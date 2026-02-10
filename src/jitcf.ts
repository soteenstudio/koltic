import { loadWasm } from "./utils/index.js";

export class JITCF {
  private wasm: any;
  private hitCounter: Record<number, number> = {};
  private HOT_THRESHOLD = 0;
  constructor(hit: Record<number, number>, hot: number) {
    this.hitCounter = hit;
    this.HOT_THRESHOLD = hot;
  }
  add(a: number, b: number): void {
    this.wasm = loadWasm("add.wasm");
  }
}