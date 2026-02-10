import chalk from "chalk";

export function formatDuration(ms: number): string {
  const s = ms / 1000;
  const m = s / 60;
  const h = m / 60;

  // Tentukan warna angka berdasarkan durasi
  let colorFn: (text: string) => string;
  if (ms < 10) colorFn = chalk.greenBright;     // super cepat
  else if (ms < 100) colorFn = chalk.green;     // cepat
  else if (ms < 500) colorFn = chalk.yellow;
  else if (ms < 1000) colorFn = chalk.rgb(255, 165, 0);   // mulai lambat
  else colorFn = chalk.red;                     // lambat banget

  if (h >= 1) return `${colorFn(h.toFixed(2))} ${chalk.blueBright("h")}`;
  if (m >= 1) return `${colorFn(m.toFixed(2))} ${chalk.blueBright("m")}`;
  if (s >= 1) return `${colorFn(s.toFixed(2))} ${chalk.blueBright("s")}`;
  return `${colorFn(ms.toFixed(2))} ${chalk.blueBright("ms")}`;
}