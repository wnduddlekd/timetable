export const pad2 = (n) => (n < 10 ? '0' : '') + n;

// "09:30" -> 570 (분). 24:00 -> 1440
export function toMin(t) {
  if (!t || !t.includes(':')) return NaN;
  const [h, m] = t.split(':');
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

// 570 -> "09:30"
export function fmt(min) {
  return `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}`;
}

// 시작 시간 1시간 뒤 (표시 범위의 끝을 넘지 않게)
export function autoEnd(start, endHour) {
  return fmt(Math.min(toMin(start) + 60, endHour * 60));
}

// 시간 값을 표시 설정 범위 안으로 맞춰요.
// 시작: minHour ~ maxHour-1시, 종료: minHour ~ maxHour시 (마지막 시는 분 00 고정)
export function clampTime(time, minHour, maxHour, isEnd) {
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10);
  const lastHour = isEnd ? maxHour : maxHour - 1;
  if (h < minHour) h = minHour;
  else if (h > lastHour) h = lastHour;
  if (isEnd && h === maxHour) m = 0;
  return `${pad2(h)}:${pad2(m)}`;
}
