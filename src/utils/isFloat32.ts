export function isFloat32(num: number): boolean {
  const float32 = new Float32Array([num])[0];
  return Math.abs(num - float32) < 1e-7;
}