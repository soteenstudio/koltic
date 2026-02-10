import { figures } from "./figures.js";

export function warning(lines: Array<string>, config: { design: 'legacy' | 'modern' }): void {
  const maxLen = Math.max(...lines.map(l => l.replace(/\x1b\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '').replace(/\x1b\[38;2;[0-9]{1,3};[0-9]{1,3};[0-9]{1,3}m/g, '').length));
  const top = (config.design === "legacy" ? figures.elbowUpLeft : config.design === "modern" ? figures.roundedElbowUpLeft : " ") + (config.design === "legacy" || config.design === "modern" ? figures.hpipe : " ").repeat(maxLen - 2) + (config.design === "legacy" ? figures.elbowUpRight : config.design === "modern" ? figures.roundedElbowUpRight : " ");
  const bottom = (config.design === "legacy" ? figures.elbowDownLeft : config.design === "modern" ? figures.roundedElbowDownLeft : " ") + (config.design === "legacy" || config.design === "modern" ? figures.hpipe : " ").repeat(maxLen - 2) + (config.design === "legacy" ? figures.elbowDownRight : config.design === "modern" ? figures.roundedElbowDownRight : " ");
  
  const fixed = lines.map(l => {
    const diff = maxLen - l.replace(/\x1b\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '').replace(/\x1b\[38;2;[0-9]{1,3};[0-9]{1,3};[0-9]{1,3}m/g, '').length;
    return diff > 0 ? l.slice(0, -1) + " ".repeat(diff) + "│" : l;
  });
  
  console.log([top, ...fixed, bottom].join("\n"));
}