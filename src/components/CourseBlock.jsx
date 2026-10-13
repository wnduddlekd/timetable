import { COLORS, HOUR_HEIGHT } from "../constants";
import { fmt } from "../utils/time";

// 시간표 안의 과목 한 칸
export default function CourseBlock({
  course,
  startHour,
  conflict = false,
  selected = false,
  draft = false,
  onSelect,
}) {
  const color = COLORS[course.color] || COLORS[0];
  const duration = course.end - course.start;

  const className = [
    "block",
    draft && "draft",
    conflict && "conflict",
    selected && "selected",
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    top: ((course.start - startHour * 60) / 60) * HOUR_HEIGHT,
    height: (duration / 60) * HOUR_HEIGHT - 2,
    background: color.bg,
    "--bar": color.bar,
  };

  // 입력 중 미리보기는 저장 이미지에서 제외
  const extra = draft ? { "data-html2canvas-ignore": "true" } : {};

  return (
    <div
      className={className}
      style={style}
      data-edit-area
      onClick={draft ? undefined : () => onSelect(course.id)}
      {...extra}
    >
      <b>{course.name}</b>
      {duration >= 40 && (
        <small>
          {fmt(course.start)}–{fmt(course.end)}
        </small>
      )}
      {course.place && duration >= 60 && <small>{course.place}</small>}
    </div>
  );
}
