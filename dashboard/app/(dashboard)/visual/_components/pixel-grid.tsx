import type { Sprite } from './sprites';

interface Props {
  sprite: Sprite;
  color: string;
  scale?: number;
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function PixelGrid({ sprite, color, scale = 5, glow = false, className, style }: Props) {
  const w = sprite[0]?.length ?? 0;
  const h = sprite.length;
  const filter = glow ? `drop-shadow(0 0 ${Math.max(2, scale - 2)}px ${color}aa)` : undefined;
  return (
    <svg
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      className={className}
      style={{ filter, ...style }}
    >
      {sprite.flatMap((row, y) =>
        Array.from(row).map((cell, x) =>
          cell === 'X' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null,
        ),
      )}
    </svg>
  );
}
