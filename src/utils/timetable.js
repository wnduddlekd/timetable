// 같은 요일에 시간이 겹치는 과목의 id 집합 { [id]: true }
export function findConflicts(items) {
  const bad = {};
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const a = items[i];
      const b = items[j];
      if (a.day === b.day && a.start < b.end && b.start < a.end) {
        bad[a.id] = true;
        bad[b.id] = true;
      }
    }
  }
  return bad;
}

// 표시할 요일 수와 시간 범위. 범위 밖 과목이 있으면 그 과목이 보이도록 넓혀요.
export function getLayout({ startHour, endHour, weekend, all }) {
  const days = weekend || all.some((c) => c.day >= 5) ? 7 : 5;
  let sh = startHour;
  let eh = endHour;
  all.forEach((c) => {
    sh = Math.min(sh, Math.floor(c.start / 60));
    eh = Math.max(eh, Math.ceil(c.end / 60));
  });
  if (eh <= sh) eh = sh + 1;
  return { days, startHour: sh, hours: eh - sh };
}
