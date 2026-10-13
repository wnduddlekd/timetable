import CourseBlock from './CourseBlock';
import { DAYS, HOUR_HEIGHT } from '../constants';
import { pad2 } from '../utils/time';
import { getLayout } from '../utils/timetable';

// 제목 + 시간표. 이 영역 전체(captureRef)가 이미지로 저장돼요.
export default function Timetable({
  title,
  onTitleChange,
  items,
  draft,
  startHour,
  endHour,
  weekend,
  editingId,
  conflicts,
  onSelect,
  captureRef,
}) {
  const all = draft ? [...items, draft] : items;
  const layout = getLayout({ startHour, endHour, weekend, all });
  const { days, hours } = layout;

  return (
    <div className="capture" ref={captureRef}>
      <input
        className="tt-title"
        type="text"
        placeholder="시간표 제목"
        maxLength={30}
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />

      <div
        className="tt"
        style={{ '--days': days, '--hours': hours, '--hour-h': `${HOUR_HEIGHT}px` }}
      >
        <div className="tt-head corner" />
        {DAYS.slice(0, days).map((d) => (
          <div key={d} className="tt-head">
            {d}
          </div>
        ))}

        <div className="tt-times">
          {Array.from({ length: hours + 1 }, (_, k) => (
            <span
              key={k}
              style={{
                top: k * HOUR_HEIGHT,
                transform: k === hours ? 'translateY(-100%)' : undefined,
              }}
            >
              {pad2(layout.startHour + k)}:00
            </span>
          ))}
        </div>

        {Array.from({ length: days }, (_, day) => (
          <div key={day} className="tt-col">
            {items
              .filter((c) => c.day === day)
              .map((c) => (
                <CourseBlock
                  key={c.id}
                  course={c}
                  startHour={layout.startHour}
                  conflict={Boolean(conflicts[c.id])}
                  selected={c.id === editingId}
                  onSelect={onSelect}
                />
              ))}
            {draft && draft.day === day && (
              <CourseBlock course={draft} startHour={layout.startHour} draft />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
