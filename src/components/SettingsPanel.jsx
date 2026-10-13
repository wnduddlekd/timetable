import { useEffect, useRef, useState } from 'react';

// 표시 설정: 시간표에 보여줄 시각 범위, 주말 표시, 전체 삭제
export default function SettingsPanel({ startHour, endHour, weekend, onChange, onClear }) {
  // 입력 도중(예: "1" 입력 후 "18")에는 값이 바뀌어도 칸을 덮어쓰지 않도록 문자열로 따로 관리
  const [startText, setStartText] = useState(String(startHour));
  const [endText, setEndText] = useState(String(endHour));
  const focused = useRef(null);

  useEffect(() => {
    if (focused.current !== 'start') setStartText(String(startHour));
  }, [startHour]);
  useEffect(() => {
    if (focused.current !== 'end') setEndText(String(endHour));
  }, [endHour]);

  const handleHour = (key, setText) => (e) => {
    const text = e.target.value;
    setText(text);
    const n = parseInt(text, 10);
    if (!Number.isNaN(n)) onChange({ [key]: n });
  };

  return (
    <section className="panel">
      <h2>표시 설정</h2>
      <div className="row">
        <div>
          <label htmlFor="startHour">시작 시각 (시)</label>
          <input
            type="number"
            id="startHour"
            min="0"
            max="22"
            value={startText}
            onFocus={() => {
              focused.current = 'start';
            }}
            onBlur={() => {
              focused.current = null;
              setStartText(String(startHour));
            }}
            onChange={handleHour('startHour', setStartText)}
          />
        </div>
        <div>
          <label htmlFor="endHour">종료 시각 (시)</label>
          <input
            type="number"
            id="endHour"
            min="1"
            max="24"
            value={endText}
            onFocus={() => {
              focused.current = 'end';
            }}
            onBlur={() => {
              focused.current = null;
              setEndText(String(endHour));
            }}
            onChange={handleHour('endHour', setEndText)}
          />
        </div>
      </div>

      <label className="check">
        <input
          type="checkbox"
          checked={weekend}
          onChange={(e) => onChange({ weekend: e.target.checked })}
        />
        토·일 표시
      </label>

      <div className="btns">
        <button type="button" className="danger" onClick={onClear}>
          전체 삭제
        </button>
      </div>
    </section>
  );
}
