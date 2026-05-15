import type { AgentWire } from '@/components/agent-card';
import { PixelGrid } from './pixel-grid';
import { SPRITE_FOR, MONITOR, MONITOR_BUSY, DESK, ZZZ, SPARK } from './sprites';
import styles from './office.module.css';

export function Room({ agent }: { agent: AgentWire }) {
  const id = agent.agent_id as keyof typeof SPRITE_FOR;
  const isBusy = agent.status === 'busy';
  const sprite = SPRITE_FOR[id]?.[isBusy ? 'busy' : 'idle'] ?? SPRITE_FOR.scanner.idle;
  const color = agent.accent_color;

  return (
    <div
      className={`${styles.room} ${isBusy ? styles.busy : styles.idle}`}
      style={{ borderColor: color + '88' }}
    >
      <div className={styles.label} style={{ color }}>
        {agent.role}
      </div>

      {isBusy && (
        <>
          <div className={`${styles.spark} ${styles.spark1}`}>
            <PixelGrid sprite={SPARK} color={color} scale={3} glow />
          </div>
          <div className={`${styles.spark} ${styles.spark2}`}>
            <PixelGrid sprite={SPARK} color={color} scale={3} glow />
          </div>
          <div className={`${styles.spark} ${styles.spark3}`}>
            <PixelGrid sprite={SPARK} color={color} scale={3} glow />
          </div>
        </>
      )}

      {!isBusy && (
        <div className={styles.zzz}>
          <PixelGrid sprite={ZZZ} color={color} scale={3} />
        </div>
      )}

      {/* Floor line in accent. */}
      <div className={styles.floor} style={{ background: color, opacity: 0.4 }} />

      <div className={styles.figureWrap}>
        <div className={styles.figure}>
          <PixelGrid sprite={sprite} color={color} scale={5} glow={isBusy} />
        </div>

        <div className="relative mt-2 flex flex-col items-center" style={{ color }}>
          <div className={`${styles.monitor} ${isBusy ? styles.busy : ''}`}>
            <PixelGrid
              sprite={isBusy ? MONITOR_BUSY : MONITOR}
              color={color}
              scale={4}
              glow={isBusy}
            />
          </div>
          <PixelGrid sprite={DESK} color={color} scale={4} style={{ marginTop: -2 }} />
        </div>
      </div>

      <div className="relative z-10 mt-4 text-center">
        <div className="font-mono text-sm tracking-tight text-ink">{agent.display_name}</div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color }}>
          {isBusy ? 'BUSY' : 'IDLE'}
        </div>
        {agent.active_task ? (
          <div className="mt-1 line-clamp-2 max-w-[220px] font-mono text-[11px] text-ink-dim">
            {agent.active_task.type ?? 'task'} · {agent.active_task.project_slug ?? ''}
          </div>
        ) : (
          <div className="mt-1 font-mono text-[10px] text-ink-faint">no active task</div>
        )}
      </div>
    </div>
  );
}
