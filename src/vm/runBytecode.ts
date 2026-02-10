import { Instruction } from "./Instruction.js";
import { loadWasm, getValueType, normalizeType } from "../utils/index.js";
import util from "node:util";
import chalk from "chalk";
import { CustomError } from "../error.js";

function markerFormatter(text: string) {
  const markerLists = ["NoInitExpression", "NoValueExpression"];
  if (typeof text === "string" && markerLists.some(marker => text.includes(marker)) && (!text.startsWith('"') && !text.endsWith('"'))) {
    return chalk.gray(text.replace(/\{([a-zA-Z0-9]+)\}/g, ""));
  }
  return text;
}

// di atas loop
function computeHotThreshold(stackLen: number) {
  const baseHot = 10;        // dasar
  const scaleStep = 100;     // tiap 100 stack -> +1x base
  const minHot = 5;
  const maxHot = 2000;

  const scale = Math.max(1, Math.floor(stackLen / scaleStep));
  const raw = baseHot * scale;
  return Math.min(maxHot, Math.max(minHot, raw));
}

let wasm: any = loadWasm("main.wasm");

export function runBytecode(
  bytecode: Instruction[],
  options?: {
    entry?: number;
    args?: any[];
    captureReturn?: boolean;
    __exports?: Set<string>;
    __imports?: Map<string, any>;
  }
): any {
  let lastReturn: any = undefined
  
  const functions: Record<string, { paramsCount: number; paramNames: string[]; start: number; end: number }> = {};
  const exported = new Set<string>();
  const callStack: number[] = [];
  const stack: any[] = [];
  const vars: Record<string, any> = {};
  const hitCounter: Record<number, number> = {}; // <— Tambahan
  let ip = options?.entry ?? 0; // instruction pointer

  for (let i = 0; i < bytecode.length; i++) {
    const [op, name, params, start, end] = bytecode[i];
    if (op === "func") {
      const paramNames = bytecode[i].slice(5) as string[];
      functions[name as string] = {
        paramsCount: params as number,
        start: start as number,
        end: end as number,
        paramNames
      };
    }
    
    if (op === "export") {
      exported.add(name as string);
    }
  }

  if (options?.entry !== undefined && options?.args) {
    // cari function yang start = entry
    const fn = Object.values(functions).find(f => f.start === options.entry);
  
    if (!fn) {
      throw new Error("Entry function not found");
    }
  
    for (let i = 0; i < fn.paramsCount; i++) {
      const paramName = fn.paramNames[i] || `param${i}`;
      vars[paramName] = options.args[i];
    }
  }

  function pop() {
    if (stack.length === 0) throw new CustomError(
      "InternalError",
      "Stack underflow",
      null,
      null
    );
    if (stack.length >= 50000) throw new CustomError(
      "Internal",
      "Stack overflow",
      null,
      null
    );
    return stack.pop();
  }

  function cleanStack(limit = 50) {
    // hapus elemen stack yang gak kepakai
    while (stack.length > limit) stack.pop();
  }
  
  const HOT_THRESHOLD = computeHotThreshold(stack.length); // jumlah eksekusi buat dianggap hot

  let JITCF: boolean = false;
  while (ip < bytecode.length) {
    if (!bytecode[ip]) {
      throw new Error(`Invalid jump: ip=${ip} di luar batas bytecode (${bytecode.length})`);
    }
    
    hitCounter[ip] = (hitCounter[ip] || 0) + 1;
    const [op, arg, arg2, arg3, arg4] = bytecode[ip];

    switch (op) {
      case "push":
        stack.push(arg);
        break;
      case "val": {
        if (!(arg as string in vars)) vars[arg as string] = "NoInitExpression";
        break;
      }
      // ... di dalam switch(op) ...
      
      case "set": {
        const varName = arg;
        const val = pop();
        
        // JITCF Strategy: Kalau string dan sudah melewati Hot Threshold
        if (typeof val === "string" && hitCounter[ip] >= HOT_THRESHOLD) {
          JITCF = true;
          // Pindahin ke "Temperal" Wasm
          // Kita pake prefix atau mapping biar gak bentrok
          wasm.tSet(varName, val.replace(/::string/g, ""));
        }
        
        vars[varName] = val; // Tetap simpan di vars sebagai backup/fast access
        cleanStack();
        break;
      }
      
      case "get": {
        const varName = arg;
        
        if (hitCounter[ip] >= HOT_THRESHOLD) {
          // Cek apakah data ada di Temperal Wasm
          if (wasm.tHas(varName)) {
            JITCF = true;
            // Ambil string native dari Wasm
            stack.push(wasm.tGet(varName) + "::string");
          } else {
            stack.push(vars[varName]);
          }
        } else {
          stack.push(vars[varName]);
        }
        break;
      }
      case "concat": {
        const b = pop();
        const a = pop();
        stack.push(String(a).replace(/^['"]|['"]$/g, "") + String(b).replace(/^['"]|['"]$/g, ""));
        break;
      }
      case "add": {
        const b = pop(), a = pop();
        let result;
        if (hitCounter[ip] >= HOT_THRESHOLD) {
          JITCF = true;
          result = arg === "int" ?
            wasm.add_i32(a, b) :
            arg === "lng" ?
            wasm.add_i64(a, b) :
            arg === "flt" ? 
            wasm.add_f32(a, b) :
            arg === "dbl" ?
            wasm.add_f64(a, b) :
            a + b;
        } else {
          result = a + b;
        }
        stack.push(typeof result === "string" ? result.replace(/::string/g, "") : result);
        break;
      }
      case "sub": {
        const b = pop(), a = pop();
        let result;
        if (hitCounter[ip] >= HOT_THRESHOLD) {
          JITCF = true;
          result = arg === "int" ?
            wasm.sub_i32(a, b) :
            arg === "lng" ?
            wasm.sub_i64(a, b) :
            arg === "flt" ?
            wasm.sub_f32(a, b) :
            wasm.sub_f64(a, b)
        } else {
          result = a - b;
        }
        stack.push(result);
        break;
      }
      case "mul": {
        const b = pop(), a = pop();
        let result;
        if (hitCounter[ip] >= HOT_THRESHOLD) {
          JITCF = true;
          result = arg === "int" ?
            wasm.mul_i32(a, b) :
            arg === "lng" ?
            wasm.mul_i64(a, b) :
            arg === "flt" ?
            wasm.mul_f32(a, b) :
            wasm.mul_f64(a, b)
        } else {
          result = a * b;
        }
        stack.push(result);
        break;
      }
      case "div": {
        const b = pop(), a = pop();
        let result;
        if (hitCounter[ip] >= HOT_THRESHOLD) {
          JITCF = true;
          result = arg === "int" ?
            wasm.div_i32(a, b) :
            arg === "lng" ?
            wasm.div_i64(a, b) :
            arg === "flt" ?
            wasm.div_f32(a, b) :
            wasm.div_f64(a, b)
        } else {
          result = a / b;
        }
        stack.push(result);
        break;
      }
      case "mod": {
        const b = pop(), a = pop();
        let result;
        if (hitCounter[ip] >= HOT_THRESHOLD) {
          JITCF = true;
          result = arg === "int" ?
            wasm.mod_i32(a, b) :
            arg === "lng" ?
            wasm.mod_i64(a, b) :
            arg === "flt" ?
            wasm.mod_f32(a, b) :
            wasm.mod_f64(a, b)
        } else {
          result = a % b;
        }
        stack.push(result);
        break;
      }
      case "gt": {
        const b = pop(), a = pop();
        let result;
        if (hitCounter[ip] >= HOT_THRESHOLD) {
          JITCF = true;
          result = arg === "int" ?
            wasm.gt_i32(a, b) :
            arg === "lng" ?
            wasm.gt_i64(a, b) :
            arg === "flt" ?
            wasm.gt_f32(a, b) :
            wasm.gt_f64(a, b)
        } else {
          result = a > b;
        }
        stack.push(result);
        break;
      }
      case "lt": {
        const b = pop(), a = pop();
        let result;
        if (hitCounter[ip] >= HOT_THRESHOLD) {
          JITCF = true;
          result = arg === "int" ?
            wasm.lt_i32(a, b) :
            arg === "lng" ?
            wasm.lt_i64(a, b) :
            arg === "flt" ?
            wasm.lt_f32(a, b) :
            wasm.lt_f64(a, b)
        } else {
          result = a < b;
        }
        stack.push(result);
        break;
      }
      case "ge": {
        const b = pop(), a = pop();
        let result;
        if (hitCounter[ip] >= HOT_THRESHOLD) {
          JITCF = true;
          result = arg === "int" ?
            wasm.ge_i32(a, b) :
            arg === "lng" ?
            wasm.ge_i64(a, b) :
            arg === "flt" ?
            wasm.ge_f32(a, b) :
            wasm.ge_f64(a, b)
        } else {
          result = a >= b;
        }
        stack.push(result);
        break;
      }
      case "le": {
        const b = pop(), a = pop();
        let result;
        if (hitCounter[ip] >= HOT_THRESHOLD) {
          JITCF = true;
          result = arg === "int" ?
            wasm.le_i32(a, b) :
            arg === "lng" ?
            wasm.le_i64(a, b) :
            arg === "flt" ?
            wasm.le_f32(a, b) :
            wasm.le_f64(a, b)
        } else {
          result = a <= b;
        }
        stack.push(result);
        break;
      }
      case "eq": {
        const b = pop(), a = pop();
        stack.push(a === b);
        break;
      }
      case "neq": {
        const b = pop(), a = pop();
        stack.push(a !== b);
        break;
      }
      case "and": {
        const b = pop(), a = pop();
        stack.push(a && b);
        break;
      }
      case "or": {
        const b = pop(), a = pop();
        stack.push(a || b);
        break;
      }
      case "print": {
        const val = pop();
      
        let out;
        if (typeof val === "string") {
          out = markerFormatter(val.replace(/^['"]|['"]$/g, ""));
        } else {
          out = markerFormatter(
            util.inspect(val, { colors: true, compact: true, depth: null })
          );
        }
      
        process.stdout.write(out);
        cleanStack();
        break;
      }
      case "println": {
        const val = pop(); // ambil sekali saja
        let res; 
        if (typeof val === "string" && val.includes("::string")) {
          res = markerFormatter(val.replace("::string", ""));
        } else {
          res = markerFormatter(val);
        }
        if (typeof val === "string" && (val.startsWith("'") || val.startsWith('"')) && (val.endsWith("'") || val.endsWith('"'))) {
          console.log(res.replace(/^['"]|['"]$/g, ""))
        } else {
          console.log(res);
        }
        cleanStack();
        break;
      }
      case "if_false": {
        const cond = pop();
        cleanStack();
        if (!cond) {
          ip = arg as number;
          continue;
        }
        break;
      }
      case "jump":
        cleanStack();
        ip = arg as number;
        continue;
      case "inc": {
        const varName = arg as string;
        const oldVal = vars[varName];
      
        if (typeof oldVal !== "number") {
          throw new CustomError("TypeError", `Cannot increment non-number variable '${varName}'`, null, null);
        }
      
        let result;
      
        if (hitCounter[ip] >= HOT_THRESHOLD) {
          JITCF = true;
          result = arg2 === "int" ? wasm.inc_i32(oldVal)
            : arg2 === "lng" ? wasm.inc_i64(oldVal)
            : arg2 === "flt" ? wasm.inc_f32(oldVal)
            : arg2 === "dbl" ? wasm.inc_f64(oldVal)
            : oldVal + 1;
        } else {
          result = oldVal + 1;
        }
      
        vars[varName] = result;
        stack.push(result);
        break;
      }
      case "dec":
        vars[arg as string]--;
        break;
      case "func":
        // function body biarin aja diskip normal (gak usah lompat)
        break;
      case "call": {
        const [, name, argc = 0] = bytecode[ip];
        const fn = functions[name as string];
        if (!fn) throw new Error(`Function ${name} not found`);
      
        // ambil argumen dari stack
        const args: any[] = [];
        for (let i = 0; i < (argc as number); i++) args.unshift(pop());
      
        // simpan posisi ip buat balik setelah function selesai
        callStack.push(ip);
        cleanStack();
      
        // simpan parameter ke vars lokal (misal param0, param1, dst)
        for (let i = 0; i < fn.paramsCount; i++) {
          const paramName = fn.paramNames[i] || `param${i}`;
          vars[paramName] = args[i];
        }
      
        // lompat ke body function
        ip = fn.start - 1; // biar pas ip++ langsung ke instruksi pertama function
        break;
      }
      case "stop":
        cleanStack();
        const returnAddr = callStack.pop()!;
        ip = returnAddr + 1;
        continue;
      case "return": {
        const hasValue = stack.length > 0;
        const ret = hasValue ? pop() : undefined;
      
        const returnAddr = callStack.pop();
      
        if (options?.captureReturn) {
          lastReturn = ret;
        }
      
        if (returnAddr === undefined) {
          ip = bytecode.length;
          continue;
        }
      
        cleanStack();
        if (ret !== undefined) stack.push(ret);
        ip = returnAddr + 1;
        continue;
      }
      case "make_obj": {
        const count = (arg as number | undefined) ?? 0;
        const obj: Record<string, any> = {};
        
        // Loop mundur karena yang terakhir di-push ada di posisi paling atas stack
        for (let i = 0; i < count; i++) {
          const value = pop();
          const key = pop();
          obj[key] = value;
        }
      
        stack.push(obj);
        break;
      }
      case "make_array": {
        const count = (arg as number | undefined) ?? 0; // jumlah elemen → bisa diganti ambil arg dari instruksi
        const arr = [];
        for (let i = 0; i < count; i++) {
          arr.unshift(pop()); // ambil dari stack, urutan harus bener
        }
        stack.push(arr);
        break;
      }
      case "access": {
        const prop = arg as string;
        const obj = pop(); // ambil object terakhir di stack
        if (obj == null || typeof obj !== "object") {
          throw new Error(`Cannot access property '${prop}' of non-object`);
        }
        const value = obj[prop];
        stack.push(value);
        break;
      }
      case "access_index": {
        const index = pop();
        const obj = pop();
        if (!Array.isArray(obj)) throw new Error(`Cannot access index of non-array`);
        stack.push(obj[index]);
        break;
      }
      case "typeof": {
        const val = pop();
        stack.push({
          class: normalizeType(getValueType(val.replace("?", ""))).replace("$Type.", ""),
          nullable: val.endsWith("?")
        });
        break;
      }
      case "instantiate": {
        const className = arg as string;
        const argc = arg2 as number;
      
        const classObj = vars[className];
        if (!classObj || typeof classObj !== "object") {
          throw new Error(`Class '${className}' is not defined`);
        }
      
        // Ambil argumen constructor
        const args: any[] = [];
        for (let i = 0; i < argc; i++) {
          args.unshift(pop());
        }
      
        // Clone object class → instance baru
        const instance = Object.create(null);
        for (const key of Object.keys(classObj)) {
          instance[key] = classObj[key];
        }
      
        // Inject this
        instance.__class = className;
      
        // Cari constructor
        const ctorName = `${className}_constructor`;
        const ctor = functions[ctorName];
      
        if (ctor) {
          // Simpan ip
          callStack.push(ip);
      
          // set this
          vars["this"] = instance;
      
          // set parameter
          for (let i = 0; i < ctor.paramsCount; i++) {
            const paramName = ctor.paramNames[i];
            vars[paramName] = args[i];
          }
      
          // lompat ke constructor
          ip = ctor.start - 1;
        }
      
        // push instance ke stack
        stack.push(instance);
        break;
      }
      case "length": {
        stack.push(pop().length);
        break;
      }
      case "break": {
        ip = (arg as number | undefined) ?? 0;
        break;
      }
      case "string":
        stack.push(String(pop() + "::string"));
        break;
      case "number":
        stack.push(Number(pop()));
        break;
      case "dup": {
        const top = stack[stack.length - 1];
        stack.push(top);
        break;
      }
      case "set_prop": {
        const prop = arg as string;
        // stack top must be object
        const obj = pop();    // top = object (we expect object pushed after value)
        const val = pop();    // next = value
        if (obj == null || typeof obj !== "object") {
          throw new Error(`Cannot set property '${prop}' of non-object`);
        }
        obj[prop] = val;
        // optionally push obj back? usually not needed
        break;
      }
      case "import": {
        const moduleName = arg as string;
        const alias = (arg2 as string) ?? moduleName;
      
        if (!options?.__imports) {
          throw new Error(`Import system not available`);
        }
      
        if (!options.__imports.has(moduleName)) {
          throw new Error(`Module '${moduleName}' not found`);
        }
      
        vars[alias] = options.__imports.get(moduleName);
        break;
      }
      default:
        throw new Error(`Unknown opcode: ${op}`);
    }

    ip++;
  }
  if (options?.captureReturn) {
    return lastReturn;
  }
  
  if (options?.__exports) {
    for (const e of exported) options.__exports.add(e);
  }
}