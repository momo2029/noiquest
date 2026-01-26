import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  PhoneAuthResponse,
  SkillTreeResponse,
  SkillUnit,
  Lesson,
  Exercise,
  AnswerResult,
  LessonCompleteResult,
  DailyStatus,
  DailyQuest,
  DailyGoalLevel,
  ReviewStatus,
  MistakeRecord,
  KnowledgeMastery,
  ReviewSession,
  ReviewCompleteResult,
  SystemConfig,
} from '../types';

const API_BASE_URL = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    // 从 localStorage 恢复 token
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }));
      throw new Error(error.error || '请求失败');
    }

    return response.json();
  }

  // 认证相关
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // 邮箱认证相关
  async sendVerificationCode(email: string): Promise<{ message: string; code?: string }> {
    return this.request<{ message: string; code?: string }>('/email-auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async emailRegister(data: {
    email: string;
    code: string;
    password: string;
    name: string;
    role?: 'STUDENT' | 'TEACHER';
    inviteCode?: string;
  }): Promise<PhoneAuthResponse> {
    const response = await this.request<PhoneAuthResponse>('/email-auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async emailLogin(email: string, password: string): Promise<PhoneAuthResponse> {
    const response = await this.request<PhoneAuthResponse>('/email-auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  // ==================== 技能树 API ====================

  async getSkillTree(): Promise<SkillTreeResponse> {
    return this.request<SkillTreeResponse>('/skill-tree');
  }

  async getSkillUnit(unitId: string): Promise<SkillUnit> {
    return this.request<SkillUnit>(`/skill-tree/units/${unitId}`);
  }

  async getLesson(lessonId: string): Promise<Lesson> {
    return this.request<Lesson>(`/skill-tree/lessons/${lessonId}`);
  }

  async startLesson(lessonId: string): Promise<{ message: string; exercises: Exercise[] }> {
    return this.request<{ message: string; exercises: Exercise[] }>(`/skill-tree/lessons/${lessonId}/start`, {
      method: 'POST',
    });
  }

  async completeLesson(lessonId: string, mistakes: number): Promise<LessonCompleteResult> {
    return this.request<LessonCompleteResult>(`/skill-tree/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ mistakes }),
    });
  }

  // ==================== 题目 API ====================

  async getQuestion(exerciseId: string): Promise<Exercise & { userProgress: any }> {
    return this.request<Exercise & { userProgress: any }>(`/questions/${exerciseId}`);
  }

  async submitAnswer(exerciseId: string, answer: any, lessonId?: string): Promise<AnswerResult> {
    return this.request<AnswerResult>(`/questions/${exerciseId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer, lessonId }),
    });
  }

  async getHint(exerciseId: string): Promise<{ hints: string[] }> {
    return this.request<{ hints: string[] }>(`/questions/${exerciseId}/hint`);
  }

  async getAIHint(exerciseId: string): Promise<{ hint: string }> {
    return this.request<{ hint: string }>(`/ai/hint/${exerciseId}`, {
      method: 'POST',
    });
  }

  // ==================== 每日目标 API ====================

  async getDailyStatus(): Promise<DailyStatus> {
    return this.request<DailyStatus>('/daily/status');
  }

  async setDailyGoal(data: {
    dailyGoal?: DailyGoalLevel;
    reminderEnabled?: boolean;
    reminderTime?: string;
  }): Promise<{ message: string; settings: any }> {
    return this.request<{ message: string; settings: any }>('/daily/goal', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getDailyQuests(): Promise<DailyQuest[]> {
    return this.request<DailyQuest[]>('/daily/quests');
  }

  async claimQuestReward(questId: string): Promise<{ message: string; xpReward: number; gemsReward: number }> {
    return this.request<{ message: string; xpReward: number; gemsReward: number }>(`/daily/quests/${questId}/claim`, {
      method: 'POST',
    });
  }

  async getDailyHistory(days: number = 7): Promise<{ date: string; xpEarned: number; goalMet: boolean }[]> {
    return this.request<{ date: string; xpEarned: number; goalMet: boolean }[]>(`/daily/history?days=${days}`);
  }

  // ==================== 复习系统 API ====================

  async getReviewStatus(): Promise<ReviewStatus> {
    return this.request<ReviewStatus>('/review/status');
  }

  async getDueReviews(limit: number = 10): Promise<{
    knowledgeReview: { knowledge: any; exercises: Exercise[] }[];
    mistakeReview: MistakeRecord[];
  }> {
    return this.request(`/review/due?limit=${limit}`);
  }

  async startReviewSession(type: 'mistakes' | 'knowledge' | 'mixed' = 'mixed', limit: number = 10): Promise<ReviewSession> {
    return this.request<ReviewSession>('/review/start', {
      method: 'POST',
      body: JSON.stringify({ type, limit }),
    });
  }

  async completeReview(results: {
    exerciseId: string;
    correct: boolean;
    reviewType: string;
    mistakeRecordId?: string;
    knowledgeKey?: string;
  }[]): Promise<ReviewCompleteResult> {
    return this.request<ReviewCompleteResult>('/review/complete', {
      method: 'POST',
      body: JSON.stringify({ results }),
    });
  }

  async getMistakes(params?: {
    category?: string;
    reviewed?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    mistakes: MistakeRecord[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.reviewed !== undefined) query.set('reviewed', String(params.reviewed));
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request(`/review/mistakes?${query.toString()}`);
  }

  async markMistakeReviewed(mistakeId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/review/mistakes/${mistakeId}/review`, {
      method: 'POST',
    });
  }

  async getKnowledgeMastery(type?: string): Promise<KnowledgeMastery[]> {
    const query = type ? `?type=${type}` : '';
    return this.request<KnowledgeMastery[]>(`/review/mastery${query}`);
  }

  // ==================== 管理员 API ====================

  async getAdminDashboard(): Promise<any> {
    return this.request('/admin/dashboard');
  }

  async getAdminUsers(params?: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request(`/admin/users?${query.toString()}`);
  }

  async getAdminUser(userId: string): Promise<any> {
    return this.request(`/admin/users/${userId}`);
  }

  async updateAdminUser(userId: string, data: any): Promise<any> {
    return this.request(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminUser(userId: string): Promise<any> {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getAdminExercises(params?: {
    category?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.type) query.set('type', params.type);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request(`/admin/exercises?${query.toString()}`);
  }

  async getAdminUnits(): Promise<any> {
    return this.request('/admin/units');
  }

  // ==================== 内容管理 API ====================

  // 技能单元
  async getContentSkillUnits(): Promise<any> {
    return this.request('/admin/content/skill-units');
  }

  async createContentSkillUnit(data: {
    title: string;
    description: string;
    icon?: string;
    color?: string;
    requiredXp?: number;
    prerequisiteId?: string;
  }): Promise<any> {
    return this.request('/admin/content/skill-units', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContentSkillUnit(id: string, data: {
    title?: string;
    description?: string;
    icon?: string;
    color?: string;
    requiredXp?: number;
    prerequisiteId?: string;
    isPublished?: boolean;
  }): Promise<any> {
    return this.request(`/admin/content/skill-units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContentSkillUnit(id: string): Promise<any> {
    return this.request(`/admin/content/skill-units/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderContentSkillUnits(orders: { id: string; orderIndex: number }[]): Promise<any> {
    return this.request('/admin/content/skill-units/reorder', {
      method: 'PUT',
      body: JSON.stringify({ orders }),
    });
  }

  // 课程
  async getContentLessons(unitId?: string): Promise<any> {
    const query = unitId ? `?unitId=${unitId}` : '';
    return this.request(`/admin/content/lessons${query}`);
  }

  async createContentLesson(data: {
    title: string;
    description?: string;
    unitId: string;
  }): Promise<any> {
    return this.request('/admin/content/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContentLesson(id: string, data: {
    title?: string;
    description?: string;
    unitId?: string;
    isPublished?: boolean;
  }): Promise<any> {
    return this.request(`/admin/content/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContentLesson(id: string): Promise<any> {
    return this.request(`/admin/content/lessons/${id}`, {
      method: 'DELETE',
    });
  }

  // 题目
  async getContentExercises(params?: {
    unitId?: string;
    lessonId?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.unitId) query.set('unitId', params.unitId);
    if (params?.lessonId) query.set('lessonId', params.lessonId);
    if (params?.type) query.set('type', params.type);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request(`/admin/content/exercises?${query.toString()}`);
  }

  async getContentExercise(id: string): Promise<any> {
    return this.request(`/admin/content/exercises/${id}`);
  }

  async createContentExercise(data: any): Promise<any> {
    return this.request('/admin/content/exercises', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContentExercise(id: string, data: any): Promise<any> {
    return this.request(`/admin/content/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContentExercise(id: string): Promise<any> {
    return this.request(`/admin/content/exercises/${id}`, {
      method: 'DELETE',
    });
  }

  // 知识点
  async getContentKnowledgePoints(category?: string): Promise<any> {
    const query = category ? `?category=${category}` : '';
    return this.request(`/admin/content/knowledge-points${query}`);
  }

  async createContentKnowledgePoint(data: { name: string; category: string }): Promise<any> {
    return this.request('/admin/content/knowledge-points', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContentKnowledgePoint(id: string, data: { name?: string; category?: string }): Promise<any> {
    return this.request(`/admin/content/knowledge-points/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContentKnowledgePoint(id: string): Promise<any> {
    return this.request(`/admin/content/knowledge-points/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminAnalytics(days: number = 30): Promise<any> {
    return this.request(`/admin/analytics?days=${days}`);
  }

  async getAdminSettings(): Promise<any> {
    return this.request('/admin/settings');
  }

  async updateAdminSettings(settings: SystemConfig): Promise<any> {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // ==================== 班级管理 API ====================

  async getAdminClasses(): Promise<any> {
    return this.request('/admin/classes');
  }

  async getAdminClassStudents(classId: string): Promise<any> {
    return this.request(`/admin/classes/${classId}/students`);
  }

  async createAdminClass(data: { name: string; description?: string }): Promise<any> {
    return this.request('/admin/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminClass(classId: string, data: { name?: string; description?: string }): Promise<any> {
    return this.request(`/admin/classes/${classId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminClass(classId: string): Promise<any> {
    return this.request(`/admin/classes/${classId}`, {
      method: 'DELETE',
    });
  }

  // ==================== 邀请码 API ====================

  async getInviteCodes(params?: { used?: boolean }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.used !== undefined) query.set('used', String(params.used));
    return this.request(`/invite?${query.toString()}`);
  }

  async generateInviteCodes(data: {
    count: number;
    type: string;
    maxUses: number;
    expiresInDays?: number;
    note?: string;
  }): Promise<any> {
    return this.request('/invite/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteInviteCode(id: string): Promise<any> {
    return this.request(`/invite/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteExpiredInviteCodes(): Promise<any> {
    return this.request('/invite/expired/batch', {
      method: 'DELETE',
    });
  }

  async verifyInviteCode(code: string): Promise<{ valid: boolean; type: string }> {
    return this.request('/invite/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // ==================== 排行榜 API ====================

  async getLeaderboard(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME' = 'WEEKLY', limit: number = 50): Promise<{
    period: string;
    periodKey: string;
    entries: {
      rank: number;
      userId: string;
      username: string;
      name: string;
      avatar: string;
      xp: number;
      league: string;
    }[];
    myRank: { rank: number; xp: number } | null;
    totalParticipants: number;
  }> {
    return this.request(`/leaderboard?period=${period}&limit=${limit}`);
  }

  async getMyRankings(): Promise<Record<string, { rank: number; xp: number; total: number; percentile: number } | null>> {
    return this.request('/leaderboard/me');
  }

  async getLeagueInfo(): Promise<{
    currentLeague: string;
    leagueName: string;
    leagueColor: string;
    weeklyXp: number;
    weeklyRank: number;
    totalInLeague: number;
    promotionZone: { threshold: number; inZone: boolean; xpNeeded: number };
    demotionZone: { threshold: number; inZone: boolean; safe: boolean };
    rewards: { xpMultiplier: number; weeklyBonus: number };
    endsIn: number;
    endsAt: string;
  }> {
    return this.request('/leaderboard/league');
  }

  // ==================== 成就 API ====================

  async getAchievements(): Promise<any[]> {
    return this.request('/achievements');
  }

  async getUserAchievements(): Promise<{
    unlocked: any[];
    inProgress: any[];
    locked: any[];
  }> {
    return this.request('/achievements/user');
  }

  async checkAchievements(): Promise<{ checked: boolean; newlyUnlocked: any[] }> {
    return this.request('/achievements/check', { method: 'POST' });
  }

  async getUnnotifiedAchievements(): Promise<any[]> {
    return this.request('/achievements/unnotified');
  }

  async markAchievementNotified(achievementId: string): Promise<{ success: boolean }> {
    return this.request(`/achievements/${achievementId}/notified`, { method: 'POST' });
  }

  // ==================== 学习分析 API ====================

  async getDailyAnalytics(date?: string): Promise<{
    date: string;
    totalDuration: number;
    sessionsCount: number;
    exercisesCount: number;
    correctCount: number;
    correctRate: number;
    xpEarned: number;
    lessonsCompleted: number;
    reviewsCompleted: number;
  }> {
    const query = date ? `?date=${date}` : '';
    return this.request(`/analytics/daily${query}`);
  }

  async getWeeklyAnalytics(): Promise<{
    period: string;
    summary: {
      totalDuration: number;
      totalExercises: number;
      totalCorrect: number;
      correctRate: number;
      xpEarned: number;
      lessonsCompleted: number;
      reviewsCompleted: number;
      streakDays: number;
    };
    dailyBreakdown: { date: string; duration: number; exercises: number; correctRate: number; xp: number }[];
    peakHours: { hour: number; sessions: number; avgDuration: number }[];
    comparison: { duration: string; exercises: string; correctRate: string };
  }> {
    return this.request('/analytics/weekly');
  }

  async getKnowledgeMap(): Promise<{
    categories: {
      name: string;
      masteryLevel: number;
      knowledgePoints: { name: string; masteryLevel: number; reviewDue: boolean; reviewCount: number }[];
    }[];
    overallMastery: number;
    weakestPoints: string[];
    strongestPoints: string[];
  }> {
    return this.request('/analytics/knowledge-map');
  }

  async getProgressTrend(days: number = 30): Promise<{
    days: number;
    trend: { date: string; xp: number; exercises: number; correctRate: number; duration: number }[];
  }> {
    return this.request(`/analytics/progress-trend?days=${days}`);
  }

  // ==================== 复习提醒 API ====================

  async getReminders(unreadOnly: boolean = false): Promise<any[]> {
    return this.request(`/reminders?unread=${unreadOnly}`);
  }

  async getReminderCount(): Promise<{ count: number }> {
    return this.request('/reminders/count');
  }

  async markReminderRead(reminderId: string): Promise<{ success: boolean }> {
    return this.request(`/reminders/${reminderId}/read`, { method: 'POST' });
  }

  async markAllRemindersRead(): Promise<{ success: boolean }> {
    return this.request('/reminders/read-all', { method: 'POST' });
  }

  async dismissReminder(reminderId: string): Promise<{ success: boolean }> {
    return this.request(`/reminders/${reminderId}/dismiss`, { method: 'POST' });
  }

  // ==================== 管理端统计 API ====================

  async getExerciseStatistics(exerciseId: string): Promise<any> {
    return this.request(`/admin/statistics/exercises/${exerciseId}/statistics`);
  }

  async getStatisticsOverview(): Promise<{
    totalExercises: number;
    totalAttempts: number;
    totalUsers: number;
    activeUsers: number;
    avgCorrectRate: number;
    today: { exercisesCompleted: number; xpEarned: number; activeUsers: number };
  }> {
    return this.request('/admin/statistics/overview');
  }

  async getDifficultExercises(limit: number = 10): Promise<any[]> {
    return this.request(`/admin/statistics/difficult?limit=${limit}`);
  }

  async getPopularExercises(limit: number = 10): Promise<any[]> {
    return this.request(`/admin/statistics/popular?limit=${limit}`);
  }

  // ==================== 生命值 API ====================

  async getHeartsStatus(): Promise<{
    hearts: number;
    maxHearts: number;
    nextRecoveryIn: number | null;
    fullRecoveryIn: number | null;
    canStartLesson: boolean;
    prices: { single: number; full: number };
    userGems: number;
  }> {
    return this.request('/hearts');
  }

  async purchaseHearts(type: 'single' | 'full'): Promise<{
    success: boolean;
    message: string;
    hearts: number;
    maxHearts: number;
    gemsSpent: number;
    gemsRemaining: number;
  }> {
    return this.request('/hearts/purchase', {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  // ==================== 宝石 API ====================

  async getGemsStatus(): Promise<{ gems: number }> {
    return this.request('/gems');
  }

  // ==================== Streak API ====================

  async getStreakStatus(): Promise<{
    streak: number;
    lastStudyDate: string | null;
    isAtRisk: boolean;
    isBroken: boolean;
    canProtect: boolean;
    protectDeadline: string | null;
    previousStreak: number | null;
    protectCost: number;
    userGems: number;
  }> {
    return this.request('/streak');
  }

  async purchaseStreakProtect(): Promise<{
    success: boolean;
    message: string;
    streak: number;
    gemsSpent: number;
    gemsRemaining: number;
  }> {
    return this.request('/streak/protect', { method: 'POST' });
  }

  async getStreakMilestones(): Promise<{
    currentStreak: number;
    milestones: {
      days: number;
      xpReward: number;
      gemsReward: number;
      name: string;
      achieved: boolean;
      progress: number;
    }[];
  }> {
    return this.request('/streak/milestones');
  }

  // ==================== 兑换码 API ====================

  async redeemCode(code: string): Promise<{
    success: boolean;
    type?: string;
    value?: number;
    message: string;
    error?: string;
    user?: { gems: number; hearts: number; streak: number };
  }> {
    return this.request('/redeem/redeem', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getRedeemHistory(): Promise<{
    records: {
      id: string;
      code: string;
      type: string;
      value: number;
      redeemedAt: string;
    }[];
  }> {
    return this.request('/redeem/history');
  }

  // ==================== 练习题库 API ====================

  async getExerciseCategories(source?: string): Promise<string[]> {
    const query = source ? `?source=${source}` : '';
    return this.request(`/exercises/meta/categories${query}`);
  }

  async getExercises(params?: {
    source?: string;
    category?: string;
    difficulty?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    exercises: {
      id: string;
      title: string;
      description: string;
      difficulty: string;
      category: string;
      xp: number;
      completed: boolean;
      completedCount: number;
    }[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params?.source) query.set('source', params.source);
    if (params?.category) query.set('category', params.category);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request(`/exercises?${query.toString()}`);
  }

  async getExerciseDetail(exerciseId: string): Promise<any> {
    return this.request(`/exercises/${exerciseId}`);
  }

  async saveExerciseCode(exerciseId: string, code: string): Promise<{ message: string }> {
    return this.request(`/exercises/${exerciseId}/save`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async runExerciseCode(exerciseId: string, code: string): Promise<any> {
    return this.request(`/exercises/${exerciseId}/run`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async submitExercise(exerciseId: string, code: string): Promise<{
    correct: boolean;
    message: string;
    xpEarned: number;
    isFirstCompletion: boolean;
    totalXp?: number;
  }> {
    return this.request(`/exercises/${exerciseId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }
}

export const api = new ApiService();
