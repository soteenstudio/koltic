import fs from "node:fs";
import path from "node:path";

// In-memory cache
let cachedConfig: any = null;

/**
 * Load config dengan caching.
 * Pemanggilan pertama wajib kasih filename.
 * Pemanggilan selanjutnya tinggal loadConfig() aja.
 */
export function loadConfig(filename?: string) {
  // 1. Kalo udah ada di cache, langsung balikin. Gak peduli ada argumen atau gak.
  if (cachedConfig !== null) {
    return cachedConfig;
  }

  // 2. Kalo cache kosong DAN gak ada filename, kasih peringatan.
  if (!filename) {
    console.error("Error: Pemanggilan pertama loadConfig harus menyertakan nama file!");
    return null;
  }

  const configPath = path.join(process.cwd(), filename);

  try {
    const data = fs.readFileSync(configPath, "utf8");
    
    // 3. Simpan ke cache
    cachedConfig = JSON.parse(data);
    
    return cachedConfig;
  } catch (err) {
    console.error("Config tidak ditemukan atau format JSON invalid");
    return null;
  }
}