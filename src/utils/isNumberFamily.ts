export function isNumberFamily(expected: string, actual: string): boolean {
  return (
    expected === "$Type.Number" &&
    ["$Type.Integer", "$Type.Float", "$Type.Double", "$Type.Long"].includes(actual)
  );
}