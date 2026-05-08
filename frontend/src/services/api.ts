import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  PhoneAuthResponse,
  SkillTreeResponse,
  SkillUnit,
  Exercise,
  AnswerResult,
  SessionCompleteResult,
  DailyStatus,
  DailyQuest,
  DailyGoalLevel,
  ReviewStatus,
  MistakeRecord,
  KnowledgeMastery,
  ReviewSession,
  ReviewCompleteResult,
  SystemConfig,
  TierInfo,
  ModuleInfo,
  CoursesResponse,
  Course,
  CourseSession,
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
      const errorMessage = error.error || '请求失败';

      // 处理登录失效（单设备登录）
      if (response.status === 401 && errorMessage === '登录已失效，请重新登录') {
        this.setToken(null);
        window.dispatchEvent(new CustomEvent('auth:session_expired'));
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  // 认证相关

  // 确保用户存在（自动创建匿名用户）
  async ensureUser(): Promise<{ userId: string; isActivated: boolean; authType: string }> {
    const response = await this.request<{ userId: string; isActivated: boolean; authType: string }>('/users/ensure', {
      method: 'POST',
      credentials: 'include',
    });
    return response;
  }

  // 发送邮箱验证码
  async sendVerificationCode(email: string): Promise<{ message: string; code?: string }> {
    return this.request('/email-auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // 激活账号
  async activateAccount(data: {
    userId: string;
    email: string;
    code: string;
    name?: string;
  }): Promise<{ success: boolean; merged: boolean; user: any }> {
    const response = await this.request<{ success: boolean; merged: boolean; user: any }>('/email-auth/activate', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return response;
  }

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

  // 更新用户资料
  async updateProfile(data: { name?: string; avatar?: string }): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // 邮箱认证相关

  async emailRegister(data: {
    email: string;
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

  async getSkillTree(params?: { tier?: string; moduleId?: number }): Promise<SkillTreeResponse> {
    const query = new URLSearchParams();
    if (params?.tier) query.set('tier', params.tier);
    if (params?.moduleId) query.set('moduleId', String(params.moduleId));
    const queryStr = query.toString();
    return this.request<SkillTreeResponse>(`/skill-tree${queryStr ? `?${queryStr}` : ''}`);
  }

  async getTiers(): Promise<{ tiers: TierInfo[] }> {
    return this.request<{ tiers: TierInfo[] }>('/skill-tree/tiers');
  }

  // 公开 API（不需要登录）
  async getPublicTiers(): Promise<{ tiers: TierInfo[] }> {
    return this.request<{ tiers: TierInfo[] }>('/skill-tree/public/tiers');
  }

  async getPublicModules(tier?: string): Promise<{ modules: ModuleInfo[] }> {
    const query = tier ? `?tier=${tier}` : '';
    return this.request<{ modules: ModuleInfo[] }>(`/skill-tree/public/modules${query}`);
  }

  async getPublicSkillTree(params?: { tier?: string; moduleId?: number }): Promise<SkillTreeResponse> {
    const query = new URLSearchParams();
    if (params?.tier) query.set('tier', params.tier);
    if (params?.moduleId) query.set('moduleId', String(params.moduleId));
    const queryStr = query.toString();
    return this.request<SkillTreeResponse>(`/skill-tree/public${queryStr ? `?${queryStr}` : ''}`);
  }

  // 静态知识图谱数据（优先从静态文件加载）
  async getStaticKnowledgeGraph(): Promise<{
    generatedAt: string;
    tiers: TierInfo[];
    modules: ModuleInfo[];
    skillTree: SkillUnit[];
    dependencies: { from: string; to: string }[];
  } | null> {
    try {
      const response = await fetch('/data/knowledge-graph.json');
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  async getModules(tier?: string): Promise<{ modules: ModuleInfo[] }> {
    const query = tier ? `?tier=${tier}` : '';
    return this.request<{ modules: ModuleInfo[] }>(`/skill-tree/modules${query}`);
  }

  async getSkillUnit(unitId: string): Promise<SkillUnit> {
    return this.request<SkillUnit>(`/skill-tree/units/${unitId}`);
  }

  async getSession(sessionId: string): Promise<CourseSession & { course: { id: string; code: string; title: string }; exercises: Exercise[] }> {
    return this.request(`/skill-tree/sessions/${sessionId}`);
  }

  async startSession(sessionId: string): Promise<{ message: string; exercises: Exercise[] }> {
    return this.request<{ message: string; exercises: Exercise[] }>(`/skill-tree/sessions/${sessionId}/start`, {
      method: 'POST',
    });
  }

  async completeSession(sessionId: string, mistakes: number): Promise<SessionCompleteResult> {
    return this.request<SessionCompleteResult>(`/skill-tree/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ mistakes }),
    });
  }

  // ==================== 课程系统 API ====================

  async getCourses(params?: { tier?: string; moduleId?: number }): Promise<CoursesResponse> {
    const query = new URLSearchParams();
    if (params?.tier) query.set('tier', params.tier);
    if (params?.moduleId) query.set('moduleId', String(params.moduleId));
    const queryStr = query.toString();
    return this.request<CoursesResponse>(`/courses${queryStr ? `?${queryStr}` : ''}`);
  }

  async getCourse(courseId: string): Promise<Course> {
    return this.request<Course>(`/courses/${courseId}`);
  }

  async getCourseSession(sessionId: string): Promise<CourseSession & { course: { id: string; code: string; title: string }; exercises: Exercise[] }> {
    return this.request(`/courses/sessions/${sessionId}`);
  }

  async startCourseSession(sessionId: string): Promise<{ message: string; exercises: Exercise[] }> {
    return this.request<{ message: string; exercises: Exercise[] }>(`/courses/sessions/${sessionId}/start`, {
      method: 'POST',
    });
  }

  async completeCourseSession(sessionId: string, mistakes: number): Promise<{
    message: string;
    xpEarned: number;
    perfectRun: boolean;
    courseCompleted: boolean;
    sessionsCompleted: number;
    totalSessions: number;
    crownLevel: number;
  }> {
    return this.request(`/courses/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ mistakes }),
    });
  }

  // ==================== 题目 API ====================

  async getQuestion(exerciseId: string): Promise<Exercise & { userProgress: any }> {
    return this.request<Exercise & { userProgress: any }>(`/questions/${exerciseId}`);
  }

  async submitAnswer(exerciseId: string, answer: any, sessionId?: string): Promise<AnswerResult> {
    return this.request<AnswerResult>(`/questions/${exerciseId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer, sessionId }),
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

  async sendStudyHeartbeat(minutes: number = 1): Promise<{ studyMinutes: number; added: number }> {
    return this.request<{ studyMinutes: number; added: number }>('/daily/study-heartbeat', {
      method: 'POST',
      body: JSON.stringify({ minutes }),
    });
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
    moduleId?: number;
    tier?: string;
    code?: string;
    coreLevel?: number;
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
    moduleId?: number;
    tier?: string;
    code?: string;
    coreLevel?: number;
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
  async getContentCourses(moduleId?: number): Promise<any> {
    const query = moduleId ? `?moduleId=${moduleId}` : '';
    return this.request(`/admin/content/courses${query}`);
  }

  async getContentCourse(id: string): Promise<any> {
    return this.request(`/admin/content/courses/${id}`);
  }

  async createContentCourse(data: {
    code: string;
    title: string;
    description?: string;
    objectives?: string[];
    tier?: string;
    moduleId: number;
    unitIds?: string[];
    isPublished?: boolean;
  }): Promise<any> {
    return this.request('/admin/content/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContentCourse(id: string, data: {
    code?: string;
    title?: string;
    description?: string;
    objectives?: string[];
    tier?: string;
    moduleId?: number;
    unitIds?: string[];
    isPublished?: boolean;
  }): Promise<any> {
    return this.request(`/admin/content/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContentCourse(id: string): Promise<any> {
    return this.request(`/admin/content/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // 课时
  async createContentSession(courseId: string, data: {
    title: string;
    description?: string;
    xpReward?: number;
    isPublished?: boolean;
  }): Promise<any> {
    return this.request(`/admin/content/courses/${courseId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContentSession(id: string, data: {
    title?: string;
    description?: string;
    xpReward?: number;
    isPublished?: boolean;
  }): Promise<any> {
    return this.request(`/admin/content/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContentSession(id: string): Promise<any> {
    return this.request(`/admin/content/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  async addSessionExercise(sessionId: string, exerciseId: string): Promise<any> {
    return this.request(`/admin/content/sessions/${sessionId}/exercises`, {
      method: 'POST',
      body: JSON.stringify({ exerciseId }),
    });
  }

  async removeSessionExercise(sessionId: string, exerciseId: string): Promise<any> {
    return this.request(`/admin/content/sessions/${sessionId}/exercises/${exerciseId}`, {
      method: 'DELETE',
    });
  }

  // 模块
  async getContentModules(): Promise<any> {
    return this.request('/admin/content/modules');
  }

  // 题目
  async getContentExercises(params?: {
    courseId?: string;
    sessionId?: string;
    type?: string;
    knowledgePointId?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.courseId) query.set('courseId', params.courseId);
    if (params?.sessionId) query.set('sessionId', params.sessionId);
    if (params?.type) query.set('type', params.type);
    if (params?.knowledgePointId) query.set('knowledgePointId', params.knowledgePointId);
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

  // ==================== 知识点学习资料 API ====================

  async getSkillUnitLearningContent(unitId: string): Promise<{
    id: string;
    code: string;
    title: string;
    description: string;
    content: string | null;
    codeExamples: { title: string; code: string; language: string; explanation?: string }[] | null;
    videoUrl: string | null;
    references: { title: string; url: string }[] | null;
    tips: string[];
    commonMistakes: string[];
    estimatedTime: number | null;
  }> {
    return this.request(`/admin/skill-units/${unitId}/content`);
  }

  async updateSkillUnitLearningContent(unitId: string, data: {
    content?: string;
    codeExamples?: { title: string; code: string; language: string; explanation?: string }[];
    videoUrl?: string;
    references?: { title: string; url: string }[];
    tips?: string[];
    commonMistakes?: string[];
    estimatedTime?: number;
  }): Promise<any> {
    return this.request(`/admin/skill-units/${unitId}/content`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminSkillUnits(params?: {
    tier?: string;
    moduleId?: number;
    hasContent?: boolean;
  }): Promise<{ units: any[] }> {
    const query = new URLSearchParams();
    if (params?.tier) query.set('tier', params.tier);
    if (params?.moduleId) query.set('moduleId', String(params.moduleId));
    if (params?.hasContent !== undefined) query.set('hasContent', String(params.hasContent));
    return this.request(`/admin/skill-units?${query.toString()}`);
  }

  async regenerateStaticFiles(): Promise<{ message: string }> {
    return this.request('/admin/regenerate-static', { method: 'POST' });
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

  // ==================== 教师班级管理 API ====================

  async getTeacherClasses(): Promise<any> {
    return this.request('/classes');
  }

  async createTeacherClass(data: { name: string; description?: string }): Promise<any> {
    return this.request('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTeacherClassDetail(classId: string): Promise<any> {
    return this.request(`/classes/${classId}`);
  }

  async getTeacherClassStudents(classId: string): Promise<any> {
    return this.request(`/classes/${classId}/students`);
  }

  async addStudentToClass(classId: string, studentId: string): Promise<any> {
    return this.request(`/classes/${classId}/students`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  }

  async removeStudentFromClass(classId: string, studentId: string): Promise<any> {
    return this.request(`/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
    });
  }

  async deleteTeacherClass(classId: string): Promise<any> {
    return this.request(`/classes/${classId}`, {
      method: 'DELETE',
    });
  }

  // 搜索未分班学生
  async searchUnassignedStudents(keyword: string): Promise<{ users: any[] }> {
    return this.request(`/classes/search/students?q=${encodeURIComponent(keyword)}`);
  }

  // 班级邀请码管理
  async getClassInviteCodes(classId: string): Promise<{ codes: any[] }> {
    return this.request(`/classes/${classId}/invite-codes`);
  }

  async createClassInviteCode(classId: string, data: {
    expiresInDays?: number;
    maxUses?: number;
    note?: string;
  }): Promise<any> {
    return this.request(`/classes/${classId}/invite-codes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteClassInviteCode(classId: string, codeId: string): Promise<any> {
    return this.request(`/classes/${classId}/invite-codes/${codeId}`, {
      method: 'DELETE',
    });
  }

  // 获取班级学生错题统计
  async getClassMistakesSummary(classId: string): Promise<{
    students: {
      id: string;
      name: string;
      avatar: string;
      totalMistakes: number;
      unreviewedMistakes: number;
    }[];
  }> {
    return this.request(`/classes/${classId}/mistakes-summary`);
  }

  // 获取学生错题列表
  async getStudentMistakes(classId: string, studentId: string, params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    student: { id: string; name: string };
    mistakes: any[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request(`/classes/${classId}/students/${studentId}/mistakes?${query.toString()}`);
  }

  // ==================== 邀请码 API ====================

  async getInviteCodes(params?: { used?: boolean }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.used !== undefined) query.set('used', String(params.used));
    return this.request(`/invite?${query.toString()}`);
  }

  async generateInviteCodes(data: {
    count?: number;
    type: string;
    maxUses: number;
    expiresInDays?: number;
    note?: string;
    customCodes?: string[];
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

  async verifyInviteCode(code: string): Promise<{
    valid: boolean;
    type: string;
    classInfo?: {
      id: string;
      name: string;
      teacherName: string;
    } | null;
  }> {
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
    sessionsCompleted: number;
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
      sessionsCompleted: number;
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

  async consumeHeart(amount: number = 1): Promise<{
    hearts: number;
    maxHearts: number;
    nextRecoveryIn: number | null;
    canContinue: boolean;
  }> {
    return this.request('/hearts/consume', {
      method: 'POST',
      body: JSON.stringify({ amount }),
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

  // 通用代码执行（编辑器直接运行）
  async executeCode(code: string, stdin: string = ''): Promise<{
    success: boolean;
    stdout: string;
    stderr: string;
    status: { id: number; description: string };
    time: number;
    memory: number;
    compileOutput?: string;
    error?: string;
  }> {
    return this.request('/exercises/execute', {
      method: 'POST',
      body: JSON.stringify({ code, stdin }),
    });
  }

  // ==================== 用户文件 API ====================

  async getUserFiles(): Promise<{
    files: { id: string; name: string; updatedAt: string }[];
  }> {
    return this.request('/user-files');
  }

  async getUserFile(id: string): Promise<{
    file: { id: string; name: string; content: string; updatedAt: string };
  }> {
    return this.request(`/user-files/${id}`);
  }

  async syncUserFiles(data: {
    files: { id?: string; name: string; content: string }[];
    deletedIds?: string[];
  }): Promise<{
    message: string;
    files: { id: string; name: string; updatedAt: string }[];
  }> {
    return this.request('/user-files/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteUserFile(id: string): Promise<{ message: string }> {
    return this.request(`/user-files/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
