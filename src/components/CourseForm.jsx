import { useEffect, useRef } from "react";
import TimeField from "./TimeField";
import { COLORS, DAYS } from "../constants";

// 과목 추가 / 수정 폼. 값은 App이 들고 있고, 바뀔 때마다 onChange(필드, 값)로 알려요.
export default function CourseForm({
  form,
  editingId,
  message,
  range,
  onChange,
  onSubmit,
}) {
  const nameRef = useRef(null);
  const editing = Boolean(editingId);

  // 수정할 과목을 고르면 과목명 칸으로 포커스
  useEffect(() => {
    if (editingId) nameRef.current?.focus();
  }, [editingId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
    if (!editing) nameRef.current?.focus();
  };

  return (
    <form
      className="panel"
      autoComplete="off"
      onSubmit={handleSubmit}
      data-edit-area
    >
      <h2>{editing ? "과목 수정" : "과목 추가"}</h2>

      <label htmlFor="name">과목명</label>
      <input
        ref={nameRef}
        type="text"
        id="name"
        placeholder="예: 웹프로그래밍"
        maxLength={30}
        value={form.name}
        onChange={(e) => onChange("name", e.target.value)}
      />

      <div className="row">
        <div>
          <label htmlFor="day">요일</label>
          <select
            id="day"
            value={form.day}
            onChange={(e) => onChange("day", Number(e.target.value))}
          >
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="place">장소 (선택)</label>
          <input
            type="text"
            id="place"
            placeholder="예: 공학관 302"
            maxLength={20}
            value={form.place}
            onChange={(e) => onChange("place", e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        <div>
          <label htmlFor="startH">시작</label>
          <TimeField
            id="start"
            label="시작"
            value={form.start}
            onChange={(v) => onChange("start", v)}
            minHour={range.startHour}
            maxHour={range.endHour}
          />
        </div>
        <div>
          <label htmlFor="endH">종료</label>
          <TimeField
            id="end"
            label="종료"
            value={form.end}
            onChange={(v) => onChange("end", v)}
            minHour={range.startHour}
            maxHour={range.endHour}
            isEnd
          />
        </div>
      </div>

      <label>색상</label>
      <div className="swatches">
        {COLORS.map((c, i) => (
          <label key={c.bar} title={`색상 ${i + 1}`}>
            <input
              type="radio"
              name="color"
              value={i}
              checked={form.color === i}
              onChange={() => onChange("color", i)}
            />
            <span style={{ background: c.bar }} />
          </label>
        ))}
      </div>

      <div className="btns">
        <button type="submit" className="primary">
          {editing ? "수정 완료" : "추가"}
        </button>
      </div>
      <div className={`msg${message.warn ? " warn" : ""}`} role="status">
        {message.text}
      </div>
    </form>
  );
}
