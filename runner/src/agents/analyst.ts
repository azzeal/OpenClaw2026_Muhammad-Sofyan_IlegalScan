import fs from 'node:fs';
import path from 'node:path';
import { paths, projectDir } from '../paths.js';
import { appendLog, bumpMetric, claimBusy, markIdle } from '../state.js';
import { nowIso } from '../ids.js';

interface FindingFile {
  file: string;
  data: {
    id: string;
    project_slug?: string;
    matched_patterns?: string[];
    status: string;
    confidence?: number;
    [k: string]: unknown;
  };
}

function listProjectSlugs(): string[] {
  if (!fs.existsSync(paths.projects)) return [];
  return fs.readdirSync(paths.projects).filter((slug) => {
    try {
      return fs.statSync(path.join(paths.projects, slug)).isDirectory();
    } catch {
      return false;
    }
  });
}

function listFindings(slug: string): FindingFile[] {
  const dir = path.join(projectDir(slug), 'findings');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({
      file: path.join(dir, f),
      data: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')),
    }));
}

interface Verdict {
  confidence: number;
  verdict: 'confirmed' | 'downgrade' | 'dismiss';
  notes: string;
}

function applyRules(matched: string[]): Verdict {
  let confidence = 0.5;
  const reasons: string[] = [];

  if (matched.includes('impossible-dosage')) {
    confidence = Math.max(confidence, 0.95);
    reasons.push('impossible-dosage hit (deterministic counterfeit signal).');
  }
  if (matched.includes('non-psef-sellers')) {
    confidence = Math.max(confidence, 0.8);
    reasons.push('non-PSEF seller signal raises baseline for prescription drugs.');
  }
  if (matched.includes('disguised-names')) {
    if (matched.length > 1) {
      confidence = Math.max(confidence, 0.85);
      reasons.push('disguised-names combined with corroborating pattern.');
    } else {
      confidence = Math.max(confidence, 0.7);
      reasons.push('disguised-names alone — strong but circumstantial.');
    }
  }
  if (matched.includes('kios-labels')) {
    confidence = Math.min(1.0, confidence + 0.05);
    reasons.push('kios-labels contextual bump.');
  }

  const v: Verdict['verdict'] =
    confidence >= 0.75 ? 'confirmed' : confidence < 0.4 ? 'dismiss' : 'downgrade';
  return {
    confidence: Math.round(confidence * 100) / 100,
    verdict: v,
    notes: reasons.join(' ') || 'No applicable rules — held at baseline.',
  };
}

export async function tickAnalyst(): Promise<void> {
  const slugs = listProjectSlugs();
  const allNew: Array<{ slug: string; f: FindingFile }> = [];
  for (const slug of slugs) {
    for (const f of listFindings(slug)) {
      if (f.data.status === 'new') allNew.push({ slug, f });
    }
  }

  if (allNew.length === 0) {
    markIdle('analyst', 'No new findings to review.');
    return;
  }

  claimBusy('analyst', null, `Reviewing ${allNew.length} new finding(s).`);
  appendLog('analyst', { event: 'review_start', count: allNew.length });
  bumpMetric('analyst', 'tasks_started', 1);

  let confirmed = 0;
  let dismissed = 0;
  let downgraded = 0;

  for (const { slug, f } of allNew) {
    const v = applyRules(f.data.matched_patterns ?? []);
    f.data.confidence = v.confidence;
    f.data.status =
      v.verdict === 'confirmed' ? 'confirmed' : v.verdict === 'dismiss' ? 'dismissed' : 'new';
    f.data.confidence_review = {
      by: 'analyst',
      at: nowIso(),
      verdict: v.verdict,
      notes: v.notes,
    };
    fs.writeFileSync(f.file, JSON.stringify(f.data, null, 2) + '\n');
    bumpMetric('analyst', 'findings_reviewed', 1);
    appendLog('analyst', {
      event: 'finding_reviewed',
      id: f.data.id,
      project: slug,
      verdict: v.verdict,
      confidence: v.confidence,
    });
    if (v.verdict === 'confirmed') confirmed++;
    else if (v.verdict === 'dismiss') dismissed++;
    else downgraded++;
  }

  // Update each touched project's high-confidence count
  for (const slug of new Set(allNew.map((x) => x.slug))) {
    const projFile = path.join(projectDir(slug), 'project.json');
    if (!fs.existsSync(projFile)) continue;
    const proj = JSON.parse(fs.readFileSync(projFile, 'utf-8'));
    const findings = listFindings(slug);
    proj.stats = proj.stats ?? {};
    proj.stats.findings_high_confidence = findings.filter(
      (x) => (x.data.confidence ?? 0) >= 0.75,
    ).length;
    if (confirmed > 0) {
      proj.next_step = {
        action: 'compose-report',
        owner: 'intake',
        due: null,
        note: `${proj.stats.findings_high_confidence} high-confidence finding(s) ready for client report.`,
      };
    }
    fs.writeFileSync(projFile, JSON.stringify(proj, null, 2) + '\n');
  }

  bumpMetric('analyst', 'tasks_completed', 1);
  markIdle(
    'analyst',
    `Reviewed ${allNew.length} finding(s): ${confirmed} confirmed, ${downgraded} held, ${dismissed} dismissed.`,
  );
}
