import { COLORS, DAYS } from "../constants";
import { fmt } from "../utils/time";

// 등록한 과목 목록. 누르면 수정, ✕는 삭제.
export default function CourseList({ items, editingId, onSelect, onDelete }) {
  const sorted = [...items].sort((a, b) => a.day - b.day || a.start - b.start);

  return (
    <section className="panel">
      <h2>
        등록한 과목{" "}
        {items.length > 0 && <span className="count">({items.length})</span>}
      </h2>

      <ul className="list">
        {sorted.length === 0 && (
          <li className="empty">아직 등록한 과목이 없어요.</li>
        )}
        {sorted.map((c) => (
          <li
            key={c.id}
            className={c.id === editingId ? "editing" : undefined}
            data-edit-area
            onClick={() => onSelect(c.id)}
          >
            <span
              className="dot"
              style={{ background: (COLORS[c.color] || COLORS[0]).bar }}
            />
            <div className="info">
              <b>{c.name}</b>
              <small>
                {DAYS[c.day]} {fmt(c.start)}–{fmt(c.end)}
                {c.place ? ` · ${c.place}` : ""}
              </small>
            </div>
            <button
              type="button"
              className="del"
              title="삭제"
              aria-label={`${c.name} 삭제`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
