import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Timetable from "./components/Timetable";
import CourseForm from "./components/CourseForm";
import CourseList from "./components/CourseList";
import SettingsPanel from "./components/SettingsPanel";
import { STORAGE_KEY } from "./constants";
import { autoEnd, clampTime } from "./utils/time";
import {
  courseToForm,
  formToCourse,
  uid,
  validateCourse,
} from "./utils/course";
import { findConflicts } from "./utils/timetable";
import { saveElementAsImage } from "./utils/saveImage";

const DEFAULTS = {
  title: "나의 시간표",
  startHour: 9,
  endHour: 18,
  weekend: false,
  items: [],
};

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && Array.isArray(saved.items)) return { ...DEFAULTS, ...saved };
    }
  } catch {
    /* 저장소를 못 쓰는 환경에서는 기본값 사용 */
  }
  return DEFAULTS;
}

function makeInitialForm(startHour, endHour) {
  const start = clampTime("09:00", startHour, endHour, false);
  return {
    name: "",
    day: 0,
    place: "",
    start,
    end: autoEnd(start, endHour),
    color: 0,
  };
}

export default function App() {
  const [saved] = useState(loadSaved);
  const [title, setTitle] = useState(saved.title);
  const [settings, setSettings] = useState({
    startHour: saved.startHour,
    endHour: saved.endHour,
    weekend: Boolean(saved.weekend),
  });
  const [items, setItems] = useState(saved.items);

  const [form, setForm] = useState(() =>
    makeInitialForm(saved.startHour, saved.endHour),
  );
  const [editingId, setEditingId] = useState(null);
  const [endTouched, setEndTouched] = useState(false); // 종료 시간을 직접 골랐는지
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const captureRef = useRef(null);

  // 수정 중에 폼·과목 밖을 누르면 수정 완료
  useEffect(() => {
    if (!editingId) return;
    const handleOutside = (e) => {
      if (e.target.closest("[data-edit-area]")) return;
      resetForm();
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [editingId]);

  // 바뀔 때마다 브라우저에 저장
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ title, ...settings, items }),
      );
    } catch {
      /* 저장 실패는 무시 */
    }
  }, [title, settings, items]);

  /* ---------- 폼 ---------- */
  function handleFormChange(field, value) {
    const next = { ...form, [field]: value };
    if (field === "end") setEndTouched(true);
    // 종료 시간을 직접 고르기 전에는 시작 시간의 1시간 뒤로 자동 설정
    if (field === "start" && !endTouched && !editingId) {
      next.end = autoEnd(value, settings.endHour);
    }
    setForm(next);

    if (editingId) {
      // 수정 중에는 바꾸는 즉시 시간표에 반영
      const course = formToCourse(next);
      const err = validateCourse(course);
      setError(err);
      if (!err) {
        setItems((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...course } : c)),
        );
      }
    } else {
      setError("");
    }
  }

  function resetForm() {
    setEditingId(null);
    setEndTouched(false);
    setError("");
    setForm((f) => ({ ...f, name: "", place: "" }));
  }

  function handleSubmit() {
    if (editingId) {
      resetForm();
      return;
    }
    const course = formToCourse(form);
    const err = validateCourse(course);
    if (err) {
      setError(err);
      return;
    }
    setItems((prev) => [...prev, { ...course, id: uid() }]);
    if (course.day >= 5) setSettings((s) => ({ ...s, weekend: true }));
    resetForm();
    setForm(makeInitialForm(settings.startHour, settings.endHour));
  }

  function handleSelect(id) {
    const course = items.find((c) => c.id === id);
    if (!course) return;
    setEditingId(id);
    setEndTouched(true);
    setError("");
    setForm(courseToForm(course));
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((c) => c.id !== id));
    if (editingId === id) resetForm();
  }

  function handleClear() {
    if (items.length === 0) return;
    if (window.confirm("등록한 과목을 모두 삭제할까요?")) {
      setItems([]);
      resetForm();
    }
  }

  /* ---------- 표시 설정 ---------- */
  function handleSettingsChange(patch) {
    const next = { ...settings, ...patch };
    if (patch.startHour !== undefined)
      next.startHour = Math.max(0, Math.min(22, patch.startHour));
    if (patch.endHour !== undefined)
      next.endHour = Math.max(1, Math.min(24, patch.endHour));
    if (next.endHour <= next.startHour) next.endHour = next.startHour + 1;
    setSettings(next);
    setError("");

    // 시각 범위가 바뀌면 폼의 시간도 범위 안으로 맞춰요 (수정 중인 과목은 그대로)
    const rangeChanged =
      next.startHour !== settings.startHour ||
      next.endHour !== settings.endHour;
    if (rangeChanged && !editingId) {
      setForm((f) => {
        const start = clampTime(f.start, next.startHour, next.endHour, false);
        const end = endTouched
          ? clampTime(f.end, next.startHour, next.endHour, true)
          : autoEnd(start, next.endHour);
        return { ...f, start, end };
      });
    }
  }

  /* ---------- 이미지 저장 ---------- */
  async function handleSaveImage() {
    setSaving(true);
    try {
      await saveElementAsImage(captureRef.current, title);
    } catch {
      window.alert("이미지 저장에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  /* ---------- 화면용 계산값 ---------- */
  const conflicts = useMemo(() => findConflicts(items), [items]);

  const draftCourse = formToCourse(form);
  const draft =
    !editingId && !validateCourse(draftCourse)
      ? { ...draftCourse, id: "draft" }
      : null;

  let message = { text: "", warn: false };
  if (error) message = { text: error, warn: false };
  else if (Object.keys(conflicts).length) {
    message = {
      text: "시간이 겹치는 과목이 있어요 (점선으로 표시).",
      warn: true,
    };
  }

  return (
    <div className="app">
      <main>
        <div className="stage-bar">
          <p>
            입력하는 즉시 반영돼요. 시간표의 과목을 누르면 수정할 수 있어요.
          </p>
          <button
            type="button"
            className="primary"
            onClick={handleSaveImage}
            disabled={saving}
          >
            {saving ? "저장 중..." : "이미지로 저장"}
          </button>
        </div>
        <div className="stage">
          <Timetable
            title={title}
            onTitleChange={setTitle}
            items={items}
            draft={draft}
            startHour={settings.startHour}
            endHour={settings.endHour}
            weekend={settings.weekend}
            editingId={editingId}
            conflicts={conflicts}
            onSelect={handleSelect}
            captureRef={captureRef}
          />
        </div>
      </main>

      <aside>
        <CourseForm
          form={form}
          editingId={editingId}
          message={message}
          range={settings}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={() => {
            resetForm();
          }}
        />
        <CourseList
          items={items}
          editingId={editingId}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
        <SettingsPanel
          startHour={settings.startHour}
          endHour={settings.endHour}
          weekend={settings.weekend}
          onChange={handleSettingsChange}
          onClear={handleClear}
        />
      </aside>
    </div>
  );
}
