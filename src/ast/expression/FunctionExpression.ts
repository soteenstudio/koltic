import { BaseNode } from "../BaseNode.js";
import { Statement } from "../statement/Statement.js";

export interface FunctionExpression extends BaseNode {
  type: "FunctionExpression";
  params: { name: string }[];
  returnType: string;
  body: Statement[];
}
