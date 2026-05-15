import { AGENT_IDS, type AgentId } from './paths.js';
import { markBlocked } from './state.js';
import { tickIntake } from './agents/intake.js';
import { tickScanner } from './agents/scanner.js';
import { tickAnalyst } from './agents/analyst.js';

const TICKS: Record<AgentId, () => Promise<void>> = {
  intake: tickIntake,
  scanner: tickScanner,
  analyst: tickAnalyst,
};

function usage(): never {
  console.error('Usage: tsx src/cli.ts <intake|scanner|analyst|all> [--loop <seconds>]');
  console.error('');
  console.error('  intake    Process clearmark/inbox/*.json → create projects + dispatch scans');
  console.error('  scanner   Take next scan task → fetch URLs → write findings');
  console.error('  analyst   Review every status:new finding → set confidence + verdict');
  console.error('  all       Run intake, scanner, analyst once in that order');
  console.error('');
  console.error('  --loop <s>  Keep ticking every <s> seconds (default 30) until Ctrl+C');
  process.exit(2);
}

async function runOnce(agent: AgentId | 'all'): Promise<void> {
  const ids: AgentId[] = agent === 'all' ? [...AGENT_IDS] : [agent as AgentId];
  for (const id of ids) {
    console.log(`\n──── tick: ${id} ────`);
    const t0 = Date.now();
    try {
      await TICKS[id]();
    } catch (err) {
      console.error(`[${id}] tick failed:`, err);
      try {
        markBlocked(id, String(err));
      } catch {}
    }
    console.log(`──── done: ${id} (${Date.now() - t0}ms) ────`);
  }
}

async function main(): Promise<void> {
  const agent = process.argv[2] as AgentId | 'all' | undefined;
  if (!agent || (agent !== 'all' && !AGENT_IDS.includes(agent as AgentId))) usage();

  const loopIdx = process.argv.indexOf('--loop');
  if (loopIdx === -1) {
    await runOnce(agent);
    return;
  }

  const everyS = Math.max(1, Number(process.argv[loopIdx + 1] ?? 30));
  console.log(`Looping ${agent} every ${everyS}s. Ctrl+C to stop.`);
  let stop = false;
  process.on('SIGINT', () => {
    console.log('\nStopping after current tick...');
    stop = true;
  });
  while (!stop) {
    await runOnce(agent);
    if (stop) break;
    await new Promise((r) => setTimeout(r, everyS * 1000));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
