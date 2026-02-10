export function isInt32(num: number): boolean {
  const int32 = new Int32Array([num])[0];
  return num === int32;
}