// 用户角色
export type UserRole = 'student' | 'teacher';

// 认证相关
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  role?: 'STUDENT' | 'TEACHER';
  classCode?: string;
}

export interface PhoneAuthResponse {
  user: User;
  token: string;
}

export interface User {
  id: string;
  username: string;
  phone?: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatar: string;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  hearts: number;
  gems: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// 练习题难度
export type Difficulty = 'easy' | 'medium' | 'hard' | 'EASY' | 'MEDIUM' | 'HARD';

// 题目类型
export type QuestionType = 'CODING' | 'FILL_BLANK' | 'CODE_ORDER' | 'MULTIPLE_CHOICE' | 'MATCHING' | 'BUG_FIX';

// 每日目标等级
export type DailyGoalLevel = 'CASUAL' | 'REGULAR' | 'SERIOUS' | 'INTENSE';

// 代码文件
export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

// 练习题
export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  starterCode: string;
  hint?: string;
  solution?: string;
  xp: number;
  type?: QuestionType;
  questionData?: QuestionData;
  unitId?: string;
  lessonId?: string;
}

// 题目数据类型
export type QuestionData = FillBlankData | CodeOrderData | MultipleChoiceData | MatchingData | BugFixData;

// 填空题数据
export interface FillBlankData {
  code: string;
  blanks: {
    id: string;
    answer: string;
    hint?: string;
    alternatives?: string[];
  }[];
}

// 排序题数据
export interface CodeOrderData {
  description: string;
  lines: {
    id: string;
    code: string;
    order: number;
  }[];
}

// 选择题数据
export interface MultipleChoiceData {
  question: string;
  options: {
    id: string;
    text: string;
    correct: boolean;
  }[];
  explanation?: string;
}

// 配对题数据
export interface MatchingData {
  left: { id: string; text: string }[];
  right: { id: string; text: string }[];
  pairs: [string, string][];
}

// 改错题数据
export interface BugFixData {
  buggyCode: string;
  bugs: {
    line: number;
    fix: string;
    hint?: string;
  }[];
  correctCode?: string;
}

// 练习完成记录
export interface ExerciseProgress {
  exerciseId: string;
  completed: boolean;
  code: string;
  completedAt?: string;
}

// 成就
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  xpReward: number;
  unlockedAt?: string;
}

// 学生信息
export interface Student {
  id: string;
  name: string;
  class: string;
  avatar: string;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  lastStudyDate: string;
  hearts: number;
  gems: number;
  progress: ExerciseProgress[];
  achievements: string[];
  createdAt: string;
}

// 作业
export interface Assignment {
  id: string;
  title: string;
  description: string;
  exerciseIds: string[];
  dueDate: string;
  createdAt: string;
}

// AI消息
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 应用设置
export interface AppSettings {
  apiKey: string;
  role: UserRole;
  currentStudentId?: string;
  theme: 'dark' | 'light';
  fontSize: number;
  tabSize: number;
  soundEnabled: boolean;
}

// ==================== 多邻国模式新增类型 ====================

// 技能单元
export interface SkillUnit {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  orderIndex: number;
  requiredXp: number;
  prerequisiteId?: string;
  prerequisite?: { id: string; title: string };
  lessons: Lesson[];
  unlocked: boolean;
  completed: boolean;
  lessonsCompleted: number;
  crownLevel: number;
}

// 课程
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  unitId: string;
  exercises: Exercise[];
  completed: boolean;
  mistakes: number;
  perfectRun: boolean;
}

// 技能树响应
export interface SkillTreeResponse {
  skillTree: SkillUnit[];
  userTotalXp: number;
}

// 课程会话
export interface LessonSession {
  lessonId: string;
  exercises: Exercise[];
  currentIndex: number;
  mistakes: number;
  hearts: number;
  xpEarned: number;
}

// 答题结果
export interface AnswerResult {
  correct: boolean;
  feedback: string;
  correctAnswer?: any;
  xpEarned: number;
}

// 课程完成结果
export interface LessonCompleteResult {
  message: string;
  xpEarned: number;
  bonusXp: number;
  perfectRun: boolean;
  unitCompleted: boolean;
  lessonsCompleted: number;
  totalLessons: number;
  crownLevel: number;
}

// 每日状态
export interface DailyStatus {
  dailyGoal: DailyGoalLevel;
  goalXp: number;
  xpEarned: number;
  progress: number;
  goalMet: boolean;
  streak: number;
  reminderEnabled: boolean;
  reminderTime?: string;
}

// 每日任务
export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  questType: string;
  currentValue: number;
  targetValue: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  xpReward: number;
  gemsReward: number;
}

// 复习状态
export interface ReviewStatus {
  dueCount: number;
  mistakeCount: number;
  totalReviewItems: number;
  masteryStats: {
    type: string;
    avgMastery: number;
    count: number;
  }[];
  weakPoints: {
    key: string;
    type: string;
    masteryLevel: number;
    lastReviewedAt?: string;
  }[];
}

// 错题记录
export interface MistakeRecord {
  id: string;
  exercise: Exercise;
  userAnswer: any;
  correctAnswer: any;
  mistakeCount: number;
  reviewed: boolean;
  reviewedAt?: string;
  createdAt: string;
}

// 知识点掌握度
export interface KnowledgeMastery {
  key: string;
  type: string;
  masteryLevel: number;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
}

// 复习会话
export interface ReviewSession {
  sessionId: string;
  exercises: (Exercise & { reviewType: string; mistakeRecordId?: string; knowledgeKey?: string })[];
  totalCount: number;
}

// 复习完成结果
export interface ReviewCompleteResult {
  message: string;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  xpEarned: number;
}

// 学习路径单元（兼容旧版）
export interface LearningUnit {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  exercises: string[];
  requiredXp: number;
  unlocked: boolean;
}

// 认证状态
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
