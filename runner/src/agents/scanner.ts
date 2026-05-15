import fs from 'node:fs';
import path from 'node:path';
import { projectDir } from '../paths.js';
import {
  appendLog,
  bumpMetric,
  claimBusy,
  heartbeat,
  markBlocked,
  markIdle,
} from '../state.js';
import { completeTask, nextTask } from '../tasks.js';
import { loadPatterns } from '../patterns.js';
import { matchPattern } from '../matching.js';
import { httpGet } from '../fetch.js';
import { detectPlatform, extractMetaDescription, extractTitle, stripTags } from '../text.js';
import { dateSlug, nowIso, shortId } from '../ids.js';

export async function tickScanner(): Promise<void> {
  const task = nextTask('scanner');
  if (!task) {
    markIdle('scanner', 'No tasks queued.');
    return;
  }
  if (!task.project_slug) {
    markBlocked('scanner', `Task ${task.task_id} has no project_slug.`);
    return;
  }

  claimBusy(
    'scanner',
    task.task_id,
    `Starting ${task.type ?? 'scan'} for ${task.project_slug}.`,
  );
  appendLog('scanner', {
    event: 'task_started',
    task_id: task.task_id,
    project: task.project_slug,
  });
  bumpMetric('scanner', 'tasks_started', 1);

  // Load project to get applied_patterns
  const projectFile = path.join(projectDir(task.project_slug), 'project.json');
  if (!fs.existsSync(projectFile)) {
    markBlocked('scanner', `Project ${task.project_slug} not found.`);
    return;
  }
  const project = JSON.parse(fs.readFileSync(projectFile, 'utf-8'));
  const appliedSlugs: string[] = project.applied_patterns ?? [];
  const patterns = loadPatterns().filter((p) => appliedSlugs.includes(p.slug));

  const urls = task.target_urls ?? [];
  let foundCount = 0;

  // Mark scan start on project
  project.stats.last_scan_started_at = nowIso();
  fs.writeFileSync(projectFile, JSON.stringify(project, null, 2) + '\n');

  for (const url of urls) {
    heartbeat('scanner');
    try {
      appendLog('scanner', { event: 'platform_open', url });
      const res = await httpGet(url);

      if (res.status >= 400) {
        appendLog('scanner', { event: 'fetch_failed', url, status: res.status });
        continue;
      }

      const title = extractTitle(res.body);
      const description = extractMetaDescription(res.body);
      const body = stripTags(res.body, 200000);
      const haystack = `${title}\n${description}\n${body}`;

      const matches: Array<{ pattern: string; signals: string[] }> = [];
      for (const p of patterns) {
        const m = matchPattern(haystack, p);
        if (m.matched) matches.push({ pattern: p.slug, signals: m.signals });
      }

      if (matches.length > 0) {
        const finding = {
          id: `${dateSlug()}-${shortId()}`,
          project_slug: task.project_slug,
          discovered_at: nowIso(),
          discovered_by: 'scanner',
          platform: detectPlatform(res.finalUrl || url),
          listing_url: url,
          title: title || url,
          matched_patterns: matches.map((m) => m.pattern),
          match_signals: matches,
          confidence: 0.5,
          status: 'new',
          notes: `Auto-flagged via patterns: ${matches.map((m) => m.pattern).join(', ')}. Awaiting Analyst review.`,
        };
        const findingsDir = path.join(projectDir(task.project_slug), 'findings');
        fs.mkdirSync(findingsDir, { recursive: true });
        fs.writeFileSync(
          path.join(findingsDir, `${finding.id}.json`),
          JSON.stringify(finding, null, 2) + '\n',
        );
        foundCount++;
        bumpMetric('scanner', 'findings_logged', 1);
        appendLog('scanner', {
          event: 'candidate_found',
          url,
          patterns: matches.map((m) => m.pattern).join(','),
          finding_id: finding.id,
        });
      } else {
        appendLog('scanner', { event: 'no_match', url, title: title.slice(0, 80) });
      }
    } catch (err) {
      appendLog('scanner', { event: 'fetch_failed', url, error: String(err) });
    }
  }

  // Update project stats post-scan
  const projAfter = JSON.parse(fs.readFileSync(projectFile, 'utf-8'));
  projAfter.stats.findings_total = (projAfter.stats.findings_total ?? 0) + foundCount;
  projAfter.stats.last_scan_completed_at = nowIso();
  projAfter.next_step = {
    action: foundCount > 0 ? 'analyst-review' : 're-scan',
    owner: foundCount > 0 ? 'analyst' : 'scanner',
    due: null,
    note:
      foundCount > 0
        ? `${foundCount} candidate(s) waiting for Analyst confidence review.`
        : 'No candidates flagged on this sweep. Consider widening the URL list.',
  };
  fs.writeFileSync(projectFile, JSON.stringify(projAfter, null, 2) + '\n');

  completeTask('scanner', task.task_id);
  bumpMetric('scanner', 'tasks_completed', 1);
  markIdle(
    'scanner',
    `Scanned ${urls.length} URL(s); ${foundCount} candidate(s) flagged for Analyst review.`,
  );
}
