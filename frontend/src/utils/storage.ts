import { Student, ExerciseProgress, Assignment, AppSettings } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'cplus_settings',
  STUDENTS: 'cplus_students',
  ASSIGNMENTS: 'cplus_assignments',
  CURRENT_CODE: 'cplus_current_code',
};

// 默认设置
const DEFAULT_SETTINGS: AppSettings = {
  role: 'student',
  theme: 'dark',
  fontSize: 16,
  tabSize: 4,
  soundEnabled: true
};

// 创建默认学生
export function createDefaultStudent(name: string = '小码农', avatar: string = '🦊'): Student {
  return {
    id: generateId(),
    name,
    class: '默认班级',
    avatar,
    level: 1,
    xp: 0,
    totalXp: 0,
    streak: 0,
    lastStudyDate: '',
    hearts: 5,
    gems: 0,
    progress: [],
    achievements: [],
    createdAt: new Date().toISOString()
  };
}

// 设置相关
export function getSettings(): AppSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (data) {
    const settings = JSON.parse(data);
    return { ...DEFAULT_SETTINGS, ...settings };
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// 学生相关
export function getStudents(): Student[] {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  return data ? JSON.parse(data) : [];
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function addStudent(student: Student): void {
  const students = getStudents();
  students.push(student);
  saveStudents(students);
}

export function updateStudent(id: string, updates: Partial<Student>): void {
  const students = getStudents();
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index] = { ...students[index], ...updates };
    saveStudents(students);
  }
}

export function deleteStudent(id: string): void {
  const students = getStudents().filter(s => s.id !== id);
  saveStudents(students);
}

// 进度相关
export function updateProgress(studentId: string, progress: ExerciseProgress): void {
  const students = getStudents();
  const student = students.find(s => s.id === studentId);
  if (student) {
    const existingIndex = student.progress.findIndex(p => p.exerciseId === progress.exerciseId);
    if (existingIndex !== -1) {
      student.progress[existingIndex] = progress;
    } else {
      student.progress.push(progress);
    }
    saveStudents(students);
  }
}

// 更新连续学习天数
export function updateStreak(student: Student): Student {
  const today = new Date().toDateString();
  const lastStudy = student.lastStudyDate ? new Date(student.lastStudyDate).toDateString() : '';

  if (lastStudy === today) {
    // 今天已经学习过
    return student;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (lastStudy === yesterdayStr) {
    // 昨天学习过，连续天数+1
    return {
      ...student,
      streak: student.streak + 1,
      lastStudyDate: new Date().toISOString()
    };
  } else if (lastStudy === '') {
    // 第一次学习
    return {
      ...student,
      streak: 1,
      lastStudyDate: new Date().toISOString()
    };
  } else {
    // 断了，重新开始
    return {
      ...student,
      streak: 1,
      lastStudyDate: new Date().toISOString()
    };
  }
}

// 添加经验值
export function addXp(student: Student, xp: number): Student {
  return {
    ...student,
    xp: student.xp + xp,
    totalXp: student.totalXp + xp,
    gems: student.gems + Math.floor(xp / 10) // 每10XP获得1宝石
  };
}

// 作业相关
export function getAssignments(): Assignment[] {
  const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  return data ? JSON.parse(data) : [];
}

export function saveAssignments(assignments: Assignment[]): void {
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
}

export function addAssignment(assignment: Assignment): void {
  const assignments = getAssignments();
  assignments.push(assignment);
  saveAssignments(assignments);
}

export function deleteAssignment(id: string): void {
  const assignments = getAssignments().filter(a => a.id !== id);
  saveAssignments(assignments);
}

// 当前代码
export function getCurrentCode(): string {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_CODE) || '';
}

export function saveCurrentCode(code: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_CODE, code);
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 当前视图（路由记忆）
const STORAGE_KEY_CURRENT_VIEW = 'current_view';

export function getCurrentView(defaultView: string): string {
  return localStorage.getItem(STORAGE_KEY_CURRENT_VIEW) || defaultView;
}

export function saveCurrentView(view: string): void {
  localStorage.setItem(STORAGE_KEY_CURRENT_VIEW, view);
}
