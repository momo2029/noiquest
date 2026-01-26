# 数据库设计

## ER 图

```mermaid
erDiagram
    User ||--o{ ExerciseProgress : has
    User ||--o{ Submission : submits
    User ||--o{ UserAchievement : earns
    User ||--o{ ChatMessage : sends
    User ||--o{ AIUsageRecord : tracks
    User ||--o{ UserUnitProgress : tracks
    User ||--o{ UserLessonProgress : tracks
    User ||--o{ UserDailyQuest : has
    User ||--o{ DailyXpRecord : records
    User ||--o{ KnowledgeMastery : masters
    User ||--o{ MistakeRecord : makes
    User }o--|| Class : belongs_to

    Class ||--o{ Homework : has

    SkillUnit ||--o{ Lesson : contains
    SkillUnit ||--o{ Exercise : contains
    SkillUnit ||--o{ UserUnitProgress : tracked_by

    Lesson ||--o{ Exercise : contains
    Lesson ||--o{ UserLessonProgress : tracked_by

    Exercise ||--o{ ExerciseProgress : tracked_by
    Exercise ||--o{ Submission : receives
    Exercise ||--o{ MistakeRecord : generates

    Homework ||--o{ HomeworkExercise : contains
    Homework ||--o{ StudentHomework : assigned_to

    Achievement ||--o{ UserAchievement : earned_by

    InviteCode ||--o{ User : used_by
```

## 核心数据模型

### User (用户)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | String | 用户名，唯一 |
| email | String | 邮箱，唯一 |
| password | String | 密码哈希 |
| name | String | 姓名 |
| avatar | String | 头像 |
| role | Enum | STUDENT/TEACHER/ADMIN |
| level | Int | 等级 |
| xp | Int | 当前经验值 |
| totalXp | Int | 累计经验值 |
| streak | Int | 连续学习天数 |
| lastStudyDate | DateTime | 最后学习日期 |
| streakProtectedAt | DateTime? | 上次使用 Streak 保护的时间 |
| hearts | Int | 当前生命值 |
| maxHearts | Int | 最大生命值（默认5） |
| heartsUpdatedAt | DateTime | 心的更新时间（用于计算恢复） |
| gems | Int | 宝石 |
| inviteCode | String? | 使用的邀请码 |
| classId | String? | 所属班级 |

### SkillUnit (技能单元)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | String | 标题 |
| description | String | 描述 |
| icon | String | 图标 |
| color | String | 颜色 |
| orderIndex | Int | 排序 |
| requiredXp | Int | 解锁所需XP |
| prerequisiteId | String? | 前置单元 |

### Lesson (课程)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | String | 标题 |
| description | String | 描述 |
| orderIndex | Int | 排序 |
| unitId | String | 所属单元 |

### Exercise (练习题)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | String | 标题 |
| description | String | 描述 |
| difficulty | Enum | EASY/MEDIUM/HARD |
| category | String | 分类 |
| type | Enum | 题目类型 |
| questionData | JSON | 题目数据（含答案） |
| starterCode | String | 初始代码 |
| hint | String? | 提示 |
| solution | String? | 解答 |
| xp | Int | 经验值奖励 |
| orderIndex | Int | 排序 |
| unitId | String? | 所属单元 |
| lessonId | String? | 所属课程 |

### 题目类型 (QuestionType)

| 类型 | 说明 | questionData 结构 |
|------|------|-------------------|
| CODING | 编程题 | `{ testCases: [...] }` |
| FILL_BLANK | 填空题 | `{ code, blanks: [{ id, answer, alternatives }] }` |
| CODE_ORDER | 排序题 | `{ lines: [{ id, code, order }] }` |
| MULTIPLE_CHOICE | 选择题 | `{ question, options: [{ id, text, correct }], explanation }` |
| MATCHING | 配对题 | `{ left: [...], right: [...], pairs: [[l,r]...] }` |
| BUG_FIX | 改错题 | `{ buggyCode, bugs: [{ line, fix, hint }], correctCode }` |

### UserUnitProgress (用户单元进度)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | String | 用户ID |
| unitId | String | 单元ID |
| unlocked | Boolean | 是否解锁 |
| completed | Boolean | 是否完成 |
| lessonsCompleted | Int | 已完成课程数 |
| crownLevel | Int | 皇冠等级(0-3) |
| perfectCount | Int | 完美通关次数 |

### UserLessonProgress (用户课程进度)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | String | 用户ID |
| lessonId | String | 课程ID |
| completed | Boolean | 是否完成 |
| mistakes | Int | 错误次数 |
| perfectRun | Boolean | 是否完美通关 |
| completedCount | Int | 完成次数（区分首次/重做） |
| xpEarned | Int | 累计获得XP |
| lastCompletedAt | DateTime? | 最后完成时间 |

### MistakeRecord (错题记录)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | String | 用户ID |
| exerciseId | String | 题目ID |
| lessonId | String? | 所属课程 |
| unitId | String? | 所属单元 |
| status | Enum | UNREVIEWED/REVIEWING/MASTERED |
| wrongCount | Int | 错误次数 |
| correctStreak | Int | 连续答对次数（达到2次变为MASTERED） |
| userAnswer | JSON? | 最近一次错误答案 |
| correctAnswer | JSON? | 正确答案 |
| wrongAnswers | JSON? | 历史错误答案列表 |
| lastWrongAt | DateTime | 最后错误时间 |
| reviewedAt | DateTime? | 最后复习时间 |
| masteredAt | DateTime? | 掌握时间 |

### 错题状态 (MistakeStatus)

| 状态 | 说明 | 转换条件 |
|------|------|----------|
| UNREVIEWED | 未复习 | 刚记录的错题 |
| REVIEWING | 复习中 | 复习过但还未掌握 |
| MASTERED | 已掌握 | 连续答对2次 |

### InviteCode (邀请码)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| code | String | 邀请码，唯一 |
| createdBy | String? | 创建者 |
| type | String | STUDENT/TEACHER/ADMIN |
| maxUses | Int | 最大使用次数 |
| usedCount | Int | 已使用次数 |
| expiresAt | DateTime? | 过期时间 |
| note | String? | 备注 |

### AIUsageRecord (AI使用记录)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | String | 用户ID |
| date | Date | 日期 |
| count | Int | 当日使用次数 |

### RedeemCode (兑换码)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| code | String | 兑换码，唯一 |
| type | Enum | GEMS/HEARTS/STREAK_PROTECT |
| value | Int | 数量（宝石数/心数） |
| maxUses | Int | 最大使用次数 |
| usedCount | Int | 已使用次数 |
| expiresAt | DateTime? | 过期时间 |
| createdBy | String? | 创建者ID |
| note | String? | 备注 |

### RedeemRecord (兑换记录)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | String | 用户ID |
| codeId | String | 兑换码ID |
| redeemedAt | DateTime | 兑换时间 |

## 索引设计

```sql
-- 用户表索引
CREATE INDEX idx_user_class ON "User"(classId);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_username ON "User"(username);
CREATE INDEX idx_user_invite ON "User"(inviteCode);

-- 练习表索引
CREATE INDEX idx_exercise_category ON "Exercise"(category);
CREATE INDEX idx_exercise_difficulty ON "Exercise"(difficulty);
CREATE INDEX idx_exercise_unit ON "Exercise"(unitId);
CREATE INDEX idx_exercise_lesson ON "Exercise"(lessonId);
CREATE INDEX idx_exercise_type ON "Exercise"(type);

-- 进度表索引
CREATE UNIQUE INDEX idx_progress_user_exercise ON "ExerciseProgress"(userId, exerciseId);
CREATE UNIQUE INDEX idx_unit_progress ON "UserUnitProgress"(userId, unitId);
CREATE UNIQUE INDEX idx_lesson_progress ON "UserLessonProgress"(userId, lessonId);

-- 错题表索引
CREATE UNIQUE INDEX idx_mistake_user_exercise ON "MistakeRecord"(userId, exerciseId);
CREATE INDEX idx_mistake_user_status ON "MistakeRecord"(userId, status);
CREATE INDEX idx_mistake_user_lesson ON "MistakeRecord"(userId, lessonId);

-- AI使用记录索引
CREATE UNIQUE INDEX idx_ai_usage_user_date ON "AIUsageRecord"(userId, date);

-- 邀请码索引
CREATE INDEX idx_invite_code ON "InviteCode"(code);
CREATE INDEX idx_invite_type ON "InviteCode"(type);

-- 兑换码索引
CREATE INDEX idx_redeem_code ON "RedeemCode"(code);
CREATE INDEX idx_redeem_type ON "RedeemCode"(type);
CREATE UNIQUE INDEX idx_redeem_record ON "RedeemRecord"(userId, codeId);
```

## 生命值恢复计算

```typescript
const HEART_RECOVERY_MINUTES = 60; // 1小时恢复1心

function calculateCurrentHearts(user: User): {
  hearts: number;
  nextRecoveryIn: number | null; // 秒
  fullRecoveryIn: number | null; // 秒
} {
  const now = new Date();
  const lastUpdate = new Date(user.heartsUpdatedAt);
  const minutesPassed = (now.getTime() - lastUpdate.getTime()) / 1000 / 60;

  // 计算恢复了多少心
  const recoveredHearts = Math.floor(minutesPassed / HEART_RECOVERY_MINUTES);
  const currentHearts = Math.min(user.hearts + recoveredHearts, user.maxHearts);

  if (currentHearts >= user.maxHearts) {
    return { hearts: currentHearts, nextRecoveryIn: null, fullRecoveryIn: null };
  }

  // 计算下一颗心恢复时间
  const minutesSinceLastRecovery = minutesPassed % HEART_RECOVERY_MINUTES;
  const minutesToNextHeart = HEART_RECOVERY_MINUTES - minutesSinceLastRecovery;

  // 计算全部恢复时间
  const heartsNeeded = user.maxHearts - currentHearts;
  const minutesToFull = minutesToNextHeart + (heartsNeeded - 1) * HEART_RECOVERY_MINUTES;

  return {
    hearts: currentHearts,
    nextRecoveryIn: Math.ceil(minutesToNextHeart * 60),
    fullRecoveryIn: Math.ceil(minutesToFull * 60),
  };
}
```
