interface processTimes {
  tTime: number;
  pTime: number;
  cTime: number;
  wTime: number;
  oTime: number
}

let data: processTimes = {
  tTime: 0,
  pTime: 0,
  cTime: 0,
  wTime: 0,
  oTime: 0
};

export function setProcessTimes(newData: processTimes): void {
  data = newData;
}

export function getProcessTimes(): processTimes {
  return data;
}