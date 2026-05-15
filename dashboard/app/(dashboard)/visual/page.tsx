export const dynamic = 'force-dynamic';

export default function VisualPage() {
  return (
    <main className="grid min-h-full place-items-center px-8 py-8">
      <div className="text-center">
        <div className="label text-accent-analyst">Visual Office · Fase 3</div>
        <div className="mt-2 font-mono text-2xl text-ink">Belum dibangun.</div>
        <p className="mt-2 max-w-md text-sm text-ink-dim">
          Pixel-art 2D office dengan 3 karakter (Scanner kiri, Intake tengah, Analyst kanan). Animasi
          idle/busy akan terikat ke <span className="kbd">clearmark/agents/&#42;/state.json</span>.
        </p>
      </div>
    </main>
  );
}
