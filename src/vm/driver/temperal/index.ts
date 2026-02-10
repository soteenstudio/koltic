import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { loadWasm } from "../../../utils/loadWasm.js";

interface Data {
  count32bit: number;
  count64bit: number;
}

const CACHE_DIR = ".lightcache";
const DATA_DIR = "data";
const INDEX_FILE = path.join(CACHE_DIR, DATA_DIR, "temperal.json");

// Ensure directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export class Temperal {
  private data: Data | null = null; // Memory Cache
  private isDirty: boolean = false; // Flag buat nandain ada perubahan
  
  constructor() {
    // Initial load langsung ke RAM
    this.data = this.loadToRam();
  }
  
  // --- MEMORY MANAGEMENT ---

  private loadToRam(): Data {
    // Kalau udah ada di RAM, balikin langsung (No redundant Read)
    if (this.data) return this.data;

    try {
      if (fs.existsSync(INDEX_FILE)) {
        const raw = fs.readFileSync(INDEX_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.log("Warning: Failed to load index, creating new one.");
    }

    return { count32bit: 0, count64bit: 0 }; // Default data
  }

  // --- LOGIC ---

  is64Bit(): boolean {
    const currentData = this.loadToRam();

    if (currentData.count32bit > 50) {
      return false;
    }
    
    if (currentData.count64bit > 50) {
      return true;
    }
    
    const arch = os.arch();
    if (arch === "arm64" || arch === "x64") {
      currentData.count64bit += 1;
      this.isDirty = true;
      this.data = currentData;
      return true;
    }
    
    // Update di RAM dulu
    currentData.count32bit += 1;
    this.isDirty = true; 
    this.data = currentData;
    return false;
  }

  // --- WRITE SYSTEM (STREAMING) ---

  /**
   * Final Write: Pake Stream biar performa stabil pas nulis data gede
   */
  commit(): Promise<void> {
    // Debugging buat lo di Vivo Y400: liat angkanya beneran ada gak di RAM
    console.log(`[Temperal] Committing... Dirty: ${this.isDirty}, Data:`, this.data);

    return new Promise((resolve, reject) => {
      if (!this.isDirty || !this.data) {
        return resolve();
      }

      // Pastikan directory ada (safety double check)
      if (!fs.existsSync(path.dirname(INDEX_FILE))) {
        fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
      }

      const writeStream = fs.createWriteStream(INDEX_FILE, { 
        flags: 'w',
        highWaterMark: 1024 // Kecilin buffer biar langsung flush buat data kecil
      });

      const jsonData = JSON.stringify(this.data);

      // Pakai write dengan callback buat mastiin data masuk ke buffer kernel
      const canWrite = writeStream.write(jsonData, 'utf8');

      if (!canWrite) {
        // Kalau buffer penuh, tunggu 'drain' baru end
        writeStream.once('drain', () => writeStream.end());
      } else {
        writeStream.end();
      }

      writeStream.on('finish', () => {
        this.isDirty = false;
        console.log("[Temperal] Stream Finished Gacor!");
        resolve();
      });

      writeStream.on('error', (err) => {
        console.error("[Temperal] Stream Error:", err);
        reject(err);
      });
    });
  }

  getRamHealth() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const freePercentage = (free / total) * 100;
    
    return {
        freeGB: (free / 1024**3).toFixed(2),
        usedGB: (used / 1024**3).toFixed(2),
        percent: freePercentage.toFixed(1),
        status: freePercentage > 30 ? 'Lega' : freePercentage > 10 ? 'Pas-pasan' : 'Kritis'
    };
  }
}