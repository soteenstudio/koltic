export function normalizeType(typeName?: string): string {
  //if (!typeName) return "Unknown";
  const aliasMap: Record<string, string> = {
    Any: "$Type.Anything",
    Anything: "$Type.Anything",
    Unt: "$Type.Unit",
    Unit: "$Type.Unit",
    Num: "$Type.Number",
    Number: "$Type.Number",
    Int: "$Type.Integer",
    Integer: "$Type.Integer",
    Flt: "$Type.Float",
    Float: "$Type.Float",
    Dbl: "$Type.Double",
    Double: "$Type.Double",
    Lng: "$Type.Long",
    Long: "$Type.Long",
    Str: "$Type.String",
    String: "$Type.String",
    Char: "$Type.Character",
    Character: "$Type.Character",
    Bool: "$Type.Boolean",
    Boolean: "$Type.Boolean",
    Obj: "$Type.Object",
    Object: "$Type.Object",
    Func: "$Type.Function",
    Function: "$Type.Function",
  };
  return aliasMap[typeName as string] || `$Type.${(typeName as string)?.replace("$Type.", "")}`;
}