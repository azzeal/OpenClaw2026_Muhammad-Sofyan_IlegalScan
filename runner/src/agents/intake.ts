import fs from 'node:fs';
import path from 'node:path';
import { paths, projectDir } from '../paths.js';
import { appendLog, bumpMetric, claimBusy, markIdle } from '../state.js';
import { writeTask } from '../tasks.js';
import { dateSlug, nowIso, shortId, slugify } from '../ids.js';

interface InboxRequest {
  request_id?: string;
  received_at?: string;
  client_name: string;
  client_legal_name?: string;
  industry?: string;
  category?: string;
  project_slug?: string;
  products?: Array<{
    id?: string;
    name: string;
    nie?: string;
    active_ingredient?: string;
    form?: string;
    packaging?: string;
    therapeutic_class?: string;
  }>;
  watch_platforms?: string[];
  target_urls?: string[];
  applied_patterns?: string[];
  instructions?: string;
  deadline?: string | null;
  sources?: unknown[];
}

function readJson(p: string): InboxRequest {
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as InboxRequest;
}

function listInbox(): string[] {
  if (!fs.existsSync(paths.inbox)) return [];
  return fs
    .readdirSync(paths.inbox)
    .filter((f) => f.endsWith('.json') && !f.startsWith('.'))
    .map((f) => path.join(paths.inbox, f));
}

function archiveInbox(file: string): void {
  fs.mkdirSync(paths.inboxProcessed, { recursive: true });
  fs.renameSync(file, path.join(paths.inboxProcessed, path.basename(file)));
}

function getOrCreateProject(req: InboxRequest): { slug: string; created: boolean } {
  const slug = req.project_slug ?? slugify(req.client_name);
  const dir = projectDir(slug);
  const projectFile = path.join(dir, 'project.json');
  if (fs.existsSync(projectFile)) return { slug, created: false };

  fs.mkdirSync(path.join(dir, 'findings'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'reports'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'evidence'), { recursive: true });

  const project = {
    slug,
    client_name: req.client_name,
    client_legal_name: req.client_legal_name,
    industry: req.industry ?? 'pharmaceutical',
    category: req.category ?? 'obat-keras',
    status: 'active',
    created_at: nowIso(),
    created_by: 'intake',
    products: req.products ?? [],
    watch_platforms: req.watch_platforms ?? ['shopee', 'tokopedia', 'tiktokshop'],
    applied_patterns:
      req.applied_patterns ?? ['disguised-names', 'non-psef-sellers', 'impossible-dosage'],
    stats: {
      findings_total: 0,
      findings_high_confidence: 0,
      reports_filed: 0,
      last_scan_started_at: null,
      last_scan_completed_at: null,
    },
    next_step: {
      action: 'initial-scan',
      owner: 'scanner',
      due: null,
      note: 'Auto-dispatched by Intake from inbox request.',
    },
    sources: req.sources ?? [],
  };
  fs.writeFileSync(projectFile, JSON.stringify(project, null, 2) + '\n');
  return { slug, created: true };
}

export async function tickIntake(): Promise<void> {
  const files = listInbox();
  if (files.length === 0) {
    markIdle('intake', 'No new requests in inbox.');
    return;
  }

  claimBusy('intake', null, `Processing ${files.length} inbox request(s).`);
  appendLog('intake', { event: 'sweep_start', requests: files.length });
  bumpMetric('intake', 'tasks_started', 1);

  let intakesProcessed = 0;
  let projectsCreated = 0;
  let tasksDispatched = 0;

  for (const file of files) {
    try {
      const req = readJson(file);
      const { slug, created } = getOrCreateProject(req);
      if (created) {
        projectsCreated++;
        appendLog('intake', { event: 'project_created', slug, client: req.client_name });
      } else {
        appendLog('intake', { event: 'project_matched', slug });
      }

      if (req.target_urls && req.target_urls.length > 0) {
        const taskId = `task-${dateSlug()}-${shortId()}`;
        writeTask('scanner', {
          task_id: taskId,
          project_slug: slug,
          created_at: nowIso(),
          created_by: 'intake',
          type: 'targeted-scan',
          instructions:
            req.instructions ?? `Scan ${req.target_urls.length} target URL(s) against applied patterns.`,
          target_urls: req.target_urls,
          deadline: req.deadline ?? null,
        });
        tasksDispatched++;
        appendLog('intake', {
          event: 'task_dispatched',
          to: 'scanner',
          task_id: taskId,
          urls: req.target_urls.length,
        });
      }

      archiveInbox(file);
      bumpMetric('intake', 'intakes_processed', 1);
      intakesProcessed++;
    } catch (err) {
      appendLog('intake', {
        event: 'request_failed',
        file: path.basename(file),
        error: String(err),
      });
    }
  }

  bumpMetric('intake', 'tasks_completed', 1);
  markIdle(
    'intake',
    `Processed ${intakesProcessed} request(s): ${projectsCreated} new project(s), ${tasksDispatched} scan task(s) dispatched.`,
  );
}
