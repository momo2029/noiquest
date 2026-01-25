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
| hearts | Int | 生命值 |
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

-- AI使用记录索引
CREATE UNIQUE INDEX idx_ai_usage_user_date ON "AIUsageRecord"(userId, date);

-- 邀请码索引
CREATE INDEX idx_invite_code ON "InviteCode"(code);
CREATE INDEX idx_invite_type ON "InviteCode"(type);
```
