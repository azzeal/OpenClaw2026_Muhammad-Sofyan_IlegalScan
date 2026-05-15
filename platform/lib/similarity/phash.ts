import sharp from 'sharp';

// Average-hash (8×8 grayscale, threshold = mean) — simple, fast, no native quirks.
// Hamming distance / 64 ∈ [0, 1]; we return 1 - that as a similarity score.
export async function imageAverageHash(buffer: Buffer): Promise<bigint | null> {
  try {
    const { data } = await sharp(buffer)
      .resize(8, 8, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (data.length < 64) return null;
    let sum = 0;
    for (let i = 0; i < 64; i++) sum += data[i];
    const mean = sum / 64;
    let h = 0n;
    for (let i = 0; i < 64; i++) {
      if (data[i] >= mean) h |= 1n << BigInt(i);
    }
    return h;
  } catch {
    return null;
  }
}

export function hammingDistance(a: bigint, b: bigint): number {
  let x = a ^ b;
  let n = 0;
  while (x !== 0n) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
}

export function hashSimilarity(a: bigint, b: bigint): number {
  const d = hammingDistance(a, b);
  return Math.max(0, Math.min(1, 1 - d / 64));
}
