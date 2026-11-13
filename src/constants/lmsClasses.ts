import { LmsGrade, LmsItem, LmsItemGrade, LmsSubject } from '../types';

export const LMS_CLASS_GROUPS: Record<LmsGrade, string[]> = {
  VII: [
    'VII-A',
    'VII-B',
    'VII-C',
    'VII-D',
    'VII-E',
    'VII-F',
    'VII-G',
    'VII-H',
    'VII-I',
    'VII-J'
  ],
  VIII: [
    'VIII-A',
    'VIII-B',
    'VIII-C',
    'VIII-D',
    'VIII-E',
    'VIII-F',
    'VIII-G',
    'VIII-H',
    'VIII-I'
  ],
  IX: ['IX-A', 'IX-B', 'IX-C', 'IX-D', 'IX-E', 'IX-F', 'IX-G', 'IX-H', 'IX-I']
};

export const ALL_LMS_CLASSES: string[] = [
  ...LMS_CLASS_GROUPS.VII,
  ...LMS_CLASS_GROUPS.VIII,
  ...LMS_CLASS_GROUPS.IX
];

export const VALID_LMS_CLASS_SET = new Set(ALL_LMS_CLASSES);

export function sortLmsClasses(classes: string[]): string[] {
  const orderMap = new Map(ALL_LMS_CLASSES.map((c, idx) => [c, idx]));
  return [...new Set(classes)].sort(
    (a, b) => (orderMap.get(a) ?? 999) - (orderMap.get(b) ?? 999)
  );
}

export function deriveGradeFromClasses(classes: string[]): LmsItemGrade {
  const levels = new Set<LmsGrade>();
  for (const cls of classes) {
    if (cls.startsWith('VII-')) levels.add('VII');
    else if (cls.startsWith('VIII-')) levels.add('VIII');
    else if (cls.startsWith('IX-')) levels.add('IX');
  }
  if (levels.size === 1) {
    return Array.from(levels)[0];
  }
  return 'Semua';
}

export function formatAssignmentClasses(item: Pick<LmsItem, 'targetClasses' | 'grade'>): string {
  if (item.targetClasses && item.targetClasses.length > 0) {
    return sortLmsClasses(item.targetClasses).join(', ');
  }
  return item.grade === 'Semua' ? 'Semua Kelas' : `Kelas ${item.grade}`;
}

export function assignmentMatchesFilter(
  item: Pick<LmsItem, 'targetClasses' | 'grade'>,
  selectedLevel: 'Semua' | LmsGrade,
  selectedClass: string
): boolean {
  if (selectedLevel === 'Semua') {
    return true;
  }

  if (item.targetClasses && item.targetClasses.length > 0) {
    if (selectedClass && selectedClass !== 'Semua') {
      return item.targetClasses.includes(selectedClass);
    }
    return item.targetClasses.some((c) => c.startsWith(`${selectedLevel}-`));
  }

  // Kompatibilitas PR format lama (tanpa targetClasses)
  return item.grade === 'Semua' || item.grade === selectedLevel;
}

export function getSubjectTeacherNames(
  subject: Pick<LmsSubject, 'teacherNamesList' | 'legacyTeacherNames' | 'teacherNames'>
): string[] {
  if (Array.isArray(subject.teacherNamesList) && subject.teacherNamesList.length > 0) {
    return subject.teacherNamesList.map((n) => n.trim()).filter(Boolean);
  }
  if (Array.isArray(subject.legacyTeacherNames) && subject.legacyTeacherNames.length > 0) {
    return subject.legacyTeacherNames.map((n) => n.trim()).filter(Boolean);
  }
  if (typeof subject.teacherNames === 'string' && subject.teacherNames.trim()) {
    return [subject.teacherNames.trim()];
  }
  return [];
}

export function formatSubjectTeacherSummary(
  subject: Pick<LmsSubject, 'teacherNamesList' | 'legacyTeacherNames' | 'teacherNames'>
): { display: string; full: string; count: number } {
  const names = getSubjectTeacherNames(subject);
  if (names.length === 0) {
    return { display: '', full: '', count: 0 };
  }
  const full = names.join(', ');
  if (names.length <= 2 || (names.length === 3 && full.length <= 45)) {
    return { display: full, full, count: names.length };
  }
  const display = `${names.slice(0, 2).join(', ')}, +${names.length - 2} lainnya`;
  return { display, full, count: names.length };
}
