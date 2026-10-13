import { pad2 } from '../utils/time';

const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

// 24시간제 시간 선택 (오전/오후 없음).
// 고를 수 있는 시(時)는 표시 설정 범위(minHour ~ maxHour) 안으로 제한돼요.
export default function TimeField({
  id,
  label,
  value,
  onChange,
  minHour,
  maxHour,
  isEnd = false,
}) {
  const [hStr, mStr] = value.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  const lastHour = isEnd ? maxHour : maxHour - 1;
  const hours = [];
  for (let i = minHour; i <= lastHour; i += 1) hours.push(i);
  // 범위 밖 값(수정 중인 과목 등)도 선택지에서 사라지지 않게 유지
  if (!hours.includes(h)) hours.push(h);
  hours.sort((a, b) => a - b);

  const minutes = MINUTES.includes(m) ? MINUTES : [...MINUTES, m].sort((a, b) => a - b);

  // 종료 시각이 범위의 마지막 시(時)이면 분은 00으로 고정
  const capped = isEnd && h === maxHour;

  const handleHour = (e) => {
    const nh = parseInt(e.target.value, 10);
    const nm = isEnd && nh === maxHour ? 0 : m;
    onChange(`${pad2(nh)}:${pad2(nm)}`);
  };
  const handleMinute = (e) => {
    onChange(`${pad2(h)}:${pad2(parseInt(e.target.value, 10))}`);
  };

  return (
    <div className="time-sel">
      <select id={`${id}H`} aria-label={`${label} 시`} value={pad2(h)} onChange={handleHour}>
        {hours.map((hour) => (
          <option key={hour} value={pad2(hour)}>
            {pad2(hour)}시
          </option>
        ))}
      </select>
      <span>:</span>
      <select
        id={`${id}M`}
        aria-label={`${label} 분`}
        value={pad2(m)}
        onChange={handleMinute}
        disabled={capped}
      >
        {minutes.map((min) => (
          <option key={min} value={pad2(min)}>
            {pad2(min)}분
          </option>
        ))}
      </select>
    </div>
  );
}
