import { fmt, toMin } from './time';

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// 폼 값(시간은 "HH:MM" 문자열) -> 과목 데이터(시간은 분 단위 숫자)
export function formToCourse(form) {
  return {
    name: form.name.trim(),
    day: Number(form.day),
    place: form.place.trim(),
    start: toMin(form.start),
    end: toMin(form.end),
    color: form.color,
  };
}

// 과목 데이터 -> 폼 값
export function courseToForm(course) {
  return {
    name: course.name,
    day: course.day,
    place: course.place || '',
    start: fmt(course.start),
    end: fmt(course.end),
    color: course.color,
  };
}

// 문제가 없으면 빈 문자열, 있으면 안내 문구
export function validateCourse(course) {
  if (!course.name) return '과목명을 입력해 주세요.';
  if (Number.isNaN(course.start) || Number.isNaN(course.end)) {
    return '시작/종료 시간을 입력해 주세요.';
  }
  if (course.end <= course.start) return '종료 시간이 시작 시간보다 늦어야 해요.';
  return '';
}
