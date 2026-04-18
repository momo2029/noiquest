--
-- PostgreSQL database dump
--

\restrict dHg789YOh5hpdauZg4bYGXXouuMWwOb1cwZYLy7T3YB5Uk8vUw9c4oQ8Du231Pz

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ChangeType; Type: TYPE; Schema: public; Owner: noiquest
--

CREATE TYPE public."ChangeType" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE'
);


ALTER TYPE public."ChangeType" OWNER TO noiquest;

--
-- Name: DailyGoalLevel; Type: TYPE; Schema: public; Owner: noiquest
--

CREATE TYPE public."DailyGoalLevel" AS ENUM (
    'CASUAL',
    'REGULAR',
    'SERIOUS',
    'INTENSE'
);


ALTER TYPE public."DailyGoalLevel" OWNER TO noiquest;

--
-- Name: Difficulty; Type: TYPE; Schema: public; Owner: noiquest
--

CREATE TYPE public."Difficulty" AS ENUM (
    'EASY',
    'MEDIUM',
    'HARD'
);


ALTER TYPE public."Difficulty" OWNER TO noiquest;

--
-- Name: LeaderboardPeriod; Type: TYPE; Schema: public; Owner: noiquest
--

CREATE TYPE public."LeaderboardPeriod" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'ALL_TIME'
);


ALTER TYPE public."LeaderboardPeriod" OWNER TO noiquest;

--
-- Name: LeagueLevel; Type: TYPE; Schema: public; Owner: noiquest
--

CREATE TYPE public."LeagueLevel" AS ENUM (
    'BRONZE',
    'SILVER',
    'GOLD',
    'DIAMOND',
    'MASTER'
);


ALTER TYPE public."LeagueLevel" OWNER TO noiquest;

--
-- Name: MistakeStatus; Type: TYPE; Schema: public; Owner: noiquest
--

CREATE TYPE public."MistakeStatus" AS ENUM (
    'UNREVIEWED',
    'REVIEWING',
    'MASTERED'
);


ALTER TYPE public."MistakeStatus" OWNER TO noiquest;

--
-- Name: QuestionType; Type: TYPE; Schema: public; Owner: noiquest
--

CREATE TYPE public."QuestionType" AS ENUM (
    'CODING',
    'FILL_BLANK',
    'CODE_ORDER',
    'MULTIPLE_CHOICE',
    'MATCHING',
    'BUG_FIX'
);


ALTER TYPE public."QuestionType" OWNER TO noiquest;

--
-- Name: RedeemCodeType; Type: TYPE; Schema: public; Owner: noiquest
--

CREATE TYPE public."RedeemCodeType" AS ENUM (
    'GEMS',
    'HEARTS',
    'STREAK_PROTECT'
);


ALTER TYPE public."RedeemCodeType" OWNER TO noiquest;

--
-- Name: ReminderType; Type: TYPE; Schema: public; Owner: noiquest
--

CREATE TYPE public."ReminderType" AS ENUM (
    'DUE_REVIEW',
    'INACTIVE',
    'MASTERY_DROP',
    'MISTAKES_PILE',
    'STREAK_RISK'
);


ALTER TYPE public."ReminderType" OWNER TO noiquest;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: noiquest
--

CREATE TYPE public."Role" AS ENUM (
    'STUDENT',
    'TEACHER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO noiquest;

--
-- Name: SessionType; Type: TYPE; Schema: public; Owner: noiquest
--

CREATE TYPE public."SessionType" AS ENUM (
    'LESSON',
    'REVIEW',
    'PRACTICE'
);


ALTER TYPE public."SessionType" OWNER TO noiquest;

--
-- Name: Tier; Type: TYPE; Schema: public; Owner: noiquest
--

CREATE TYPE public."Tier" AS ENUM (
    'CSP_J',
    'CSP_S',
    'PROVINCIAL',
    'IOI'
);


ALTER TYPE public."Tier" OWNER TO noiquest;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AIUsageRecord; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."AIUsageRecord" (
    id text NOT NULL,
    "userId" text NOT NULL,
    date date NOT NULL,
    count integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AIUsageRecord" OWNER TO noiquest;

--
-- Name: Achievement; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."Achievement" (
    id text NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    category text DEFAULT 'MILESTONE'::text NOT NULL,
    condition jsonb DEFAULT '{}'::jsonb NOT NULL,
    reward jsonb DEFAULT '{"xp": 0, "gems": 0}'::jsonb NOT NULL,
    rarity text DEFAULT 'COMMON'::text NOT NULL,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Achievement" OWNER TO noiquest;

--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "sessionId" text NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatMessage" OWNER TO noiquest;

--
-- Name: Class; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."Class" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "teacherId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Class" OWNER TO noiquest;

--
-- Name: ContentVersion; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."ContentVersion" (
    id text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    version integer NOT NULL,
    data jsonb NOT NULL,
    "changeType" public."ChangeType" NOT NULL,
    "changedBy" text NOT NULL,
    "changeNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ContentVersion" OWNER TO noiquest;

--
-- Name: Course; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."Course" (
    id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text,
    objectives text[],
    "orderIndex" integer DEFAULT 0 NOT NULL,
    tier public."Tier" DEFAULT 'CSP_J'::public."Tier" NOT NULL,
    "moduleId" integer NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Course" OWNER TO noiquest;

--
-- Name: CoursePrerequisite; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."CoursePrerequisite" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "prerequisiteId" text NOT NULL
);


ALTER TABLE public."CoursePrerequisite" OWNER TO noiquest;

--
-- Name: CourseSession; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."CourseSession" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "courseId" text NOT NULL,
    "xpReward" integer DEFAULT 10 NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CourseSession" OWNER TO noiquest;

--
-- Name: CourseUnit; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."CourseUnit" (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "unitId" text NOT NULL
);


ALTER TABLE public."CourseUnit" OWNER TO noiquest;

--
-- Name: DailyLearningStats; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."DailyLearningStats" (
    id text NOT NULL,
    "userId" text NOT NULL,
    date date NOT NULL,
    "totalDuration" integer DEFAULT 0 NOT NULL,
    "sessionsCount" integer DEFAULT 0 NOT NULL,
    "exercisesCount" integer DEFAULT 0 NOT NULL,
    "correctCount" integer DEFAULT 0 NOT NULL,
    "xpEarned" integer DEFAULT 0 NOT NULL,
    "lessonsCompleted" integer DEFAULT 0 NOT NULL,
    "reviewsCompleted" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."DailyLearningStats" OWNER TO noiquest;

--
-- Name: DailyQuestTemplate; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."DailyQuestTemplate" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "questType" text NOT NULL,
    "targetValue" integer NOT NULL,
    "xpReward" integer DEFAULT 10 NOT NULL,
    "gemsReward" integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DailyQuestTemplate" OWNER TO noiquest;

--
-- Name: DailyXpRecord; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."DailyXpRecord" (
    id text NOT NULL,
    "userId" text NOT NULL,
    date date NOT NULL,
    "xpEarned" integer DEFAULT 0 NOT NULL,
    "goalMet" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DailyXpRecord" OWNER TO noiquest;

--
-- Name: Exercise; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."Exercise" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    difficulty public."Difficulty" NOT NULL,
    category text NOT NULL,
    "starterCode" text NOT NULL,
    hint text,
    solution text,
    xp integer DEFAULT 10 NOT NULL,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    type public."QuestionType" DEFAULT 'CODING'::public."QuestionType" NOT NULL,
    "questionData" jsonb,
    source text DEFAULT 'SKILL_TREE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Exercise" OWNER TO noiquest;

--
-- Name: ExerciseKnowledgePoint; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."ExerciseKnowledgePoint" (
    id text NOT NULL,
    "exerciseId" text NOT NULL,
    "knowledgePointId" text NOT NULL
);


ALTER TABLE public."ExerciseKnowledgePoint" OWNER TO noiquest;

--
-- Name: ExerciseProgress; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."ExerciseProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "exerciseId" text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    code text,
    "completedAt" timestamp(3) without time zone,
    "completedCount" integer DEFAULT 0 NOT NULL,
    "xpEarned" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ExerciseProgress" OWNER TO noiquest;

--
-- Name: ExerciseStatistics; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."ExerciseStatistics" (
    id text NOT NULL,
    "exerciseId" text NOT NULL,
    "totalAttempts" integer DEFAULT 0 NOT NULL,
    "correctFirst" integer DEFAULT 0 NOT NULL,
    "totalCorrect" integer DEFAULT 0 NOT NULL,
    "uniqueUsers" integer DEFAULT 0 NOT NULL,
    "totalTimeSeconds" integer DEFAULT 0 NOT NULL,
    "skippedCount" integer DEFAULT 0 NOT NULL,
    "commonMistakes" jsonb,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ExerciseStatistics" OWNER TO noiquest;

--
-- Name: Homework; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."Homework" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "classId" text NOT NULL,
    "teacherId" text NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Homework" OWNER TO noiquest;

--
-- Name: HomeworkExercise; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."HomeworkExercise" (
    id text NOT NULL,
    "homeworkId" text NOT NULL,
    "exerciseId" text NOT NULL,
    "orderIndex" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."HomeworkExercise" OWNER TO noiquest;

--
-- Name: InviteCode; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."InviteCode" (
    id text NOT NULL,
    code text NOT NULL,
    "createdBy" text,
    "usedBy" text,
    "usedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "maxUses" integer DEFAULT 1 NOT NULL,
    "usedCount" integer DEFAULT 0 NOT NULL,
    type text DEFAULT 'STUDENT'::text NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InviteCode" OWNER TO noiquest;

--
-- Name: KnowledgeMastery; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."KnowledgeMastery" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "knowledgeKey" text NOT NULL,
    "knowledgeType" text NOT NULL,
    "masteryLevel" integer DEFAULT 0 NOT NULL,
    "lastReviewedAt" timestamp(3) without time zone,
    "nextReviewAt" timestamp(3) without time zone,
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "correctCount" integer DEFAULT 0 NOT NULL,
    "incorrectCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."KnowledgeMastery" OWNER TO noiquest;

--
-- Name: KnowledgePoint; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."KnowledgePoint" (
    id text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."KnowledgePoint" OWNER TO noiquest;

--
-- Name: LeaderboardEntry; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."LeaderboardEntry" (
    id text NOT NULL,
    "userId" text NOT NULL,
    period public."LeaderboardPeriod" NOT NULL,
    "periodKey" text NOT NULL,
    xp integer DEFAULT 0 NOT NULL,
    rank integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LeaderboardEntry" OWNER TO noiquest;

--
-- Name: LearningSession; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."LearningSession" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "sessionType" public."SessionType" NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endedAt" timestamp(3) without time zone,
    duration integer,
    "exerciseCount" integer DEFAULT 0 NOT NULL,
    "correctCount" integer DEFAULT 0 NOT NULL,
    "xpEarned" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."LearningSession" OWNER TO noiquest;

--
-- Name: MistakeRecord; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."MistakeRecord" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "exerciseId" text NOT NULL,
    "sessionId" text,
    source text DEFAULT 'COURSE'::text NOT NULL,
    status public."MistakeStatus" DEFAULT 'UNREVIEWED'::public."MistakeStatus" NOT NULL,
    "wrongCount" integer DEFAULT 1 NOT NULL,
    "correctStreak" integer DEFAULT 0 NOT NULL,
    "userAnswer" jsonb,
    "correctAnswer" jsonb,
    "wrongAnswers" jsonb,
    "lastWrongAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp(3) without time zone,
    "masteredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MistakeRecord" OWNER TO noiquest;

--
-- Name: Module; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."Module" (
    id integer NOT NULL,
    name text NOT NULL,
    icon text DEFAULT '📚'::text NOT NULL,
    color text DEFAULT '#3b82f6'::text NOT NULL,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Module" OWNER TO noiquest;

--
-- Name: RedeemCode; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."RedeemCode" (
    id text NOT NULL,
    code text NOT NULL,
    type public."RedeemCodeType" NOT NULL,
    value integer NOT NULL,
    "maxUses" integer DEFAULT 1 NOT NULL,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "createdBy" text,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RedeemCode" OWNER TO noiquest;

--
-- Name: RedeemRecord; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."RedeemRecord" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "codeId" text NOT NULL,
    "redeemedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RedeemRecord" OWNER TO noiquest;

--
-- Name: ReviewReminder; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."ReviewReminder" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."ReminderType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb,
    read boolean DEFAULT false NOT NULL,
    dismissed boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ReviewReminder" OWNER TO noiquest;

--
-- Name: SessionExercise; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."SessionExercise" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "exerciseId" text NOT NULL,
    "orderIndex" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."SessionExercise" OWNER TO noiquest;

--
-- Name: SkillUnit; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."SkillUnit" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text DEFAULT '📚'::text NOT NULL,
    color text DEFAULT 'from-blue-400 to-blue-600'::text NOT NULL,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "requiredXp" integer DEFAULT 0 NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    code text,
    tier public."Tier" DEFAULT 'CSP_J'::public."Tier" NOT NULL,
    "moduleId" integer,
    "coreLevel" integer DEFAULT 3 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "codeExamples" jsonb,
    "commonMistakes" text[],
    content text,
    "estimatedTime" integer,
    "references" jsonb,
    tips text[],
    "videoUrl" text
);


ALTER TABLE public."SkillUnit" OWNER TO noiquest;

--
-- Name: SkillUnitPrerequisite; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."SkillUnitPrerequisite" (
    id text NOT NULL,
    "unitId" text NOT NULL,
    "prerequisiteId" text NOT NULL
);


ALTER TABLE public."SkillUnitPrerequisite" OWNER TO noiquest;

--
-- Name: StudentHomework; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."StudentHomework" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "homeworkId" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    score integer,
    feedback text
);


ALTER TABLE public."StudentHomework" OWNER TO noiquest;

--
-- Name: Submission; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."Submission" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "exerciseId" text NOT NULL,
    code text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    output text,
    "errorMsg" text,
    "executionTime" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Submission" OWNER TO noiquest;

--
-- Name: SystemConfig; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."SystemConfig" (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SystemConfig" OWNER TO noiquest;

--
-- Name: TestCase; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."TestCase" (
    id text NOT NULL,
    "exerciseId" text NOT NULL,
    input text NOT NULL,
    output text NOT NULL,
    "isHidden" boolean DEFAULT false NOT NULL,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "timeLimit" integer,
    "memoryLimit" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TestCase" OWNER TO noiquest;

--
-- Name: User; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    avatar text DEFAULT '🦊'::text NOT NULL,
    role public."Role" DEFAULT 'STUDENT'::public."Role" NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    xp integer DEFAULT 0 NOT NULL,
    "totalXp" integer DEFAULT 0 NOT NULL,
    streak integer DEFAULT 0 NOT NULL,
    "lastStudyDate" timestamp(3) without time zone,
    "streakProtectedAt" timestamp(3) without time zone,
    hearts integer DEFAULT 5 NOT NULL,
    "maxHearts" integer DEFAULT 5 NOT NULL,
    "heartsUpdatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    gems integer DEFAULT 0 NOT NULL,
    "inviteCode" text,
    "classId" text,
    "tokenVersion" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO noiquest;

--
-- Name: UserAchievement; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."UserAchievement" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "achievementId" text NOT NULL,
    "unlockedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    notified boolean DEFAULT false NOT NULL
);


ALTER TABLE public."UserAchievement" OWNER TO noiquest;

--
-- Name: UserCourseProgress; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."UserCourseProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "courseId" text NOT NULL,
    unlocked boolean DEFAULT false NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "sessionsCompleted" integer DEFAULT 0 NOT NULL,
    "crownLevel" integer DEFAULT 0 NOT NULL,
    "totalXpEarned" integer DEFAULT 0 NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserCourseProgress" OWNER TO noiquest;

--
-- Name: UserDailyQuest; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."UserDailyQuest" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "templateId" text NOT NULL,
    "currentValue" integer DEFAULT 0 NOT NULL,
    "targetValue" integer NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    claimed boolean DEFAULT false NOT NULL,
    "xpReward" integer NOT NULL,
    "gemsReward" integer DEFAULT 0 NOT NULL,
    date date NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserDailyQuest" OWNER TO noiquest;

--
-- Name: UserDailySettings; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."UserDailySettings" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "dailyGoal" public."DailyGoalLevel" DEFAULT 'REGULAR'::public."DailyGoalLevel" NOT NULL,
    "reminderEnabled" boolean DEFAULT true NOT NULL,
    "reminderTime" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserDailySettings" OWNER TO noiquest;

--
-- Name: UserFile; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."UserFile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserFile" OWNER TO noiquest;

--
-- Name: UserLeague; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."UserLeague" (
    id text NOT NULL,
    "userId" text NOT NULL,
    league public."LeagueLevel" DEFAULT 'BRONZE'::public."LeagueLevel" NOT NULL,
    "weeklyXp" integer DEFAULT 0 NOT NULL,
    "weeklyRank" integer,
    "promotedAt" timestamp(3) without time zone,
    "demotedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserLeague" OWNER TO noiquest;

--
-- Name: UserSessionProgress; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."UserSessionProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "sessionId" text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    mistakes integer DEFAULT 0 NOT NULL,
    "perfectRun" boolean DEFAULT false NOT NULL,
    "completedCount" integer DEFAULT 0 NOT NULL,
    "xpEarned" integer DEFAULT 0 NOT NULL,
    "lastCompletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserSessionProgress" OWNER TO noiquest;

--
-- Name: UserTierProgress; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."UserTierProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    tier public."Tier" NOT NULL,
    unlocked boolean DEFAULT false NOT NULL,
    "unitsCompleted" integer DEFAULT 0 NOT NULL,
    "totalUnits" integer DEFAULT 0 NOT NULL,
    "completionRate" double precision DEFAULT 0 NOT NULL,
    "unlockedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserTierProgress" OWNER TO noiquest;

--
-- Name: UserUnitProgress; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."UserUnitProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "unitId" text NOT NULL,
    unlocked boolean DEFAULT false NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "crownLevel" integer DEFAULT 0 NOT NULL,
    "perfectCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."UserUnitProgress" OWNER TO noiquest;

--
-- Name: VerificationCode; Type: TABLE; Schema: public; Owner: noiquest
--

CREATE TABLE public."VerificationCode" (
    id text NOT NULL,
    email text NOT NULL,
    code text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."VerificationCode" OWNER TO noiquest;

--
-- Data for Name: AIUsageRecord; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."AIUsageRecord" (id, "userId", date, count, "createdAt", "updatedAt") FROM stdin;
98588c3f-6eeb-472a-8246-d0159f765fa1	8738a703-3540-4842-911e-acaa73a0af9b	2026-01-31	2	2026-01-31 04:41:27.662	2026-01-31 04:41:51.128
\.


--
-- Data for Name: Achievement; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."Achievement" (id, key, name, description, icon, category, condition, reward, rarity, "orderIndex", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."ChatMessage" (id, "userId", "sessionId", role, content, "createdAt") FROM stdin;
\.


--
-- Data for Name: Class; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."Class" (id, name, description, "teacherId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContentVersion; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."ContentVersion" (id, "entityType", "entityId", version, data, "changeType", "changedBy", "changeNote", "createdAt") FROM stdin;
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."Course" (id, code, title, description, objectives, "orderIndex", tier, "moduleId", "isPublished", "createdAt", "updatedAt") FROM stdin;
85a77e95-71c9-4019-856e-36d4361475b6	M1-L01	C++入门与变量	认识C++程序结构，掌握变量定义与基本数据类型	{认识C++程序基本结构,掌握变量定义与命名规则,理解int/char/double/bool四种基本类型}	1	CSP_J	1	t	2026-01-30 16:29:53.583	2026-02-01 12:22:38.208
0e27431b-875a-415a-8bdc-f71ee10b26b7	M1-L02	运算符与表达式	掌握C++各类运算符的使用，理解运算符优先级	{掌握算术/关系/逻辑运算符的使用,理解运算符优先级与结合性,正确使用自增/自减运算符}	2	CSP_J	1	t	2026-01-30 16:29:53.598	2026-02-01 12:22:44.448
a3c3dd99-9238-4d91-8c02-d8c086c8814d	M1-L03	输入输出	掌握cin/cout和scanf/printf两种输入输出方式	{掌握cin/cout基础使用,掌握scanf/printf格式控制,了解freopen文件重定向}	3	CSP_J	1	t	2026-01-30 16:29:53.611	2026-02-01 12:22:52.553
38370f8d-7804-47b8-a114-fa96c79626cf	M1-L04	分支结构	掌握if/else和switch语句，实现条件判断	{"掌握if/else if/else多分支",掌握switch语句,能处理多条件判断}	4	CSP_J	1	t	2026-01-30 16:29:53.623	2026-02-01 12:23:00.737
18b0980a-1ff5-4599-abae-7297c1ec743d	M1-L05	循环结构（上）	掌握for、while、do-while三种循环的基础使用	{掌握for循环语法,掌握while循环语法,理解循环三要素}	5	CSP_J	1	t	2026-01-30 16:29:53.635	2026-02-01 12:23:06.182
57af7827-34b5-4ee4-86ca-d77c41f94e18	M1-L06	循环结构（下）	掌握循环嵌套和break/continue的使用	{掌握循环嵌套,理解break/continue,能解决双重循环问题}	6	CSP_J	1	t	2026-01-30 16:29:53.646	2026-02-01 12:23:12.58
51233d80-d440-46ce-87f2-4a729e37656c	M1-L07	一维数组	掌握一维数组的定义、初始化与遍历	{掌握数组定义与初始化,理解数组下标从0开始,能遍历数组解决统计问题}	7	CSP_J	1	t	2026-01-30 16:29:53.657	2026-02-01 12:23:18.981
e7bcdd28-89fc-4b77-8b0f-3b36c40cbe08	M1-L08	二维数组与字符串	掌握二维数组和字符串的基本操作	{掌握二维数组的定义与遍历,掌握char数组与string类,能进行字符串基本操作}	8	CSP_J	1	t	2026-01-30 16:29:53.669	2026-02-01 12:23:23.229
8f8aafdf-4125-42f5-99bf-f26e18b14c5c	M1-L09	函数基础	掌握函数的定义、调用与参数传递	{掌握函数定义与调用,理解参数传递（值传递）,能封装重复逻辑为函数}	9	CSP_J	1	t	2026-01-30 16:29:53.682	2026-02-01 12:23:28.935
6f789059-d943-4a49-8c88-a719a3673832	M1-L10	递归与结构体	理解递归思想，掌握结构体的使用	{理解递归的核心思想,掌握递归终止条件设计,掌握结构体定义与使用}	10	CSP_J	1	t	2026-01-30 16:29:53.694	2026-02-01 12:23:33.713
c8635f23-f275-446a-885d-1dc9352e9242	M1-L11	指针与引用	理解指针和引用的概念，掌握引用传递	{理解指针与地址的概念,掌握引用传递,理解数组与指针的关系}	11	CSP_S	1	t	2026-01-30 16:29:53.709	2026-02-01 12:23:38.735
1f13c1f4-52c6-4b45-8cbc-eba1f624a7df	M1-L12	STL容器	掌握vector、set、map等常用STL容器	{掌握vector动态数组,了解set/map/queue/stack,能选择合适的容器}	12	CSP_S	1	t	2026-01-30 16:29:53.722	2026-02-01 12:23:42.718
1ca5ecb5-3be5-41aa-8af2-c300bc44c8e9	M1-L13	STL算法与位运算	掌握sort等STL算法，理解位运算基础	{掌握sort排序算法,理解位运算基础,能用位运算优化代码}	13	CSP_S	1	t	2026-01-30 16:29:53.74	2026-02-01 12:23:47.286
db088b21-5e85-41f3-a890-7286bd922102	M1-L14	竞赛技巧与综合训练	掌握快速读写优化，综合运用所有知识点	{掌握快速读写优化,了解模板函数基础,综合运用所有知识点}	14	CSP_S	1	t	2026-01-30 16:29:53.756	2026-02-01 12:23:51.077
9153a6d9-80a3-435c-9632-990eb8d7b3c0	M1-L15	异常处理	掌握C++异常处理机制，编写健壮的程序	{理解异常处理的概念,掌握try-catch语法,学会自定义异常类}	15	CSP_S	1	t	2026-01-30 16:29:53.769	2026-02-01 12:23:55.669
\.


--
-- Data for Name: CoursePrerequisite; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."CoursePrerequisite" (id, "courseId", "prerequisiteId") FROM stdin;
8fda8951-f579-4e28-b35e-0800bb59373f	0e27431b-875a-415a-8bdc-f71ee10b26b7	85a77e95-71c9-4019-856e-36d4361475b6
f81191c3-3448-4290-a941-647e14aeb8d8	a3c3dd99-9238-4d91-8c02-d8c086c8814d	85a77e95-71c9-4019-856e-36d4361475b6
bfcc9299-7d51-4282-9ffa-f8606df8b651	38370f8d-7804-47b8-a114-fa96c79626cf	0e27431b-875a-415a-8bdc-f71ee10b26b7
8b1eb6f1-f84a-4331-bbf2-45f3366067c9	18b0980a-1ff5-4599-abae-7297c1ec743d	38370f8d-7804-47b8-a114-fa96c79626cf
4c67059a-4a7d-4f4b-88ca-9d081cf67d48	57af7827-34b5-4ee4-86ca-d77c41f94e18	18b0980a-1ff5-4599-abae-7297c1ec743d
8d4b8023-4385-4be0-937a-dea3de65d0f1	51233d80-d440-46ce-87f2-4a729e37656c	57af7827-34b5-4ee4-86ca-d77c41f94e18
29470899-47a4-475b-ad84-d774dfcc02da	e7bcdd28-89fc-4b77-8b0f-3b36c40cbe08	51233d80-d440-46ce-87f2-4a729e37656c
bca91eaa-3da3-4f86-ba08-347e60f0a148	8f8aafdf-4125-42f5-99bf-f26e18b14c5c	57af7827-34b5-4ee4-86ca-d77c41f94e18
21dbc219-0a8f-495f-bde2-37a6e60edee2	6f789059-d943-4a49-8c88-a719a3673832	8f8aafdf-4125-42f5-99bf-f26e18b14c5c
f2be48c5-3ffd-4cbb-ac0e-43feb72200f9	c8635f23-f275-446a-885d-1dc9352e9242	51233d80-d440-46ce-87f2-4a729e37656c
7f49bab3-fbc9-46da-8c3b-d2cc6996c525	c8635f23-f275-446a-885d-1dc9352e9242	8f8aafdf-4125-42f5-99bf-f26e18b14c5c
ba03f4c2-034d-49f5-add9-9df581b83c08	1f13c1f4-52c6-4b45-8cbc-eba1f624a7df	c8635f23-f275-446a-885d-1dc9352e9242
f8f5d42f-f2f0-494a-a4f2-e40144c3b9b1	1ca5ecb5-3be5-41aa-8af2-c300bc44c8e9	1f13c1f4-52c6-4b45-8cbc-eba1f624a7df
c6eeb2c3-70f5-41b9-a558-0c33a0683450	db088b21-5e85-41f3-a890-7286bd922102	1ca5ecb5-3be5-41aa-8af2-c300bc44c8e9
694120cf-30c1-4d19-b0a8-db0af2087ae9	9153a6d9-80a3-435c-9632-990eb8d7b3c0	db088b21-5e85-41f3-a890-7286bd922102
\.


--
-- Data for Name: CourseSession; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."CourseSession" (id, title, description, "orderIndex", "courseId", "xpReward", "isPublished", "createdAt", "updatedAt") FROM stdin;
e5d1c27f-474b-4085-846e-7f438fad7d3d	变量是什么	理解变量的概念，学习变量命名规则	2	85a77e95-71c9-4019-856e-36d4361475b6	10	t	2026-01-30 16:29:53.591	2026-02-01 12:22:41.964
747327b0-56fe-4814-bc53-48d97d4f9ab6	整型与字符型	学习int和char类型的使用	3	85a77e95-71c9-4019-856e-36d4361475b6	10	t	2026-01-30 16:29:53.593	2026-02-01 12:22:42.381
dfaf7d92-3b6b-43ac-bd06-b2eb6bb7ded0	浮点型与布尔型	学习double和bool类型的使用	4	85a77e95-71c9-4019-856e-36d4361475b6	15	t	2026-01-30 16:29:53.594	2026-02-01 12:22:43.02
ccce2aa1-6042-4b18-a6d1-6fae5748dd40	综合练习	变量定义与类型转换综合练习	5	85a77e95-71c9-4019-856e-36d4361475b6	20	t	2026-01-30 16:29:53.596	2026-02-01 12:22:44.028
d1f349a5-c602-4555-b114-578a6bdc2357	算术运算符	学习+、-、*、/、%运算符	1	0e27431b-875a-415a-8bdc-f71ee10b26b7	10	t	2026-01-30 16:29:53.602	2026-02-01 12:22:45.81
e5ae3fc3-69aa-4605-af13-abca6627a007	关系运算符	学习>、<、==、!=等比较运算	2	0e27431b-875a-415a-8bdc-f71ee10b26b7	10	t	2026-01-30 16:29:53.604	2026-02-01 12:22:46.683
b466fc2e-9c3f-40b8-a164-560eff53eef6	逻辑运算符	学习&&、||、!逻辑运算	3	0e27431b-875a-415a-8bdc-f71ee10b26b7	10	t	2026-01-30 16:29:53.606	2026-02-01 12:22:47.537
f6e4a18e-4233-4164-ab2f-784a96137f7f	自增自减与优先级	掌握++、--和运算符优先级	4	0e27431b-875a-415a-8bdc-f71ee10b26b7	15	t	2026-01-30 16:29:53.607	2026-02-01 12:22:48.847
d9ec109e-a744-40fe-8bd9-339d86345a37	综合练习	表达式计算综合练习	5	0e27431b-875a-415a-8bdc-f71ee10b26b7	20	t	2026-01-30 16:29:53.609	2026-02-01 12:22:51.061
2eb3fb1e-c0e2-4d4b-b647-f2894b592fe7	cin与cout	学习C++风格的输入输出	1	a3c3dd99-9238-4d91-8c02-d8c086c8814d	10	t	2026-01-30 16:29:53.615	2026-02-01 12:22:55.452
862330ac-ad50-46a2-b8fe-99759d5c8a1c	scanf与printf	学习C风格的格式化输入输出	2	a3c3dd99-9238-4d91-8c02-d8c086c8814d	10	t	2026-01-30 16:29:53.617	2026-02-01 12:22:56.736
8176c340-62e7-4fb7-a6a2-964be7de9d03	格式控制	学习保留小数、对齐等格式控制	3	a3c3dd99-9238-4d91-8c02-d8c086c8814d	10	t	2026-01-30 16:29:53.618	2026-02-01 12:22:58.911
e1d5927f-2ad9-4f03-9f91-68a938fdec7c	文件重定向	学习freopen实现文件读写	4	a3c3dd99-9238-4d91-8c02-d8c086c8814d	15	t	2026-01-30 16:29:53.62	2026-02-01 12:22:59.329
93b0fe2d-157c-43e7-b091-d0bd3049f6ac	综合练习	输入输出综合练习	5	a3c3dd99-9238-4d91-8c02-d8c086c8814d	20	t	2026-01-30 16:29:53.621	2026-02-01 12:22:59.774
60e7f193-2ea7-4f05-ae88-3de870728db3	if语句	学习单分支和双分支结构	1	38370f8d-7804-47b8-a114-fa96c79626cf	10	t	2026-01-30 16:29:53.627	2026-02-01 12:23:02.449
7716e2e7-cd32-4e09-86f0-ab2fa24d0956	多分支结构	学习if-else if-else多分支	2	38370f8d-7804-47b8-a114-fa96c79626cf	10	t	2026-01-30 16:29:53.628	2026-02-01 12:23:03.372
4e67fe17-1710-4f88-8812-eccef8217c95	switch语句	学习switch-case分支结构	3	38370f8d-7804-47b8-a114-fa96c79626cf	10	t	2026-01-30 16:29:53.63	2026-02-01 12:23:04.292
26084db8-bb12-41a0-b5c3-3e9977fc2de1	条件表达式	学习三目运算符和复杂条件	4	38370f8d-7804-47b8-a114-fa96c79626cf	15	t	2026-01-30 16:29:53.631	2026-02-01 12:23:04.816
182c24d5-7b8a-42cc-81fe-bf150ca96008	综合练习	分支结构综合练习	5	38370f8d-7804-47b8-a114-fa96c79626cf	20	t	2026-01-30 16:29:53.633	2026-02-01 12:23:05.762
46992a34-aa33-4a42-87fa-988d3b8095ed	for循环	学习for循环的基本语法	1	18b0980a-1ff5-4599-abae-7297c1ec743d	10	t	2026-01-30 16:29:53.638	2026-02-01 12:23:09.323
a8680c6c-5648-4d80-9f19-9805389f33bd	while循环	学习while循环的使用	2	18b0980a-1ff5-4599-abae-7297c1ec743d	10	t	2026-01-30 16:29:53.639	2026-02-01 12:23:10.228
49602caf-6f59-4bb5-a8b9-84332e3f6ef0	do-while循环	学习do-while循环的特点	3	18b0980a-1ff5-4599-abae-7297c1ec743d	10	t	2026-01-30 16:29:53.641	2026-02-01 12:23:11.135
e2a575cf-1c68-4772-b72f-9471de076f9d	循环计数与累加	用循环实现计数和累加	4	18b0980a-1ff5-4599-abae-7297c1ec743d	15	t	2026-01-30 16:29:53.642	2026-02-01 12:23:11.653
77b339a2-231a-4afc-993a-185b06631027	综合练习	基础循环综合练习	5	18b0980a-1ff5-4599-abae-7297c1ec743d	20	t	2026-01-30 16:29:53.644	2026-02-01 12:23:12.16
01fab7c7-d7dd-444d-b40d-ec67c3c68f70	循环嵌套原理	理解双重循环的执行过程	1	57af7827-34b5-4ee4-86ca-d77c41f94e18	10	t	2026-01-30 16:29:53.649	2026-02-01 12:23:15.54
649c2505-4a4b-48e0-9792-a702e8d8342b	九九乘法表	用嵌套循环输出乘法表	2	57af7827-34b5-4ee4-86ca-d77c41f94e18	10	t	2026-01-30 16:29:53.651	2026-02-01 12:23:16.259
9e3a4488-8fd4-4d90-a672-ad2bbe6107fc	break与continue	学习循环控制语句	3	57af7827-34b5-4ee4-86ca-d77c41f94e18	10	t	2026-01-30 16:29:53.652	2026-02-01 12:23:17.282
2fea5add-3c66-4829-a052-15531ffab4af	质数判断	用循环判断质数	4	57af7827-34b5-4ee4-86ca-d77c41f94e18	15	t	2026-01-30 16:29:53.654	2026-02-01 12:23:17.703
9a25dbc3-b7bc-43e4-abe6-0b52da13ddf1	综合练习	循环嵌套综合练习	5	57af7827-34b5-4ee4-86ca-d77c41f94e18	20	t	2026-01-30 16:29:53.656	2026-02-01 12:23:18.136
121b7eb0-c04c-4411-8571-79184c813d0f	数组的概念	理解数组是什么	1	51233d80-d440-46ce-87f2-4a729e37656c	10	t	2026-01-30 16:29:53.661	2026-02-01 12:23:20.253
e5a64287-666d-43a9-b7fc-4d504ad91e96	数组遍历	用循环遍历数组元素	3	51233d80-d440-46ce-87f2-4a729e37656c	10	t	2026-01-30 16:29:53.664	2026-02-01 12:23:21.671
fbbc77b0-5569-4c63-a951-a3ccc8f6ffcd	数组统计	求最大值、最小值、平均值	4	51233d80-d440-46ce-87f2-4a729e37656c	15	t	2026-01-30 16:29:53.665	2026-02-01 12:23:22.156
f3b28902-b237-46ce-953d-82cde6353d4d	综合练习	一维数组综合练习	5	51233d80-d440-46ce-87f2-4a729e37656c	20	t	2026-01-30 16:29:53.667	2026-02-01 12:23:22.642
c08f9189-2404-4fbf-b5de-7bbe7a359798	二维数组	学习二维数组的定义和遍历	1	e7bcdd28-89fc-4b77-8b0f-3b36c40cbe08	10	t	2026-01-30 16:29:53.673	2026-02-01 12:23:25.012
5e6545d6-6d55-4edc-9cef-77f0fc935708	矩阵操作	矩阵的输入输出和转置	2	e7bcdd28-89fc-4b77-8b0f-3b36c40cbe08	10	t	2026-01-30 16:29:53.675	2026-02-01 12:23:25.882
26e8d2e9-50a9-4c0a-92d8-0a8c50a56c7a	char数组	学习C风格字符串	3	e7bcdd28-89fc-4b77-8b0f-3b36c40cbe08	10	t	2026-01-30 16:29:53.677	2026-02-01 12:23:26.516
d710bb48-7d6b-47b9-a270-a991af71c642	string类	学习C++字符串类	4	e7bcdd28-89fc-4b77-8b0f-3b36c40cbe08	15	t	2026-01-30 16:29:53.679	2026-02-01 12:23:27.043
3c946ba6-ade3-48ac-9ca7-c33270e45f8e	综合练习	数组与字符串综合练习	5	e7bcdd28-89fc-4b77-8b0f-3b36c40cbe08	20	t	2026-01-30 16:29:53.68	2026-02-01 12:23:28.411
1ac383f1-69d1-4497-af43-2dcd1b6ac603	函数的概念	理解为什么需要函数	1	8f8aafdf-4125-42f5-99bf-f26e18b14c5c	10	t	2026-01-30 16:29:53.686	2026-02-01 12:23:30.904
543075fc-8281-484d-a61e-06ba59e7853a	函数定义与调用	学习函数的基本语法	2	8f8aafdf-4125-42f5-99bf-f26e18b14c5c	10	t	2026-01-30 16:29:53.687	2026-02-01 12:23:31.968
6685513a-8ec8-4448-90dc-5c11c1034d7d	参数与返回值	学习参数传递和返回值	3	8f8aafdf-4125-42f5-99bf-f26e18b14c5c	10	t	2026-01-30 16:29:53.689	2026-02-01 12:23:32.387
ab31ad31-7b3a-46ab-a293-85a8366c65d6	函数重载	学习同名函数的重载	4	8f8aafdf-4125-42f5-99bf-f26e18b14c5c	15	t	2026-01-30 16:29:53.69	2026-02-01 12:23:32.812
ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	第一个C++程序	编写Hello World，认识程序结构	1	85a77e95-71c9-4019-856e-36d4361475b6	10	t	2026-01-30 16:29:53.589	2026-02-01 12:22:40.432
50b12224-c4f6-400d-9f30-f28e9db9565e	数组定义与初始化	学习数组的声明和初始化	2	51233d80-d440-46ce-87f2-4a729e37656c	10	t	2026-01-30 16:29:53.662	2026-02-01 12:23:21.228
2c821141-0c7f-414f-8012-4b159dcc8497	综合练习	函数综合练习	5	8f8aafdf-4125-42f5-99bf-f26e18b14c5c	20	t	2026-01-30 16:29:53.692	2026-02-01 12:23:33.228
5d5fd5c6-95cf-4061-babe-4a05330e2420	递归的概念	理解递归是什么	1	6f789059-d943-4a49-8c88-a719a3673832	10	t	2026-01-30 16:29:53.7	2026-02-01 12:23:35.225
2cb8d9e7-a36d-4a44-b1c5-daa3fa987c3d	递归实例	阶乘和斐波那契数列	2	6f789059-d943-4a49-8c88-a719a3673832	10	t	2026-01-30 16:29:53.702	2026-02-01 12:23:36.143
827c4749-e0c9-4935-9212-90a8b725fbab	结构体定义	学习结构体的声明和使用	3	6f789059-d943-4a49-8c88-a719a3673832	10	t	2026-01-30 16:29:53.704	2026-02-01 12:23:36.574
12d2519d-fe1a-4d84-bb35-2d82b846b688	结构体数组	学习结构体数组的应用	4	6f789059-d943-4a49-8c88-a719a3673832	15	t	2026-01-30 16:29:53.705	2026-02-01 12:23:37.005
470d8a30-43e0-4a26-8c73-b91dd7415b3c	综合练习	递归与结构体综合练习	5	6f789059-d943-4a49-8c88-a719a3673832	20	t	2026-01-30 16:29:53.707	2026-02-01 12:23:37.876
8399d96d-c405-40ed-a251-3af106282c07	指针的概念	理解内存地址和指针	1	c8635f23-f275-446a-885d-1dc9352e9242	15	t	2026-01-30 16:29:53.712	2026-02-01 12:23:40.013
352f54b0-bfe7-41c0-9502-6a8a0139f348	指针的使用	学习指针的声明和操作	2	c8635f23-f275-446a-885d-1dc9352e9242	15	t	2026-01-30 16:29:53.714	2026-02-01 12:23:40.468
6268a922-4530-456d-9576-e2c611bea413	引用	学习引用的概念和使用	3	c8635f23-f275-446a-885d-1dc9352e9242	15	t	2026-01-30 16:29:53.716	2026-02-01 12:23:41.384
453dd855-ac43-4e74-bf8a-b38ef7cf2ca9	引用传递	用引用实现参数传递	4	c8635f23-f275-446a-885d-1dc9352e9242	20	t	2026-01-30 16:29:53.718	2026-02-01 12:23:41.819
d8b0e134-44bf-4c70-89c4-78a9d07d6c47	综合练习	指针与引用综合练习	5	c8635f23-f275-446a-885d-1dc9352e9242	25	t	2026-01-30 16:29:53.719	2026-02-01 12:23:42.247
9bc8ad45-e0b8-4a0d-ae3a-65168e2bb71e	vector基础	学习动态数组vector	1	1f13c1f4-52c6-4b45-8cbc-eba1f624a7df	15	t	2026-01-30 16:29:53.727	2026-02-01 12:23:43.931
0be8e28c-d83d-4ea3-b0d9-7751e55b20c0	vector进阶	学习vector的常用操作	2	1f13c1f4-52c6-4b45-8cbc-eba1f624a7df	15	t	2026-01-30 16:29:53.73	2026-02-01 12:23:44.351
10393334-bbba-456e-989f-b719aaa2e47a	set与map	学习集合和映射容器	3	1f13c1f4-52c6-4b45-8cbc-eba1f624a7df	15	t	2026-01-30 16:29:53.732	2026-02-01 12:23:45.351
146f2ab8-2533-44e5-bb24-6710a5e5d737	queue与stack	学习队列和栈容器	4	1f13c1f4-52c6-4b45-8cbc-eba1f624a7df	20	t	2026-01-30 16:29:53.734	2026-02-01 12:23:46.233
0c395f27-842f-49ed-9209-05c4a23c933b	综合练习	STL容器综合练习	5	1f13c1f4-52c6-4b45-8cbc-eba1f624a7df	25	t	2026-01-30 16:29:53.737	2026-02-01 12:23:46.788
d9f05418-995a-4973-a3d8-f182fe7d1b44	sort排序	学习STL排序算法	1	1ca5ecb5-3be5-41aa-8af2-c300bc44c8e9	15	t	2026-01-30 16:29:53.746	2026-02-01 12:23:48.861
9bc8e470-7d6a-4374-99c1-f97ec0e5084d	自定义排序	学习自定义比较函数	2	1ca5ecb5-3be5-41aa-8af2-c300bc44c8e9	15	t	2026-01-30 16:29:53.748	2026-02-01 12:23:49.385
11567da0-2fa5-4d0e-911b-02c270ce35cf	位运算基础	学习&、|、^、<<、>>	3	1ca5ecb5-3be5-41aa-8af2-c300bc44c8e9	15	t	2026-01-30 16:29:53.75	2026-02-01 12:23:49.809
5ac8a02f-2a6d-4a2a-bbbe-511904edf9c8	位运算技巧	学习位运算的常用技巧	4	1ca5ecb5-3be5-41aa-8af2-c300bc44c8e9	20	t	2026-01-30 16:29:53.752	2026-02-01 12:23:50.226
d09eebbd-2a07-475b-b0e2-29b65cb40cba	综合练习	STL算法与位运算综合练习	5	1ca5ecb5-3be5-41aa-8af2-c300bc44c8e9	25	t	2026-01-30 16:29:53.754	2026-02-01 12:23:50.643
f0eb80ce-b3c7-4ed4-8a9d-b380e9221785	快速读写	学习输入输出优化技巧	1	db088b21-5e85-41f3-a890-7286bd922102	15	t	2026-01-30 16:29:53.761	2026-02-01 12:23:52.543
fbe69347-7fb0-4bdd-adbd-da180afc26ff	快读函数	编写高效的读入函数	2	db088b21-5e85-41f3-a890-7286bd922102	15	t	2026-01-30 16:29:53.762	2026-02-01 12:23:53.38
d0903a92-1824-47d9-b03f-dde01d52f311	模板函数	学习模板函数基础	3	db088b21-5e85-41f3-a890-7286bd922102	15	t	2026-01-30 16:29:53.764	2026-02-01 12:23:53.8
2dc603fd-e2c9-45e2-99e7-acbf28a869fa	竞赛模板	整理竞赛常用代码模板	4	db088b21-5e85-41f3-a890-7286bd922102	20	t	2026-01-30 16:29:53.765	2026-02-01 12:23:54.303
9545b868-da78-41f2-87b6-c8038a62fc7e	综合训练	模块1综合实战训练	5	db088b21-5e85-41f3-a890-7286bd922102	30	t	2026-01-30 16:29:53.767	2026-02-01 12:23:54.719
7daa41ea-d47d-4404-b55e-dc91f893a109	异常处理的概念	理解什么是异常以及为什么需要异常处理	1	9153a6d9-80a3-435c-9632-990eb8d7b3c0	15	t	2026-01-30 16:29:53.772	2026-02-01 12:23:56.945
5a2b7c5f-6980-4018-a6c2-c0aa79d66b9c	try-catch基础	学习try-catch语句的基本用法	2	9153a6d9-80a3-435c-9632-990eb8d7b3c0	15	t	2026-01-30 16:29:53.774	2026-02-01 12:23:57.473
4b10906f-2abb-4f0b-a0ba-b79233075693	异常类型	学习标准异常类型和throw语句	3	9153a6d9-80a3-435c-9632-990eb8d7b3c0	15	t	2026-01-30 16:29:53.775	2026-02-01 12:23:58.032
85e0c6e5-5f07-4db2-8d2a-9e0c4b5d6e74	自定义异常	学习如何创建自定义异常类	4	9153a6d9-80a3-435c-9632-990eb8d7b3c0	20	t	2026-01-30 16:29:53.777	2026-02-01 12:23:58.501
9b42e6c5-0c4c-48a1-956d-7aa90b3607cb	综合练习	异常处理综合练习	5	9153a6d9-80a3-435c-9632-990eb8d7b3c0	25	t	2026-01-30 16:29:53.778	2026-02-01 12:23:58.918
\.


--
-- Data for Name: CourseUnit; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."CourseUnit" (id, "courseId", "unitId") FROM stdin;
b4d0771f-a53b-4674-8b07-7f71f3c0960a	85a77e95-71c9-4019-856e-36d4361475b6	8a37c02b-e3ad-4de5-8329-5a22f4ec3b64
794a8559-f485-4c44-89a1-1748268ba58b	0e27431b-875a-415a-8bdc-f71ee10b26b7	3da91943-dffe-49e9-b5dd-d5657c0a8196
daa1eb83-f34d-4095-8c34-8ff3d7a4d672	a3c3dd99-9238-4d91-8c02-d8c086c8814d	ac136adb-9302-4c20-b143-bde1a4fb5644
06db5050-b937-4bfa-a531-624c56db08c1	a3c3dd99-9238-4d91-8c02-d8c086c8814d	42b3943e-4c43-4397-a673-07ce0dce925c
7c23fe24-b78e-45c7-8c48-f997b53cfe1c	38370f8d-7804-47b8-a114-fa96c79626cf	46c3a7e1-ad27-4acb-9420-b32fba742bfb
372c1c07-dbac-4338-a6ad-f7e58f708c35	18b0980a-1ff5-4599-abae-7297c1ec743d	68e1485b-12a2-4a5b-a222-10303068f950
7fa5698d-018d-4b25-8635-579166007c13	57af7827-34b5-4ee4-86ca-d77c41f94e18	68e1485b-12a2-4a5b-a222-10303068f950
4f3cbcf1-9dcc-4011-9fe3-857a5e2fd8f0	51233d80-d440-46ce-87f2-4a729e37656c	8a271029-3500-4753-aac1-c341003bef3c
a7f68412-9bdb-4dd3-a004-05b92775b2f3	e7bcdd28-89fc-4b77-8b0f-3b36c40cbe08	8a271029-3500-4753-aac1-c341003bef3c
c1dd895a-f53f-4245-90a2-0cdebdb7ada6	e7bcdd28-89fc-4b77-8b0f-3b36c40cbe08	d237e481-b06b-468d-a70a-653a4230e765
a0b3444a-337e-4c98-b5dd-0c977c1372c1	8f8aafdf-4125-42f5-99bf-f26e18b14c5c	76794f94-a309-4391-8dc2-859457d224af
b880b992-499a-40e0-af70-e856d6cec25d	6f789059-d943-4a49-8c88-a719a3673832	c48a3092-2787-40dc-b2d1-a0ed191cdf91
3ad57c45-f1fc-4fd7-bb12-22f6ef7538a9	6f789059-d943-4a49-8c88-a719a3673832	6442e653-0432-4c43-9b84-9d01e0f75ea9
1c3ff585-1c3e-4b14-b5d2-cc773f8ec1f9	c8635f23-f275-446a-885d-1dc9352e9242	c5c4d326-4899-4008-bb18-fdc366121570
43cad7b8-6375-4a0f-8391-f828cfbb30b8	1f13c1f4-52c6-4b45-8cbc-eba1f624a7df	e00aa8a6-9755-46ec-aac6-1a589150d9e9
68da8a03-5012-47f1-92d7-5044c083c34a	1f13c1f4-52c6-4b45-8cbc-eba1f624a7df	0d47246e-6c5b-44da-8d0c-51fd376c5595
e2252b68-037f-42b5-bb56-d1e7a99c3803	1ca5ecb5-3be5-41aa-8af2-c300bc44c8e9	d28310b9-7551-4a4b-b41d-22ad981df234
e6eb97e3-83e2-4490-bf6d-5eb9ccfa389c	1ca5ecb5-3be5-41aa-8af2-c300bc44c8e9	ba94af1a-f949-4f75-9be3-edf65f3de716
5340828f-9afc-46c9-a5dd-3cd681f08a96	db088b21-5e85-41f3-a890-7286bd922102	5ea37a34-465d-4760-9b34-e5483e1d3495
d652a9ee-af98-43c1-909a-714a891838ed	db088b21-5e85-41f3-a890-7286bd922102	f30747a3-0fe8-428c-874e-f3e0e627e4b2
4c633543-d3bf-43d8-b2eb-ccdf40445c0a	9153a6d9-80a3-435c-9632-990eb8d7b3c0	d28310b9-7551-4a4b-b41d-22ad981df234
\.


--
-- Data for Name: DailyLearningStats; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."DailyLearningStats" (id, "userId", date, "totalDuration", "sessionsCount", "exercisesCount", "correctCount", "xpEarned", "lessonsCompleted", "reviewsCompleted") FROM stdin;
\.


--
-- Data for Name: DailyQuestTemplate; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."DailyQuestTemplate" (id, title, description, "questType", "targetValue", "xpReward", "gemsReward", active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DailyXpRecord; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."DailyXpRecord" (id, "userId", date, "xpEarned", "goalMet", "createdAt", "updatedAt") FROM stdin;
f5deb254-8697-4525-a056-e9367d5a9661	8738a703-3540-4842-911e-acaa73a0af9b	2026-01-30	0	f	2026-01-30 16:30:27.325	2026-01-30 16:30:27.325
ba01f00c-871f-4aae-8abb-a556910225b2	e00cfaae-5a52-4c55-9807-1e206d0f157e	2026-02-01	0	f	2026-02-01 07:57:19.623	2026-02-01 07:57:19.623
2891d048-5664-453f-95aa-4bdb6b293d48	8738a703-3540-4842-911e-acaa73a0af9b	2026-02-01	70	f	2026-02-01 01:24:42.267	2026-02-01 12:46:22.452
f50133c4-26c5-4e3a-9efb-547fb499bad3	8738a703-3540-4842-911e-acaa73a0af9b	2026-01-31	210	t	2026-01-31 00:13:58.529	2026-01-31 04:55:39.524
d01b2550-61da-4f56-9e41-9abedcc4b804	e00cfaae-5a52-4c55-9807-1e206d0f157e	2026-01-31	322	t	2026-01-31 05:07:19.967	2026-01-31 05:22:24.174
\.


--
-- Data for Name: Exercise; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."Exercise" (id, title, description, difficulty, category, "starterCode", hint, solution, xp, "orderIndex", "isPublished", type, "questionData", source, "createdAt", "updatedAt") FROM stdin;
00cd6fb5-d574-42c6-8aad-cc665ee96659	头文件的作用	#include <iostream> 的作用是什么？	EASY	1-01		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["引入输入输出功能", "定义main函数", "声明变量", "结束程序"], "explanation": "iostream头文件包含了cin和cout等输入输出功能的定义。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.392	2026-02-01 12:24:16.405
7f77f98a-875a-4fdc-866c-2e94bfe1ce1d	程序结构排序	将下列代码按正确顺序排列，组成一个完整的C++程序	EASY	1-01		\N	\N	10	4	t	CODE_ORDER	{"lines": ["#include <iostream>", "using namespace std;", "int main() {", "    cout << \\"Hello\\";", "    return 0;", "}"], "explanation": "C++程序结构：头文件 → 命名空间 → main函数 → 语句 → 返回值 → 结束", "correctOrder": [0, 1, 2, 3, 4, 5]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.396	2026-02-01 12:24:17.078
54179df9-c7e0-4dec-be56-4203149b9e6a	using namespace std	如果不写 using namespace std; 要如何输出内容？	MEDIUM	1-01		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["std::cout << \\"Hello\\";", "cout << \\"Hello\\";", "print(\\"Hello\\");", "output(\\"Hello\\");"], "explanation": "不使用using namespace std时，需要用std::前缀来访问标准库中的内容。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.399	2026-02-01 12:24:17.578
ace5626b-8cf6-4978-89d4-05a1213ed46b	找出程序错误	找出下面程序的错误并修正	MEDIUM	1-01		\N	\N	10	6	t	BUG_FIX	{"bugLine": 5, "buggyCode": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    cout << \\"Hello World\\"\\n    return 0;\\n}", "correctCode": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    cout << \\"Hello World\\";\\n    return 0;\\n}", "explanation": "C++中每条语句必须以分号;结尾。", "bugDescription": "语句末尾缺少分号"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.403	2026-02-01 12:24:18.083
96332c81-0075-4126-91eb-a261cf13f5fb	return 0的含义	main函数中 return 0; 表示什么？	EASY	1-01		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["程序正常结束", "程序出错", "输出数字0", "重新开始程序"], "explanation": "return 0表示程序正常结束，返回0给操作系统表示执行成功。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.406	2026-02-01 12:24:18.941
83dce4ad-f279-4053-8d0c-21822e0d61ab	输出多行内容	补全代码，使程序输出两行内容	MEDIUM	1-01		\N	\N	10	8	t	FILL_BLANK	{"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    cout << \\"第一行\\" << {{blank}};\\n    cout << \\"第二行\\";\\n    return 0;\\n}", "blanks": [{"hint": "换行符", "answer": "endl"}], "explanation": "endl是换行符，可以让输出换到下一行。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.41	2026-02-01 12:24:19.359
5873a619-be16-48a7-8ba6-3b1b28a303bc	程序注释	下面哪个是C++的单行注释？	EASY	1-01		\N	\N	10	9	t	MULTIPLE_CHOICE	{"options": ["// 这是注释", "# 这是注释", "-- 这是注释", "' 这是注释"], "explanation": "C++使用//进行单行注释，使用/* */进行多行注释。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.413	2026-02-01 12:24:19.79
c4253945-4485-4c63-b73a-3e44a9142235	完整程序编写	编写一个C++程序，输出你的名字	MEDIUM	1-01	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"testCases": [], "explanation": "使用cout输出字符串内容。", "expectedOutput": "任意名字"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.416	2026-02-01 12:24:20.212
82d2b4d8-0da5-43fc-a460-5a7d68605acf	变量的概念	变量在程序中的作用是什么？	EASY	1-01		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["存储数据", "输出内容", "结束程序", "引入头文件"], "explanation": "变量是用来存储数据的容器，可以在程序运行时保存和修改数据。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.419	2026-02-01 12:24:20.63
60df9e66-e57e-4f8b-bd00-3ce768f09a88	变量命名规则	下面哪个是合法的变量名？	EASY	1-01		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["score", "2name", "my-age", "class"], "explanation": "变量名只能以字母或下划线开头，不能以数字开头，不能使用关键字，不能包含特殊字符。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.423	2026-02-01 12:24:21.499
d832ae63-409e-47ac-a93e-abe7a188a7d2	变量声明	声明一个整型变量age	EASY	1-01		\N	\N	10	3	t	FILL_BLANK	{"code": "{{blank}} age;", "blanks": [{"hint": "整数类型", "answer": "int"}], "explanation": "int是整型关键字，用于声明整数变量。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.427	2026-02-01 12:24:22.41
13a9e3fe-b602-47c2-9d3e-24eb1caf5852	变量初始化	声明一个整型变量num并初始化为10	EASY	1-01		\N	\N	10	4	t	FILL_BLANK	{"code": "int num = {{blank}};", "blanks": [{"hint": "数字", "answer": "10"}], "explanation": "变量可以在声明时直接赋初值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.431	2026-02-01 12:24:23.34
9f6cfd2f-7495-4b47-a227-f0344b4161ed	非法变量名	下面哪个变量名是非法的？	MEDIUM	1-01		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["3score", "_name", "myAge", "total_count"], "explanation": "变量名不能以数字开头，3score是非法的变量名。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.434	2026-02-01 12:24:23.857
3b40a9f7-ba1f-4213-b0df-09f71d52f800	找出命名错误	找出变量命名的错误	MEDIUM	1-01		\N	\N	10	7	t	BUG_FIX	{"bugLine": 1, "buggyCode": "int 1st_number = 10;", "correctCode": "int first_number = 10;", "explanation": "变量名必须以字母或下划线开头。", "bugDescription": "变量名不能以数字开头"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.44	2026-02-01 12:24:24.82
3b0c7afe-2a5d-4c7d-a4ee-dd951f03d2a8	变量覆盖	执行以下代码后，x的值是多少？\nint x = 5;\nx = 10;	MEDIUM	1-01		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["10", "5", "15", "0"], "explanation": "变量可以被重新赋值，新值会覆盖旧值。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.444	2026-02-01 12:24:25.241
d7236109-37ef-4190-9cdf-b5f392f8e46e	多变量声明	在一行中声明两个整型变量a和b	MEDIUM	1-01		\N	\N	10	9	t	FILL_BLANK	{"code": "int a{{blank}} b;", "blanks": [{"hint": "分隔符", "answer": ","}], "explanation": "可以用逗号在一行中声明多个同类型变量。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.447	2026-02-01 12:24:25.661
8c4cb5e8-4918-4a3e-8ea6-e588493fe272	int类型范围	int类型可以存储什么？	EASY	1-01		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["整数", "小数", "文字", "图片"], "explanation": "int是整型，只能存储整数，不能存储小数。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.455	2026-02-01 12:24:26.679
41574f14-afa9-4292-ac92-8ccb99c65cad	char类型	char类型用于存储什么？	EASY	1-01		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["单个字符", "整数", "小数", "字符串"], "explanation": "char类型用于存储单个字符，如字母、数字字符或符号。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.458	2026-02-01 12:24:27.129
e1596cc6-c8d3-4ede-ba86-b85d33e20447	字符变量声明	声明一个字符变量ch并赋值为字母A	EASY	1-01		\N	\N	10	3	t	FILL_BLANK	{"code": "char ch = {{blank}};", "blanks": [{"hint": "用单引号", "answer": "'A'"}], "explanation": "字符常量要用单引号括起来。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.463	2026-02-01 12:24:27.981
ce6be96b-0f32-45da-bdb2-c14a91531549	整型运算	int a = 7 / 2; 变量a的值是多少？	EASY	1-01		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["3", "3.5", "4", "2"], "explanation": "整数除法会舍去小数部分，7/2=3。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.467	2026-02-01 12:24:28.829
82d501cf-bd82-430c-b1a9-942392787c2d	字符与ASCII	char c = 'A'; int n = c; n的值是多少？	MEDIUM	1-01		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["65", "A", "0", "1"], "explanation": "字符在计算机中以ASCII码存储，字母A的ASCII码是65。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.471	2026-02-01 12:24:29.276
c55e5c6b-c35c-4fd2-8023-0cfe1cf1cf30	整型溢出概念	当int类型存储的数超过范围时会发生什么？	MEDIUM	1-01		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["溢出，得到错误结果", "自动扩展", "程序报错停止", "变成小数"], "explanation": "整型溢出会导致数据回绕，得到意想不到的结果。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.474	2026-02-01 12:24:29.745
c3416b44-dca2-42f0-91d7-a0ffc224e109	字符输出	补全代码输出字符变量	EASY	1-01		\N	\N	10	7	t	FILL_BLANK	{"code": "char grade = 'A';\\ncout << {{blank}};", "blanks": [{"hint": "变量名", "answer": "grade"}], "explanation": "直接使用变量名即可输出变量的值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.477	2026-02-01 12:24:30.274
3be0a4fe-ad30-4b3c-9c37-9d5ec29d2880	类型匹配	将数据与合适的类型匹配	MEDIUM	1-01		\N	\N	10	8	t	MATCHING	{"leftItems": ["100", "'X'", "年龄", "等级(A/B/C)"], "rightItems": ["int", "char"], "explanation": "整数用int，单个字符用char。", "correctPairs": [[0, 0], [1, 1], [2, 0], [3, 1]]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.481	2026-02-01 12:24:30.846
cb4886ea-dd70-4d0b-9876-380de8fe4d98	找出类型错误	找出类型使用的错误	MEDIUM	1-01		\N	\N	10	9	t	BUG_FIX	{"bugLine": 1, "buggyCode": "char name = \\"Tom\\";", "correctCode": "char name = 'T';", "explanation": "char类型只能存一个字符，字符串需要用string或char数组。", "bugDescription": "char只能存储单个字符，不能存储字符串"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.484	2026-02-01 12:24:31.327
801a3778-af6a-4288-8858-84e5378d19b7	整型与字符型综合	声明一个int变量存储你的年龄，一个char变量存储你姓名的首字母，并输出	MEDIUM	1-01	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 声明变量并输出\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "练习int和char类型的声明和使用。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.487	2026-02-01 12:24:31.748
16287fc9-9b8f-4421-905c-02e329518a73	double类型	double类型用于存储什么？	EASY	1-01		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["小数", "整数", "字符", "布尔值"], "explanation": "double是双精度浮点型，用于存储小数。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.491	2026-02-01 12:24:32.89
dfadbe05-4469-44c2-b425-17e53518a9a2	bool类型	bool类型可以存储哪些值？	EASY	1-01		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["true和false", "任意整数", "任意小数", "任意字符"], "explanation": "bool是布尔类型，只能存储true（真）或false（假）。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.494	2026-02-01 12:24:33.422
e6d34d19-8c95-4ae8-826a-5a3e132bdc2e	浮点变量声明	声明一个double变量pi并赋值为3.14	EASY	1-01		\N	\N	10	3	t	FILL_BLANK	{"code": "{{blank}} pi = 3.14;", "blanks": [{"hint": "浮点类型", "answer": "double"}], "explanation": "double用于声明浮点数变量。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.497	2026-02-01 12:24:34.032
25df6116-349c-4351-a3d1-af000a05e70b	布尔变量声明	声明一个布尔变量isStudent并赋值为true	EASY	1-01		\N	\N	10	4	t	FILL_BLANK	{"code": "bool isStudent = {{blank}};", "blanks": [{"hint": "真", "answer": "true"}], "explanation": "bool变量用true表示真，false表示假。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.5	2026-02-01 12:24:34.468
0121dba7-104b-4e00-aca7-6232a2bbfa84	浮点运算	double x = 7.0 / 2; x的值是多少？	MEDIUM	1-01		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["3.5", "3", "4", "3.0"], "explanation": "当有一个操作数是浮点数时，结果也是浮点数。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.504	2026-02-01 12:24:34.901
18d9f30a-9971-466b-9b43-68e984d86a8e	类型转换	int a = 3.7; a的值是多少？	MEDIUM	1-01		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["3", "4", "3.7", "0"], "explanation": "将浮点数赋给整型变量时，小数部分会被截断。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.507	2026-02-01 12:24:35.542
7977004c-c301-4054-bc31-3385d0d9c126	布尔值输出	bool b = true; cout << b; 输出什么？	MEDIUM	1-01		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["1", "true", "0", "false"], "explanation": "默认情况下，true输出为1，false输出为0。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.51	2026-02-01 12:24:36.124
9476f46a-bb54-410d-9f19-7a11147d987d	找出精度问题	找出代码中的问题	HARD	1-01		\N	\N	15	9	t	BUG_FIX	{"bugLine": 1, "buggyCode": "int price = 9.99;", "correctCode": "double price = 9.99;", "explanation": "存储小数必须使用浮点类型，否则小数部分会丢失。", "bugDescription": "价格是小数，应该用double类型"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.517	2026-02-01 12:24:37.623
4ef60a9a-f759-4c72-84b6-008e2e5086f7	类型识别	存储学生人数应该用什么类型？	EASY	1-01		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["int", "double", "char", "bool"], "explanation": "人数是整数，应该用int类型。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.523	2026-02-01 12:24:38.911
f4f22b97-78c0-4a75-838d-d6cfb7f5b44c	类型识别2	存储圆周率应该用什么类型？	EASY	1-01		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["double", "int", "char", "bool"], "explanation": "圆周率是小数，应该用double类型。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.526	2026-02-01 12:24:39.46
a8952a6b-87ae-4cef-9716-ec3357cb386b	变量声明综合	排列代码，完成变量声明、赋值和输出	MEDIUM	1-01		\N	\N	10	3	t	CODE_ORDER	{"lines": ["int score;", "score = 100;", "cout << \\"分数是:\\" << score;"], "explanation": "先声明，再赋值，最后输出。", "correctOrder": [0, 1, 2]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.529	2026-02-01 12:24:42.203
bc7ec928-9527-4697-8172-cfbfecde2fc9	类型转换理解	下面代码输出什么？\nint a = 5, b = 2;\ncout << a / b;	MEDIUM	1-01		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["2", "2.5", "3", "2.0"], "explanation": "两个整数相除，结果仍是整数，小数部分被舍去。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.532	2026-02-01 12:24:42.624
b736eeef-1e50-4e23-831e-2426c5255052	混合运算	下面代码输出什么？\nint a = 5;\ndouble b = 2;\ncout << a / b;	MEDIUM	1-01		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["2.5", "2", "3", "2.0"], "explanation": "整数和浮点数运算，结果是浮点数。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.536	2026-02-01 12:24:43.067
899b8921-e850-45f9-b1ed-d0509f2314dc	综合填空	补全代码，计算圆的面积（半径r=5）	MEDIUM	1-01		\N	\N	10	6	t	FILL_BLANK	{"code": "double r = 5;\\ndouble pi = 3.14;\\ndouble area = pi * r * {{blank}};", "blanks": [{"hint": "半径", "answer": "r"}], "explanation": "圆面积公式：π × r × r"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.539	2026-02-01 12:24:43.485
88fb509e-0569-4f4d-b023-15519c7ff870	找出多处错误	找出代码中的错误	HARD	1-01		\N	\N	15	7	t	BUG_FIX	{"bugLine": 1, "buggyCode": "Int num = 10;\\ncout << num", "correctCode": "int num = 10;\\ncout << num;", "explanation": "C++关键字区分大小写，int必须小写。", "bugDescription": "int应该小写，语句末尾缺少分号"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.542	2026-02-01 12:24:43.983
10fbb77b-88be-45c6-953d-17e7564ec682	温度转换	已知摄氏温度celsius=25，计算并输出华氏温度（公式：F = C × 1.8 + 32）	HARD	1-01	#include <iostream>\nusing namespace std;\n\nint main() {\n    double celsius = 25;\n    // 计算华氏温度并输出\n    \n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "使用公式进行温度转换。", "expectedOutput": "77"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.548	2026-02-01 12:24:45.474
512a9c23-ebac-47a8-b918-22f16e7289ef	个人信息卡	创建一个"个人信息卡"：姓名首字母(char)、年龄(int)、身高(double)、是否学生(bool)，并格式化输出	HARD	1-01	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 声明变量\n    \n    // 输出个人信息\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "综合运用四种基本数据类型。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.551	2026-02-01 12:24:46.002
8d539307-f5c0-4a87-8ef8-2a43a7e9bdc2	加法运算	int a = 3 + 5; a的值是多少？	EASY	1-02		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["8", "35", "2", "15"], "explanation": "加法运算符+用于计算两个数的和。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.555	2026-02-01 12:24:46.533
d49cabd5-0a8e-4c0d-90a0-d13336f1fffd	减法运算	计算10减3的结果	EASY	1-02		\N	\N	10	2	t	FILL_BLANK	{"code": "int result = 10 {{blank}} 3; // result = 7", "blanks": [{"hint": "减法运算符", "answer": "-"}], "explanation": "减法运算符-用于计算两个数的差。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.559	2026-02-01 12:24:47.053
a8fa895e-2f33-4f2b-ae9d-590bdb3fc749	乘法运算	int x = 4 * 5; x的值是多少？	EASY	1-02		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["20", "9", "45", "1"], "explanation": "乘法运算符*用于计算两个数的积。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.563	2026-02-01 12:24:47.578
9000c402-e04c-4313-b08c-f2cbd96410c3	整数除法	int a = 17 / 5; a的值是多少？	MEDIUM	1-02		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["3", "3.4", "4", "2"], "explanation": "整数除法会舍去小数部分，17÷5=3余2，结果是3。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.566	2026-02-01 12:24:48.881
61e7b279-c4a1-45bd-ab55-cbdd4d81fe71	取余运算	int r = 17 % 5; r的值是多少？	MEDIUM	1-02		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["2", "3", "3.4", "0"], "explanation": "取余运算符%返回除法的余数，17÷5=3余2。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.57	2026-02-01 12:24:50.2
dd0e80f3-0bd4-4a63-8daa-a7421da0cb7c	取余应用	判断一个数n是否为偶数，应该用哪个表达式？	MEDIUM	1-02		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["n % 2 == 0", "n / 2 == 0", "n * 2 == 0", "n - 2 == 0"], "explanation": "偶数除以2余数为0，所以用n % 2 == 0判断。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.576	2026-02-01 12:24:51.461
ea115bcf-3a34-4d3d-b85d-864429fa23a2	运算符填空	计算两个数的乘积	EASY	1-02		\N	\N	10	7	t	FILL_BLANK	{"code": "int a = 6, b = 7;\\nint product = a {{blank}} b;", "blanks": [{"hint": "乘法", "answer": "*"}], "explanation": "乘法运算符是*。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.58	2026-02-01 12:24:51.981
97019edb-82f8-40ed-bf14-99f474e3878d	混合运算	int x = 2 + 3 * 4; x的值是多少？	MEDIUM	1-02		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["14", "20", "24", "9"], "explanation": "乘法优先级高于加法，先算3*4=12，再算2+12=14。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.584	2026-02-01 12:24:53.775
af3b2186-4d20-4f21-a058-34a212db06e7	括号优先	int x = (2 + 3) * 4; x的值是多少？	MEDIUM	1-02		\N	\N	10	9	t	MULTIPLE_CHOICE	{"options": ["20", "14", "24", "9"], "explanation": "括号优先级最高，先算2+3=5，再算5*4=20。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.587	2026-02-01 12:24:54.267
cfccb05b-4322-4992-8f9b-482469ab9685	自增运算	int a = 5; a++; a的值是？	EASY	1-02		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["6", "5", "4", "7"], "explanation": "a++使a的值增加1。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.661	2026-02-01 12:25:06.697
93ba4558-1ccc-4e08-afd2-1bb37e2e4251	大于运算	5 > 3 的结果是什么？	EASY	1-02		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["true", "false", "1", "2"], "explanation": "5大于3，所以结果为true（真）。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.594	2026-02-01 12:24:55.306
b3a1a356-01a3-4695-9816-f9f06662d443	小于运算	5 < 3 的结果是什么？	EASY	1-02		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["false", "true", "0", "-2"], "explanation": "5不小于3，所以结果为false（假）。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.597	2026-02-01 12:24:55.743
c03c004e-90d8-46cd-bc13-8fd7fee22f9e	等于运算符	判断a是否等于b	EASY	1-02		\N	\N	10	3	t	FILL_BLANK	{"code": "bool result = (a {{blank}} b);", "blanks": [{"hint": "两个等号", "answer": "=="}], "explanation": "判断相等用==，单个=是赋值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.6	2026-02-01 12:24:56.25
32a0cc4a-18be-4a3f-99f7-4b69299b9e09	不等于运算符	判断a是否不等于b	EASY	1-02		\N	\N	10	4	t	FILL_BLANK	{"code": "bool result = (a {{blank}} b);", "blanks": [{"hint": "不等于", "answer": "!="}], "explanation": "不等于运算符是!=。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.603	2026-02-01 12:24:56.708
ff656187-75a5-4e85-a854-2878f2896846	大于等于	5 >= 5 的结果是什么？	EASY	1-02		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["true", "false", "0", "5"], "explanation": "5等于5，满足大于等于的条件，结果为true。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.607	2026-02-01 12:24:57.132
ab5c2017-5c22-422d-8936-222a7318314c	关系运算结果	int a = 5, b = 5;\ncout << (a == b); 输出什么？	MEDIUM	1-02		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["1", "true", "0", "5"], "explanation": "关系运算结果为bool，输出时true显示为1。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.61	2026-02-01 12:24:57.562
532b524b-8fa6-47fb-b608-0eea49f8836e	关系运算符匹配	将运算符与含义匹配	EASY	1-02		\N	\N	10	8	t	MATCHING	{"leftItems": [">", "<", "==", "!="], "rightItems": ["大于", "小于", "等于", "不等于"], "explanation": "熟记六种关系运算符。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.617	2026-02-01 12:24:58.673
fdc1c29d-5aef-483c-9048-8d28479a894c	比较表达式	int a = 10;\nbool b = (a > 5) && (a < 15); b的值是？	MEDIUM	1-02		\N	\N	10	9	t	MULTIPLE_CHOICE	{"options": ["true", "false", "10", "1"], "explanation": "a=10，10>5为真，10<15为真，两个都为真，结果为true。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.62	2026-02-01 12:24:59.106
384b16c6-f624-4d8c-9ae7-da04fc962dcc	成绩判断	已知score=85，判断并输出：是否及格(>=60)、是否优秀(>=90)	MEDIUM	1-02	#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 85;\n    // 判断并输出结果\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "练习关系运算符的使用。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.623	2026-02-01 12:25:00.022
5d91e522-b6a9-4b7b-a148-ddcb1503349c	逻辑与	true && true 的结果是？	EASY	1-02		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["true", "false", "1", "2"], "explanation": "逻辑与(&&)：两边都为真，结果才为真。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.626	2026-02-01 12:25:00.443
c0d00ed3-3ee6-4e7c-9a6a-307fcb36265f	逻辑与2	true && false 的结果是？	EASY	1-02		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["false", "true", "0", "1"], "explanation": "逻辑与(&&)：只要有一边为假，结果就为假。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.63	2026-02-01 12:25:00.974
0c5045e7-3a0a-4b39-923a-e29e6dd3ef14	逻辑或	false || true 的结果是？	EASY	1-02		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["true", "false", "0", "1"], "explanation": "逻辑或(||)：只要有一边为真，结果就为真。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.633	2026-02-01 12:25:01.466
640169fd-90e2-4250-a5f8-63d03d0ba388	逻辑非	!true 的结果是？	EASY	1-02		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["false", "true", "0", "-1"], "explanation": "逻辑非(!)：取反，真变假，假变真。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.636	2026-02-01 12:25:02.792
11d2b5f7-bde3-443f-a6be-eec67665e9cd	逻辑运算符填空	判断年龄在18到60之间	MEDIUM	1-02		\N	\N	10	5	t	FILL_BLANK	{"code": "bool valid = (age >= 18) {{blank}} (age <= 60);", "blanks": [{"hint": "并且", "answer": "&&"}], "explanation": "两个条件都要满足，用逻辑与&&。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.64	2026-02-01 12:25:03.214
b52167c0-9914-47ad-aa83-405b20117520	逻辑或应用	判断是周六或周日（weekend）	MEDIUM	1-02		\N	\N	10	6	t	FILL_BLANK	{"code": "bool weekend = (day == 6) {{blank}} (day == 7);", "blanks": [{"hint": "或者", "answer": "||"}], "explanation": "满足其中一个条件即可，用逻辑或||。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.643	2026-02-01 12:25:03.72
ec71b23d-4053-4660-96d5-203c019aad4f	复合逻辑	int x = 5;\nbool r = (x > 0) && (x < 10); r的值是？	MEDIUM	1-02		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["true", "false", "5", "1"], "explanation": "5>0为真，5<10为真，两个都为真，结果为true。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.647	2026-02-01 12:25:04.425
dbcce51d-f370-440a-8755-34fdd0790e43	逻辑运算顺序	按优先级从高到低排列逻辑运算符	MEDIUM	1-02		\N	\N	10	8	t	CODE_ORDER	{"lines": ["! (逻辑非)", "&& (逻辑与)", "|| (逻辑或)"], "explanation": "优先级：! > && > ||", "correctOrder": [0, 1, 2]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.65	2026-02-01 12:25:04.877
374b518c-01f8-47d9-a969-86c15a93f5f6	短路求值	int a = 0;\nbool r = (a != 0) && (10 / a > 1); 这段代码会出错吗？	HARD	1-02		\N	\N	15	9	t	MULTIPLE_CHOICE	{"options": ["不会，因为短路求值", "会，除以0错误", "不确定", "编译错误"], "explanation": "&&短路求值：左边为假时，右边不会执行，避免了除以0。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.654	2026-02-01 12:25:05.735
329032b7-6951-4fe7-845c-39ad2be075f8	闰年判断	判断year是否为闰年（能被4整除但不能被100整除，或者能被400整除）	HARD	1-02	#include <iostream>\nusing namespace std;\n\nint main() {\n    int year = 2024;\n    // 判断是否为闰年\n    bool isLeap = // 补全表达式\n    cout << isLeap;\n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "综合运用逻辑运算符。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.657	2026-02-01 12:25:06.161
5d000617-1211-404d-8c4d-6c2851192bb5	前置与后置	int a = 5;\nint b = a++;\nb的值是？	MEDIUM	1-02		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["5", "6", "4", "7"], "explanation": "后置++：先使用原值，再自增。b得到5，然后a变成6。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.668	2026-02-01 12:25:07.71
79f08b0f-cbfe-4bc3-b398-4ad08f53238c	前置自增	int a = 5;\nint b = ++a;\nb的值是？	MEDIUM	1-02		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["6", "5", "4", "7"], "explanation": "前置++：先自增，再使用新值。a先变成6，b得到6。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.671	2026-02-01 12:25:09.173
ca0cd0a9-8a6f-4ede-980b-d11503561457	自增填空	让变量count增加1	EASY	1-02		\N	\N	10	5	t	FILL_BLANK	{"code": "int count = 0;\\ncount{{blank}}; // count变为1", "blanks": [{"hint": "自增", "answer": "++"}], "explanation": "++是自增运算符。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.674	2026-02-01 12:25:09.881
2daaeb39-7b8f-40b8-98cf-3a8022ce2e04	运算符优先级	int x = 2 + 3 * 4 - 1; x的值是？	MEDIUM	1-02		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["13", "19", "14", "12"], "explanation": "先算乘法3*4=12，再算加减：2+12-1=13。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.678	2026-02-01 12:25:10.348
4c01ae05-d5d7-4360-84eb-ca41740cd6dd	优先级排序	按优先级从高到低排列	MEDIUM	1-02		\N	\N	10	7	t	CODE_ORDER	{"lines": ["() 括号", "* / % 乘除取余", "+ - 加减", "< > == 关系", "&& || 逻辑"], "explanation": "括号 > 算术 > 关系 > 逻辑", "correctOrder": [0, 1, 2, 3, 4]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.681	2026-02-01 12:25:11.39
044b6fd5-4e83-407f-9ba1-bd8755ab833b	复合赋值	int a = 10; a += 5; a的值是？	MEDIUM	1-02		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["15", "10", "5", "50"], "explanation": "a += 5 等价于 a = a + 5。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.684	2026-02-01 12:25:12.333
dd626e6b-3694-4f22-845a-4b624c71aab3	复合赋值填空	让a的值乘以2	MEDIUM	1-02		\N	\N	10	9	t	FILL_BLANK	{"code": "int a = 5;\\na {{blank}} 2; // a变为10", "blanks": [{"hint": "乘等于", "answer": "*="}], "explanation": "a *= 2 等价于 a = a * 2。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.687	2026-02-01 12:25:12.829
23bc6401-e910-401a-a3a0-da71a863e76e	表达式求值	计算表达式 (10 + 20) * 3 / 5 % 7 的值并输出	HARD	1-02	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 计算并输出结果\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "按优先级计算：(30)*3=90, 90/5=18, 18%7=4", "expectedOutput": "4"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.691	2026-02-01 12:25:13.792
1a7f7e72-442c-4e0f-b636-9cd4797c2549	表达式计算1	int a = 15, b = 4;\nint c = a / b + a % b;\nc的值是？	MEDIUM	1-02		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["6", "7", "3", "4"], "explanation": "15/4=3, 15%4=3, 3+3=6", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.698	2026-02-01 12:25:14.952
52b21354-c311-4bbf-9eba-d50927f03443	逻辑表达式	int x = 7;\nbool r = (x > 5) && (x < 10) || (x == 0);\nr的值是？	MEDIUM	1-02		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["true", "false", "7", "1"], "explanation": "(7>5)&&(7<10)为true，true||false为true。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.702	2026-02-01 12:25:15.371
8086f91f-d006-45bb-915d-a4f974f90767	自增综合	int a = 3;\nint b = a++ + ++a;\nb的值是？	HARD	1-02		\N	\N	15	4	t	MULTIPLE_CHOICE	{"options": ["8", "7", "9", "6"], "explanation": "a++(值3,a变4) + ++a(a变5,值5) = 3+5=8", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.705	2026-02-01 12:25:15.893
b9f5ccb3-4639-424c-98fb-2e054adc8f3e	找出运算错误	找出代码中的错误	MEDIUM	1-02		\N	\N	10	5	t	BUG_FIX	{"bugLine": 2, "buggyCode": "int a = 10;\\nint b = a % 0; // 取余", "correctCode": "int a = 10;\\nint b = a % 3; // 取余", "explanation": "除法和取余运算的除数不能为0。", "bugDescription": "不能对0取余，会导致运行错误"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.708	2026-02-01 12:25:16.31
27551feb-48ef-4c5f-8ca8-8e517af1465d	优先级判断	下面哪个表达式的结果是true？(设a=5)	MEDIUM	1-02		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["a > 3 && a < 10", "a < 3 || a > 10", "!(a == 5)", "a >= 6"], "explanation": "5>3为真，5<10为真，两个都为真，结果为true。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.711	2026-02-01 12:25:16.804
c2e56e52-8d94-450d-972c-4ea7bcd7fed2	复合运算	补全代码，让sum增加num的值	MEDIUM	1-02		\N	\N	10	7	t	FILL_BLANK	{"code": "int sum = 100, num = 20;\\nsum {{blank}} num; // sum变为120", "blanks": [{"hint": "加等于", "answer": "+="}], "explanation": "+= 是复合赋值运算符。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.715	2026-02-01 12:25:17.295
e7a25d55-ecbc-41fd-a4ff-994de6bede83	三目运算符	int a = 5, b = 3;\nint max = (a > b) ? a : b;\nmax的值是？	MEDIUM	1-02		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["5", "3", "8", "2"], "explanation": "三目运算符：条件?值1:值2，条件为真取值1，为假取值2。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.718	2026-02-01 12:25:18.013
122e9241-5b49-4f7a-8e7c-cc47da6b3325	奇偶判断	输入一个整数n，判断并输出它是奇数还是偶数	MEDIUM	1-02	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n = 7;\n    // 判断奇偶并输出\n    \n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "使用取余运算判断奇偶。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.721	2026-02-01 12:25:18.511
747829be-1468-4066-8aab-38d24fb3dd19	成绩等级	根据分数score判断等级：>=90优秀，>=80良好，>=60及格，<60不及格	HARD	1-02	#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 85;\n    // 使用三目运算符或逻辑运算判断等级\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "综合运用关系运算符和逻辑运算符。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.725	2026-02-01 12:25:19.036
5cea1f88-0515-4b0d-bb66-538488136ca4	cout基础	cout的作用是什么？	EASY	1-03		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["输出内容到屏幕", "从键盘读取输入", "定义变量", "结束程序"], "explanation": "cout是C++的标准输出流，用于向屏幕输出内容。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.728	2026-02-01 12:25:19.671
d3e085fd-427c-402e-b043-0f04bcb2549b	cin基础	cin的作用是什么？	EASY	1-03		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["从键盘读取输入", "输出内容到屏幕", "定义变量", "引入头文件"], "explanation": "cin是C++的标准输入流，用于从键盘读取数据。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.732	2026-02-01 12:25:20.173
fcd863e8-69d0-429c-95e3-529c9e2333e5	输入运算符	补全输入语句	EASY	1-03		\N	\N	10	4	t	FILL_BLANK	{"code": "int n;\\ncin {{blank}} n;", "blanks": [{"hint": "输入运算符", "answer": ">>"}], "explanation": ">>是输入运算符，用于cin。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.738	2026-02-01 12:25:22.042
80ec0c80-a9b9-45d1-9e74-c60cf05d1e94	连续输出	下面哪个可以输出 "a=5"？(假设a=5)	EASY	1-03		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["cout << \\"a=\\" << a;", "cout << \\"a=\\" + a;", "cout >> \\"a=\\" >> a;", "cin << \\"a=\\" << a;"], "explanation": "可以用<<连续输出多个内容。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.742	2026-02-01 12:25:22.468
c04c3c39-4351-4b73-acfc-f5fba91c474e	连续输入	一次读取两个整数a和b	MEDIUM	1-03		\N	\N	10	6	t	FILL_BLANK	{"code": "int a, b;\\ncin >> a {{blank}} b;", "blanks": [{"hint": "继续输入", "answer": ">>"}], "explanation": "可以用>>连续读取多个变量。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.745	2026-02-01 12:25:23.359
b3980246-37d0-4e05-bee1-939c2a0959ed	换行输出	下面哪个可以输出换行？	EASY	1-03		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["cout << endl;", "cout << end;", "cout << enter;", "cout << newline;"], "explanation": "endl是换行符，也可以用\\"\\\\n\\"。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.748	2026-02-01 12:25:23.787
baae7e5c-8ce7-4893-8bd8-cde0671b4fca	输入输出顺序	排列代码，实现输入一个数并输出	EASY	1-03		\N	\N	10	8	t	CODE_ORDER	{"lines": ["int n;", "cin >> n;", "cout << n;"], "explanation": "先声明变量，再输入，最后输出。", "correctOrder": [0, 1, 2]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.752	2026-02-01 12:25:24.371
2623459f-9c9f-4e06-b0fa-2b96bb0a5221	找出输入错误	找出输入语句的错误	MEDIUM	1-03		\N	\N	10	9	t	BUG_FIX	{"bugLine": 2, "buggyCode": "int n;\\ncin << n;", "correctCode": "int n;\\ncin >> n;", "explanation": "cin用>>输入，cout用<<输出，方向不能搞混。", "bugDescription": "cin应该用>>，不是<<"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.755	2026-02-01 12:25:25.077
138baf60-5f7a-4a53-a87d-c898bce79c0b	输入输出练习	读取两个整数a和b，输出它们的和	MEDIUM	1-03	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 读取两个整数并输出和\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "练习cin和cout的基本使用。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.758	2026-02-01 12:25:25.597
f411ce91-d907-42e9-862f-2ed8d3d0d68a	printf基础	printf函数来自哪个头文件？	EASY	1-03		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["cstdio 或 stdio.h", "iostream", "string", "cmath"], "explanation": "printf和scanf是C语言的函数，在cstdio头文件中。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.762	2026-02-01 12:25:26.101
12f6f33a-5f49-4c70-9e42-867de2b283ab	整数格式符	用printf输出整数	EASY	1-03		\N	\N	10	2	t	FILL_BLANK	{"code": "int n = 10;\\nprintf(\\"{{blank}}\\", n);", "blanks": [{"hint": "整数格式", "answer": "%d"}], "explanation": "%d是整数的格式说明符。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.765	2026-02-01 12:25:26.577
33ff8392-82b6-418f-9cc5-45b744ebc3b4	浮点数格式符	用printf输出浮点数	EASY	1-03		\N	\N	10	3	t	FILL_BLANK	{"code": "double x = 3.14;\\nprintf(\\"{{blank}}\\", x);", "blanks": [{"hint": "浮点格式", "answer": "%f"}], "explanation": "%f是浮点数的格式说明符。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.768	2026-02-01 12:25:27.103
75738583-6605-4529-833d-64bbfd910cf0	字符格式符	输出单个字符用什么格式符？	EASY	1-03		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["%c", "%s", "%d", "%f"], "explanation": "%c用于字符，%s用于字符串。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.771	2026-02-01 12:25:28.019
bbe18fae-b798-4714-8fbd-dce2b67256cf	scanf读取整数	用scanf读取一个整数	MEDIUM	1-03		\N	\N	10	5	t	FILL_BLANK	{"code": "int n;\\nscanf(\\"%d\\", {{blank}}n);", "blanks": [{"hint": "取地址符", "answer": "&"}], "explanation": "scanf需要变量的地址，用&取地址。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.774	2026-02-01 12:25:29.558
c13a3b54-b52f-4c68-8db8-f851b7b46ac8	printf多变量	下面哪个正确输出 "a=5, b=3"？	MEDIUM	1-03		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["printf(\\"a=%d, b=%d\\", a, b);", "printf(\\"a=%d, b=%d\\", &a, &b);", "printf(\\"a=a, b=b\\");", "printf(\\"%d, %d\\", \\"a=\\", a, \\"b=\\", b);"], "explanation": "printf中格式符按顺序对应后面的变量。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.781	2026-02-01 12:25:30.467
d85c9a14-502b-4fd5-a741-4fe9f0a3c062	找出scanf错误	找出scanf的错误	MEDIUM	1-03		\N	\N	10	8	t	BUG_FIX	{"bugLine": 2, "buggyCode": "int n;\\nscanf(\\"%d\\", n);", "correctCode": "int n;\\nscanf(\\"%d\\", &n);", "explanation": "scanf的参数必须是地址，要加&符号。", "bugDescription": "scanf需要变量地址，缺少&"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.784	2026-02-01 12:25:31.335
e7c284dc-b0be-468b-9b1d-c22306bfe08c	printf vs cout	printf相比cout的优势是什么？	MEDIUM	1-03		\N	\N	10	9	t	MULTIPLE_CHOICE	{"options": ["格式控制更方便", "不需要头文件", "速度更慢", "只能输出整数"], "explanation": "printf的格式控制更灵活，特别是控制小数位数时。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.788	2026-02-01 12:25:31.857
40ea431b-27b6-4506-8de8-d98d78296c8f	scanf和printf练习	用scanf读取两个整数，用printf输出它们的和	MEDIUM	1-03	#include <cstdio>\n\nint main() {\n    // 用scanf读取，printf输出\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "练习C风格的输入输出。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.791	2026-02-01 12:25:32.568
40ab78a3-1657-4ea5-8d0c-043686707e3b	保留小数位数	用printf输出保留2位小数	MEDIUM	1-03		\N	\N	10	1	t	FILL_BLANK	{"code": "double pi = 3.14159;\\nprintf(\\"{{blank}}\\", pi); // 输出3.14", "blanks": [{"hint": "点2f", "answer": "%.2f"}], "explanation": "%.2f表示保留2位小数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.795	2026-02-01 12:25:32.993
f993f658-6038-4199-91be-18b07bc07ec0	保留小数理解	printf("%.3f", 3.14159); 输出什么？	EASY	1-03		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["3.142", "3.14", "3.1415", "3.141"], "explanation": "%.3f保留3位小数，会四舍五入。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.798	2026-02-01 12:25:33.475
ceeaf6a5-a7ae-4618-bdb2-5afcf6452d54	宽度控制	printf("%5d", 42); 输出什么？(用_表示空格)	MEDIUM	1-03		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["___42", "42___", "42", "00042"], "explanation": "%5d表示宽度为5，右对齐，左边补空格。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.802	2026-02-01 12:25:33.942
e017ea3c-fb53-44dc-9f88-b93a308f91ad	补零输出	printf("%05d", 42); 输出什么？	MEDIUM	1-03		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["00042", "42000", "___42", "42"], "explanation": "%05d表示宽度5，不足补0。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.808	2026-02-01 12:25:35.322
9f3d8d0f-f89f-4ba6-be42-a00ddfb0101d	格式符组合	输出宽度8，保留3位小数	HARD	1-03		\N	\N	15	7	t	FILL_BLANK	{"code": "printf(\\"{{blank}}\\", 3.14159); // 输出\\"   3.142\\"", "blanks": [{"hint": "宽度.精度", "answer": "%8.3f"}], "explanation": "%8.3f表示总宽度8，小数3位。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.815	2026-02-01 12:25:36.344
b87ce5b2-9129-42c3-a534-ce630e174f3d	时间格式输出	将时间输出为 HH:MM:SS 格式（如 09:05:03）	MEDIUM	1-03	#include <cstdio>\n\nint main() {\n    int h = 9, m = 5, s = 3;\n    // 输出格式化时间\n    \n    return 0;\n}	\N	\N	10	8	t	CODING	{"explanation": "使用%02d补零输出。", "expectedOutput": "09:05:03"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.818	2026-02-01 12:25:37.479
ab30638d-6a28-4ba8-8ad7-93530b6e8408	科学计数法	用什么格式符输出科学计数法？	HARD	1-03		\N	\N	15	9	t	MULTIPLE_CHOICE	{"options": ["%e", "%f", "%d", "%s"], "explanation": "%e用于科学计数法输出，如1.23e+05。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.822	2026-02-01 12:25:37.995
041f2d1f-889a-48d8-834a-5f8fdedb05a9	成绩单格式化	输出成绩单：姓名左对齐占10位，分数右对齐占6位保留1位小数	HARD	1-03	#include <cstdio>\n\nint main() {\n    // 输出: "张三        95.5"\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "综合运用格式控制。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.825	2026-02-01 12:25:38.432
0ce71487-5000-48d3-af0a-8215850d19d1	freopen作用	freopen函数的作用是什么？	EASY	1-03		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["重定向输入输出到文件", "打开网页", "创建文件夹", "删除文件"], "explanation": "freopen可以将标准输入输出重定向到文件。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.828	2026-02-01 12:25:38.855
e8be1f3d-d811-4e8a-9ea5-61e367824433	输入重定向	从input.txt文件读取数据	MEDIUM	1-03		\N	\N	10	2	t	FILL_BLANK	{"code": "freopen(\\"input.txt\\", \\"{{blank}}\\", stdin);", "blanks": [{"hint": "读取模式", "answer": "r"}], "explanation": "\\"r\\"表示读取模式(read)。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.832	2026-02-01 12:25:39.311
93648b6b-10ea-4e13-a3c2-be70ed29110e	输出重定向	将输出写入output.txt文件	MEDIUM	1-03		\N	\N	10	3	t	FILL_BLANK	{"code": "freopen(\\"output.txt\\", \\"{{blank}}\\", stdout);", "blanks": [{"hint": "写入模式", "answer": "w"}], "explanation": "\\"w\\"表示写入模式(write)。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.836	2026-02-01 12:25:40.22
da0dda3f-0ce8-4683-bb73-12ae63a70509	freopen参数	匹配freopen的参数含义	MEDIUM	1-03		\N	\N	10	4	t	MATCHING	{"leftItems": ["第一个参数", "第二个参数", "第三个参数"], "rightItems": ["文件名", "打开模式", "标准流"], "explanation": "freopen(文件名, 模式, 流)", "correctPairs": [[0, 0], [1, 1], [2, 2]]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.84	2026-02-01 12:25:40.652
63f151b8-44da-4b93-a1b4-686dcd46b15c	竞赛文件操作	排列竞赛中文件操作的正确顺序	MEDIUM	1-03		\N	\N	10	5	t	CODE_ORDER	{"lines": ["freopen(\\"data.in\\", \\"r\\", stdin);", "freopen(\\"data.out\\", \\"w\\", stdout);", "int n; cin >> n;", "cout << n * 2;"], "explanation": "先重定向输入输出，再进行读写操作。", "correctOrder": [0, 1, 2, 3]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.843	2026-02-01 12:25:41.134
986c3432-4c49-4662-9415-eafbd981457d	stdin和stdout	stdin代表什么？	EASY	1-03		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["标准输入(键盘)", "标准输出(屏幕)", "标准错误", "文件"], "explanation": "stdin是标准输入流，默认是键盘。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.847	2026-02-01 12:25:41.676
68d37b2a-69c9-4221-9826-e2331c8e49e8	为什么用freopen	竞赛中使用freopen的好处是什么？	MEDIUM	1-03		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["不用修改cin/cout代码就能读写文件", "程序运行更快", "可以同时读多个文件", "可以读取网络数据"], "explanation": "freopen让你用cin/cout就能读写文件，代码改动最小。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.85	2026-02-01 12:25:42.186
812d218e-65bf-440a-bcf8-a46a64268477	找出文件操作错误	找出文件操作的错误	MEDIUM	1-03		\N	\N	10	8	t	BUG_FIX	{"bugLine": 1, "buggyCode": "freopen(\\"input.txt\\", \\"w\\", stdin);", "correctCode": "freopen(\\"input.txt\\", \\"r\\", stdin);", "explanation": "读取用\\"r\\"，写入用\\"w\\"。", "bugDescription": "从stdin读取应该用\\"r\\"模式，不是\\"w\\""}	EXERCISE_LIBRARY	2026-01-30 16:29:54.853	2026-02-01 12:25:42.628
5b816c7a-142a-4cf6-be2f-1f403597330c	关闭文件	如何关闭freopen打开的文件？	MEDIUM	1-03		\N	\N	10	9	t	MULTIPLE_CHOICE	{"options": ["fclose(stdin) 或程序结束自动关闭", "close(stdin)", "stdin.close()", "不需要关闭"], "explanation": "可以用fclose关闭，或者程序结束时自动关闭。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.857	2026-02-01 12:25:43.051
8244b000-0cf9-4023-be75-ebcaa6608ec3	文件读写练习	编写程序：从input.txt读取两个整数，将它们的和写入output.txt	HARD	1-03	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 文件重定向\n    \n    // 读取并计算\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "练习freopen的使用。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.86	2026-02-01 12:25:43.469
603fa2fc-40a6-49ce-bae9-2a3b766943d7	输入输出选择	读取一个整数，下面哪个正确？	EASY	1-03		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["cin >> n; 或 scanf(\\"%d\\", &n);", "cout >> n;", "printf >> n;", "cin << n;"], "explanation": "cin用>>，scanf需要格式符和地址。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.864	2026-02-01 12:25:43.892
dee19a49-4b2d-46dd-82b5-cd86bad57337	格式符选择	为数据选择正确的格式符	MEDIUM	1-03		\N	\N	10	2	t	MATCHING	{"leftItems": ["整数100", "小数3.14", "字符A", "字符串Hello"], "rightItems": ["%d", "%f", "%c", "%s"], "explanation": "不同类型使用不同格式符。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.867	2026-02-01 12:25:44.31
0f8f8f76-d013-4d50-ab90-89c747d25d8c	混合输入	读取一个整数和一个浮点数	MEDIUM	1-03		\N	\N	10	3	t	FILL_BLANK	{"code": "int a; double b;\\nscanf(\\"%d{{blank}}\\", &a, &b);", "blanks": [{"hint": "double格式", "answer": "%lf"}], "explanation": "scanf读取double用%lf。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.87	2026-02-01 12:25:45.64
254886e4-75d6-437c-ac85-6c7a6c67cdaf	多行输入	排列代码，读取n个数并求和	MEDIUM	1-03		\N	\N	10	5	t	CODE_ORDER	{"lines": ["int n, sum = 0;", "cin >> n;", "for(int i = 0; i < n; i++) {", "    int x; cin >> x;", "    sum += x;", "}"], "explanation": "先读取个数，再循环读取每个数。", "correctOrder": [0, 1, 2, 3, 4, 5]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.877	2026-02-01 12:25:46.686
977ba7e8-cce7-4739-8104-3eda2be11945	cin加速	如何加速cin的读取？	HARD	1-03		\N	\N	15	6	t	MULTIPLE_CHOICE	{"options": ["ios::sync_with_stdio(false);", "cin.speed(fast);", "cin.turbo();", "无法加速"], "explanation": "关闭同步可以加速cin，但之后不能混用scanf。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.88	2026-02-01 12:25:47.106
fccb9a60-e71b-4ea4-ba24-78dff4655303	找出格式错误	找出格式控制的错误	MEDIUM	1-03		\N	\N	10	7	t	BUG_FIX	{"bugLine": 2, "buggyCode": "double x = 3.14159;\\nprintf(\\"%d\\", x);", "correctCode": "double x = 3.14159;\\nprintf(\\"%f\\", x);", "explanation": "%d是整数格式，%f是浮点数格式。", "bugDescription": "double应该用%f，不是%d"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.884	2026-02-01 12:25:47.605
90404293-c40d-4c19-9aa7-bea7863793e5	读取到文件结束	如何读取直到文件结束？	HARD	1-03		\N	\N	15	8	t	MULTIPLE_CHOICE	{"options": ["while(cin >> n) 或 while(scanf(\\"%d\\",&n)!=EOF)", "while(n != 0)", "while(true)", "while(file.end())"], "explanation": "cin>>n在读取失败时返回false，scanf返回EOF。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.887	2026-02-01 12:25:48.118
e7436677-238d-485a-9bd6-3c73e5476ff4	A+B问题	经典A+B问题：读取多组数据，每组两个整数，输出它们的和，直到文件结束	MEDIUM	1-03	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 读取多组数据并输出和\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "这是OJ上最经典的入门题。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.894	2026-02-01 12:25:49.572
92ce6e63-289a-4e7c-ae7b-7b4fb0b30177	if语句的基本语法	if语句的基本语法结构是什么？	EASY	1-04		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["if (条件) { 语句 }", "if (条件) 语句", "if { 条件 } 语句", "if 条件 { 语句 }"], "explanation": "if语句的正确语法是if (条件) { 语句 }，条件需要用括号括起来。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.897	2026-02-01 12:25:51.137
5650000d-3aa2-4cd4-9e02-46e55da367b0	if-else结构	补全if-else结构，当a>0时输出"正数"，否则输出"非正数"	EASY	1-04		\N	\N	10	2	t	FILL_BLANK	{"code": "int a = 5;\\nif (a > 0) {\\n    cout << \\"正数\\";\\n} {{blank}} {\\n    cout << \\"非正数\\";\\n}", "blanks": [{"hint": "否则", "answer": "else"}], "explanation": "else用于处理条件不满足的情况。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.901	2026-02-01 12:25:51.612
7a7954e6-3254-4e43-add8-f8081e7a1e9a	条件表达式类型	if语句的条件表达式返回什么类型？	EASY	1-04		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["bool", "int", "char", "double"], "explanation": "条件表达式返回bool类型，true或false。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.904	2026-02-01 12:25:52.067
4f151382-aa9e-47ea-bd59-c35da91ba68b	代码排序	将下列代码按正确顺序排列，实现判断数的正负	EASY	1-04		\N	\N	10	4	t	CODE_ORDER	{"lines": ["int n;", "cin >> n;", "if (n > 0) {", "    cout << \\"正数\\";", "}", "else {", "    cout << \\"非正数\\";", "}"], "explanation": "先输入数据，再进行条件判断。", "correctOrder": [0, 1, 2, 3, 4, 5, 6, 7]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.911	2026-02-01 12:25:52.939
319a776b-f845-4eec-a64d-63a5b9eeed76	找错误	找出if语句的错误	MEDIUM	1-04		\N	\N	10	5	t	BUG_FIX	{"bugLine": 2, "buggyCode": "int x = 10;\\nif x > 5 {\\n    cout << \\"x大于5\\";\\n}", "correctCode": "int x = 10;\\nif (x > 5) {\\n    cout << \\"x大于5\\";\\n}", "explanation": "if语句的条件必须用括号括起来。", "bugDescription": "条件缺少括号"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.915	2026-02-01 12:25:53.642
586bb17f-2988-4a44-bba9-2a6fa4d226dc	布尔值作为条件	执行以下代码会输出什么？\nbool flag = true;\nif (flag) { cout << "Yes"; } else { cout << "No"; }	MEDIUM	1-04		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["Yes", "No", "什么都不输出", "编译错误"], "explanation": "bool变量flag为true，所以执行if分支。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.919	2026-02-01 12:25:54.213
d03845b8-c533-4480-aa39-321c03acb924	比较运算符	补全条件，判断a是否等于b	EASY	1-04		\N	\N	10	7	t	FILL_BLANK	{"code": "int a = 5, b = 5;\\nif (a {{blank}} b) {\\n    cout << \\"相等\\";\\n}", "blanks": [{"hint": "等于运算符", "answer": "=="}], "explanation": "==是等于运算符，=是赋值运算符。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.922	2026-02-01 12:25:55.825
560fb9c4-66e1-4e1a-a1cc-2cdcb8961149	单分支与双分支	匹配分支结构类型	MEDIUM	1-04		\N	\N	10	8	t	MATCHING	{"leftItems": ["只处理条件成立的情况", "同时处理条件成立和不成立的情况", "if语句", "if-else语句"], "rightItems": ["单分支", "双分支", "单分支", "双分支"], "explanation": "if是单分支，if-else是双分支。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.926	2026-02-01 12:25:56.785
a91ca07a-a802-4988-bea7-e2561a09cb4e	嵌套if语句	补全嵌套if语句，判断x是否为正数且偶数	MEDIUM	1-04		\N	\N	10	9	t	FILL_BLANK	{"code": "int x = 4;\\nif (x > 0) {\\n    if (x % 2 {{blank}} 0) {\\n        cout << \\"正数且偶数\\";\\n    }\\n}", "blanks": [{"hint": "等于", "answer": "=="}], "explanation": "%是取模运算符，x%2==0表示x是偶数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.929	2026-02-01 12:25:57.306
c30e86dd-07a4-4195-89ff-ebd1cc743669	if语句编程	输入一个整数，判断它是否为正数	MEDIUM	1-04	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用if-else结构判断数的正负。", "expectedOutput": "正数或非正数"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.933	2026-02-01 12:25:57.724
6046b0d4-fff0-4a01-a1be-5c9f5c17dad6	if-else if结构	if-else if结构的作用是什么？	EASY	1-04		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["处理多个条件分支", "处理嵌套条件", "处理循环条件", "处理函数条件"], "explanation": "if-else if结构用于处理多个互斥的条件分支。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.936	2026-02-01 12:25:58.257
f99ff1fb-5ae8-4150-aa7e-5ee2ba3e65e1	多分支执行顺序	执行以下代码会输出什么？\nint x = 75;\nif (x >= 90) { cout << "A"; }\nelse if (x >= 80) { cout << "B"; }\nelse if (x >= 70) { cout << "C"; }\nelse { cout << "D"; }	MEDIUM	1-04		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["C", "B", "D", "A"], "explanation": "75满足x>=70的条件，所以输出C。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.943	2026-02-01 12:26:00.485
0fcb4098-4e02-41a5-b679-99871892221d	代码排序	排列多分支代码，判断成绩等级	MEDIUM	1-04		\N	\N	10	4	t	CODE_ORDER	{"lines": ["int score;", "cin >> score;", "if (score >= 90) {", "    cout << \\"A\\";", "} else if (score >= 80) {", "    cout << \\"B\\";", "} else {", "    cout << \\"C\\";", "}"], "explanation": "多分支结构应该从高到低判断。", "correctOrder": [0, 1, 2, 3, 4, 5, 6, 7, 8]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.947	2026-02-01 12:26:00.972
821933db-cf8d-4bb4-8d3c-810615aa8f29	找错误	找出多分支结构的错误	MEDIUM	1-04		\N	\N	10	5	t	BUG_FIX	{"bugLine": 6, "buggyCode": "int age = 15;\\nif (age >= 18) {\\n    cout << \\"成年\\";\\n} else if (age >= 12) {\\n    cout << \\"青少年\\";\\n} if (age < 12) {\\n    cout << \\"儿童\\";\\n}", "correctCode": "int age = 15;\\nif (age >= 18) {\\n    cout << \\"成年\\";\\n} else if (age >= 12) {\\n    cout << \\"青少年\\";\\n} else {\\n    cout << \\"儿童\\";\\n}", "explanation": "多分支结构的最后一个分支应该用else。", "bugDescription": "应该使用else而不是if"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.95	2026-02-01 12:26:01.894
e891ecbd-c01f-4802-8a50-a1518590104a	条件覆盖	执行以下代码会输出什么？\nint x = 100;\nif (x > 50) { cout << "A"; }\nelse if (x > 80) { cout << "B"; }\nelse { cout << "C"; }	HARD	1-04		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["A", "B", "C", "AB"], "explanation": "x>50条件成立，所以执行第一个分支，后面的条件不会再判断。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.954	2026-02-01 12:26:02.328
71d76495-9ade-4b03-9f35-59e72729c06b	逻辑运算符	补全条件，判断x是否在10到20之间	MEDIUM	1-04		\N	\N	10	7	t	FILL_BLANK	{"code": "int x = 15;\\nif (x >= 10 {{blank}} x <= 20) {\\n    cout << \\"在范围内\\";\\n}", "blanks": [{"hint": "逻辑与", "answer": "&&"}], "explanation": "&&表示逻辑与，两个条件都必须成立。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.957	2026-02-01 12:26:02.809
ba93fc12-c082-4b73-b410-4c663f35f7dd	多分支应用	匹配条件与输出	MEDIUM	1-04		\N	\N	10	8	t	MATCHING	{"leftItems": ["score=95", "score=85", "score=75", "score=65"], "rightItems": ["优秀", "良好", "中等", "及格"], "explanation": "根据分数范围判断等级。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.96	2026-02-01 12:26:03.755
1a444534-f9d8-4331-84dc-7932f19c4dfa	温度判断	补全多分支结构，判断温度区间	MEDIUM	1-04		\N	\N	10	9	t	FILL_BLANK	{"code": "int temp = 25;\\nif (temp >= 30) {\\n    cout << \\"炎热\\";\\n} else if (temp >= 20) {\\n    cout << \\"温暖\\";\\n} {{blank}} if (temp >= 10) {\\n    cout << \\"凉爽\\";\\n} else {\\n    cout << \\"寒冷\\";\\n}", "blanks": [{"hint": "否则如果", "answer": "else"}], "explanation": "多分支结构需要正确使用else if。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.964	2026-02-01 12:26:04.226
1a38f228-66c7-4f2e-a313-140b2ec95cec	多分支编程	输入一个整数，判断它是正数、负数还是零	MEDIUM	1-04	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用if-else if-else结构判断数的符号。", "expectedOutput": "正数或负数或零"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.968	2026-02-01 12:26:04.657
187d0116-61df-49db-872d-bc70fd5a4148	switch语句的基本语法	switch语句的基本语法结构是什么？	EASY	1-04		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["switch (表达式) { case 值: 语句; }", "switch { case 表达式: 语句; }", "switch (表达式) { case: 值 语句; }", "switch 表达式 { case 值: 语句; }"], "explanation": "switch语句的正确语法是switch (表达式) { case 值: 语句; }。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.971	2026-02-01 12:26:05.074
8f214237-9d90-4499-9c3e-891c6662c937	switch语句结构	补全switch语句，根据数字输出对应星期	EASY	1-04		\N	\N	10	2	t	FILL_BLANK	{"code": "int day = 1;\\nswitch (day) {\\n    {{blank}} 1: cout << \\"星期一\\"; break;\\n    case 2: cout << \\"星期二\\"; break;\\n    default: cout << \\"其他\\"; break;\\n}", "blanks": [{"hint": "情况", "answer": "case"}], "explanation": "case用于匹配switch表达式的值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.974	2026-02-01 12:26:06.573
ae518193-faca-435e-91b6-d983f3fa5220	break语句的作用	switch语句中break的作用是什么？	EASY	1-04		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["跳出switch语句", "跳出循环", "结束程序", "开始新的case"], "explanation": "break用于跳出switch语句，防止执行后续的case。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.978	2026-02-01 12:26:07.005
8b68b455-ee87-46ce-852b-84f322e3f9cf	代码排序	排列switch语句代码，根据成绩等级输出评语	MEDIUM	1-04		\N	\N	10	4	t	CODE_ORDER	{"lines": ["char grade = 'B';", "switch (grade) {", "    case 'A': cout << \\"优秀\\"; break;", "    case 'B': cout << \\"良好\\"; break;", "    case 'C': cout << \\"及格\\"; break;", "    default: cout << \\"不及格\\"; break;", "}"], "explanation": "switch语句的正确结构：switch(表达式) { case 值: 语句; break; }。", "correctOrder": [0, 1, 2, 3, 4, 5, 6]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.981	2026-02-01 12:26:07.488
a821ae64-ddf7-4328-a65f-8150c150652b	找错误	找出switch语句的错误	MEDIUM	1-04		\N	\N	10	5	t	BUG_FIX	{"bugLine": 3, "buggyCode": "int num = 2;\\nswitch (num) {\\n    case 1: cout << \\"一\\";\\n    case 2: cout << \\"二\\";\\n    case 3: cout << \\"三\\";\\n}", "correctCode": "int num = 2;\\nswitch (num) {\\n    case 1: cout << \\"一\\"; break;\\n    case 2: cout << \\"二\\"; break;\\n    case 3: cout << \\"三\\"; break;\\n}", "explanation": "switch语句的每个case后需要break，否则会继续执行后续case。", "bugDescription": "缺少break语句"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.984	2026-02-01 12:26:07.92
78e24b70-7bc8-4b23-9f00-4ca7154df0a4	default的作用	switch语句中default的作用是什么？	MEDIUM	1-04		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["处理所有未匹配的情况", "必须放在最前面", "必须放在最后面", "可以省略"], "explanation": "default用于处理所有没有被case匹配的情况。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.988	2026-02-01 12:26:08.92
79360a65-2637-4c24-bfef-8704f86d4ba0	switch与if的比较	匹配语句特点	MEDIUM	1-04		\N	\N	10	8	t	MATCHING	{"leftItems": ["适合多个固定值的判断", "适合范围判断", "switch语句", "if语句"], "rightItems": ["switch", "if", "多个固定值", "范围判断"], "explanation": "switch适合多个固定值的判断，if适合范围判断。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.995	2026-02-01 12:26:10.284
5ce93bfc-8306-4be1-bca1-de0af1076f25	switch执行流程	执行以下代码会输出什么？\nint x = 2;\nswitch (x) {\n    case 1: cout << "A";\n    case 2: cout << "B";\n    case 3: cout << "C"; break;\n    default: cout << "D";\n}	HARD	1-04		\N	\N	10	9	t	MULTIPLE_CHOICE	{"options": ["BC", "B", "BCD", "C"], "explanation": "因为case 2后没有break，所以会继续执行case 3。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.998	2026-02-01 12:26:10.709
29120753-4597-455d-a73f-5f416f3276fe	switch编程	输入一个数字1-7，输出对应的星期几	MEDIUM	1-04	#include <iostream>\nusing namespace std;\n\nint main() {\n    int day;\n    cin >> day;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用switch语句根据数字输出星期。", "expectedOutput": "星期一到星期日或输入错误"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.002	2026-02-01 12:26:11.175
dc1aee83-0113-4af4-9c64-3fa4784336d1	三目运算符的语法	三目运算符的语法结构是什么？	EASY	1-04		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["条件 ? 表达式1 : 表达式2", "条件 : 表达式1 ? 表达式2", "表达式1 ? 条件 : 表达式2", "表达式1 : 条件 ? 表达式2"], "explanation": "三目运算符的正确语法是条件 ? 表达式1 : 表达式2。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.005	2026-02-01 12:26:11.686
b9f8cf12-2507-4913-a61e-784421067a80	三目运算符应用	补全三目运算符，求两个数的最大值	EASY	1-04		\N	\N	10	2	t	FILL_BLANK	{"code": "int a = 5, b = 10;\\nint max = a > b ? {{blank}} : {{blank}};", "blanks": [{"hint": "第一个表达式", "answer": "a"}, {"hint": "第二个表达式", "answer": "b"}], "explanation": "三目运算符当条件成立时返回表达式1，否则返回表达式2。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.009	2026-02-01 12:26:12.63
d7b3d021-787e-4050-83c9-02db54c589c8	三目运算符与if-else	以下代码与哪个if-else结构等价？\nint x = 5;\nint y = x > 0 ? 1 : -1;	MEDIUM	1-04		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["if (x > 0) y=1; else y=-1;", "if (x > 0) y=-1; else y=1;", "if (x < 0) y=1; else y=-1;", "if (x < 0) y=-1; else y=1;"], "explanation": "三目运算符x > 0 ? 1 : -1等价于if (x > 0) y=1; else y=-1;", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.013	2026-02-01 12:26:13.054
04b1aee1-f1a6-4151-82f6-032b20180856	复杂条件表达式	补全复杂条件表达式，判断一个数是否为偶数	MEDIUM	1-04		\N	\N	10	4	t	FILL_BLANK	{"code": "int n = 4;\\nbool isEven = (n % 2 {{blank}} 0) ? true : false;", "blanks": [{"hint": "等于", "answer": "=="}], "explanation": "n%2==0表示n是偶数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.016	2026-02-01 12:26:13.56
18e78c87-9396-4dd0-aa93-b0bf1158a04a	嵌套三目运算符	执行以下代码，y的值是多少？\nint x = 15;\nint y = x > 10 ? (x > 20 ? 1 : 2) : 3;	HARD	1-04		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["2", "1", "3", "0"], "explanation": "x=15>10成立，继续判断x>20不成立，所以返回2。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.022	2026-02-01 12:26:14.861
72110a2c-fc89-413d-b994-41da5876440e	条件表达式的返回值	三目运算符的返回值类型是什么？	MEDIUM	1-04		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["表达式1和表达式2的共同类型", "条件的类型", "布尔类型", "整数类型"], "explanation": "三目运算符的返回值类型是表达式1和表达式2的共同类型。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.026	2026-02-01 12:26:15.561
85980a3d-8206-4575-9a55-03cf7edc2283	条件表达式与赋值	补全代码，使用三目运算符给变量赋值	MEDIUM	1-04		\N	\N	10	7	t	FILL_BLANK	{"code": "int age = 16;\\nstring status = age >= 18 ? \\"成年\\" : {{blank}};", "blanks": [{"hint": "字符串字面量", "answer": "\\"未成年\\""}], "explanation": "三目运算符可以返回字符串类型的值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.03	2026-02-01 12:26:16.717
73a0fc99-c880-4fae-926b-2c5dcfd4728b	条件表达式的优先级	以下表达式的执行顺序是？\na = b > c ? d : e + f;	HARD	1-04		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["先计算b>c，然后根据结果选择d或e+f，最后赋值给a", "先计算e+f，然后计算b>c，然后选择d或结果，最后赋值给a", "先赋值给a，然后计算其他部分", "编译错误"], "explanation": "三目运算符的优先级高于赋值运算符。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.033	2026-02-01 12:26:17.138
83afa1a3-965e-48fb-bfea-d6515643299c	条件表达式应用	匹配条件表达式与结果	MEDIUM	1-04		\N	\N	10	9	t	MATCHING	{"leftItems": ["5>3?\\"Yes\\":\\"No\\"", "10==5?1:0", "true?\\"A\\":\\"B\\"", "false?\\"X\\":\\"Y\\""], "rightItems": ["Yes", "0", "A", "Y"], "explanation": "根据条件表达式的规则计算结果。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.039	2026-02-01 12:26:17.663
f989fe3b-0c43-4859-aec9-caf3829e87be	三目运算符编程	输入三个整数，使用三目运算符找出最大值	MEDIUM	1-04	#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用嵌套的三目运算符找出三个数中的最大值。", "expectedOutput": "最大值"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.043	2026-02-01 12:26:18.171
fdc49f8f-35b1-439d-8a30-81f07e596b50	分支结构应用	要判断一个年份是否是闰年，应该使用什么结构？	EASY	1-04		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["if-else if结构", "switch语句", "循环结构", "函数结构"], "explanation": "闰年判断需要多个条件，适合使用if-else if结构。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.047	2026-02-01 12:26:19.051
b11aba84-6def-46e6-b885-c2964824db5f	闰年判断条件	闰年的正确判断条件是什么？	MEDIUM	1-04		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["能被4整除但不能被100整除，或者能被400整除", "能被4整除", "能被100整除", "能被400整除"], "explanation": "闰年的判断条件是：能被4整除但不能被100整除，或者能被400整除。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.051	2026-02-01 12:26:19.973
ec851181-0136-44b0-928d-9af5669afb64	多条件组合	补全条件，判断一个数是否是奇数且正数	MEDIUM	1-04		\N	\N	10	4	t	FILL_BLANK	{"code": "int n = 7;\\nif (n > 0 {{blank}} n % 2 == 1) {\\n    cout << \\"奇数且正数\\";\\n}", "blanks": [{"hint": "逻辑与", "answer": "&&"}], "explanation": "&&表示两个条件都必须成立。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.058	2026-02-01 12:26:21.522
7eb23f37-893c-4adc-a0e7-534517375108	逻辑运算符优先级	以下表达式的结果是什么？\nbool result = true || false && false;	HARD	1-04		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["true", "false", "编译错误", "不确定"], "explanation": "&&的优先级高于||，所以先计算false&&false=false，再计算true||false=true。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.062	2026-02-01 12:26:22.375
e5802405-d39e-4d4c-a26a-2f354133a32a	switch语句的局限性	switch语句不能直接处理什么类型的条件？	MEDIUM	1-04		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["范围条件", "整数条件", "字符条件", "枚举条件"], "explanation": "switch语句只能处理固定值的匹配，不能直接处理范围条件。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.065	2026-02-01 12:26:22.867
84b28759-362f-4e01-b22a-a5b9b553c724	分支结构的选择	匹配问题与适合的分支结构	MEDIUM	1-04		\N	\N	10	7	t	MATCHING	{"leftItems": ["判断一个数的正负", "根据月份输出季节", "判断成绩等级", "根据字符选择操作"], "rightItems": ["if-else", "switch", "if-else if", "switch"], "explanation": "根据具体问题选择合适的分支结构。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.069	2026-02-01 12:26:23.288
e4d30838-b71f-4b13-a181-5ef8914b3b2d	复杂条件表达式	补全条件，判断一个数是否在1到100之间（包括边界）	HARD	1-04		\N	\N	10	8	t	FILL_BLANK	{"code": "int x = 50;\\nif (x >= 1 {{blank}} x <= 100) {\\n    cout << \\"在范围内\\";\\n}", "blanks": [{"hint": "逻辑与", "answer": "&&"}], "explanation": "使用&&组合两个条件，确保x同时满足大于等于1和小于等于100。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.074	2026-02-01 12:26:24.184
ce1f7e63-5de1-42a6-8a3c-cea37d194833	综合应用	输入一个年份，判断它是否是闰年	HARD	1-04	#include <iostream>\nusing namespace std;\n\nint main() {\n    int year;\n    cin >> year;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "使用闰年的判断条件：能被4整除但不能被100整除，或者能被400整除。", "expectedOutput": "是闰年或不是闰年"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.077	2026-02-01 12:26:24.648
84a2496e-86cb-42b3-8383-93e210c5b1c2	综合挑战	输入三个整数，按从大到小的顺序输出	HARD	1-04	#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用if-else if结构比较三个数的大小并排序。", "expectedOutput": "三个数从大到小排列"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.082	2026-02-01 12:26:25.495
a41588ab-8ca9-4693-83e0-5d26e493a8b9	for循环的基本语法	for循环的基本语法结构是什么？	EASY	1-05		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["for (初始化; 条件; 更新) { 语句 }", "for (条件; 初始化; 更新) { 语句 }", "for { 初始化; 条件; 更新; 语句 }", "for (初始化, 条件, 更新) { 语句 }"], "explanation": "for循环的正确语法是for (初始化; 条件; 更新) { 语句 }。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.085	2026-02-01 12:26:26.013
ad9bc702-8cd0-4a6b-a3ae-24d85d4b627e	for循环执行流程	补全for循环，输出1到5	EASY	1-05		\N	\N	10	2	t	FILL_BLANK	{"code": "for (int i = 1; i <= 5; {{blank}}) {\\n    cout << i << \\" \\";\\n}", "blanks": [{"hint": "自增操作", "answer": "i++"}], "explanation": "i++表示每次循环后i的值加1。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.089	2026-02-01 12:26:26.861
d46f2a87-d462-4541-b1e7-55ca2b907061	for循环的三要素	for循环的三要素是什么？	EASY	1-05		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["初始化、条件、更新", "开始、结束、步长", "变量、条件、操作", "声明、判断、修改"], "explanation": "for循环的三要素是初始化、条件和更新。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.093	2026-02-01 12:26:27.295
a0c622a4-3bf5-4766-a261-55e8506b146b	代码排序	排列for循环代码，输出1到10	EASY	1-05		\N	\N	10	4	t	CODE_ORDER	{"lines": ["for (int i = 1;", "     i <= 10;", "     i++) {", "    cout << i << \\" \\";", "}"], "explanation": "for循环的正确结构：for (初始化; 条件; 更新) { 语句 }。", "correctOrder": [0, 1, 2, 3, 4]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.097	2026-02-01 12:26:27.719
21dfbb54-b0cc-46b9-acf2-fdb8f66d4c97	找错误	找出for循环的错误	MEDIUM	1-05		\N	\N	10	5	t	BUG_FIX	{"bugLine": 1, "buggyCode": "for (int i = 1; i <= 5) {\\n    cout << i << \\" \\";\\n    i++;\\n}", "correctCode": "for (int i = 1; i <= 5; i++) {\\n    cout << i << \\" \\";\\n}", "explanation": "for循环的括号内应该有三个部分：初始化; 条件; 更新。", "bugDescription": "缺少更新表达式"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.101	2026-02-01 12:26:28.576
688e3634-7b0f-4c4d-a7af-2368e504127d	for循环的执行次数	以下for循环执行多少次？\nfor (int i = 0; i < 5; i++) { ... }	MEDIUM	1-05		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["5", "4", "6", "0"], "explanation": "i从0到4，共执行5次。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.105	2026-02-01 12:26:28.997
2cfff5f6-989f-4c54-9ed2-c545ddf9100e	循环变量作用域	补全代码，使用for循环计算1到10的和	MEDIUM	1-05		\N	\N	10	7	t	FILL_BLANK	{"code": "int sum = 0;\\nfor (int i = 1; i <= 10; i++) {\\n    sum {{blank}} i;\\n}\\ncout << sum;", "blanks": [{"hint": "累加", "answer": "+="}], "explanation": "sum += i等价于sum = sum + i。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.108	2026-02-01 12:26:29.915
986aa020-f987-4857-aa18-240ae7c427a0	for循环的变体	以下哪个是合法的for循环？	MEDIUM	1-05		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["for (;;) { ... }", "for (int i = 1; ; i++) { ... }", "for (; i <= 10; i++) { ... }", "以上都是"], "explanation": "for循环的三个部分都可以省略，;;表示无限循环。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:55.111	2026-02-01 12:26:30.55
052a67bf-a65d-4739-a345-b986630673d8	循环步长	补全for循环，输出1, 3, 5, 7, 9	MEDIUM	1-05		\N	\N	10	9	t	FILL_BLANK	{"code": "for (int i = 1; i <= 9; {{blank}}) {\\n    cout << i << \\" \\";\\n}", "blanks": [{"hint": "步长为2", "answer": "i += 2"}], "explanation": "i += 2表示每次循环后i的值增加2。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.115	2026-02-01 12:26:31.913
eed6a558-64e5-43e5-b446-f55dfdcac02b	while循环执行流程	补全while循环，输出1到5	EASY	1-05		\N	\N	10	2	t	FILL_BLANK	{"code": "int i = 1;\\nwhile (i <= 5) {\\n    cout << i << \\" \\";\\n    {{blank}};\\n}", "blanks": [{"hint": "自增操作", "answer": "i++"}], "explanation": "while循环需要在循环体内手动更新循环变量。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.131	2026-02-01 12:26:33.489
57ac7adc-819c-4927-a377-5c848a7cf826	while循环的特点	while循环的特点是什么？	EASY	1-05		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["先判断条件，再执行循环体", "先执行循环体，再判断条件", "只执行一次循环体", "不需要循环变量"], "explanation": "while循环先判断条件是否成立，成立才执行循环体。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.135	2026-02-01 12:26:34.275
cfd67924-250d-44bb-9cec-36bf88cda44b	代码排序	排列while循环代码，计算1到10的和	EASY	1-05		\N	\N	10	4	t	CODE_ORDER	{"lines": ["int i = 1, sum = 0;", "while (i <= 10) {", "    sum += i;", "    i++;", "}", "cout << sum;"], "explanation": "while循环的正确结构：先初始化变量，然后循环判断和执行。", "correctOrder": [0, 1, 2, 3, 4, 5]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.139	2026-02-01 12:26:34.77
8f4df26e-0cd6-408a-a888-547d8c373178	找错误	找出while循环的错误	MEDIUM	1-05		\N	\N	10	5	t	BUG_FIX	{"bugLine": 3, "buggyCode": "int i = 1;\\nwhile (i <= 5) {\\n    cout << i << \\" \\";\\n}", "correctCode": "int i = 1;\\nwhile (i <= 5) {\\n    cout << i << \\" \\";\\n    i++;\\n}", "explanation": "while循环需要在循环体内更新循环变量，否则会导致无限循环。", "bugDescription": "缺少循环变量更新，会导致无限循环"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.142	2026-02-01 12:26:35.275
13c8bd09-665d-4034-b4e3-a75348bb0764	while循环的执行次数	以下while循环执行多少次？\nint i = 0;\nwhile (i < 5) { i++; }	MEDIUM	1-05		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["5", "4", "6", "0"], "explanation": "i从0到4，共执行5次。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.152	2026-02-01 12:26:35.694
411bdc56-82de-4493-a32d-861abf80bac5	while循环与for循环的转换	将for循环转换为while循环	MEDIUM	1-05		\N	\N	10	7	t	FILL_BLANK	{"code": "// for循环\\n// for (int i = 1; i <= 10; i++) { cout << i; }\\n\\n// while循环\\nint i = 1;\\nwhile ({{blank}}) {\\n    cout << i;\\n    i++;\\n}", "blanks": [{"hint": "循环条件", "answer": "i <= 10"}], "explanation": "while循环的条件与for循环的条件相同。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.156	2026-02-01 12:26:36.119
be1f7966-25c1-46f4-9488-dd0ec853b445	无限循环	以下哪个是无限循环？	MEDIUM	1-05		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["while (true) { ... }", "while (1) { ... }", "for (;;) { ... }", "以上都是"], "explanation": "条件永远为真的循环都是无限循环。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:55.161	2026-02-01 12:26:36.84
8962490d-7b02-4ca2-a3ba-9a44d293dedc	while循环的应用	补全while循环，计算n的阶乘	MEDIUM	1-05		\N	\N	10	9	t	FILL_BLANK	{"code": "int n = 5, fact = 1, i = 1;\\nwhile (i <= n) {\\n    fact {{blank}} i;\\n    i++;\\n}\\ncout << fact;", "blanks": [{"hint": "累乘", "answer": "*="}], "explanation": "fact *= i等价于fact = fact * i。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.165	2026-02-01 12:26:37.934
d4d3bdec-6278-479f-ac4b-4e3bff9a1314	while循环编程	使用while循环计算n的阶乘	MEDIUM	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, fact = 1, i = 1;\n    cin >> n;\n    // 在这里写代码\n    \n    cout << fact;\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用while循环从1到n累乘。", "expectedOutput": "n的阶乘"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.169	2026-02-01 12:26:38.412
ba903b63-dc0e-4391-962c-fc6d45bc99d5	do-while循环的基本语法	do-while循环的基本语法结构是什么？	EASY	1-05		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["do { 语句 } while (条件);", "do while (条件) { 语句 };", "do { 语句 } while 条件;", "do while { 语句 } (条件);"], "explanation": "do-while循环的正确语法是do { 语句 } while (条件);", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.173	2026-02-01 12:26:38.834
c901fe24-bc53-430b-816e-fa5c572ea1d0	do-while循环执行流程	补全do-while循环，输出1到5	EASY	1-05		\N	\N	10	2	t	FILL_BLANK	{"code": "int i = 1;\\ndo {\\n    cout << i << \\" \\";\\n    i++;\\n} while ({{blank}});", "blanks": [{"hint": "循环条件", "answer": "i <= 5"}], "explanation": "do-while循环先执行一次循环体，然后判断条件。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.176	2026-02-01 12:26:40.602
1014e38b-4937-466e-9b5e-827c60db90a8	do-while循环的特点	do-while循环的特点是什么？	EASY	1-05		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["至少执行一次循环体", "先判断条件再执行循环体", "不需要循环变量", "只能执行一次循环体"], "explanation": "do-while循环先执行循环体，再判断条件，所以至少执行一次。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.18	2026-02-01 12:26:41.059
8448af78-0e18-446f-abfd-ecb0accc122e	代码排序	排列do-while循环代码，计算1到10的和	EASY	1-05		\N	\N	10	4	t	CODE_ORDER	{"lines": ["int i = 1, sum = 0;", "do {", "    sum += i;", "    i++;", "} while (i <= 10);", "cout << sum;"], "explanation": "do-while循环的正确结构：先执行循环体，再判断条件。", "correctOrder": [0, 1, 2, 3, 4, 5]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.184	2026-02-01 12:26:41.953
fc08031a-496b-4bb4-ab1c-528c5fdc4d34	找错误	找出do-while循环的错误	MEDIUM	1-05		\N	\N	10	5	t	BUG_FIX	{"bugLine": 3, "buggyCode": "int i = 1;\\ndo {\\n    cout << i << \\" \\";\\n} while (i <= 5)", "correctCode": "int i = 1;\\ndo {\\n    cout << i << \\" \\";\\n    i++;\\n} while (i <= 5);", "explanation": "do-while循环需要在循环体内更新循环变量，并且while后面需要分号。", "bugDescription": "缺少循环变量更新和分号"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.189	2026-02-01 12:26:42.399
5ba8b943-e7be-41bc-b347-5fd88e30255f	do-while循环的执行次数	以下do-while循环执行多少次？\nint i = 5;\ndo { i--; } while (i > 0);	MEDIUM	1-05		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["5", "4", "6", "0"], "explanation": "i从5到1，共执行5次。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.192	2026-02-01 12:26:43.25
eb803956-5959-4ed7-b12e-c18c2e95ea1d	deque容器	deque容器的特点是什么？	MEDIUM	1-11		\N	\N	15	4	t	MULTIPLE_CHOICE	{"options": ["双端队列", "两端插入删除高效", "支持随机访问", "以上都是"], "explanation": "deque容器是双端队列，支持两端插入删除高效和随机访问。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.655	2026-02-01 12:31:03.008
3e2a234b-1e88-4545-b8a6-217264da8657	do-while循环的应用	补全do-while循环，实现猜数字游戏的输入验证	MEDIUM	1-05		\N	\N	10	8	t	FILL_BLANK	{"code": "int guess;\\ndo {\\n    cout << \\"请输入1-100之间的数字: \\";\\n    cin >> guess;\\n} while ({{blank}});", "blanks": [{"hint": "输入范围验证", "answer": "guess < 1 || guess > 100"}], "explanation": "当输入不在1-100之间时，重新输入。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.2	2026-02-01 12:26:44.521
7a1ea68b-c583-4bdb-ab7f-7a65399ecab5	循环的选择	以下哪种情况最适合使用do-while循环？	MEDIUM	1-05		\N	\N	10	9	t	MULTIPLE_CHOICE	{"options": ["需要至少执行一次的输入验证", "已知循环次数的计数", "未知循环次数的处理", "无限循环"], "explanation": "do-while循环最适合需要至少执行一次的场景，如输入验证。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.203	2026-02-01 12:26:45.018
9fb8002c-56a2-4b4c-9c61-e745bf6743b9	do-while循环编程	使用do-while循环实现输入验证，要求输入1-100之间的数字	MEDIUM	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int num;\n    // 在这里写代码\n    \n    cout << "输入正确: " << num;\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用do-while循环实现输入验证，确保至少输入一次。", "expectedOutput": "直到输入1-100之间的数字才停止"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.207	2026-02-01 12:26:45.561
ea82a618-be42-4536-9af0-e4576f7056ba	循环计数	以下代码的输出是什么？\nint count = 0;\nfor (int i = 1; i <= 5; i++) {\n    count++;\n}\ncout << count;	EASY	1-05		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["5", "4", "6", "0"], "explanation": "循环执行5次，count从0增加到5。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.21	2026-02-01 12:26:46.866
32d61cc9-8237-43f0-af5d-01db6650a56f	循环累加	补全代码，计算1到n的和	EASY	1-05		\N	\N	10	2	t	FILL_BLANK	{"code": "int n = 10, sum = 0;\\nfor (int i = 1; i <= n; i++) {\\n    sum {{blank}} i;\\n}\\ncout << sum;", "blanks": [{"hint": "累加", "answer": "+="}], "explanation": "sum += i用于累加i的值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.214	2026-02-01 12:26:47.323
ea87878f-471a-4f91-ae5b-3ed7a9c16209	循环累乘	以下代码计算的是什么？\nint fact = 1;\nfor (int i = 1; i <= 5; i++) {\n    fact *= i;\n}\ncout << fact;	MEDIUM	1-05		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["5的阶乘", "1到5的和", "5的平方", "5的立方"], "explanation": "fact *= i表示累乘，计算的是5的阶乘。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.218	2026-02-01 12:26:48.238
95743909-a972-4d10-876e-d1a715ab3889	计数与累加的结合	补全代码，计算1到n中偶数的和	MEDIUM	1-05		\N	\N	10	4	t	FILL_BLANK	{"code": "int n = 10, sum = 0;\\nfor (int i = 1; i <= n; i++) {\\n    if (i % 2 {{blank}} 0) {\\n        sum += i;\\n    }\\n}\\ncout << sum;", "blanks": [{"hint": "等于", "answer": "=="}], "explanation": "i%2==0表示i是偶数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.222	2026-02-01 12:26:48.69
ba15eb5d-1877-4d89-aac5-2068534ffc06	循环统计	以下代码统计的是什么？\nint count = 0;\nfor (int i = 1; i <= 100; i++) {\n    if (i % 3 == 0) {\n        count++;\n    }\n}\ncout << count;	MEDIUM	1-05		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["1到100中3的倍数的个数", "1到100中3的倍数的和", "1到100的和", "1到100的个数"], "explanation": "统计1到100中能被3整除的数的个数。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.225	2026-02-01 12:26:49.116
81fe41eb-ca94-4de2-adac-1d4614546a09	累加器初始化	补全代码，初始化累加器	EASY	1-05		\N	\N	10	6	t	FILL_BLANK	{"code": "int n = 5, sum = {{blank}};\\nfor (int i = 1; i <= n; i++) {\\n    sum += i;\\n}\\ncout << sum;", "blanks": [{"hint": "初始值", "answer": "0"}], "explanation": "累加器的初始值应该是0。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.229	2026-02-01 12:26:49.74
2f122acb-0f25-4b8a-b5df-d5d748c02b30	累乘器初始化	计算阶乘时，累乘器的初始值应该是？	EASY	1-05		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["1", "0", "n", "n-1"], "explanation": "累乘器的初始值应该是1，因为任何数乘以1都不变。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.232	2026-02-01 12:26:50.271
513b0032-8a4e-430e-a53c-72f26f991587	循环计数的应用	补全代码，统计输入的正数个数	MEDIUM	1-05		\N	\N	10	8	t	FILL_BLANK	{"code": "int n, count = 0;\\nfor (int i = 0; i < 5; i++) {\\n    cin >> n;\\n    if (n > 0) {\\n        {{blank}};\\n    }\\n}\\ncout << count;", "blanks": [{"hint": "计数", "answer": "count++"}], "explanation": "当输入正数时，计数器加1。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.236	2026-02-01 12:26:51.311
9ef9564d-cd4e-415c-996b-4d4cbb138ebd	循环累加的应用	输入n个数，计算它们的平均值	MEDIUM	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, num, sum = 0;\n    cin >> n;\n    // 在这里写代码\n    \n    double avg = (double)sum / n;\n    cout << avg;\n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "使用循环累加输入的数，然后计算平均值。", "expectedOutput": "输入n个数的平均值"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.24	2026-02-01 12:26:51.834
073ac357-89c3-403b-ba6e-bb69dd17c36c	循环结构的选择	当循环次数已知时，最适合使用哪种循环？	EASY	1-05		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["for循环", "while循环", "do-while循环", "都可以"], "explanation": "for循环最适合已知循环次数的情况。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.248	2026-02-01 12:26:53.096
8b57b09d-ed1d-4f96-8426-7d4a4cd9e637	循环的终止条件	补全代码，使用while循环计算n的阶乘	MEDIUM	1-05		\N	\N	10	2	t	FILL_BLANK	{"code": "int n = 5, fact = 1, i = 1;\\nwhile ({{blank}}) {\\n    fact *= i;\\n    i++;\\n}\\ncout << fact;", "blanks": [{"hint": "循环条件", "answer": "i <= n"}], "explanation": "当i小于等于n时，继续循环。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.252	2026-02-01 12:26:53.671
45b581d9-e8ab-456a-9347-f6b5d75a930e	循环的嵌套	以下代码的输出是什么？\nfor (int i = 1; i <= 3; i++) {\n    for (int j = 1; j <= 2; j++) {\n        cout << i << j << " ";\n    }\n}	MEDIUM	1-05		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["11 12 21 22 31 32", "11 21 31 12 22 32", "12 21 31 32", "编译错误"], "explanation": "外层循环i从1到3，内层循环j从1到2，所以输出11 12 21 22 31 32。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.255	2026-02-01 12:26:54.163
c6bc1c0c-c2b6-4d3e-9077-1f43f8b58d9f	循环的效率	以下哪个循环的效率更高？	HARD	1-05		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["for (int i = 0; i < n; i++) { ... }", "int i = 0; while (i < n) { ... i++; }", "do { ... i++; } while (i < n);", "效率相同"], "explanation": "for循环的代码结构更紧凑，编译器更容易优化，所以效率通常更高。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.262	2026-02-01 12:26:55.209
6abbe39c-d4ef-4b3c-9013-97716a21ab5e	循环的边界条件	补全代码，输出1到n的所有奇数	MEDIUM	1-05		\N	\N	10	6	t	FILL_BLANK	{"code": "int n = 10;\\nfor (int i = 1; i <= n; {{blank}}) {\\n    cout << i << \\" \\";\\n}", "blanks": [{"hint": "步长为2", "answer": "i += 2"}], "explanation": "i += 2用于跳过偶数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.265	2026-02-01 12:26:55.714
bb17a3d9-d55f-4efd-ab86-8537dceaf9b7	循环的综合应用	使用循环计算斐波那契数列的第n项	HARD	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, a = 0, b = 1, c;\n    cin >> n;\n    // 在这里写代码\n    \n    cout << b;\n    return 0;\n}	\N	\N	20	7	t	CODING	{"explanation": "斐波那契数列：0, 1, 1, 2, 3, 5, 8, ...", "expectedOutput": "斐波那契数列的第n项"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.269	2026-02-01 12:26:56.134
f8aca3ca-991c-4384-af2e-cf45fa9e64fd	循环的挑战	输入一个正整数n，输出n行的直角三角形	HARD	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	8	t	CODING	{"explanation": "使用嵌套循环输出直角三角形。", "expectedOutput": "n行的直角三角形，每行有i个*"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.272	2026-02-01 12:26:56.656
cb39c92f-563c-4fa2-b1bd-dccb9d9ce590	循环的实际应用	输入一个正整数，判断它是否是质数	HARD	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "使用循环判断一个数是否是质数。", "expectedOutput": "是质数或不是质数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.276	2026-02-01 12:26:57.075
ec221978-604f-4b20-a038-237b83a69c78	循环的综合挑战	输入两个正整数a和b，计算它们的最大公约数	HARD	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用辗转相除法计算最大公约数。", "expectedOutput": "a和b的最大公约数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.279	2026-02-01 12:26:57.562
f6e001ee-b842-4b2f-91bd-6db182654f62	循环嵌套的基本概念	循环嵌套是指什么？	EASY	1-05		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["一个循环内部包含另一个循环", "两个循环并列执行", "循环中包含条件判断", "循环中包含函数调用"], "explanation": "循环嵌套是指一个循环内部包含另一个循环。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.282	2026-02-01 12:26:57.979
35cb7318-94d8-4537-9688-4a53d683288f	循环嵌套的执行流程	补全代码，输出乘法表的前3行	EASY	1-05		\N	\N	10	2	t	FILL_BLANK	{"code": "for (int i = 1; i <= 3; i++) {\\n    for (int j = 1; j <= i; {{blank}}) {\\n        cout << i << \\"*\\" << j << \\"=\\" << i*j << \\" \\";\\n    }\\n    cout << endl;\\n}", "blanks": [{"hint": "自增操作", "answer": "j++"}], "explanation": "内层循环j从1到i，输出乘法表的第i行。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.285	2026-02-01 12:26:58.521
4fef008a-5c15-41d6-873e-e32861602baf	循环嵌套的执行次数	以下嵌套循环执行多少次？\nfor (int i = 1; i <= 3; i++) {\n    for (int j = 1; j <= 2; j++) {\n        // 执行语句\n    }\n}	MEDIUM	1-05		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["6", "5", "3", "2"], "explanation": "外层循环执行3次，内层循环每次执行2次，总共3*2=6次。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.289	2026-02-01 12:26:59.383
48a66ae0-7219-46f4-9d67-f825e94a3201	代码排序	排列嵌套循环代码，输出3x3的矩阵	MEDIUM	1-05		\N	\N	10	4	t	CODE_ORDER	{"lines": ["for (int i = 1; i <= 3; i++) {", "    for (int j = 1; j <= 3; j++) {", "        cout << i*j << \\" \\";", "    }", "    cout << endl;", "}"], "explanation": "嵌套循环的正确结构：外层循环控制行，内层循环控制列。", "correctOrder": [0, 1, 2, 3, 4, 5]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.292	2026-02-01 12:27:00.24
3f88fa93-ab57-45c7-bf25-a7db5e71cddf	循环嵌套的应用	以下哪种情况最适合使用嵌套循环？	MEDIUM	1-05		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["输出二维表格", "计算1到n的和", "输入验证", "判断质数"], "explanation": "输出二维表格需要外层循环控制行，内层循环控制列，最适合使用嵌套循环。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.299	2026-02-01 12:27:05.083
c7338bfc-c2a4-482a-ac4a-0451037e0142	循环变量的作用域	补全代码，使用嵌套循环计算矩阵元素的和	MEDIUM	1-05		\N	\N	10	7	t	FILL_BLANK	{"code": "int sum = 0;\\nfor (int i = 0; i < 2; i++) {\\n    for (int j = 0; j < 3; j++) {\\n        int num;\\n        cin >> num;\\n        sum {{blank}} num;\\n    }\\n}\\ncout << sum;", "blanks": [{"hint": "累加", "answer": "+="}], "explanation": "sum += num用于累加输入的矩阵元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.303	2026-02-01 12:27:05.569
69ee83da-0e0d-4433-a616-487d17c490f4	循环嵌套的变体	以下代码的输出是什么？\nfor (int i = 1; i <= 2; i++) {\n    cout << "外层" << i << endl;\n    for (int j = 1; j <= 2; j++) {\n        cout << "  内层" << j << endl;\n    }\n}	MEDIUM	1-05		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["外层1\\n  内层1\\n  内层2\\n外层2\\n  内层1\\n  内层2", "外层1\\n外层2\\n  内层1\\n  内层2", "外层1\\n  内层1\\n外层2\\n  内层2", "编译错误"], "explanation": "外层循环执行2次，每次外层循环执行时，内层循环执行2次。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.306	2026-02-01 12:27:06.074
519e8361-fbfe-42e4-b50b-24ef66e64ed6	质数判断编程	输入一个正整数，判断它是否是质数	MEDIUM	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "使用循环判断一个数是否是质数，注意处理特殊情况。", "expectedOutput": "是质数或不是质数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.418	2026-02-01 12:27:28.214
1ee08a42-b2cc-45cf-898f-cbff1106153c	循环嵌套编程	使用嵌套循环输出一个4x4的乘法表	MEDIUM	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用嵌套循环，外层循环控制行数，内层循环控制列数。", "expectedOutput": "4x4的乘法表"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.313	2026-02-01 12:27:07.037
75cabe3d-8175-45aa-b2ae-db9aee2091b1	九九乘法表的结构	九九乘法表有多少行？	EASY	1-05		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["9", "8", "10", "1"], "explanation": "九九乘法表有9行，从1乘到9。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.316	2026-02-01 12:27:08.166
41a21dd5-4280-444f-a6c3-9bf1bfa8f259	九九乘法表的输出格式	补全代码，输出九九乘法表	EASY	1-05		\N	\N	10	2	t	FILL_BLANK	{"code": "for (int i = 1; i <= 9; i++) {\\n    for (int j = 1; j <= {{blank}}; j++) {\\n        cout << j << \\"*\\" << i << \\"=\\" << j*i << \\"\\t\\";\\n    }\\n    cout << endl;\\n}", "blanks": [{"hint": "内层循环次数", "answer": "i"}], "explanation": "内层循环j从1到i，这样可以输出三角形的乘法表。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.319	2026-02-01 12:27:08.614
547b194d-eca6-4b6f-ba99-42cb7ac3a78c	代码排序	排列九九乘法表的代码	MEDIUM	1-05		\N	\N	10	4	t	CODE_ORDER	{"lines": ["for (int i = 1; i <= 9; i++) {", "    for (int j = 1; j <= i; j++) {", "        cout << j << \\"*\\" << i << \\"=\\" << j*i << \\" \\";", "    }", "    cout << endl;", "}"], "explanation": "正确的九九乘法表代码结构：外层循环i从1到9，内层循环j从1到i。", "correctOrder": [0, 1, 2, 3, 4, 5]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.326	2026-02-01 12:27:10.455
ac4c959b-f768-48ee-9370-59c3c75da1a9	找错误	找出九九乘法表代码的错误	MEDIUM	1-05		\N	\N	10	5	t	BUG_FIX	{"bugLine": 4, "buggyCode": "for (int i = 1; i <= 9; i++) {\\n    for (int j = 1; j <= i; j++) {\\n        cout << i << \\"*\\" << j << \\"=\\" << i*j << \\" \\";\\n    }\\n}", "correctCode": "for (int i = 1; i <= 9; i++) {\\n    for (int j = 1; j <= i; j++) {\\n        cout << j << \\"*\\" << i << \\"=\\" << j*i << \\" \\";\\n    }\\n    cout << endl;\\n}", "explanation": "每输出一行后需要换行，否则所有内容会输出在同一行。", "bugDescription": "缺少换行，所有内容输出在一行"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.329	2026-02-01 12:27:11.758
ac59eb6e-2271-44d6-b44b-094e0d4b21a6	乘法表的对齐	补全代码，使用\t制表符对齐乘法表	MEDIUM	1-05		\N	\N	10	6	t	FILL_BLANK	{"code": "for (int i = 1; i <= 9; i++) {\\n    for (int j = 1; j <= i; j++) {\\n        cout << j << \\"*\\" << i << \\"=\\" << j*i << \\"{{blank}}\\";\\n    }\\n    cout << endl;\\n}", "blanks": [{"hint": "制表符", "answer": "\\t"}], "explanation": "\\t制表符可以使输出对齐，看起来更整齐。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.333	2026-02-01 12:27:12.29
f4367ff7-7b92-45dd-a0a8-51642ab518d5	乘法表的变体	如何修改代码输出倒三角乘法表？	MEDIUM	1-05		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["将内层循环改为j从i到9", "将外层循环改为i从9到1", "将内层循环改为j从i到1", "将外层循环改为i从9到1，内层循环改为j从1到i"], "explanation": "输出倒三角乘法表需要外层循环从9到1，内层循环从1到i。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:55.336	2026-02-01 12:27:12.808
c792b6e4-d9a8-4903-9e48-c0fd55193d0d	乘法表的计算	匹配乘法表达式与结果	EASY	1-05		\N	\N	10	8	t	MATCHING	{"leftItems": ["2*3", "4*5", "7*8", "9*9"], "rightItems": ["6", "20", "56", "81"], "explanation": "计算乘法表达式的结果。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.34	2026-02-01 12:27:13.676
3ddbd8ad-4d94-45c4-8f5f-9f24426725a6	九九乘法表编程	输出标准的九九乘法表（三角形格式）	MEDIUM	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "使用嵌套循环，内层循环次数等于外层循环变量的值。", "expectedOutput": "三角形格式的九九乘法表"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.343	2026-02-01 12:27:14.097
4f22f58e-b7e5-45a0-8fdb-c7fff043ad9b	乘法表的扩展	输入一个正整数n，输出n×n的乘法表	HARD	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "根据输入的n值，输出相应大小的乘法表。", "expectedOutput": "n×n的乘法表"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.346	2026-02-01 12:27:15.021
4fd0b6a5-bf14-40f3-be5b-9dedaa9b17cc	break语句的作用	break语句在循环中的作用是什么？	EASY	1-05		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["跳出当前循环", "跳出所有循环", "结束程序", "跳过当前循环体的剩余部分"], "explanation": "break语句用于跳出当前循环，不再执行循环的剩余部分。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.35	2026-02-01 12:27:15.508
d71efb00-13d6-40d9-a52f-574b052bc8c3	continue语句的作用	continue语句在循环中的作用是什么？	EASY	1-05		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["跳过当前循环体的剩余部分，开始下一次循环", "跳出当前循环", "结束程序", "重新开始循环"], "explanation": "continue语句用于跳过当前循环体的剩余部分，直接开始下一次循环。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.353	2026-02-01 12:27:16.803
e848077b-b8dc-4518-ab04-c920c68801bf	break语句的应用	补全代码，使用break语句在找到目标值时退出循环	MEDIUM	1-05		\N	\N	10	3	t	FILL_BLANK	{"code": "int target = 5;\\nfor (int i = 1; i <= 10; i++) {\\n    if (i == target) {\\n        cout << \\"找到目标值: \\" << i;\\n        {{blank}};\\n    }\\n}", "blanks": [{"hint": "跳出循环", "answer": "break"}], "explanation": "当找到目标值时，使用break语句跳出循环。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.356	2026-02-01 12:27:17.224
cd43a5f6-95c7-4879-b1fc-8c7d69aa592e	continue语句的应用	补全代码，使用continue语句跳过偶数	MEDIUM	1-05		\N	\N	10	4	t	FILL_BLANK	{"code": "for (int i = 1; i <= 10; i++) {\\n    if (i % 2 == 0) {\\n        {{blank}};\\n    }\\n    cout << i << \\" \\";\\n}", "blanks": [{"hint": "跳过当前循环", "answer": "continue"}], "explanation": "当i是偶数时，使用continue语句跳过当前循环的剩余部分，直接开始下一次循环。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.36	2026-02-01 12:27:18.172
9e4041d8-1e80-4fe6-bd6d-b8f62e78f522	break与continue的比较	匹配语句与作用	MEDIUM	1-05		\N	\N	10	7	t	MATCHING	{"leftItems": ["break", "continue", "跳出循环", "跳过当前循环"], "rightItems": ["跳出循环", "跳过当前循环", "break", "continue"], "explanation": "break用于跳出循环，continue用于跳过当前循环的剩余部分。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.37	2026-02-01 12:27:19.617
02479fab-f639-42c1-afbe-0a7031bf93de	break在嵌套循环中的作用	执行以下代码会输出什么？\nfor (int i = 1; i <= 2; i++) {\n    for (int j = 1; j <= 3; j++) {\n        if (j == 2) {\n            break;\n        }\n        cout << i << j << " ";\n    }\n}	HARD	1-05		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["11 21", "11 12 21 22", "11 12 13 21 22 23", "编译错误"], "explanation": "当j=2时，执行break语句，跳出内层循环，所以只输出11和21。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.373	2026-02-01 12:27:20.048
4ff34c44-e103-4b73-9218-7a4519a64f40	break语句编程	输入一系列整数，当输入0时停止，计算输入的正数和	MEDIUM	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int num, sum = 0;\n    // 在这里写代码\n    \n    cout << sum;\n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "使用循环和break语句，当输入0时停止循环。", "expectedOutput": "输入的正数和"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.377	2026-02-01 12:27:20.909
6da8da51-5874-41c4-848b-b5d0ffc16a3a	continue语句编程	输入10个整数，计算其中正数的平均值	MEDIUM	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int num, sum = 0, count = 0;\n    for (int i = 0; i < 10; i++) {\n        cin >> num;\n        // 在这里写代码\n    }\n    if (count > 0) {\n        cout << (double)sum / count;\n    } else {\n        cout << 0;\n    }\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用continue语句跳过非正数，只计算正数的和和个数。", "expectedOutput": "正数的平均值"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.38	2026-02-01 12:27:21.865
7eb9b59b-15db-4a80-b143-db049d291b8c	质数的定义	质数是指什么？	EASY	1-05		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["只能被1和自身整除的大于1的自然数", "能被2整除的数", "能被多个数整除的数", "小于10的数"], "explanation": "质数的定义是只能被1和自身整除的大于1的自然数。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.383	2026-02-01 12:27:22.284
603d55d8-af19-4850-92a1-6e2240f179d1	质数判断的基本方法	补全代码，判断一个数是否是质数	MEDIUM	1-05		\N	\N	10	2	t	FILL_BLANK	{"code": "int n = 7;\\nbool isPrime = true;\\nif (n <= 1) {\\n    isPrime = false;\\n} else {\\n    for (int i = 2; i < n; i++) {\\n        if (n % i {{blank}} 0) {\\n            isPrime = false;\\n            break;\\n        }\\n    }\\n}\\ncout << (isPrime ? \\"是质数\\" : \\"不是质数\\");", "blanks": [{"hint": "等于", "answer": "=="}], "explanation": "如果n能被i整除，说明n不是质数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.386	2026-02-01 12:27:22.765
e41d713c-22e3-43b5-af8f-fa041fa4cdcb	质数判断的优化	判断质数时，循环的上界可以优化为多少？	MEDIUM	1-05		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["sqrt(n)", "n/2", "n-1", "n"], "explanation": "判断质数时，只需要检查到sqrt(n)即可，因为如果n有一个大于sqrt(n)的因数，那么它一定有一个小于sqrt(n)的因数。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.39	2026-02-01 12:27:24.334
24ee6fd6-e7b4-41ca-9a41-a825e3c7cc8a	代码排序	排列质数判断的代码	MEDIUM	1-05		\N	\N	10	4	t	CODE_ORDER	{"lines": ["int n = 11;", "bool isPrime = true;", "if (n <= 1) {", "    isPrime = false;", "} else {", "    for (int i = 2; i * i <= n; i++) {", "        if (n % i == 0) {", "            isPrime = false;", "            break;", "        }", "    }", "}", "cout << (isPrime ? \\"质数\\" : \\"非质数\\");"], "explanation": "质数判断的正确流程：首先处理特殊情况（n<=1），然后循环检查到sqrt(n)。", "correctOrder": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.393	2026-02-01 12:27:25.066
c29387b5-1340-4008-81a2-777866bd1703	找错误	找出质数判断代码的错误	MEDIUM	1-05		\N	\N	10	5	t	BUG_FIX	{"bugLine": 3, "buggyCode": "int n = 5;\\nbool isPrime = true;\\nfor (int i = 2; i < n; i++) {\\n    if (n % i == 0) {\\n        isPrime = false;\\n    }\\n}\\ncout << (isPrime ? \\"质数\\" : \\"非质数\\");", "correctCode": "int n = 5;\\nbool isPrime = true;\\nif (n <= 1) {\\n    isPrime = false;\\n} else {\\n    for (int i = 2; i < n; i++) {\\n        if (n % i == 0) {\\n            isPrime = false;\\n            break;\\n        }\\n    }\\n}\\ncout << (isPrime ? \\"质数\\" : \\"非质数\\");", "explanation": "需要处理n<=1的特殊情况，并且在找到因数后使用break跳出循环。", "bugDescription": "缺少对n<=1的处理，且没有使用break优化"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.397	2026-02-01 12:27:25.921
028c1730-aedf-47ba-ada4-ca41b45a5bb7	质数的判断结果	匹配数字与是否为质数	EASY	1-05		\N	\N	10	6	t	MATCHING	{"leftItems": ["2", "4", "7", "9"], "rightItems": ["质数", "非质数", "质数", "非质数"], "explanation": "2和7是质数，4和9是非质数。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.403	2026-02-01 12:27:26.824
1c6e2ed9-799e-4c4e-8ff4-849cccfbcb8b	质数判断的循环条件	补全代码，使用优化的循环条件判断质数	HARD	1-05		\N	\N	10	7	t	FILL_BLANK	{"code": "int n = 17;\\nbool isPrime = true;\\nif (n <= 1) {\\n    isPrime = false;\\n} else {\\n    for (int i = 2; {{blank}}; i++) {\\n        if (n % i == 0) {\\n            isPrime = false;\\n            break;\\n        }\\n    }\\n}\\ncout << (isPrime ? \\"是质数\\" : \\"不是质数\\");", "blanks": [{"hint": "优化的循环条件", "answer": "i * i <= n"}], "explanation": "i * i <= n等价于i <= sqrt(n)，可以避免使用sqrt函数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.408	2026-02-01 12:27:27.251
b5563d0b-b09d-4b81-95f6-3e40c14d7f69	质数的应用	质数在以下哪些领域有应用？	MEDIUM	1-05		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["密码学", "计算机科学", "数学", "以上都是"], "explanation": "质数在密码学、计算机科学和数学等领域都有广泛的应用。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:55.413	2026-02-01 12:27:27.701
775d30e3-7e31-4907-9796-e5ab99550a9a	循环的综合应用	输入一个字符串，统计其中每个字符出现的次数	HARD	1-05	#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	8	t	CODING	{"explanation": "使用循环遍历字符串，统计每个字符的出现次数。", "expectedOutput": "每个字符出现的次数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.459	2026-01-30 16:29:55.459
b40013ae-eec0-4c6d-abe8-b006dbfc1232	循环的挑战	输入一个正整数n，判断它是否是回文数	HARD	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "回文数是指正着读和倒着读都一样的数。", "expectedOutput": "是回文数或不是回文数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.463	2026-01-30 16:29:55.463
9aca3f84-432d-4884-a5cd-2e6c4b2d818a	循环结构的综合应用	以下哪种情况最适合使用循环结构？	EASY	1-05		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["重复执行相同的操作", "条件判断", "函数调用", "变量定义"], "explanation": "循环结构最适合重复执行相同的操作。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.428	2026-02-01 12:27:29.146
2973da44-ce2b-4a44-a4a2-9e9163556f0f	循环的挑战	输入一个正整数n，判断它是否是回文数	HARD	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "回文数是指正着读和倒着读都一样的数。", "expectedOutput": "是回文数或不是回文数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.444	2026-02-01 12:27:35.368
a94c7688-e581-4785-aae6-6d58e948b8b2	数组的基本概念	数组是什么？	EASY	1-06		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["相同类型元素的集合", "不同类型元素的集合", "只能存储整数的容器", "只能存储浮点数的容器"], "explanation": "数组是相同类型元素的集合，用于存储多个相同类型的数据。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.47	2026-02-01 12:27:36.72
11474d51-aa54-46b3-8547-33a55afcddc0	循环的实际应用	输入一个正整数n，输出n的所有因数	HARD	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	5	t	CODING	{"explanation": "使用循环找出n的所有因数。", "expectedOutput": "n的所有因数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.449	2026-02-01 12:27:32.276
3b42936e-57d7-41fa-b2b5-cff5d7d8bfcd	循环的综合挑战	输入一个正整数n，输出n行的杨辉三角	HARD	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	6	t	CODING	{"explanation": "杨辉三角的特点是每个数等于它上方两数之和。", "expectedOutput": "n行的杨辉三角"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.452	2026-02-01 12:27:32.725
10da074e-d9a0-4719-acc9-4f09a6b255b5	循环的效率挑战	输入两个正整数a和b，计算它们的最小公倍数	HARD	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	7	t	CODING	{"explanation": "最小公倍数 = a * b / 最大公约数。", "expectedOutput": "a和b的最小公倍数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.455	2026-02-01 12:27:33.597
0d5a7be4-f931-4678-b654-50a8e6083da8	循环的综合应用	输入一个字符串，统计其中每个字符出现的次数	HARD	1-05	#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	8	t	CODING	{"explanation": "使用循环遍历字符串，统计每个字符的出现次数。", "expectedOutput": "每个字符出现的次数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.44	2026-02-01 12:27:34.519
9fdee97f-48ea-4002-9fb1-8413ec93a5ec	循环的终极挑战	输入一个正整数n，输出所有小于n的质数（埃拉托斯特尼筛法）	HARD	1-05	#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "埃拉托斯特尼筛法是一种高效的质数筛选算法。", "expectedOutput": "所有小于n的质数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.466	2026-02-01 12:27:35.871
6ed8fc8c-b45d-47f1-80c5-dc6a85976873	数组的特点	以下关于数组的说法，正确的是？	EASY	1-06		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["数组元素在内存中连续存储", "数组元素在内存中分散存储", "数组的大小可以在运行时改变", "数组只能存储基本类型"], "explanation": "数组元素在内存中连续存储，这是数组的重要特点。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.474	2026-02-01 12:27:37.576
6ce60822-f9ba-45b2-a9bd-c43d3aba95ad	数组的下标	数组的下标从{{blank}}开始	EASY	1-06		\N	\N	10	3	t	FILL_BLANK	{"code": "int arr[5];\\n// 数组的第一个元素是 arr[{{blank}}]", "blanks": [{"hint": "起始下标", "answer": "0"}], "explanation": "C++中数组的下标从0开始。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.477	2026-02-01 12:27:38.003
9c2e54bf-d76a-4486-80a4-97f4e667d688	数组的大小	定义数组int arr[10];，该数组有多少个元素？	EASY	1-06		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["10", "9", "11", "0"], "explanation": "int arr[10];定义了一个包含10个元素的数组。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.481	2026-02-01 12:27:38.511
3a29e036-c2ef-4183-a01f-20972648ecdc	数组元素的访问	补全代码，访问数组的第三个元素	EASY	1-06		\N	\N	10	5	t	FILL_BLANK	{"code": "int arr[5] = {1, 2, 3, 4, 5};\\ncout << arr[{{blank}}]; // 输出第三个元素", "blanks": [{"hint": "第三个元素的下标", "answer": "2"}], "explanation": "数组下标从0开始，所以第三个元素的下标是2。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.484	2026-02-01 12:27:39.237
7f52ccaf-beec-4572-9461-57cf84c2b1e1	数组的内存占用	int类型占4字节，int arr[5];占用{{blank}}字节内存	MEDIUM	1-06		\N	\N	10	7	t	FILL_BLANK	{"code": "int arr[5];\\n// 占用 {{blank}} 字节内存", "blanks": [{"hint": "5*4", "answer": "20"}], "explanation": "int arr[5]包含5个int元素，每个占4字节，总共占用5*4=20字节内存。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.492	2026-02-01 12:27:40.668
3bc8da8b-4a6e-458e-bcf5-0026bc93cd16	数组的应用场景	匹配应用场景与数据结构	MEDIUM	1-06		\N	\N	10	8	t	MATCHING	{"leftItems": ["存储一组学生成绩", "存储不同类型的数据", "存储动态变化的数据", "存储固定数量的相同类型数据"], "rightItems": ["数组", "结构体", "vector", "数组"], "explanation": "数组适合存储固定数量的相同类型数据，如学生成绩。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.495	2026-02-01 12:27:41.112
8e267da7-4baf-4b23-904d-c510b28b5bb7	数组的越界访问	数组越界访问会导致什么问题？	MEDIUM	1-06		\N	\N	10	9	t	MULTIPLE_CHOICE	{"options": ["未定义行为", "编译错误", "运行时错误", "什么都不发生"], "explanation": "数组越界访问是未定义行为，可能导致程序崩溃或其他不可预测的结果。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.499	2026-02-01 12:27:41.533
31d884d6-c75a-4a54-8c28-3566f35c7830	数组概念编程	定义一个包含5个整数的数组，初始化并输出所有元素	EASY	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "定义数组、初始化并使用循环输出所有元素。", "expectedOutput": "数组的所有元素"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.503	2026-02-01 12:27:42.387
b4938be2-3bd8-4a47-81d3-42cbaefd336b	数组的定义语法	以下哪种数组定义方式是正确的？	EASY	1-06		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["int arr[5];", "int arr[];", "int 5[arr];", "arr[5] int;"], "explanation": "正确的数组定义语法是：类型 数组名[大小];", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.507	2026-02-01 12:27:42.971
e6bc91b9-e550-4a8e-9f18-d69548eb01f9	数组的初始化方式	补全代码，初始化数组为1, 2, 3, 4, 5	EASY	1-06		\N	\N	10	2	t	FILL_BLANK	{"code": "int arr[5] = {{blank}};", "blanks": [{"hint": "初始化列表", "answer": "{1, 2, 3, 4, 5}"}], "explanation": "使用花括号{}包含初始化值列表。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.512	2026-02-01 12:27:43.423
6d751b7f-ac3c-4798-8222-6c9e0f0310b1	数组的默认初始化	定义数组int arr[5];，未初始化的元素值是什么？	MEDIUM	1-06		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["不确定", "0", "1", "随机值"], "explanation": "全局数组会默认初始化为0，局部数组未初始化的值是不确定的。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.515	2026-02-01 12:27:43.846
9c344dc6-0fd8-4929-96b2-324df4384466	数组的部分初始化	补全代码，部分初始化数组，其余元素默认为0	MEDIUM	1-06		\N	\N	10	4	t	FILL_BLANK	{"code": "int arr[5] = {{blank}}; // 初始化前两个元素为1和2", "blanks": [{"hint": "部分初始化列表", "answer": "{1, 2}"}], "explanation": "当初始化列表元素个数少于数组大小时，剩余元素会被初始化为0。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.519	2026-02-01 12:27:44.781
301ad109-74d0-4885-aa16-33170425f158	数组的隐式大小	定义数组int arr[] = {1, 2, 3, 4, 5};，该数组的大小是多少？	MEDIUM	1-06		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["5", "4", "6", "不确定"], "explanation": "当不指定数组大小时，编译器会根据初始化列表的元素个数确定数组大小。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.523	2026-02-01 12:27:45.201
132c2005-bdb2-4f55-9a71-fcae240b959f	数组的初始化错误	找出数组初始化的错误	MEDIUM	1-06		\N	\N	10	6	t	BUG_FIX	{"bugLine": 1, "buggyCode": "int arr[3] = {1, 2, 3, 4};", "correctCode": "int arr[4] = {1, 2, 3, 4}; 或 int arr[] = {1, 2, 3, 4};", "explanation": "初始化列表的元素个数不能超过数组的大小。", "bugDescription": "初始化列表元素个数超过数组大小"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.526	2026-02-01 12:27:45.717
24696f23-3407-4945-a0e6-ffa0f755dde9	字符数组的初始化	补全代码，初始化字符数组为"Hello"	MEDIUM	1-06		\N	\N	10	7	t	FILL_BLANK	{"code": "char str[6] = {{blank}};", "blanks": [{"hint": "字符串字面量", "answer": "\\"Hello\\""}], "explanation": "字符串字面量会自动添加结束符，所以需要6个元素的空间。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.531	2026-02-01 12:27:46.568
95259d9a-1731-4ac4-875a-77210ab6fcfe	数组的初始化与赋值	以下代码是否正确？\nint arr[5];\narr = {1, 2, 3, 4, 5};	MEDIUM	1-06		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["错误", "正确", "编译通过但运行错误", "不确定"], "explanation": "数组名是常量指针，不能直接用赋值语句给整个数组赋值。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.534	2026-02-01 12:27:46.995
eb7219de-0b9f-432f-98e1-8c04ebc3ff23	数组初始化编程	定义一个包含10个元素的数组，初始化为1到10	MEDIUM	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "使用循环初始化数组元素为1到10。", "expectedOutput": "1 2 3 4 5 6 7 8 9 10"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.538	2026-02-01 12:27:47.935
8a140601-431b-4792-8024-3abc4ca59818	数组的复杂初始化	定义一个包含5个元素的数组，初始化为斐波那契数列的前5项	MEDIUM	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "斐波那契数列：0, 1, 1, 2, 3", "expectedOutput": "0 1 1 2 3"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.541	2026-02-01 12:27:48.36
3be01758-1140-4cc6-9976-d1f6185165ef	数组遍历的基本方法	遍历数组最常用的方法是什么？	EASY	1-06		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["使用循环", "使用递归", "使用指针", "使用引用"], "explanation": "使用循环是遍历数组最常用的方法。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.545	2026-02-01 12:27:48.851
12e3979c-7ac7-48ad-b7be-858afd95cf08	for循环遍历数组	补全代码，使用for循环遍历数组	EASY	1-06		\N	\N	10	2	t	FILL_BLANK	{"code": "int arr[5] = {1, 2, 3, 4, 5};\\nfor (int i = 0; i < 5; {{blank}}) {\\n    cout << arr[i] << \\" \\";\\n}", "blanks": [{"hint": "自增操作", "answer": "i++"}], "explanation": "i++用于递增循环变量，遍历数组的每个元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.548	2026-02-01 12:27:49.291
97d64357-a93b-4052-ac7f-8d7ac4281800	数组遍历的边界条件	遍历数组int arr[10];时，循环条件应该是什么？	MEDIUM	1-06		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["i < 10", "i <= 10", "i < 9", "i <= 9"], "explanation": "数组下标从0到9，所以循环条件应该是i < 10。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.555	2026-02-01 12:27:51.103
429ef768-6e04-4160-a0ec-423175ad1f26	数组遍历的应用	补全代码，遍历数组并计算元素和	MEDIUM	1-06		\N	\N	10	5	t	FILL_BLANK	{"code": "int arr[5] = {1, 2, 3, 4, 5};\\nint sum = 0;\\nfor (int i = 0; i < 5; i++) {\\n    sum {{blank}} arr[i];\\n}\\ncout << sum;", "blanks": [{"hint": "累加", "answer": "+="}], "explanation": "sum += arr[i]用于累加数组元素的值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.558	2026-02-01 12:27:51.711
e2277108-2a8f-45ab-aa10-914c33e47626	数组遍历的顺序	如何修改循环遍历数组的顺序为从后往前？	MEDIUM	1-06		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["将循环变量从n-1递减到0", "将循环变量从0递增到n-1", "使用while循环", "使用do-while循环"], "explanation": "从后往前遍历数组需要将循环变量从n-1递减到0。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.562	2026-02-01 12:27:52.201
416b231d-2f97-45a7-8c87-7c8ed7e713b2	数组遍历与条件判断	补全代码，遍历数组并输出所有偶数	MEDIUM	1-06		\N	\N	10	7	t	FILL_BLANK	{"code": "int arr[5] = {1, 2, 3, 4, 5};\\nfor (int i = 0; i < 5; i++) {\\n    if (arr[i] % 2 {{blank}} 0) {\\n        cout << arr[i] << \\" \\";\\n    }\\n}", "blanks": [{"hint": "等于", "answer": "=="}], "explanation": "arr[i] % 2 == 0用于判断元素是否为偶数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.566	2026-02-01 12:27:53.587
c61c7219-38b6-4f0d-a609-b134c1cf66d8	数组遍历的效率	以下哪种数组遍历方式效率最高？	HARD	1-06		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["for循环", "while循环", "do-while循环", "效率相同"], "explanation": "for循环的代码结构更紧凑，编译器更容易优化，所以效率通常最高。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.569	2026-02-01 12:27:54.23
294a8245-da1c-4d02-a382-cec33ffad93f	数组遍历编程	输入5个整数，存储到数组中，然后逆序输出	MEDIUM	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[5];\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "先输入数据到数组，然后从后往前遍历数组输出。", "expectedOutput": "逆序输出输入的5个整数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.572	2026-02-01 12:27:54.953
89e35669-6a7f-47b8-9444-fe0a76b2a3b2	数组统计的基本操作	以下哪个不是数组统计的基本操作？	EASY	1-06		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["求最大值", "求最小值", "求平均值", "排序"], "explanation": "排序是数组的操作，但不是统计的基本操作。统计的基本操作包括求最大值、最小值、平均值等。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:55.579	2026-02-01 12:27:56.535
6211284e-e8d0-42fa-81ef-7f37ebb267bb	求数组最大值	补全代码，求数组的最大值	MEDIUM	1-06		\N	\N	10	2	t	FILL_BLANK	{"code": "int arr[5] = {3, 1, 4, 2, 5};\\nint max = arr[0];\\nfor (int i = 1; i < 5; i++) {\\n    if (arr[i] {{blank}} max) {\\n        max = arr[i];\\n    }\\n}\\ncout << max;", "blanks": [{"hint": "大于", "answer": ">"}], "explanation": "当当前元素大于max时，更新max的值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.582	2026-02-01 12:27:56.954
eb1a1733-3c8b-4020-83cd-6736f9c0eb81	求数组最小值	补全代码，求数组的最小值	MEDIUM	1-06		\N	\N	10	3	t	FILL_BLANK	{"code": "int arr[5] = {3, 1, 4, 2, 5};\\nint min = arr[0];\\nfor (int i = 1; i < 5; i++) {\\n    if (arr[i] {{blank}} min) {\\n        min = arr[i];\\n    }\\n}\\ncout << min;", "blanks": [{"hint": "小于", "answer": "<"}], "explanation": "当当前元素小于min时，更新min的值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.585	2026-02-01 12:27:57.477
09135479-52da-4b02-8bb4-3dda365bb3e8	求数组平均值	补全代码，求数组的平均值	MEDIUM	1-06		\N	\N	10	4	t	FILL_BLANK	{"code": "int arr[5] = {1, 2, 3, 4, 5};\\nint sum = 0;\\nfor (int i = 0; i < 5; i++) {\\n    sum += arr[i];\\n}\\ndouble avg = (double)sum {{blank}} 5;\\ncout << avg;", "blanks": [{"hint": "除以", "answer": "/"}], "explanation": "平均值等于总和除以元素个数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.589	2026-02-01 12:27:58.552
69b837b4-bc44-499d-ac00-7701418bc511	数组统计的应用	以下代码的功能是什么？\nint arr[10] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};\nint count = 0;\nfor (int i = 0; i < 10; i++) {\n    if (arr[i] % 2 == 0) {\n        count++;\n    }\n}\ncout << count;	MEDIUM	1-06		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["统计数组中偶数的个数", "统计数组中奇数的个数", "统计数组中元素的和", "统计数组中元素的个数"], "explanation": "代码统计数组中能被2整除的元素个数，即偶数的个数。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.592	2026-02-01 12:27:59.01
13588941-8a29-4e62-b32b-41231db08660	数组统计的边界条件	求数组最大值时，初始值应该设为多少？	MEDIUM	1-06		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["数组的第一个元素", "0", "INT_MIN", "INT_MAX"], "explanation": "求数组最大值时，初始值应该设为数组的第一个元素，这样可以处理数组中全为负数的情况。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.595	2026-02-01 12:27:59.462
3ae17173-1b3e-476e-8108-a0a4e3641f93	数组统计的综合应用	补全代码，求数组中第二大的元素	HARD	1-06		\N	\N	10	7	t	FILL_BLANK	{"code": "int arr[5] = {3, 1, 4, 2, 5};\\nint max1 = arr[0], max2 = arr[0];\\nfor (int i = 1; i < 5; i++) {\\n    if (arr[i] > max1) {\\n        max2 = max1;\\n        max1 = arr[i];\\n    } else if (arr[i] > max2 && arr[i] != max1) {\\n        max2 = arr[i];\\n    }\\n}\\ncout << {{blank}};", "blanks": [{"hint": "第二大的元素", "answer": "max2"}], "explanation": "max2存储的是数组中第二大的元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.599	2026-02-01 12:28:00.818
ee40aef4-f524-41ff-8a75-e599dd94716f	string类的长度	补全代码，输出string变量的长度	EASY	1-06		\N	\N	10	4	t	FILL_BLANK	{"code": "string str = \\"Hello\\";\\ncout << str.{{blank}}();", "blanks": [{"hint": "长度函数", "answer": "length"}], "explanation": "string类的length()成员函数返回字符串的长度。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.767	2026-02-01 12:28:32.884
4e470be2-92e0-46ad-a4d3-be711d83f697	数组统计编程	输入10个整数，求它们的最大值、最小值和平均值	MEDIUM	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[10];\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "先输入数据到数组，然后遍历数组计算最大值、最小值和总和，最后计算平均值。", "expectedOutput": "最大值、最小值和平均值"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.606	2026-02-01 12:28:02.607
d8639551-b9e5-403e-b66b-79d0199b02e3	数组统计的挑战	输入一个整数数组，统计其中每个元素出现的次数	HARD	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[10] = {1, 2, 2, 3, 3, 3, 4, 4, 4, 4};\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用嵌套循环统计每个元素出现的次数。", "expectedOutput": "每个元素出现的次数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.609	2026-02-01 12:28:03.028
1a4652e2-eab7-4545-9a5d-880c288ac6f7	数组的综合应用	以下哪种情况最适合使用数组？	EASY	1-06		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["存储固定数量的相同类型数据", "存储不同类型的数据", "存储动态变化数量的数据", "存储需要频繁插入删除的数据"], "explanation": "数组最适合存储固定数量的相同类型数据。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.613	2026-02-01 12:28:03.528
c0d37e2a-5683-4d45-a29e-f2dca88a234f	数组的常见操作	匹配数组操作与实现方法	MEDIUM	1-06		\N	\N	10	2	t	MATCHING	{"leftItems": ["插入元素", "删除元素", "查找元素", "修改元素"], "rightItems": ["移动元素", "移动元素", "遍历比较", "直接访问"], "explanation": "不同的数组操作需要不同的实现方法。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.616	2026-02-01 12:28:05.75
7793ae20-5e46-4503-858d-bc78b9b67b04	数组的边界检查	以下代码是否正确？\nint arr[5] = {1, 2, 3, 4, 5};\ncout << arr[5];	MEDIUM	1-06		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["错误，数组越界", "正确", "编译通过但运行错误", "不确定"], "explanation": "数组arr[5]的下标范围是0-4，访问arr[5]是数组越界。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.619	2026-02-01 12:28:06.178
acc3ab4f-c548-4e0f-8c7c-201674fe5bf3	数组的传递	补全代码，定义函数打印数组元素	MEDIUM	1-06		\N	\N	10	4	t	FILL_BLANK	{"code": "void printArray(int arr[], int size) {\\n    for (int i = 0; i < size; i++) {\\n        cout << arr[i] << \\" \\";\\n    }\\n}\\n\\nint main() {\\n    int arr[5] = {1, 2, 3, 4, 5};\\n    printArray({{blank}}, 5);\\n    return 0;\\n}", "blanks": [{"hint": "数组名", "answer": "arr"}], "explanation": "数组名作为函数参数时，会退化为指针。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.623	2026-02-01 12:28:06.802
8ae1da1c-a25b-49c9-bd21-76b847116bb0	数组的综合挑战	输入一个整数数组，对其进行冒泡排序	HARD	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[10] = {9, 8, 7, 6, 5, 4, 3, 2, 1, 0};\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	5	t	CODING	{"explanation": "冒泡排序的基本思想是通过相邻元素的比较和交换，使较大的元素逐渐向后移动。", "expectedOutput": "排序后的数组"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.626	2026-02-01 12:28:07.235
fbf8ed8c-6073-4039-a1f3-174928caf8a1	数组的实际应用	输入一个字符串，统计其中每个字符出现的次数	HARD	1-06	#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	6	t	CODING	{"explanation": "可以使用数组来统计字符出现的次数，利用字符的ASCII码作为数组下标。", "expectedOutput": "每个字符出现的次数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.629	2026-02-01 12:28:07.744
9770d01f-6200-4b30-9f8b-cab99854641e	数组的挑战	输入两个有序数组，合并成一个有序数组	HARD	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr1[5] = {1, 3, 5, 7, 9};\n    int arr2[5] = {2, 4, 6, 8, 10};\n    int merged[10];\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	7	t	CODING	{"explanation": "使用双指针法合并两个有序数组。", "expectedOutput": "合并后的有序数组"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.633	2026-02-01 12:28:08.205
e78c6445-bbda-472b-b711-f20c72494b17	数组的终极挑战	输入一个整数数组，找出其中的峰值元素（峰值元素是指大于左右相邻元素的元素）	HARD	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[10] = {1, 2, 3, 1, 2, 3, 4, 5, 2, 1};\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	8	t	CODING	{"explanation": "遍历数组，检查每个元素是否大于左右相邻元素。", "expectedOutput": "所有峰值元素"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.636	2026-02-01 12:28:08.924
bf231a6f-6868-43ce-9896-05e493814c17	数组的综合应用	实现一个简单的计算器，支持加减乘除 operations	HARD	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    double a, b;\n    char op;\n    cin >> a >> op >> b;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "使用switch语句根据运算符执行相应的计算。", "expectedOutput": "计算结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.64	2026-02-01 12:28:09.422
81ba4642-249d-4cbe-b948-d43500ff674d	数组的实际应用	输入一个年份，判断它是否是闰年，并输出该年的2月份有多少天	HARD	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int year;\n    cin >> year;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "闰年的判断条件：能被4整除但不能被100整除，或者能被400整除。", "expectedOutput": "是否是闰年以及2月份的天数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.643	2026-02-01 12:28:11.233
3a9e58e7-5cc5-48b2-99bd-83f2a2b49047	二维数组的基本概念	二维数组是什么？	EASY	1-06		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["数组的数组，用于存储表格数据", "只能存储整数的数组", "只能存储浮点数的数组", "大小固定的数组"], "explanation": "二维数组是数组的数组，用于存储表格形式的数据，如矩阵。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.647	2026-02-01 12:28:11.732
cfa00932-c2e4-439f-a9ea-9f58182f5579	二维数组的定义语法	以下哪种二维数组定义方式是正确的？	EASY	1-06		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["int arr[2][3];", "int arr[2][];", "int arr[][3];", "int 2[3][arr];"], "explanation": "正确的二维数组定义语法是：类型 数组名[行数][列数];", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.65	2026-02-01 12:28:12.198
7b4abcbe-29e5-4b6d-9906-c6db061a5b3d	二维数组的初始化	补全代码，初始化一个2x3的二维数组	MEDIUM	1-06		\N	\N	10	4	t	FILL_BLANK	{"code": "int arr[2][3] = {{blank}};", "blanks": [{"hint": "二维初始化列表", "answer": "{{1, 2, 3}, {4, 5, 6}}"}], "explanation": "二维数组的初始化需要使用嵌套的花括号，外层花括号包含每行的初始化列表。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.657	2026-02-01 12:28:13.62
ddc95a2f-797a-482e-aff0-a6c82b1fa43b	二维数组的内存存储	二维数组在内存中是如何存储的？	MEDIUM	1-06		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["按行优先顺序连续存储", "按列优先顺序连续存储", "分散存储", "随机存储"], "explanation": "二维数组在内存中是按行优先顺序连续存储的，即先存储第一行的所有元素，再存储第二行的所有元素，以此类推。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.66	2026-02-01 12:28:14.497
850624c8-8a6b-4064-9068-95d7f38cfa74	二维数组的遍历	补全代码，使用嵌套循环遍历二维数组	MEDIUM	1-06		\N	\N	10	6	t	FILL_BLANK	{"code": "int arr[2][3] = {{1, 2, 3}, {4, 5, 6}};\\nfor (int i = 0; i < 2; i++) {\\n    for (int j = 0; j < 3; {{blank}}) {\\n        cout << arr[i][j] << \\" \\";\\n    }\\n    cout << endl;\\n}", "blanks": [{"hint": "列下标自增", "answer": "j++"}], "explanation": "内层循环遍历每行的列元素，需要递增列下标j。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.664	2026-02-01 12:28:16.762
5055dbc6-e56b-436a-bf9f-cb89eeb6a4e1	二维数组的大小计算	int arr[3][4];包含{{blank}}个元素	MEDIUM	1-06		\N	\N	10	7	t	FILL_BLANK	{"code": "int arr[3][4];\\n// 包含 {{blank}} 个元素", "blanks": [{"hint": "3*4", "answer": "12"}], "explanation": "二维数组的元素个数等于行数乘以列数，3*4=12。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.667	2026-02-01 12:28:17.184
5aca3ba3-02e5-4f2f-ae70-7899d953df00	二维数组的应用	匹配数据类型与适合的数组维度	MEDIUM	1-06		\N	\N	10	8	t	MATCHING	{"leftItems": ["学生成绩表格", "单个学生的成绩", "矩阵运算", "一维数组"], "rightItems": ["二维数组", "一维数组", "二维数组", "一维数组"], "explanation": "二维数组适合存储表格形式的数据，如学生成绩表格和矩阵。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.671	2026-02-01 12:28:17.612
f6c666cb-a01d-4f66-86ea-c085c64d4e95	二维数组编程	输入一个3x3的矩阵，计算其转置矩阵并输出	MEDIUM	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int matrix[3][3];\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "转置矩阵是将原矩阵的行和列互换。", "expectedOutput": "转置后的矩阵"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.674	2026-02-01 12:28:19.392
7eeb5b5d-51d2-4575-8c1d-9d3cea156f19	二维数组的综合应用	输入两个2x2的矩阵，计算它们的和并输出	HARD	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int a[2][2], b[2][2], sum[2][2];\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "矩阵和是对应元素相加。", "expectedOutput": "两个矩阵的和"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.678	2026-02-01 12:28:20.305
aabaad10-5e2c-411d-9771-f45c36f621ce	矩阵的基本概念	矩阵是什么？	EASY	1-06		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["由m行n列元素组成的矩形阵列", "只能包含整数的二维数组", "只能包含浮点数的二维数组", "大小固定的二维数组"], "explanation": "矩阵是由m行n列元素组成的矩形阵列，可以用二维数组表示。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.681	2026-02-01 12:28:20.724
69848bb5-0bf5-4683-aa78-f602b9bbcb70	矩阵的输入	补全代码，输入一个3x3的矩阵	MEDIUM	1-06		\N	\N	10	2	t	FILL_BLANK	{"code": "int matrix[3][3];\\nfor (int i = 0; i < 3; i++) {\\n    for (int j = 0; j < 3; j++) {\\n        cin >> {{blank}};\\n    }\\n}", "blanks": [{"hint": "二维数组元素", "answer": "matrix[i][j]"}], "explanation": "使用嵌套循环输入矩阵的每个元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.684	2026-02-01 12:28:21.175
4bc3860a-dc28-4c9f-8301-a174493c6ba3	矩阵的输出	补全代码，输出一个3x3的矩阵	MEDIUM	1-06		\N	\N	10	3	t	FILL_BLANK	{"code": "int matrix[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};\\nfor (int i = 0; i < 3; i++) {\\n    for (int j = 0; j < 3; j++) {\\n        cout << {{blank}} << \\" \\";\\n    }\\n    cout << endl;\\n}", "blanks": [{"hint": "二维数组元素", "answer": "matrix[i][j]"}], "explanation": "使用嵌套循环输出矩阵的每个元素，每行结束后换行。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.688	2026-02-01 12:28:21.633
340294cc-9e0e-4630-a7eb-c5d62a27c5ab	矩阵的转置	矩阵转置是指什么？	MEDIUM	1-06		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["将矩阵的行和列互换", "将矩阵的所有元素取反", "将矩阵的所有元素乘以一个常数", "将矩阵的行顺序颠倒"], "explanation": "矩阵转置是指将矩阵的行和列互换，即原矩阵的第i行第j列元素变为转置矩阵的第j行第i列元素。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.694	2026-02-01 12:28:22.067
d943e896-d985-4183-988f-fd1dd5dc7a0d	矩阵转置的实现	补全代码，实现矩阵的转置	HARD	1-06		\N	\N	10	5	t	FILL_BLANK	{"code": "int matrix[2][3] = {{1, 2, 3}, {4, 5, 6}};\\nint transpose[3][2];\\nfor (int i = 0; i < 2; i++) {\\n    for (int j = 0; j < 3; j++) {\\n        transpose[{{blank}}][{{blank}}] = matrix[i][j];\\n    }\\n}", "blanks": [{"hint": "转置后的行下标", "answer": "j"}, {"hint": "转置后的列下标", "answer": "i"}], "explanation": "矩阵转置时，原矩阵的第i行第j列元素变为转置矩阵的第j行第i列元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.697	2026-02-01 12:28:22.539
b4234c6b-b2af-4c3a-9e02-5fe3c290d28b	矩阵的对角线元素	补全代码，输出3x3矩阵的主对角线元素	MEDIUM	1-06		\N	\N	10	6	t	FILL_BLANK	{"code": "int matrix[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};\\nfor (int i = 0; i < 3; i++) {\\n    cout << matrix[{{blank}}][{{blank}}] << \\" \\";\\n}", "blanks": [{"hint": "行下标", "answer": "i"}, {"hint": "列下标", "answer": "i"}], "explanation": "主对角线元素的行下标和列下标相等。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.701	2026-02-01 12:28:22.959
dfb9c25f-0f3d-4c71-bc4c-617b1d1ba6ab	矩阵的边界元素	如何输出一个3x3矩阵的边界元素？	HARD	1-06		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["输出第一行、最后一行、第一列和最后一列的元素", "输出主对角线元素", "输出所有元素", "输出内部元素"], "explanation": "矩阵的边界元素包括第一行、最后一行、第一列和最后一列的元素。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.704	2026-02-01 12:28:23.459
092eb0d0-b2a3-438a-b7fe-2cdcc63bff98	矩阵编程	输入一个n×n的矩阵，判断它是否是对称矩阵	HARD	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    int matrix[n][n];\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "对称矩阵是指转置后与原矩阵相同的矩阵。", "expectedOutput": "是对称矩阵或不是对称矩阵"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.712	2026-02-01 12:28:24.314
c63b69a0-b3cc-436b-a428-8b0a02417d6e	矩阵的综合应用	输入一个3x3的矩阵，计算其每行的和并输出	HARD	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int matrix[3][3];\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "遍历矩阵的每行，计算该行所有元素的和。", "expectedOutput": "每行的和"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.716	2026-02-01 12:28:24.757
8ab09a30-c4b5-490b-b6f1-800840a00e43	char数组的基本概念	char数组用于存储什么？	EASY	1-06		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["字符串", "整数", "浮点数", "布尔值"], "explanation": "char数组用于存储字符串，每个元素存储一个字符。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.72	2026-02-01 12:28:25.23
e722a952-4ab1-4825-825f-a61ff3de0220	char数组的定义	补全代码，定义一个可以存储10个字符的char数组	EASY	1-06		\N	\N	10	2	t	FILL_BLANK	{"code": "char str[{{blank}}];", "blanks": [{"hint": "包含结束符的空间", "answer": "11"}], "explanation": "char数组需要额外的空间存储字符串结束符，所以存储10个字符需要11个元素的空间。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.724	2026-02-01 12:28:25.675
1563e32f-2cd7-462a-92b5-78265312b9a7	char数组的初始化	补全代码，初始化char数组为"Hello"	EASY	1-06		\N	\N	10	3	t	FILL_BLANK	{"code": "char str[6] = {{blank}};", "blanks": [{"hint": "字符串字面量", "answer": "\\"Hello\\""}], "explanation": "使用字符串字面量初始化char数组时，编译器会自动添加结束符。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.728	2026-02-01 12:28:26.233
ee62e532-5d7e-4e65-8cd7-a9298782c413	字符串结束符	C风格字符串的结束符是什么？	EASY	1-06		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["", "\\n", "\\t", "0"], "explanation": "C风格字符串使用作为结束符，标志着字符串的结束。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.732	2026-02-01 12:28:26.766
202628c5-945d-4db5-b55b-dbe8613c7b90	char数组的遍历	补全代码，遍历char数组并输出每个字符	MEDIUM	1-06		\N	\N	10	5	t	FILL_BLANK	{"code": "char str[] = \\"Hello\\";\\nfor (int i = 0; str[i] != ''; {{blank}}) {\\n    cout << str[i];\\n}", "blanks": [{"hint": "下标自增", "answer": "i++"}], "explanation": "遍历char数组直到遇到结束符。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.735	2026-02-01 12:28:27.254
d2a9954c-d74f-40e7-ac41-b025cfab266e	char数组的输入	补全代码，使用cin输入字符串到char数组	MEDIUM	1-06		\N	\N	10	6	t	FILL_BLANK	{"code": "char str[100];\\ncout << \\"请输入字符串: \\";\\ncin >> {{blank}};\\ncout << \\"你输入的是: \\" << str;", "blanks": [{"hint": "char数组名", "answer": "str"}], "explanation": "使用cin可以直接输入字符串到char数组，但会自动以空格为分隔符。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.739	2026-02-01 12:28:27.773
1f60199f-3592-49fa-888e-2173ed0a5afb	char数组的长度计算	如何计算char数组中字符串的长度？	MEDIUM	1-06		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["使用strlen函数", "使用sizeof运算符", "手动遍历计数", "以上都是"], "explanation": "strlen函数可以计算char数组中字符串的长度，不包括结束符。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.742	2026-02-01 12:28:28.69
cbaa815f-e5de-43c3-abe4-f5c23e6dd78d	char数组的操作	匹配字符串操作与C库函数	MEDIUM	1-06		\N	\N	10	8	t	MATCHING	{"leftItems": ["字符串复制", "字符串连接", "字符串比较", "字符串长度"], "rightItems": ["strcpy", "strcat", "strcmp", "strlen"], "explanation": "C库提供了一系列函数用于操作char数组形式的字符串。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.746	2026-02-01 12:28:29.107
829710b4-9ccb-422c-a2f8-a631f4505058	char数组编程	输入一个字符串，统计其中大写字母、小写字母和数字的个数	MEDIUM	1-06	#include <iostream>\n#include <cstring>\nusing namespace std;\n\nint main() {\n    char str[100];\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "遍历字符串的每个字符，使用字符的ASCII码判断其类型。", "expectedOutput": "大写字母、小写字母和数字的个数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.75	2026-02-01 12:28:29.969
fdc64cd6-32bc-4315-9b90-03638caa9077	char数组的综合应用	输入一个字符串，将其反转后输出	HARD	1-06	#include <iostream>\n#include <cstring>\nusing namespace std;\n\nint main() {\n    char str[100];\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用双指针法或临时变量交换字符串的字符。", "expectedOutput": "反转后的字符串"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.754	2026-02-01 12:28:30.426
693ae984-728c-4f35-a1ec-4dbe74ef2d65	string类的基本概念	C++中的string类是什么？	EASY	1-06		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["用于存储和操作字符串的类", "char数组的别名", "只能存储固定长度的字符串", "C语言中的字符串类型"], "explanation": "C++中的string类是一个用于存储和操作字符串的类，提供了丰富的成员函数。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.757	2026-02-01 12:28:31.296
f2c4fd69-7c4a-4137-a0ed-5f16ee237164	string类的定义	补全代码，定义一个string变量并初始化为"Hello"	EASY	1-06		\N	\N	10	2	t	FILL_BLANK	{"code": "string str = {{blank}};", "blanks": [{"hint": "字符串字面量", "answer": "\\"Hello\\""}], "explanation": "使用字符串字面量初始化string变量。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.761	2026-02-01 12:28:31.966
467c39d5-f180-45a3-8c3c-7073effe9bab	string类的输入	补全代码，使用cin输入字符串到string变量	EASY	1-06		\N	\N	10	3	t	FILL_BLANK	{"code": "string str;\\ncout << \\"请输入字符串: \\";\\ncin >> {{blank}};\\ncout << \\"你输入的是: \\" << str;", "blanks": [{"hint": "string变量名", "answer": "str"}], "explanation": "使用cin可以直接输入字符串到string变量，但会自动以空格为分隔符。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.764	2026-02-01 12:28:32.385
e271f489-b507-4ea1-aa89-22e7a80f3f2d	string类的连接	补全代码，连接两个string变量	MEDIUM	1-06		\N	\N	10	6	t	FILL_BLANK	{"code": "string str1 = \\"Hello\\";\\nstring str2 = \\" World\\";\\nstring str3 = str1 {{blank}} str2;\\ncout << str3;", "blanks": [{"hint": "连接运算符", "answer": "+"}], "explanation": "string类重载了+运算符，可以用于连接两个字符串。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.775	2026-02-01 12:28:34.149
05afd422-e82a-4d96-9663-5e7a87124188	string类的比较	如何比较两个string变量是否相等？	MEDIUM	1-06		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["使用==运算符", "使用strcmp函数", "比较长度", "手动遍历比较每个字符"], "explanation": "string类重载了==运算符，可以直接比较两个字符串是否相等。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.779	2026-02-01 12:28:34.588
527bdd1b-0375-40a0-bb5a-6825a5634fcd	string类编程	输入一个字符串，将其中的小写字母转换为大写字母并输出	MEDIUM	1-06	#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string str;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "遍历字符串的每个字符，使用toupper函数将小写字母转换为大写字母。", "expectedOutput": "转换后的字符串"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.787	2026-02-01 12:28:37.231
f1477e77-0b40-4358-838d-e71c8fd03690	string类的综合应用	输入一个字符串，判断它是否是回文字符串	HARD	1-06	#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string str;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "回文字符串是指正着读和倒着读都一样的字符串。", "expectedOutput": "是回文字符串或不是回文字符串"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.79	2026-02-01 12:28:37.742
17da7481-89e4-4d94-bd0b-faf2cbebcf15	二维数组与字符串的综合应用	以下哪种情况最适合使用二维数组？	EASY	1-06		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["存储表格数据", "存储单个字符串", "存储单个数值", "存储动态变化的数据"], "explanation": "二维数组最适合存储表格形式的数据，如矩阵、学生成绩表格等。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.794	2026-02-01 12:28:39.074
f65b0a82-6e97-41e0-b3a6-af7ce48f4554	字符串的存储方式	匹配字符串存储方式与特点	MEDIUM	1-06		\N	\N	10	2	t	MATCHING	{"leftItems": ["char数组", "string类", "固定长度", "动态长度"], "rightItems": ["C风格字符串", "C++风格字符串", "char数组", "string类"], "explanation": "char数组是C风格字符串，长度固定；string类是C++风格字符串，长度动态。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.798	2026-02-01 12:28:39.528
3cfc43ee-02c2-45c1-a537-913cf0f4a55d	二维数组的遍历	补全代码，遍历3x3二维数组并计算所有元素的和	MEDIUM	1-06		\N	\N	10	3	t	FILL_BLANK	{"code": "int matrix[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};\\nint sum = 0;\\nfor (int i = 0; i < 3; i++) {\\n    for (int j = 0; j < 3; j++) {\\n        sum {{blank}} matrix[i][j];\\n    }\\n}\\ncout << sum;", "blanks": [{"hint": "累加", "answer": "+="}], "explanation": "sum += matrix[i][j]用于累加二维数组的所有元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.801	2026-02-01 12:28:40.504
600d17f6-7481-479c-b9b7-fc73a039c052	字符串的操作	补全代码，使用string类连接两个字符串	MEDIUM	1-06		\N	\N	10	4	t	FILL_BLANK	{"code": "string firstName = \\"John\\";\\nstring lastName = \\"Doe\\";\\nstring fullName = firstName {{blank}} \\" \\" {{blank}} lastName;\\ncout << fullName;", "blanks": [{"hint": "连接运算符", "answer": "+"}, {"hint": "连接运算符", "answer": "+"}], "explanation": "string类重载了+运算符，可以用于连接字符串。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.805	2026-02-01 12:28:40.923
cf2f958f-85fb-4ea7-937e-96a14ccae4b1	综合编程挑战	输入一个n×n的字符矩阵，查找其中是否存在指定的字符串（水平、垂直或对角线方向）	HARD	1-06	#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    int n;\n    string target;\n    cin >> n >> target;\n    char matrix[n][n];\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	5	t	CODING	{"explanation": "在字符矩阵中搜索指定的字符串，检查水平、垂直和对角线方向。", "expectedOutput": "存在或不存在"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.809	2026-02-01 12:28:41.405
40855d56-a4b1-41f4-aefd-67bbad4b4b4c	字符串处理挑战	输入一个字符串，统计其中每个单词出现的次数	HARD	1-06	#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string text;\n    getline(cin, text);\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	6	t	CODING	{"explanation": "将字符串分割为单词，然后统计每个单词的出现次数。", "expectedOutput": "每个单词出现的次数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.812	2026-02-01 12:28:41.935
390df7dc-2a1a-4f1d-b0ea-7eaea95e238e	二维数组的实际应用	输入一个3x3的数独棋盘，检查其是否有效（每行、每列和每个3x3子网格都包含1-9的数字，不重复）	HARD	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int board[9][9];\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	7	t	CODING	{"explanation": "检查数独棋盘的每行、每列和每个3x3子网格是否包含1-9的数字，且不重复。", "expectedOutput": "有效或无效"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.815	2026-02-01 12:28:42.813
45941edd-5bd8-4da1-8f8f-544bd4b71009	字符串的高级操作	输入一个字符串，实现简单的文本加密：将每个字母向后移动3位（A→D, B→E, ..., X→A, Y→B, Z→C）	HARD	1-06	#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string text;\n    getline(cin, text);\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	8	t	CODING	{"explanation": "使用凯撒密码算法，将每个字母向后移动3位。", "expectedOutput": "加密后的文本"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.819	2026-02-01 12:28:43.234
355c1e8a-8dc0-4d17-be0d-61dd54d298ae	函数的递归应用	补全代码，使用递归函数计算阶乘	HARD	1-08		\N	\N	10	4	t	FILL_BLANK	{"code": "int factorial(int n) {\\n    if (n == 0 || n == 1) {\\n        return 1;\\n    } else {\\n        return n * {{blank}}(n - 1);\\n    }\\n}", "blanks": [{"hint": "函数名", "answer": "factorial"}], "explanation": "递归函数调用自身来解决问题。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.995	2026-02-01 12:29:11.496
d92fe1a5-9775-443d-a614-be95538ff614	终极综合挑战	实现一个简单的通讯录管理系统，使用二维数组存储联系人信息（姓名、电话、邮箱），支持添加、查询、修改和删除操作	HARD	1-06	#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    const int MAX_CONTACTS = 100;\n    string contacts[MAX_CONTACTS][3]; // 姓名、电话、邮箱\n    int count = 0;\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用二维字符串数组存储联系人信息，实现基本的通讯录管理功能。", "expectedOutput": "通讯录管理系统的各项操作结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.827	2026-02-01 12:28:44.146
d8f8f239-103f-4769-a958-148c7acca3a9	函数的基本概念	函数是什么？	EASY	1-08		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["一段完成特定功能的代码块", "一个变量", "一个数据类型", "一个循环结构"], "explanation": "函数是一段完成特定功能的代码块，可以被重复调用。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.831	2026-02-01 12:28:44.628
68d2d5da-45db-4152-a173-b1e648e19ee6	函数的优点	以下哪个不是函数的优点？	EASY	1-08		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["代码复用", "提高代码可读性", "使代码更复杂", "便于维护"], "explanation": "函数的优点包括代码复用、提高代码可读性和便于维护，不会使代码更复杂。", "correctIndex": 2}	EXERCISE_LIBRARY	2026-01-30 16:29:55.834	2026-02-01 12:28:45.074
fa49a3d2-73f2-440f-9327-e79c31bdbfeb	函数的组成部分	匹配函数组成部分与描述	MEDIUM	1-08		\N	\N	10	3	t	MATCHING	{"leftItems": ["返回类型", "函数名", "参数列表", "函数体"], "rightItems": ["函数返回值的类型", "函数的名称", "函数接收的参数", "函数的实现代码"], "explanation": "函数由返回类型、函数名、参数列表和函数体组成。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.838	2026-02-01 12:28:45.492
be6aa59e-f7da-4b04-b998-7791367e1309	main函数的特殊性	main函数的特殊之处在于？	EASY	1-08		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["是程序的入口点", "必须返回int类型", "可以有参数", "以上都是"], "explanation": "main函数是程序的入口点，必须返回int类型，并且可以有参数。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:55.841	2026-02-01 12:28:45.991
66b7074f-2fd0-4591-ac81-c17bae483be2	函数的声明与定义	补全代码，声明一个函数	MEDIUM	1-08		\N	\N	10	5	t	FILL_BLANK	{"code": "// 函数声明\\n{{blank}} int add(int a, int b);\\n\\n// 函数定义\\nint add(int a, int b) {\\n    return a + b;\\n}", "blanks": [{"hint": "函数声明不需要函数体", "answer": ""}], "explanation": "函数声明只需要返回类型、函数名和参数列表，不需要函数体。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.844	2026-02-01 12:28:46.412
84ca7a32-a4e0-4699-a481-1158e681d1bf	函数的调用	补全代码，调用add函数	EASY	1-08		\N	\N	10	6	t	FILL_BLANK	{"code": "int add(int a, int b) {\\n    return a + b;\\n}\\n\\nint main() {\\n    int result = {{blank}}(3, 4);\\n    cout << result;\\n    return 0;\\n}", "blanks": [{"hint": "函数名", "answer": "add"}], "explanation": "函数调用需要使用函数名和实际参数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.848	2026-02-01 12:28:47.718
a49b60c6-823c-4980-a6ed-fc32bb439009	函数的返回值	如果函数不需要返回值，应该使用什么返回类型？	EASY	1-08		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["void", "int", "bool", "char"], "explanation": "void表示函数不需要返回值。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.852	2026-02-01 12:28:48.742
6e7a38b6-fb43-4e44-a82e-65dbdbe0be64	函数的应用场景	匹配应用场景与函数	MEDIUM	1-08		\N	\N	10	8	t	MATCHING	{"leftItems": ["计算数学表达式", "排序数组", "验证输入", "输出信息"], "rightItems": ["数学函数", "排序函数", "验证函数", "输出函数"], "explanation": "不同的应用场景需要不同功能的函数。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.855	2026-02-01 12:28:49.267
b9ea388b-f7ad-4834-9d3a-96d4e873a10a	函数概念编程	定义一个函数，计算两个整数的和并返回结果	EASY	1-08	#include <iostream>\nusing namespace std;\n\n// 在这里定义add函数\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << add(a, b);\n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "定义一个add函数，接收两个int参数，返回它们的和。", "expectedOutput": "两个整数的和"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.858	2026-02-01 12:28:49.687
2f69d725-c78c-4138-9deb-d45ab1e8a1c0	函数的综合应用	定义一个函数，判断一个数是否是偶数	MEDIUM	1-08	#include <iostream>\nusing namespace std;\n\n// 在这里定义isEven函数\n\nint main() {\n    int n;\n    cin >> n;\n    if (isEven(n)) {\n        cout << "是偶数";\n    } else {\n        cout << "不是偶数";\n    }\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "定义一个isEven函数，接收一个int参数，返回bool类型表示是否是偶数。", "expectedOutput": "是偶数或不是偶数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.862	2026-02-01 12:28:50.559
178f649f-78eb-4be5-9876-40a116cc5990	函数定义的语法	以下哪种函数定义方式是正确的？	EASY	1-08		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["int add(int a, int b) { return a + b; }", "add(int a, int b) { return a + b; }", "int add(a, b) { return a + b; }", "int add(int a, int b) return a + b;"], "explanation": "正确的函数定义语法是：返回类型 函数名(参数列表) { 函数体 }", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.865	2026-02-01 12:28:51.054
0760a3e4-9ae5-4792-b6c2-6f824f7076ba	函数调用的语法	补全代码，调用函数计算5的平方	EASY	1-08		\N	\N	10	2	t	FILL_BLANK	{"code": "int square(int n) {\\n    return n * n;\\n}\\n\\nint main() {\\n    int result = {{blank}}(5);\\n    cout << result;\\n    return 0;\\n}", "blanks": [{"hint": "函数名", "answer": "square"}], "explanation": "函数调用需要使用函数名和实际参数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.869	2026-02-01 12:28:51.477
7a8c9c69-e7f1-48b7-af91-fd399919b7c3	函数的参数传递	C++中函数的默认参数传递方式是什么？	MEDIUM	1-08		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["值传递", "引用传递", "指针传递", "以上都是"], "explanation": "C++中函数的默认参数传递方式是值传递，即传递参数的副本。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.872	2026-02-01 12:28:51.969
8c6f91c5-98e9-4ae8-b409-a98d638dea32	函数的作用域	函数内部定义的变量的作用域是什么？	MEDIUM	1-08		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["函数内部", "整个文件", "整个程序", "全局"], "explanation": "函数内部定义的变量是局部变量，作用域仅限于函数内部。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.882	2026-02-01 12:28:54.515
d2fdaba2-8fcd-4068-b068-35ea5c4e8c51	函数的嵌套调用	补全代码，嵌套调用函数计算圆的面积	MEDIUM	1-08		\N	\N	10	7	t	FILL_BLANK	{"code": "const double PI = 3.14159;\\n\\ndouble square(double x) {\\n    return x * x;\\n}\\n\\ndouble circleArea(double radius) {\\n    return PI * {{blank}}(radius);\\n}\\n\\nint main() {\\n    double r;\\n    cin >> r;\\n    cout << circleArea(r);\\n    return 0;\\n}", "blanks": [{"hint": "函数名", "answer": "square"}], "explanation": "circleArea函数嵌套调用square函数计算半径的平方。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.886	2026-02-01 12:28:55.037
6a9664c5-5801-4cad-aaba-017f948aae13	函数的递归调用	函数递归调用的必要条件是什么？	HARD	1-08		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["有终止条件", "有递归调用", "返回类型为void", "参数个数为1"], "explanation": "函数递归调用必须有终止条件，否则会导致无限递归。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.89	2026-02-01 12:28:55.563
7de223d1-e8ad-425a-9aed-d35bb6ff6d42	函数定义与调用编程	定义一个函数，计算三个整数的平均值并返回	MEDIUM	1-08	#include <iostream>\nusing namespace std;\n\n// 在这里定义average函数\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    cout << average(a, b, c);\n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "定义一个average函数，接收三个int参数，返回它们的平均值（注意类型转换）。", "expectedOutput": "三个整数的平均值"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.893	2026-02-01 12:28:56.873
565e2260-55a7-46a0-a604-7d7cbd23e3aa	函数的综合应用	定义一个函数，将华氏温度转换为摄氏温度并返回	HARD	1-08	#include <iostream>\nusing namespace std;\n\n// 在这里定义fahrenheitToCelsius函数\n\nint main() {\n    double f;\n    cin >> f;\n    cout << fahrenheitToCelsius(f);\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "转换公式：C = (F - 32) * 5 / 9", "expectedOutput": "转换后的摄氏温度"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.897	2026-02-01 12:28:57.562
4a455cb0-f492-4e24-b13a-ca3542428b54	函数参数的类型	函数参数可以是什么类型？	EASY	1-08		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["基本数据类型", "数组", "结构体", "以上都是"], "explanation": "函数参数可以是基本数据类型、数组、结构体等各种类型。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:55.9	2026-02-01 12:28:58.181
c67224be-632d-419b-9527-36a0b59ee54b	函数参数的默认值	补全代码，为函数参数设置默认值	MEDIUM	1-08		\N	\N	10	2	t	FILL_BLANK	{"code": "int power(int base, int exponent {{blank}} 2) {\\n    int result = 1;\\n    for (int i = 0; i < exponent; i++) {\\n        result *= base;\\n    }\\n    return result;\\n}", "blanks": [{"hint": "默认值", "answer": "= 2"}], "explanation": "函数参数的默认值通过=符号设置，默认值必须从右向左设置。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.904	2026-02-01 12:28:58.881
677f4354-53c3-47c3-a87e-68bb3e58ef18	函数返回值的类型	函数的返回值类型可以是什么？	EASY	1-08		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["基本数据类型", "指针", "引用", "以上都是"], "explanation": "函数的返回值类型可以是基本数据类型、指针、引用等各种类型。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:55.907	2026-02-01 12:28:59.31
29f1aff7-b754-4ee7-9baa-e785ba5e3325	void函数	补全代码，定义一个void函数输出问候语	EASY	1-08		\N	\N	10	4	t	FILL_BLANK	{"code": "{{blank}} greet(string name) {\\n    cout << \\"Hello, \\" << name << \\"!\\";\\n}", "blanks": [{"hint": "返回类型", "answer": "void"}], "explanation": "void函数不需要返回值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.911	2026-02-01 12:28:59.755
ca3506db-044d-41c8-abcf-e69deef74d79	函数参数的传递方式	匹配参数传递方式与特点	MEDIUM	1-08		\N	\N	10	5	t	MATCHING	{"leftItems": ["值传递", "引用传递", "指针传递", "复制参数值"], "rightItems": ["传递参数副本", "传递参数引用", "传递参数地址", "值传递"], "explanation": "值传递传递参数的副本，引用传递传递参数的引用，指针传递传递参数的地址。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.915	2026-02-01 12:29:00.274
7f525ed1-b9a8-4b3c-b45e-55d8307daeb9	函数返回值的使用	补全代码，使用函数返回值进行计算	MEDIUM	1-08		\N	\N	10	6	t	FILL_BLANK	{"code": "int add(int a, int b) {\\n    return a + b;\\n}\\n\\nint main() {\\n    int x = 3, y = 4, z = 5;\\n    int sum = add(add(x, y), {{blank}});\\n    cout << sum;\\n    return 0;\\n}", "blanks": [{"hint": "变量名", "answer": "z"}], "explanation": "函数返回值可以作为另一个函数的参数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.918	2026-02-01 12:29:00.705
83226a91-73c1-4cb8-84fd-a4d1150067ee	函数参数的数量	函数可以有多少个参数？	EASY	1-08		\N	\N	10	7	t	MULTIPLE_CHOICE	{"options": ["任意多个", "最多10个", "最多5个", "只能有1个"], "explanation": "函数可以有任意多个参数，但为了代码可读性，通常不建议使用过多参数。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.921	2026-02-01 12:29:01.224
b7d773e0-6eed-41d3-9d98-9d7dd7f43dc3	函数返回值的限制	函数不能返回什么类型？	MEDIUM	1-08		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["数组", "基本数据类型", "结构体", "指针"], "explanation": "函数不能直接返回数组，但可以返回数组的指针或引用。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.925	2026-02-01 12:29:01.851
79216e29-111f-4489-b18f-304c115e8138	参数与返回值编程	定义一个函数，接收两个参数（底数和指数），计算幂并返回结果	MEDIUM	1-08	#include <iostream>\nusing namespace std;\n\n// 在这里定义power函数\n\nint main() {\n    int base, exponent;\n    cin >> base >> exponent;\n    cout << power(base, exponent);\n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "使用循环计算幂，注意处理指数为0的情况。", "expectedOutput": "底数的指数次幂"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.928	2026-02-01 12:29:02.282
2e500c9a-dd05-4f2f-9446-2cc850e581dc	函数重载的基本概念	函数重载是什么？	EASY	1-08		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["定义多个同名函数，参数列表不同", "定义多个同名函数，返回类型不同", "定义多个同名函数，函数体不同", "定义多个不同名函数"], "explanation": "函数重载是指定义多个同名函数，但它们的参数列表不同（参数个数或类型不同）。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.936	2026-02-01 12:29:03.423
e6a9a51e-9871-42ea-8a02-c54944de3fe6	函数重载的条件	函数重载的必要条件是什么？	MEDIUM	1-08		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["参数列表不同", "返回类型不同", "函数名不同", "作用域不同"], "explanation": "函数重载的必要条件是参数列表不同（参数个数或类型不同）。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.941	2026-02-01 12:29:03.856
f0f494ab-4fca-424b-8c79-773335b0cef8	函数重载的示例	补全代码，重载add函数	MEDIUM	1-08		\N	\N	10	3	t	FILL_BLANK	{"code": "int add(int a, int b) {\\n    return a + b;\\n}\\n\\ndouble add(double a, double b) {\\n    return a {{blank}} b;\\n}", "blanks": [{"hint": "加法运算符", "answer": "+"}], "explanation": "函数重载时，同名函数的参数列表必须不同。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.945	2026-02-01 12:29:04.343
ad03c5ce-5241-4730-960c-c827a32a726a	函数重载的调用	补全代码，调用重载的add函数	MEDIUM	1-08		\N	\N	10	4	t	FILL_BLANK	{"code": "int add(int a, int b) {\\n    return a + b;\\n}\\n\\ndouble add(double a, double b) {\\n    return a + b;\\n}\\n\\nint main() {\\n    int x = add(3, 4);\\n    double y = add(2.5, {{blank}});\\n    cout << x << \\" \\" << y;\\n    return 0;\\n}", "blanks": [{"hint": "double类型参数", "answer": "3.5"}], "explanation": "编译器会根据实参的类型自动选择合适的重载函数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.95	2026-02-01 12:29:04.761
b5708464-c494-4281-83e5-556f665c84c0	函数重载的判断	判断哪些函数对可以构成重载	MEDIUM	1-08		\N	\N	10	5	t	MATCHING	{"leftItems": ["int sum(int a, int b)", "void print(int n)", "double max(double a, double b)", "int func()"], "rightItems": ["double sum(double a, double b)", "void print(string s)", "int max(int a, int b)", "int func(int x)"], "explanation": "这些函数对的参数列表不同，可以构成重载。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.954	2026-02-01 12:29:05.616
610ed963-da11-4fe5-8da1-3141fc349ec9	函数重载与返回类型	仅返回类型不同的函数是否构成重载？	MEDIUM	1-08		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["不构成", "构成", "可能构成", "不确定"], "explanation": "仅返回类型不同的函数不构成重载，因为函数重载的判断依据是参数列表。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.958	2026-02-01 12:29:06.049
90ba0ef6-2946-4e03-876e-e9e489c7f4f8	函数重载的应用	补全代码，重载print函数输出不同类型的值	MEDIUM	1-08		\N	\N	10	7	t	FILL_BLANK	{"code": "void print(int n) {\\n    cout << \\"Integer: \\" << n << endl;\\n}\\n\\nvoid print(double d) {\\n    cout << \\"Double: \\" << d << endl;\\n}\\n\\nvoid print({{blank}} s) {\\n    cout << \\"String: \\" << s << endl;\\n}", "blanks": [{"hint": "参数类型", "answer": "string"}], "explanation": "函数重载可以为不同类型的参数提供不同的实现。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.963	2026-02-01 12:29:06.575
31bf6bb5-55b1-4a05-8331-ba324b537dcd	函数重载的歧义	以下哪种情况会导致函数重载歧义？	HARD	1-08		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["调用时实参类型与多个重载函数都匹配", "调用时实参类型与所有重载函数都不匹配", "有多个同名函数", "有多个不同名函数"], "explanation": "当调用时实参类型与多个重载函数都匹配，且无法确定哪个更合适时，会导致函数重载歧义。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.967	2026-02-01 12:29:06.993
bed0ccb4-ce56-4bb2-b476-41f844f71c78	函数重载编程	重载max函数，分别处理两个整数和两个浮点数的最大值	MEDIUM	1-08	#include <iostream>\nusing namespace std;\n\n// 在这里定义重载的max函数\n\nint main() {\n    int a = 3, b = 5;\n    double c = 2.5, d = 3.5;\n    cout << max(a, b) << endl;\n    cout << max(c, d);\n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "定义两个max函数，一个接收int参数，一个接收double参数。", "expectedOutput": "两个整数的最大值和两个浮点数的最大值"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.972	2026-02-01 12:29:07.848
f6f088b3-40fe-4880-8a46-858206b9b296	函数的综合应用	以下哪种情况最适合使用函数？	EASY	1-08		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["需要重复执行的代码", "只执行一次的代码", "简单的赋值语句", "单行输出语句"], "explanation": "函数最适合用于需要重复执行的代码，可以提高代码复用性。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.981	2026-02-01 12:29:09.253
e0ff52b9-787d-4827-964b-83a7d286355c	函数的设计原则	匹配函数设计原则与描述	MEDIUM	1-08		\N	\N	10	2	t	MATCHING	{"leftItems": ["单一职责", "函数名清晰", "参数适量", "返回值明确"], "rightItems": ["一个函数只做一件事", "函数名能准确描述功能", "参数个数不宜过多", "返回值类型与实际返回值匹配"], "explanation": "良好的函数设计应遵循这些原则。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.986	2026-02-01 12:29:09.952
b4b236d9-22e9-4ab0-85e6-d7d2fd290cca	函数的调用链	补全代码，形成函数调用链	MEDIUM	1-08		\N	\N	10	3	t	FILL_BLANK	{"code": "int add(int a, int b) {\\n    return a + b;\\n}\\n\\nint multiply(int a, int b) {\\n    return a * b;\\n}\\n\\nint main() {\\n    int result = multiply(add(2, 3), {{blank}});\\n    cout << result;\\n    return 0;\\n}", "blanks": [{"hint": "整数", "answer": "4"}], "explanation": "函数调用链是指一个函数的返回值作为另一个函数的参数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.991	2026-02-01 12:29:10.993
bcf24fe9-1b60-4fc5-8d20-c87a689085a2	函数的实际应用	定义一个函数，将十进制数转换为二进制字符串	HARD	1-08	#include <iostream>\n#include <string>\nusing namespace std;\n\n// 在这里定义decimalToBinary函数\n\nint main() {\n    int n;\n    cin >> n;\n    cout << decimalToBinary(n);\n    return 0;\n}	\N	\N	20	7	t	CODING	{"explanation": "使用除2取余法将十进制数转换为二进制。", "expectedOutput": "十进制数的二进制表示"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.005	2026-02-01 12:29:13.78
5ae52604-a536-4871-9bfb-118c0acd4ea3	函数的综合挑战	实现一个简单的计算器，使用函数处理不同的运算	HARD	1-08	#include <iostream>\nusing namespace std;\n\n// 在这里定义各种运算函数\n\nint main() {\n    double a, b;\n    char op;\n    cin >> a >> op >> b;\n    \n    switch (op) {\n        case '+':\n            cout << add(a, b);\n            break;\n        case '-':\n            cout << subtract(a, b);\n            break;\n        case '*':\n            cout << multiply(a, b);\n            break;\n        case '/':\n            cout << divide(a, b);\n            break;\n        default:\n            cout << "无效运算符";\n    }\n    \n    return 0;\n}	\N	\N	20	8	t	CODING	{"explanation": "定义add、subtract、multiply、divide函数分别处理加减乘除运算。", "expectedOutput": "计算结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.009	2026-02-01 12:29:14.264
07ab9021-36af-4435-8c66-64ad40068a85	函数的终极挑战	使用递归函数计算斐波那契数列的第n项	HARD	1-08	#include <iostream>\nusing namespace std;\n\n// 在这里定义fibonacci函数\n\nint main() {\n    int n;\n    cin >> n;\n    cout << fibonacci(n);\n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "斐波那契数列：0, 1, 1, 2, 3, 5, 8, ...", "expectedOutput": "斐波那契数列的第n项"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.012	2026-02-01 12:29:14.684
90c40e7c-e6d9-4c95-9808-546e3c22a9f7	函数的实际应用	定义一个函数，检查字符串是否是回文	HARD	1-08	#include <iostream>\n#include <string>\nusing namespace std;\n\n// 在这里定义isPalindrome函数\n\nint main() {\n    string s;\n    cin >> s;\n    if (isPalindrome(s)) {\n        cout << "是回文";\n    } else {\n        cout << "不是回文";\n    }\n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "回文是指正着读和倒着读都一样的字符串。", "expectedOutput": "是回文或不是回文"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.015	2026-02-01 12:29:15.177
866135d1-6747-4dbc-bb03-acf0f7ca4a03	递归的基本概念	递归是什么？	EASY	1-09		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["函数调用自身", "函数调用其他函数", "循环调用函数", "多次调用函数"], "explanation": "递归是指函数调用自身的过程。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.019	2026-02-01 12:29:15.603
beb1f333-cd35-4812-a3e6-06aa494bb6f5	递归的组成部分	匹配递归组成部分与描述	MEDIUM	1-09		\N	\N	10	2	t	MATCHING	{"leftItems": ["递归调用", "终止条件", "递归前进段", "递归返回段"], "rightItems": ["函数调用自身", "停止递归的条件", "向终止条件靠近的步骤", "处理结果的步骤"], "explanation": "递归由递归调用、终止条件、递归前进段和递归返回段组成。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.022	2026-02-01 12:29:16.099
6191c6da-71b3-4c5f-af81-e2420b455621	递归的优缺点	以下哪个是递归的优点？	MEDIUM	1-09		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["代码简洁", "执行效率高", "内存消耗小", "适合所有问题"], "explanation": "递归的优点是代码简洁，逻辑清晰；缺点是执行效率较低，内存消耗较大。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.025	2026-02-01 12:29:16.54
4430eac8-9446-4413-9768-90f4f6518f74	递归的终止条件	补全代码，为递归函数添加终止条件	MEDIUM	1-09		\N	\N	10	4	t	FILL_BLANK	{"code": "int factorial(int n) {\\n    if ({{blank}}) {\\n        return 1;\\n    } else {\\n        return n * factorial(n - 1);\\n    }\\n}", "blanks": [{"hint": "阶乘的终止条件", "answer": "n == 0 || n == 1"}], "explanation": "阶乘的终止条件是n==0或n==1，此时返回1。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.029	2026-02-01 12:29:16.961
8c2bd9b6-2ca5-4579-b8ea-1f159f14eefb	递归的执行过程	执行factorial(3)的递归过程是？	HARD	1-09		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["factorial(3) → factorial(2) → factorial(1) → return 1 → return 2 → return 6", "factorial(3) → return 3*factorial(2) → return 3*2*factorial(1) → return 3*2*1 → return 6", "factorial(3) → return 3*2*1 → return 6", "直接返回6"], "explanation": "递归函数的执行过程是先不断调用自身直到终止条件，然后逐层返回结果。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.032	2026-02-01 12:29:17.396
71459da5-3160-45fa-aee8-48fecb197ccd	递归的应用场景	匹配问题与递归应用	MEDIUM	1-09		\N	\N	10	6	t	MATCHING	{"leftItems": ["阶乘计算", "斐波那契数列", "二叉树遍历", "排序算法"], "rightItems": ["递归", "递归", "递归", "递归或迭代"], "explanation": "递归适合解决具有自相似性的问题，如阶乘、斐波那契数列、树的遍历等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.037	2026-02-01 12:29:18.451
05537c92-3291-4236-b1c3-bafab245a52d	递归的深度	递归调用的深度是指{{blank}}	MEDIUM	1-09		\N	\N	10	7	t	FILL_BLANK	{"code": "// 递归深度是指递归调用的{{blank}}", "blanks": [{"hint": "递归调用的层次", "answer": "层数"}], "explanation": "递归深度是指递归调用的层数，即函数调用自身的次数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.041	2026-02-01 12:29:18.893
9d285484-62ba-4b54-9be6-086638ca1cd8	递归概念编程	使用递归函数计算n的阶乘	MEDIUM	1-09	#include <iostream>\nusing namespace std;\n\n// 在这里定义factorial函数\n\nint main() {\n    int n;\n    cin >> n;\n    cout << factorial(n);\n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "使用递归函数计算阶乘，终止条件是n==0或n==1。", "expectedOutput": "n的阶乘"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.048	2026-02-01 12:29:20.298
888b536e-df25-4927-aeee-8890c284676b	阶乘的递归实现	补全递归函数计算阶乘	EASY	1-09		\N	\N	10	1	t	FILL_BLANK	{"code": "int factorial(int n) {\\n    if (n <= 1) {\\n        return 1;\\n    } else {\\n        return n * {{blank}}(n - 1);\\n    }\\n}", "blanks": [{"hint": "函数名", "answer": "factorial"}], "explanation": "递归函数调用自身计算n-1的阶乘。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.055	2026-02-01 12:29:22.01
9148d9e2-7448-44a5-a915-1af086e1a569	斐波那契数列的递归实现	补全递归函数计算斐波那契数列	MEDIUM	1-09		\N	\N	10	2	t	FILL_BLANK	{"code": "int fibonacci(int n) {\\n    if (n == 0) {\\n        return 0;\\n    } else if (n == 1) {\\n        return 1;\\n    } else {\\n        return {{blank}}(n - 1) + {{blank}}(n - 2);\\n    }\\n}", "blanks": [{"hint": "函数名", "answer": "fibonacci"}, {"hint": "函数名", "answer": "fibonacci"}], "explanation": "斐波那契数列的第n项等于前两项之和。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.058	2026-02-01 12:29:22.522
c2c7fa4b-77a0-4f57-bea4-69efe41eafb2	递归求和	补全递归函数计算1到n的和	MEDIUM	1-09		\N	\N	10	3	t	FILL_BLANK	{"code": "int sum(int n) {\\n    if (n == 1) {\\n        return 1;\\n    } else {\\n        return n + {{blank}}(n - 1);\\n    }\\n}", "blanks": [{"hint": "函数名", "answer": "sum"}], "explanation": "1到n的和等于n加上1到n-1的和。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.062	2026-02-01 12:29:23.033
f7f255d7-765f-4ef3-9827-f6d9fa76760c	递归求最大值	以下递归函数的功能是什么？\nint max(int arr[], int n) {\n    if (n == 1) {\n        return arr[0];\n    }\n    int m = max(arr, n - 1);\n    return arr[n - 1] > m ? arr[n - 1] : m;\n}	HARD	1-09		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["求数组的最大值", "求数组的最小值", "求数组的和", "求数组的平均值"], "explanation": "该递归函数通过比较当前元素与前n-1个元素的最大值，返回整个数组的最大值。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.065	2026-02-01 12:29:24.015
e0f43800-3bbc-4fcf-b6de-49e18861b0a4	递归的终止条件	匹配递归函数与终止条件	MEDIUM	1-09		\N	\N	10	5	t	MATCHING	{"leftItems": ["阶乘", "斐波那契", "求和", "求最大值"], "rightItems": ["n <= 1", "n == 0 或 n == 1", "n == 1", "n == 1"], "explanation": "不同的递归函数有不同的终止条件。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.069	2026-02-01 12:29:24.493
2cb6b3bc-bc74-4367-9bf6-e78fca2522f8	递归的效率	递归实现斐波那契数列的时间复杂度是？	HARD	1-09		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["O(2^n)", "O(n)", "O(n^2)", "O(log n)"], "explanation": "递归实现斐波那契数列的时间复杂度是O(2^n)，因为存在大量重复计算。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.072	2026-02-01 12:29:24.936
ef12c747-bd78-48a1-850d-ebb6b65ff59d	递归的优化	递归的优化方法包括{{blank}}和{{blank}}	HARD	1-09		\N	\N	10	7	t	FILL_BLANK	{"code": "// 递归的优化方法包括{{blank}}和{{blank}}", "blanks": [{"hint": "存储中间结果", "answer": "记忆化"}, {"hint": "递归调用在函数末尾", "answer": "尾递归"}], "explanation": "记忆化存储中间结果避免重复计算，尾递归优化减少栈空间使用。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.076	2026-02-01 12:29:25.446
333e6f56-6026-4e3f-98c1-7f3cc24c2c23	递归与迭代的转换	以下哪种递归可以容易地转换为迭代？	HARD	1-09		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["尾递归", "嵌套递归", "多分支递归", "间接递归"], "explanation": "尾递归是指递归调用在函数的最后一行，容易转换为迭代。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.079	2026-02-01 12:29:25.874
fb64cffb-9b12-471e-9d72-b41db3a66371	递归实例编程	使用递归函数计算数组的和	MEDIUM	1-09	#include <iostream>\nusing namespace std;\n\n// 在这里定义arraySum函数\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int size = 5;\n    cout << arraySum(arr, size);\n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "使用递归函数计算数组的和，终止条件是数组大小为1。", "expectedOutput": "数组元素的和"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.083	2026-02-01 12:29:26.364
c2b89a96-1f8f-4897-b566-c81c3fb99e6f	递归的综合应用	使用递归函数实现二分查找	HARD	1-09	#include <iostream>\nusing namespace std;\n\n// 在这里定义binarySearch函数\n\nint main() {\n    int arr[] = {1, 3, 5, 7, 9};\n    int size = 5;\n    int target = 5;\n    int result = binarySearch(arr, 0, size - 1, target);\n    cout << (result != -1 ? "找到，索引为" + to_string(result) : "未找到");\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "二分查找的递归实现，终止条件是找到目标值或搜索范围为空。", "expectedOutput": "找到，索引为2或未找到"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.086	2026-02-01 12:29:26.781
ab051bbb-2e89-4138-834c-9e36c4bd0c75	结构体的基本概念	结构体是什么？	EASY	1-09		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["用户自定义的复合数据类型", "只能包含整数的类型", "只能包含浮点数的类型", "只能包含字符的类型"], "explanation": "结构体是用户自定义的复合数据类型，可以包含不同类型的成员。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.09	2026-02-01 12:29:27.71
7c7a833c-901c-48cc-b7af-798e541ecdfd	结构体的定义语法	补全代码，定义一个学生结构体	EASY	1-09		\N	\N	10	2	t	FILL_BLANK	{"code": "struct {{blank}} {\\n    string name;\\n    int age;\\n    double score;\\n};", "blanks": [{"hint": "结构体名称", "answer": "Student"}], "explanation": "结构体的定义语法是：struct 结构体名 { 成员列表 };"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.093	2026-02-01 12:29:28.149
f54d7e33-00df-43b9-b27b-96dba1a1120b	野指针的危害	野指针的危害是什么？	MEDIUM	1-13		\N	\N	20	5	t	MULTIPLE_CHOICE	{"options": ["程序崩溃", "数据损坏", "安全漏洞", "以上都是"], "explanation": "野指针的危害包括程序崩溃、数据损坏和安全漏洞等。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.541	2026-02-01 12:30:45.01
99fd98bf-fe9f-43e0-90fc-6a9b499c807c	结构体的初始化	补全代码，初始化结构体变量	MEDIUM	1-09		\N	\N	10	5	t	FILL_BLANK	{"code": "struct Student {\\n    string name;\\n    int age;\\n    double score;\\n};\\n\\nint main() {\\n    Student stu = {{blank}};\\n    return 0;\\n}", "blanks": [{"hint": "初始化列表", "answer": "{\\"John\\", 18, 95.5}"}], "explanation": "结构体变量可以使用花括号初始化列表进行初始化。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.104	2026-02-01 12:29:29.532
7e986a4d-bddf-42fd-9ff6-910e17e94946	结构体的赋值	以下代码是否正确？\nstruct Point { int x; int y; };\nPoint p1 = {1, 2};\nPoint p2 = p1;	MEDIUM	1-09		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["正确", "错误", "编译通过但运行错误", "不确定"], "explanation": "结构体变量可以直接赋值，会进行成员逐个复制。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.107	2026-02-01 12:29:29.951
4f966fac-57c3-4d18-ab17-0a8a6e77ee3e	结构体作为函数参数	补全代码，定义函数接收结构体参数	MEDIUM	1-09		\N	\N	10	7	t	FILL_BLANK	{"code": "struct Point {\\n    int x;\\n    int y;\\n};\\n\\nvoid printPoint({{blank}} p) {\\n    cout << \\"(\\" << p.x << \\", \\" << p.y << \\")\\";\\n}", "blanks": [{"hint": "结构体类型", "answer": "Point"}], "explanation": "结构体可以作为函数参数，默认是值传递。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.111	2026-02-01 12:29:30.381
63f5d6d0-0efb-44b5-bce5-55453ee02b7f	结构体作为函数返回值	补全代码，定义函数返回结构体	MEDIUM	1-09		\N	\N	10	8	t	FILL_BLANK	{"code": "struct Point {\\n    int x;\\n    int y;\\n};\\n\\n{{blank}} createPoint(int x, int y) {\\n    Point p = {x, y};\\n    return p;\\n}", "blanks": [{"hint": "返回类型", "answer": "Point"}], "explanation": "函数可以返回结构体类型的值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.114	2026-02-01 12:29:30.809
36a23a0e-fccd-4c3c-860c-40259c17bbae	结构体编程	定义一个结构体表示矩形，包含长和宽，计算面积	MEDIUM	1-09	#include <iostream>\nusing namespace std;\n\n// 在这里定义Rectangle结构体\n\n// 在这里定义calculateArea函数\n\nint main() {\n    Rectangle rect = {5, 3};\n    cout << calculateArea(rect);\n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "定义Rectangle结构体包含length和width成员，calculateArea函数计算面积。", "expectedOutput": "矩形的面积"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.118	2026-02-01 12:29:31.252
346fbada-af17-473f-b626-da0446da857f	结构体的综合应用	定义一个结构体表示日期，包含年、月、日，判断是否是闰年	HARD	1-09	#include <iostream>\nusing namespace std;\n\n// 在这里定义Date结构体\n\n// 在这里定义isLeapYear函数\n\nint main() {\n    Date d = {2024, 2, 29};\n    if (isLeapYear(d.year)) {\n        cout << "是闰年";\n    } else {\n        cout << "不是闰年";\n    }\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "闰年的判断条件：能被4整除但不能被100整除，或者能被400整除。", "expectedOutput": "是闰年或不是闰年"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.122	2026-02-01 12:29:31.739
07c53ca0-1e5c-41a9-81cc-b0b2c897e1d5	结构体数组的定义	补全代码，定义学生结构体数组	EASY	1-09		\N	\N	10	1	t	FILL_BLANK	{"code": "struct Student {\\n    string name;\\n    int age;\\n    double score;\\n};\\n\\nint main() {\\n    {{blank}} students[5];\\n    return 0;\\n}", "blanks": [{"hint": "结构体类型", "answer": "Student"}], "explanation": "结构体数组的定义语法是：结构体名 数组名[大小];"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.125	2026-02-01 12:29:32.276
f9e022a2-de94-4397-b71e-6a32812fede5	结构体数组的初始化	补全代码，初始化学生结构体数组	MEDIUM	1-09		\N	\N	10	2	t	FILL_BLANK	{"code": "struct Student {\\n    string name;\\n    int age;\\n    double score;\\n};\\n\\nint main() {\\n    Student students[3] = {\\n        {{blank}},\\n        {\\"Alice\\", 17, 92.5},\\n        {\\"Bob\\", 18, 88.0}\\n    };\\n    return 0;\\n}", "blanks": [{"hint": "初始化列表", "answer": "{\\"John\\", 18, 95.5}"}], "explanation": "结构体数组的初始化需要使用嵌套的花括号。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.129	2026-02-01 12:29:32.696
0d2641ac-877a-4dd9-a333-962c991fb413	结构体数组元素的访问	补全代码，访问结构体数组元素的成员	EASY	1-09		\N	\N	10	3	t	FILL_BLANK	{"code": "struct Student {\\n    string name;\\n    int age;\\n    double score;\\n};\\n\\nint main() {\\n    Student students[3] = {\\n        {\\"John\\", 18, 95.5},\\n        {\\"Alice\\", 17, 92.5},\\n        {\\"Bob\\", 18, 88.0}\\n    };\\n    cout << students[{{blank}}].{{blank}};\\n    return 0;\\n}", "blanks": [{"hint": "数组下标", "answer": "0"}, {"hint": "结构体成员", "answer": "name"}], "explanation": "结构体数组元素的访问语法是：数组名[下标].成员名"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.132	2026-02-01 12:29:33.309
777d531e-0b3b-4f66-9b27-ed851ec435d2	结构体数组的遍历	补全代码，遍历结构体数组并输出	MEDIUM	1-09		\N	\N	10	4	t	FILL_BLANK	{"code": "struct Student {\\n    string name;\\n    int age;\\n    double score;\\n};\\n\\nint main() {\\n    Student students[3] = {\\n        {\\"John\\", 18, 95.5},\\n        {\\"Alice\\", 17, 92.5},\\n        {\\"Bob\\", 18, 88.0}\\n    };\\n    for (int i = 0; i < 3; i++) {\\n        cout << students[i].name << \\" \\" << students[i].age << \\" \\" << students[i].score << endl;\\n    }\\n    return 0;\\n}", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "使用循环遍历结构体数组，访问每个元素的成员。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.136	2026-02-01 12:29:34.529
84ebf3b3-d808-4008-b141-fe300d0ceada	结构体数组的排序	如何对结构体数组按某个成员排序？	HARD	1-09		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["使用标准库排序函数并自定义比较函数", "手动实现排序算法", "使用冒泡排序等简单排序算法", "以上都是"], "explanation": "对结构体数组排序可以使用标准库排序函数并自定义比较函数，也可以手动实现排序算法。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.14	2026-02-01 12:29:34.967
31b867d4-66fa-4bdc-8696-38465ae72376	结构体数组的应用	匹配应用场景与结构体数组	MEDIUM	1-09		\N	\N	10	6	t	MATCHING	{"leftItems": ["学生信息管理", "员工信息管理", "图书信息管理", "商品信息管理"], "rightItems": ["结构体数组", "结构体数组", "结构体数组", "结构体数组"], "explanation": "结构体数组适合存储和管理多个同类型的结构体数据，如学生、员工、图书、商品等信息。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.144	2026-02-01 12:29:35.406
58115cec-73f0-4145-8a99-7796c89f7ac1	结构体数组的统计	补全代码，统计结构体数组中分数大于90的学生人数	MEDIUM	1-09		\N	\N	10	8	t	FILL_BLANK	{"code": "struct Student {\\n    string name;\\n    int age;\\n    double score;\\n};\\n\\nint main() {\\n    Student students[3] = {\\n        {\\"John\\", 18, 95.5},\\n        {\\"Alice\\", 17, 92.5},\\n        {\\"Bob\\", 18, 88.0}\\n    };\\n    int count = 0;\\n    for (int i = 0; i < 3; i++) {\\n        if (students[i].score > 90) {\\n            count++;\\n        }\\n    }\\n    cout << count;\\n    return 0;\\n}", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "遍历结构体数组，统计符合条件的元素个数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.153	2026-02-01 12:29:36.713
ba5423f8-2eee-43fd-a81a-ec9fba2e9356	结构体数组编程	定义一个学生结构体数组，输入3个学生的信息，按分数从高到低排序并输出	MEDIUM	1-09	#include <iostream>\n#include <algorithm>\nusing namespace std;\n\n// 在这里定义Student结构体\n\n// 在这里定义比较函数\n\nint main() {\n    Student students[3];\n    // 在这里输入学生信息\n    // 在这里排序\n    // 在这里输出排序结果\n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "使用sort函数和自定义比较函数对结构体数组排序。", "expectedOutput": "按分数从高到低排序的学生信息"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.157	2026-02-01 12:29:37.204
82efe820-fb5e-4a2c-a69d-7aa1824687c4	结构体数组的综合应用	定义一个结构体表示商品，包含名称、价格和数量，计算总价值	HARD	1-09	#include <iostream>\nusing namespace std;\n\n// 在这里定义Product结构体\n\n// 在这里定义calculateTotalValue函数\n\nint main() {\n    Product products[3] = {\n        {"Apple", 5.5, 10},\n        {"Banana", 3.5, 20},\n        {"Orange", 4.5, 15}\n    };\n    cout << calculateTotalValue(products, 3);\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "遍历结构体数组，计算每个商品的价值（价格×数量）并累加。", "expectedOutput": "所有商品的总价值"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.161	2026-02-01 12:29:37.71
37ee948e-a007-4ba3-a365-1fa136551ee6	递归与结构体的综合应用	以下哪种情况适合使用递归和结构体？	EASY	1-09		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["树形结构的遍历", "线性结构的处理", "简单数学计算", "字符串处理"], "explanation": "树形结构的遍历适合使用递归，而树节点可以用结构体表示。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.165	2026-02-01 12:29:38.129
39f70311-5a6f-4ebc-99a3-9f42d70d69ce	递归的终止条件设计	设计递归函数时，终止条件应该{{blank}}	MEDIUM	1-09		\N	\N	10	2	t	FILL_BLANK	{"code": "// 设计递归函数时，终止条件应该{{blank}}", "blanks": [{"hint": "终止条件的设计原则", "answer": "简单明确"}], "explanation": "递归的终止条件应该简单明确，确保递归能够正常结束。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.169	2026-02-01 12:29:38.555
69482b56-2fff-4951-af7b-333656fbee1e	结构体的设计原则	匹配结构体设计原则与描述	MEDIUM	1-09		\N	\N	10	3	t	MATCHING	{"leftItems": ["单一职责", "成员命名清晰", "成员类型适当", "避免过多成员"], "rightItems": ["一个结构体只表示一个概念", "成员名能准确描述其含义", "选择合适的数据类型", "结构体成员不宜过多"], "explanation": "良好的结构体设计应遵循这些原则。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.173	2026-02-01 12:29:39.407
cd1a27dd-b495-4802-832e-49ad807fcd36	递归与栈溢出	如何避免递归导致的栈溢出？	HARD	1-09		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["控制递归深度", "使用尾递归优化", "改用迭代实现", "以上都是"], "explanation": "控制递归深度、使用尾递归优化、改用迭代实现都可以避免递归导致的栈溢出。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.176	2026-02-01 12:29:40.123
0133d685-73a8-4b8a-ab4a-a8394b5064ca	递归的实际应用	使用递归函数实现快速排序算法	HARD	1-09	#include <iostream>\nusing namespace std;\n\n// 在这里定义quickSort函数\n\nvoid printArray(int arr[], int size) {\n    for (int i = 0; i < size; i++) {\n        cout << arr[i] << " ";\n    }\n    cout << endl;\n}\n\nint main() {\n    int arr[] = {5, 2, 9, 1, 5, 6};\n    int size = 6;\n    quickSort(arr, 0, size - 1);\n    printArray(arr, size);\n    return 0;\n}	\N	\N	20	6	t	CODING	{"explanation": "快速排序的基本思想是选择一个基准元素，将数组分为两部分，然后递归排序。", "expectedOutput": "排序后的数组"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.183	2026-02-01 12:29:41.9
511d295d-d45d-4715-9e91-850a799d1a07	结构体的综合应用	定义一个结构体表示员工，包含姓名、工号、部门和工资，实现简单的员工管理系统	HARD	1-09	#include <iostream>\n#include <string>\nusing namespace std;\n\n// 在这里定义Employee结构体\n\n// 在这里定义相关函数\n\nint main() {\n    Employee employees[5];\n    // 在这里实现员工信息的输入、输出、查找等功能\n    return 0;\n}	\N	\N	20	7	t	CODING	{"explanation": "使用结构体数组存储员工信息，实现基本的管理功能。", "expectedOutput": "员工管理系统的各项操作结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.187	2026-02-01 12:29:42.759
6f252552-1dd0-4934-aaa9-21b11f5f84a9	递归与结构体的终极挑战	使用递归函数和结构体实现归并排序算法	HARD	1-09	#include <iostream>\nusing namespace std;\n\n// 在这里定义mergeSort函数\n\nvoid printArray(int arr[], int size) {\n    for (int i = 0; i < size; i++) {\n        cout << arr[i] << " ";\n    }\n    cout << endl;\n}\n\nint main() {\n    int arr[] = {38, 27, 43, 3, 9, 82, 10};\n    int size = 7;\n    mergeSort(arr, 0, size - 1);\n    printArray(arr, size);\n    return 0;\n}	\N	\N	20	8	t	CODING	{"explanation": "归并排序的基本思想是将数组分成两半，递归排序，然后合并。", "expectedOutput": "排序后的数组"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.191	2026-02-01 12:29:43.272
e46be044-7384-445e-99bb-a4b067e3ad77	递归的创意应用	使用递归函数打印斐波那契数列的前n项	HARD	1-09	#include <iostream>\nusing namespace std;\n\n// 在这里定义printFibonacci函数\n\nint main() {\n    int n;\n    cin >> n;\n    printFibonacci(n);\n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用递归函数计算并打印斐波那契数列的前n项。", "expectedOutput": "斐波那契数列的前n项"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.199	2026-02-01 12:29:44.188
9f728266-4d6b-46aa-a53a-758143dfab7d	指针的基本概念	指针是什么？	EASY	1-12		\N	\N	15	1	t	MULTIPLE_CHOICE	{"options": ["存储内存地址的变量", "存储数据的变量", "存储函数的变量", "存储数组的变量"], "explanation": "指针是存储内存地址的变量，它指向内存中的一个位置。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.203	2026-02-01 12:29:46.416
d2a185df-f286-4826-a1bd-55235a07f678	指针的定义语法	补全代码，定义一个指向整数的指针	EASY	1-12		\N	\N	15	2	t	FILL_BLANK	{"code": "int {{blank}};\\nint *ptr = &num;", "blanks": [{"hint": "变量名", "answer": "num"}], "explanation": "指针的定义语法是：类型 *指针名 = &变量名;"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.207	2026-02-01 12:29:46.839
f97731cf-1cbf-4808-a14d-71a91b2c3783	取地址运算符	取地址运算符是什么？	EASY	1-12		\N	\N	15	3	t	MULTIPLE_CHOICE	{"options": ["&", "*", "@", "#"], "explanation": "&是取地址运算符，用于获取变量的内存地址。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.21	2026-02-01 12:29:48.106
e4b258da-109f-4929-b1cd-85252702d33b	解引用运算符	解引用运算符是什么？	EASY	1-12		\N	\N	15	4	t	MULTIPLE_CHOICE	{"options": ["*", "&", "@", "#"], "explanation": "*是解引用运算符，用于获取指针指向的变量的值。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.213	2026-02-01 12:29:48.593
93a19908-b645-4b6c-a67e-6798f71900d7	指针的大小	在64位系统中，指针的大小是{{blank}}字节	MEDIUM	1-12		\N	\N	15	5	t	FILL_BLANK	{"code": "// 在64位系统中，指针的大小是{{blank}}字节", "blanks": [{"hint": "64位系统指针大小", "answer": "8"}], "explanation": "在64位系统中，指针的大小是8字节；在32位系统中，指针的大小是4字节。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.217	2026-02-01 12:29:49.651
c6918a8c-1d5d-4598-9230-315a254031ac	空指针	补全代码，定义一个空指针	EASY	1-12		\N	\N	15	6	t	FILL_BLANK	{"code": "int *ptr = {{blank}};", "blanks": [{"hint": "空指针常量", "answer": "nullptr"}], "explanation": "nullptr是C++11引入的空指针常量，表示指针不指向任何内存位置。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.22	2026-02-01 12:29:50.913
bb1c3100-1285-4df3-b2be-243588adf53b	野指针	野指针是什么？	MEDIUM	1-12		\N	\N	15	7	t	MULTIPLE_CHOICE	{"options": ["指向无效内存地址的指针", "指向有效内存地址的指针", "空指针", "未初始化的指针"], "explanation": "野指针是指向无效内存地址的指针，使用野指针会导致未定义行为。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.223	2026-02-01 12:29:51.754
be38c248-eecb-41d3-a5e9-373b2febfdf1	指针的应用场景	匹配应用场景与指针	MEDIUM	1-12		\N	\N	15	8	t	MATCHING	{"leftItems": ["动态内存分配", "函数参数传递", "数组操作", "链表实现"], "rightItems": ["指针", "指针", "指针", "指针"], "explanation": "指针在动态内存分配、函数参数传递、数组操作和链表实现等场景中广泛应用。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.227	2026-02-01 12:29:52.187
c7045b37-46e9-48d9-8f6e-05afd53c5af1	指针概念编程	使用指针交换两个整数的值	MEDIUM	1-12	#include <iostream>\nusing namespace std;\n\n// 在这里定义swap函数\n\nint main() {\n    int a = 10, b = 20;\n    cout << "交换前: a=" << a << ", b=" << b << endl;\n    swap(&a, &b);\n    cout << "交换后: a=" << a << ", b=" << b << endl;\n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "使用指针作为函数参数，实现两个整数的交换。", "expectedOutput": "交换前后的a和b的值"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.23	2026-02-01 12:29:52.607
f7249afd-5fbf-40e5-9997-ae68e6df858a	指针的综合应用	使用指针遍历数组并输出所有元素	HARD	1-12	#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int size = 5;\n    // 在这里使用指针遍历数组\n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用指针遍历数组，利用指针的算术运算。", "expectedOutput": "数组的所有元素"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.234	2026-02-01 12:29:53.024
1673aff4-d091-4767-9bac-44ce698e0784	指针的算术运算	补全代码，使用指针算术运算遍历数组	MEDIUM	1-12		\N	\N	15	1	t	FILL_BLANK	{"code": "int arr[] = {1, 2, 3, 4, 5};\\nint *ptr = arr;\\nfor (int i = 0; i < 5; i++) {\\n    cout << *ptr << \\" \\";\\n    {{blank}};\\n}", "blanks": [{"hint": "指针自增", "answer": "ptr++"}], "explanation": "指针自增运算会使指针指向下一个元素，步长由指针类型决定。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.237	2026-02-01 12:29:53.857
cc72ea71-c90e-496d-b66d-d9d0c219f317	指针与数组	数组名在表达式中会被转换为什么？	MEDIUM	1-12		\N	\N	15	2	t	MULTIPLE_CHOICE	{"options": ["指向数组首元素的指针", "数组的大小", "数组的第一个元素", "数组的最后一个元素"], "explanation": "数组名在表达式中会被转换为指向数组首元素的指针。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.241	2026-02-01 12:29:54.335
48a90939-ffdb-4d6d-a048-e13bb95e2c5c	指针的比较运算	补全代码，使用指针比较运算遍历数组	MEDIUM	1-12		\N	\N	15	3	t	FILL_BLANK	{"code": "int arr[] = {1, 2, 3, 4, 5};\\nint *ptr = arr;\\nint *end = arr + 5;\\nwhile (ptr {{blank}} end) {\\n    cout << *ptr << \\" \\";\\n    ptr++;\\n}", "blanks": [{"hint": "小于运算符", "answer": "<"}], "explanation": "指针可以进行比较运算，判断是否到达数组末尾。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.244	2026-02-01 12:29:55.331
45656081-9f9b-4f15-baa2-91e4c1518229	指针与函数参数	补全代码，使用指针作为函数参数修改变量值	MEDIUM	1-12		\N	\N	15	4	t	FILL_BLANK	{"code": "void increment(int *n) {\\n    (*n)++;\\n}\\n\\nint main() {\\n    int num = 10;\\n    increment({{blank}});\\n    cout << num;\\n    return 0;\\n}", "blanks": [{"hint": "取地址", "answer": "&num"}], "explanation": "将变量的地址传递给指针参数，函数可以修改变量的值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.248	2026-02-01 12:29:57.058
901e687a-2771-4e1e-9c58-229d8c6261dd	多级指针	补全代码，使用二级指针访问变量	HARD	1-12		\N	\N	15	6	t	FILL_BLANK	{"code": "int num = 10;\\nint *ptr = &num;\\nint **pptr = &ptr;\\ncout << {{blank}};", "blanks": [{"hint": "二级解引用", "answer": "**pptr"}], "explanation": "二级指针需要两次解引用才能访问到最终的变量值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.255	2026-02-01 12:29:58.87
175ae5ea-0918-4ea2-b9ca-ff6417226628	指针的类型转换	以下哪种指针类型转换是安全的？	HARD	1-12		\N	\N	15	7	t	MULTIPLE_CHOICE	{"options": ["void*转换为其他类型指针", "其他类型指针转换为void*", "int*转换为double*", "double*转换为int*"], "explanation": "其他类型指针可以安全地转换为void*，但void*转换为其他类型指针需要显式转换，可能不安全。", "correctIndex": 1}	EXERCISE_LIBRARY	2026-01-30 16:29:56.259	2026-02-01 12:29:59.324
d8cd7977-9fb9-4958-84c9-64b8ba262046	指针的应用	匹配指针操作与功能	MEDIUM	1-12		\N	\N	15	8	t	MATCHING	{"leftItems": ["指针自增", "指针解引用", "指针取地址", "指针比较"], "rightItems": ["移动到下一个元素", "获取指针指向的值", "获取指针的地址", "判断指针位置"], "explanation": "不同的指针操作有不同的功能。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.263	2026-02-01 12:29:59.745
84e1d116-13b5-475c-a1e7-da70149b30b6	指针使用编程	使用指针计算数组的和	MEDIUM	1-12	#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int size = 5;\n    int sum = 0;\n    // 在这里使用指针计算数组和\n    cout << sum;\n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "使用指针遍历数组，累加每个元素的值。", "expectedOutput": "数组元素的和"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.266	2026-02-01 12:30:00.175
29f667a2-7fa4-47f0-9591-36fac4f1ee05	指针的综合应用	使用指针实现字符串复制函数	HARD	1-12	#include <iostream>\nusing namespace std;\n\n// 在这里定义myStrcpy函数\n\nint main() {\n    char src[] = "Hello";\n    char dest[10];\n    myStrcpy(dest, src);\n    cout << dest;\n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用指针实现字符串复制，逐个字符复制直到遇到结束符。", "expectedOutput": "复制后的字符串"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.27	2026-02-01 12:30:01.179
ce6e20c1-e8d8-4c9b-b57a-91075c86d8b1	引用的基本概念	引用是什么？	EASY	1-12		\N	\N	15	1	t	MULTIPLE_CHOICE	{"options": ["变量的别名", "指针的别名", "常量的别名", "函数的别名"], "explanation": "引用是变量的别名，它与变量共享同一个内存地址。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.273	2026-02-01 12:30:01.619
c867b650-5749-41c8-8fd8-740533e2f260	引用的定义语法	补全代码，定义一个整数的引用	EASY	1-12		\N	\N	15	2	t	FILL_BLANK	{"code": "int num = 10;\\nint {{blank}} ref = num;", "blanks": [{"hint": "引用运算符", "answer": "&"}], "explanation": "引用的定义语法是：类型 &引用名 = 变量名;"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.277	2026-02-01 12:30:02.041
240dee87-452f-4f81-bc3e-13df47346416	引用与指针的区别	以下哪个是引用与指针的区别？	MEDIUM	1-12		\N	\N	15	4	t	MULTIPLE_CHOICE	{"options": ["引用必须初始化，指针不需要", "引用可以为空，指针不能为空", "引用可以重新绑定，指针不能", "引用的大小比指针大"], "explanation": "引用必须在定义时初始化，而指针可以先定义后初始化。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.284	2026-02-01 12:30:03.789
6b9c7dd0-9292-4609-b391-91b2f8029962	引用的使用	补全代码，使用引用修改变量值	EASY	1-12		\N	\N	15	5	t	FILL_BLANK	{"code": "int main() {\\n    int num = 10;\\n    int &ref = num;\\n    ref = 20;\\n    cout << num;\\n    return 0;\\n}", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "修改引用的值会直接修改原变量的值，因为它们共享同一个内存地址。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.288	2026-02-01 12:30:05.286
4a05a65c-fa3b-495f-98a3-ba428d4a246d	引用作为函数参数	补全代码，使用引用作为函数参数	MEDIUM	1-12		\N	\N	15	6	t	FILL_BLANK	{"code": "void increment(int {{blank}} n) {\\n    n++;\\n}\\n\\nint main() {\\n    int num = 10;\\n    increment(num);\\n    cout << num;\\n    return 0;\\n}", "blanks": [{"hint": "引用运算符", "answer": "&"}], "explanation": "使用引用作为函数参数，可以直接修改实参的值，无需解引用操作。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.292	2026-02-01 12:30:06.875
54392b42-c15e-42ea-b930-e625fd8a6433	常量引用	补全代码，定义一个常量引用	MEDIUM	1-12		\N	\N	15	7	t	FILL_BLANK	{"code": "int num = 10;\\nconst int {{blank}} ref = num;", "blanks": [{"hint": "引用运算符", "answer": "&"}], "explanation": "常量引用的定义语法是：const 类型 &引用名 = 变量名; 常量引用不能修改所引用变量的值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.295	2026-02-01 12:30:07.403
c72d07d1-4e9a-49a7-8133-236da21d507d	引用的应用场景	匹配应用场景与引用	MEDIUM	1-12		\N	\N	15	8	t	MATCHING	{"leftItems": ["函数参数传递", "函数返回值", "操作符重载", "避免复制大对象"], "rightItems": ["引用", "引用", "引用", "引用"], "explanation": "引用在函数参数传递、函数返回值、操作符重载和避免复制大对象等场景中广泛应用。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.299	2026-02-01 12:30:08.348
a360ae54-2527-407d-b324-c804904ee3aa	引用编程	使用引用作为函数参数交换两个整数的值	MEDIUM	1-12	#include <iostream>\nusing namespace std;\n\n// 在这里定义swap函数\n\nint main() {\n    int a = 10, b = 20;\n    cout << "交换前: a=" << a << ", b=" << b << endl;\n    swap(a, b);\n    cout << "交换后: a=" << a << ", b=" << b << endl;\n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "使用引用作为函数参数，实现两个整数的交换。", "expectedOutput": "交换前后的a和b的值"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.302	2026-02-01 12:30:08.966
d4e3df8c-fbdb-4e13-ba60-35a0026960dc	引用传递的概念	引用传递是什么？	EASY	1-12		\N	\N	20	1	t	MULTIPLE_CHOICE	{"options": ["使用引用作为函数参数传递", "使用指针作为函数参数传递", "使用值作为函数参数传递", "使用常量作为函数参数传递"], "explanation": "引用传递是指使用引用作为函数参数，将实参的引用传递给函数。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.309	2026-02-01 12:30:10.427
6162b017-7c11-4984-a89d-19e250fc0a5e	引用传递的优点	匹配引用传递优点与描述	MEDIUM	1-12		\N	\N	20	2	t	MATCHING	{"leftItems": ["避免复制", "直接修改实参", "代码简洁", "安全性高"], "rightItems": ["引用传递不需要复制实参", "引用传递可以直接修改实参", "引用传递语法简洁，无需解引用", "引用必须初始化，避免空指针"], "explanation": "引用传递的优点包括避免复制、直接修改实参、代码简洁和安全性高等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.312	2026-02-01 12:30:10.848
4f2e35aa-81df-413c-908c-b32af27066f0	引用传递与值传递的区别	以下哪个是引用传递与值传递的区别？	MEDIUM	1-12		\N	\N	20	3	t	MULTIPLE_CHOICE	{"options": ["引用传递修改实参，值传递不修改", "引用传递需要复制，值传递不需要", "引用传递速度慢，值传递速度快", "引用传递语法复杂，值传递语法简单"], "explanation": "引用传递可以直接修改实参的值，而值传递只是修改实参的副本，不影响实参本身。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.316	2026-02-01 12:30:11.266
cf079d9f-b62c-4c89-975f-088fa6d0aa57	引用传递的使用场景	补全代码，使用引用传递修改结构体成员	MEDIUM	1-12		\N	\N	20	4	t	FILL_BLANK	{"code": "struct Point {\\n    int x;\\n    int y;\\n};\\n\\nvoid movePoint(Point {{blank}} p, int dx, int dy) {\\n    p.x += dx;\\n    p.y += dy;\\n}\\n\\nint main() {\\n    Point p = {10, 20};\\n    movePoint(p, 5, 5);\\n    cout << \\"(\\" << p.x << \\", \\" << p.y << \\")\\";\\n    return 0;\\n}", "blanks": [{"hint": "引用运算符", "answer": "&"}], "explanation": "使用引用传递结构体参数，可以直接修改结构体成员的值，避免复制结构体的开销。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.319	2026-02-01 12:30:11.814
dc260776-7a86-4b90-91ae-34575b6b5632	常量引用传递	补全代码，使用常量引用传递避免修改	MEDIUM	1-12		\N	\N	20	5	t	FILL_BLANK	{"code": "void printString(const string {{blank}} s) {\\n    cout << s;\\n    // s = \\"Hello\\"; // 错误：不能修改常量引用\\n}\\n\\nint main() {\\n    string str = \\"World\\";\\n    printString(str);\\n    return 0;\\n}", "blanks": [{"hint": "引用运算符", "answer": "&"}], "explanation": "使用常量引用传递参数，可以避免复制大对象的开销，同时保证函数不会修改实参的值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.323	2026-02-01 12:30:12.322
2871184c-2e07-4001-b8d5-2e35bb2f88fd	引用传递与指针传递的选择	以下哪种情况适合使用引用传递？	HARD	1-12		\N	\N	20	6	t	MULTIPLE_CHOICE	{"options": ["参数不能为空且需要修改", "参数可以为空", "需要多级间接访问", "需要重新绑定指针"], "explanation": "当参数不能为空且需要修改时，适合使用引用传递；当参数可以为空时，适合使用指针传递。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.326	2026-02-01 12:30:12.745
5ccb3b26-6e47-44a3-9901-2e0c9937ce92	引用传递的综合应用	使用引用传递实现一个函数，将字符串转换为大写并返回转换后的字符数	HARD	1-12	#include <iostream>\n#include <string>\n#include <cctype>\nusing namespace std;\n\n// 在这里定义toUpperCase函数\n\nint main() {\n    string str = "hello world";\n    int count = toUpperCase(str);\n    cout << "转换后: " << str << endl;\n    cout << "转换的字符数: " << count << endl;\n    return 0;\n}	\N	\N	25	8	t	CODING	{"explanation": "使用引用传递修改字符串，将小写字母转换为大写字母，并统计转换的字符数。", "expectedOutput": "转换后的大写字符串和转换的字符数"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.334	2026-02-01 12:30:14.597
6a84c41d-0de0-48e5-a847-61c83127280e	引用传递编程	使用引用传递实现一个函数，计算三个整数的最大值、最小值和平均值	MEDIUM	1-12	#include <iostream>\nusing namespace std;\n\n// 在这里定义calculate函数\n\nint main() {\n    int a = 10, b = 20, c = 30;\n    int max, min;\n    double avg;\n    calculate(a, b, c, max, min, avg);\n    cout << "最大值: " << max << endl;\n    cout << "最小值: " << min << endl;\n    cout << "平均值: " << avg << endl;\n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "使用引用传递返回多个计算结果。", "expectedOutput": "三个整数的最大值、最小值和平均值"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.337	2026-02-01 12:30:15.018
843a9335-570e-4f6a-a2a4-a5d061c38552	引用传递的终极挑战	使用引用传递实现一个函数，将一个整数分解为质因数，并存储到向量中	HARD	1-12	#include <iostream>\n#include <vector>\nusing namespace std;\n\n// 在这里定义factorize函数\n\nint main() {\n    int n = 120;\n    vector<int> factors;\n    factorize(n, factors);\n    cout << n << "的质因数: ";\n    for (int factor : factors) {\n        cout << factor << " ";\n    }\n    cout << endl;\n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "使用引用传递向量参数，存储质因数分解的结果。", "expectedOutput": "整数的质因数分解结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.341	2026-02-01 12:30:16.308
281e8305-066d-4898-9efb-e4a8bc8558b2	指针与引用的综合应用	以下哪种情况适合使用指针？	EASY	1-12		\N	\N	20	1	t	MULTIPLE_CHOICE	{"options": ["需要动态内存分配", "需要空值", "需要多级间接访问", "以上都是"], "explanation": "指针适合用于需要动态内存分配、需要空值和需要多级间接访问的情况。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.346	2026-02-01 12:30:16.728
67e714b6-b754-49e5-ab10-1ac6e90ffa39	指针的高级应用	补全代码，使用函数指针调用函数	HARD	1-12		\N	\N	20	3	t	FILL_BLANK	{"code": "int add(int a, int b) {\\n    return a + b;\\n}\\n\\nint main() {\\n    int (*funcPtr)(int, int) = {{blank}};\\n    int result = funcPtr(3, 4);\\n    cout << result;\\n    return 0;\\n}", "blanks": [{"hint": "函数名", "answer": "add"}], "explanation": "函数指针可以存储函数的地址，用于间接调用函数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.354	2026-02-01 12:30:17.743
76a98b47-6bbb-4859-9822-6f3a0be59b28	引用的高级应用	补全代码，使用引用返回函数结果	HARD	1-12		\N	\N	20	4	t	FILL_BLANK	{"code": "int& getMax(int &a, int &b) {\\n    return a > b ? {{blank}} : {{blank}};\\n}\\n\\nint main() {\\n    int x = 10, y = 20;\\n    getMax(x, y) = 30;\\n    cout << x << \\" \\" << y;\\n    return 0;\\n}", "blanks": [{"hint": "第一个参数", "answer": "a"}, {"hint": "第二个参数", "answer": "b"}], "explanation": "函数可以返回引用，允许对返回值进行赋值操作。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.358	2026-02-01 12:30:18.242
460f4eb5-e08d-4537-ba65-cbd1977d2090	综合编程挑战	使用指针实现一个简单的动态数组	HARD	1-12	#include <iostream>\nusing namespace std;\n\n// 在这里实现动态数组\n\nint main() {\n    // 测试动态数组\n    return 0;\n}	\N	\N	25	5	t	CODING	{"explanation": "使用指针和动态内存分配实现一个简单的动态数组。", "expectedOutput": "动态数组的创建、添加元素、访问元素和释放内存"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.361	2026-02-01 12:30:19.171
0251ff51-622e-4ea9-8c82-25bd163261cc	指针的实际应用	使用指针实现链表的基本操作	HARD	1-12	#include <iostream>\nusing namespace std;\n\n// 在这里定义链表节点结构体\n\n// 在这里实现链表操作函数\n\nint main() {\n    // 测试链表操作\n    return 0;\n}	\N	\N	25	6	t	CODING	{"explanation": "使用指针实现链表的基本操作，包括创建节点、插入节点、删除节点和遍历链表。", "expectedOutput": "链表的创建、插入、删除和遍历"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.364	2026-02-01 12:30:19.657
ee96773b-9c1a-4077-83ea-7151d9bab944	引用的实际应用	使用引用实现一个简单的矩阵类	HARD	1-12	#include <iostream>\nusing namespace std;\n\n// 在这里定义Matrix类\n\nint main() {\n    // 测试矩阵类\n    return 0;\n}	\N	\N	25	7	t	CODING	{"explanation": "使用引用实现矩阵类的运算符重载，支持矩阵的加法、乘法等操作。", "expectedOutput": "矩阵的创建、加法、乘法和输出"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.368	2026-02-01 12:30:21.014
683a736f-00c4-4201-9528-aed3d89934ae	指针与引用的终极挑战	实现一个简单的智能指针类	HARD	1-12	#include <iostream>\nusing namespace std;\n\n// 在这里定义SmartPtr类\n\nint main() {\n    // 测试智能指针\n    return 0;\n}	\N	\N	25	8	t	CODING	{"explanation": "使用引用计数实现一个简单的智能指针类，自动管理动态内存的释放。", "expectedOutput": "智能指针的创建、使用和自动释放内存"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.372	2026-02-01 12:30:21.768
ec12b934-7a09-4696-ab19-3a38da903736	综合应用挑战	使用指针和引用实现一个简单的字符串类	HARD	1-12	#include <iostream>\nusing namespace std;\n\n// 在这里定义MyString类\n\nint main() {\n    // 测试字符串类\n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "使用指针和引用实现一个简单的字符串类，支持字符串的基本操作。", "expectedOutput": "字符串的创建、复制、连接和比较"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.377	2026-02-01 12:30:22.186
9285195e-96ba-491d-8e7c-43607ce399f5	指针与引用的创意应用	使用函数指针实现一个简单的回调机制	HARD	1-12	#include <iostream>\nusing namespace std;\n\n// 在这里定义回调函数类型和使用回调的函数\n\nint main() {\n    // 测试回调机制\n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "使用函数指针实现一个简单的回调机制，允许在特定事件发生时调用注册的函数。", "expectedOutput": "回调函数的注册和调用"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.38	2026-02-01 12:30:22.62
091398b7-6484-4527-bdc0-491d1e15ffc2	动态内存分配的基本概念	动态内存分配是什么？	EASY	1-13		\N	\N	15	1	t	MULTIPLE_CHOICE	{"options": ["在程序运行时分配内存", "在程序编译时分配内存", "在程序链接时分配内存", "在程序加载时分配内存"], "explanation": "动态内存分配是在程序运行时根据需要分配内存空间。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.384	2026-02-01 12:30:23.118
0bab697f-6a81-4743-af88-0c6e2bfe8cc8	静态内存与动态内存的区别	匹配内存类型与特点	MEDIUM	1-13		\N	\N	15	2	t	MATCHING	{"leftItems": ["静态内存", "动态内存", "静态内存", "动态内存"], "rightItems": ["编译时分配", "运行时分配", "自动释放", "手动释放"], "explanation": "静态内存在编译时分配，程序结束时自动释放；动态内存在运行时分配，需要手动释放。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.388	2026-02-01 12:30:24.036
8167fcb6-c4c8-45f2-8c36-416cd29969e9	动态内存分配的优点	动态内存分配的优点是什么？	EASY	1-13		\N	\N	15	3	t	MULTIPLE_CHOICE	{"options": ["灵活分配内存大小", "内存使用效率高", "可以根据运行时需求调整", "以上都是"], "explanation": "动态内存分配的优点包括灵活分配内存大小、内存使用效率高和可以根据运行时需求调整。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.391	2026-02-01 12:30:24.454
9bf6854c-0a05-4634-90d0-e21cb417ecc9	动态内存分配的应用场景	补全代码，使用动态内存分配存储用户输入的数组大小	MEDIUM	1-13		\N	\N	15	4	t	FILL_BLANK	{"code": "int main() {\\n    int n;\\n    cout << \\"请输入数组大小: \\";\\n    cin >> n;\\n    // 在这里使用动态内存分配\\n    int *arr = new int[n];\\n    // 使用数组\\n    delete[] arr;\\n    return 0;\\n}", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "动态内存分配适用于需要根据运行时输入确定内存大小的场景。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.395	2026-02-01 12:30:24.965
3ffbc5d2-a942-4057-b9b9-48711605dd95	内存管理的重要性	内存管理不当会导致什么问题？	EASY	1-13		\N	\N	15	5	t	MULTIPLE_CHOICE	{"options": ["内存泄漏", "野指针", "程序崩溃", "以上都是"], "explanation": "内存管理不当会导致内存泄漏、野指针和程序崩溃等问题。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.398	2026-02-01 12:30:25.468
11620b5d-7747-47c3-958c-91118877d6c4	动态内存分配的基本步骤	动态内存分配的基本步骤是：分配内存 → 使用内存 → {{blank}}内存	EASY	1-13		\N	\N	15	7	t	FILL_BLANK	{"code": "// 动态内存分配的基本步骤是：分配内存 → 使用内存 → {{blank}}内存", "blanks": [{"hint": "内存管理步骤", "answer": "释放"}], "explanation": "动态内存分配的基本步骤是：分配内存 → 使用内存 → 释放内存。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.406	2026-02-01 12:30:26.375
23980a80-4994-4e7c-8593-bacb3274a791	new运算符的作用	new运算符的作用是什么？	EASY	1-13		\N	\N	15	8	t	MULTIPLE_CHOICE	{"options": ["分配内存并初始化", "释放内存", "修改变量值", "获取内存地址"], "explanation": "new运算符用于分配内存并初始化对象。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.41	2026-02-01 12:30:26.796
a22e6945-6935-4485-bcfd-9e5d17e9e0ee	delete运算符的作用	delete运算符的作用是什么？	EASY	1-13		\N	\N	15	9	t	MULTIPLE_CHOICE	{"options": ["释放内存", "分配内存", "修改变量值", "获取内存地址"], "explanation": "delete运算符用于释放之前通过new分配的内存。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.414	2026-02-01 12:30:27.64
b931d8c8-8e2d-405b-85ad-0412ebdea9bb	动态内存分配编程	使用动态内存分配存储并打印用户输入的整数	MEDIUM	1-13	#include <iostream>\nusing namespace std;\n\nint main() {\n    int *ptr = nullptr;\n    int num;\n    cout << "请输入一个整数: ";\n    cin >> num;\n    // 在这里分配内存并存储值\n    // 打印值\n    // 释放内存\n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用new运算符分配内存，存储用户输入的值，打印后使用delete运算符释放内存。", "expectedOutput": "用户输入的整数"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.424	2026-02-01 12:30:28.409
2182de57-e0a6-42d7-8a4e-8e40dca54ed1	new运算符的使用	补全代码，使用new运算符分配一个整数的内存	EASY	1-13		\N	\N	15	1	t	FILL_BLANK	{"code": "int *ptr = {{blank}} int(10);", "blanks": [{"hint": "分配内存运算符", "answer": "new"}], "explanation": "new运算符用于分配内存，语法为：new 类型(初始值)。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.433	2026-02-01 12:30:28.898
b2d274f5-7e18-47f8-b6a2-803154947f09	delete运算符的使用	补全代码，使用delete运算符释放内存	EASY	1-13		\N	\N	15	2	t	FILL_BLANK	{"code": "int *ptr = new int(10);\\n// 使用ptr\\n{{blank}} ptr;", "blanks": [{"hint": "释放内存运算符", "answer": "delete"}], "explanation": "delete运算符用于释放内存，语法为：delete 指针。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.437	2026-02-01 12:30:29.518
aa5b5eaf-385b-44dd-bcc0-8d63b35b94d6	new与delete的配对使用	以下哪种使用方式是正确的？	MEDIUM	1-13		\N	\N	15	3	t	MULTIPLE_CHOICE	{"options": ["new → delete", "new[] → delete", "new → delete[]", "new[] → delete[]"], "explanation": "使用new分配的内存应该使用delete释放；使用new[]分配的内存应该使用delete[]释放。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.441	2026-02-01 12:30:29.939
2d26c020-be90-4f7f-b88d-dbb054d7ea23	new[]运算符的使用	补全代码，使用new[]运算符分配一个数组	MEDIUM	1-13		\N	\N	15	4	t	FILL_BLANK	{"code": "int size = 5;\\nint *arr = {{blank}} int[size];", "blanks": [{"hint": "分配数组内存运算符", "answer": "new"}], "explanation": "new[]运算符用于分配数组内存，语法为：new 类型[大小]。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.445	2026-02-01 12:30:30.358
7137c568-924e-4b0c-be4e-59c953785e3e	delete[]运算符的使用	补全代码，使用delete[]运算符释放数组内存	MEDIUM	1-13		\N	\N	15	5	t	FILL_BLANK	{"code": "int *arr = new int[5];\\n// 使用arr\\n{{blank}}[] arr;", "blanks": [{"hint": "释放数组内存运算符", "answer": "delete"}], "explanation": "delete[]运算符用于释放数组内存，语法为：delete[] 指针。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.448	2026-02-01 12:30:31.369
c6a075b4-c57c-4f66-83d0-a8ad05b12132	内存分配失败的处理	当new运算符无法分配内存时，会发生什么？	MEDIUM	1-13		\N	\N	15	6	t	MULTIPLE_CHOICE	{"options": ["抛出bad_alloc异常", "返回nullptr", "程序崩溃", "返回0"], "explanation": "当new运算符无法分配内存时，会抛出bad_alloc异常。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.451	2026-02-01 12:30:31.87
10d3fb9f-4a8c-471c-958d-9d1ad543f723	new(nothrow)的使用	补全代码，使用new(nothrow)分配内存	HARD	1-13		\N	\N	15	7	t	FILL_BLANK	{"code": "int *ptr = new(nothrow) int(10);\\nif (ptr == nullptr) {\\n    cout << \\"内存分配失败\\" << endl;\\n    return 1;\\n}\\n// 使用ptr\\ndelete ptr;", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "new(nothrow)在内存分配失败时会返回nullptr，而不是抛出异常。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.454	2026-02-01 12:30:32.291
b6bc8be4-73d1-4b1d-af18-a2d526b38dd9	new与delete编程	使用new与delete运算符管理动态内存	MEDIUM	1-13	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 分配一个整数的内存并初始化\n    // 打印值\n    // 释放内存\n    // 分配一个数组的内存\n    // 初始化数组元素\n    // 打印数组元素\n    // 释放数组内存\n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "使用new分配单个整数的内存，使用delete释放；使用new[]分配数组内存，使用delete[]释放。", "expectedOutput": "单个整数的值和数组的所有元素"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.462	2026-02-01 12:30:33.68
097f33c0-9ab5-4e25-9ef4-63b6be38f497	new与delete的综合应用	使用动态内存分配实现一个简单的学生信息管理系统	HARD	1-13	#include <iostream>\n#include <string>\nusing namespace std;\n\nstruct Student {\n    string name;\n    int age;\n    int score;\n};\n\nint main() {\n    int n;\n    cout << "请输入学生数量: ";\n    cin >> n;\n    \n    // 分配学生数组内存\n    // 输入学生信息\n    // 打印学生信息\n    // 释放内存\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用new[]分配学生数组内存，输入并打印学生信息后，使用delete[]释放内存。", "expectedOutput": "输入的学生信息"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.465	2026-02-01 12:30:34.151
f2e24c01-44c5-42fb-bea1-bfb4534e7cce	动态数组的创建	补全代码，创建一个动态数组	MEDIUM	1-13		\N	\N	20	2	t	FILL_BLANK	{"code": "int size = 10;\\nint *dynamicArray = {{blank}} int[size];", "blanks": [{"hint": "分配数组内存", "answer": "new"}], "explanation": "使用new[]运算符创建动态数组，语法为：new 类型[大小]。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.472	2026-02-01 12:30:35.252
8d6a2507-797c-42f4-94be-0198c2f257bf	动态数组的初始化	补全代码，初始化动态数组	MEDIUM	1-13		\N	\N	20	3	t	FILL_BLANK	{"code": "int size = 5;\\nint *arr = new int[size];\\nfor (int i = 0; i < size; i++) {\\n    arr[i] = {{blank}};\\n}", "blanks": [{"hint": "初始值", "answer": "i"}], "explanation": "动态数组创建后需要手动初始化，因为new[]不会自动初始化元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.479	2026-02-01 12:30:35.704
4d60aa6b-b64c-4b86-995c-0d2b95c4d82f	动态数组的访问	如何访问动态数组的元素？	EASY	1-13		\N	\N	20	4	t	MULTIPLE_CHOICE	{"options": ["使用下标运算符[]", "使用指针算术运算", "以上都是", "以上都不是"], "explanation": "可以使用下标运算符[]或指针算术运算访问动态数组的元素。", "correctIndex": 2}	EXERCISE_LIBRARY	2026-01-30 16:29:56.484	2026-02-01 12:30:36.123
a26fe954-5408-4438-a5f4-6060dc638fc9	动态数组的释放	补全代码，释放动态数组内存	EASY	1-13		\N	\N	20	5	t	FILL_BLANK	{"code": "int *arr = new int[5];\\n// 使用arr\\n{{blank}}[] arr;", "blanks": [{"hint": "释放数组内存", "answer": "delete"}], "explanation": "使用delete[]运算符释放动态数组内存，语法为：delete[] 指针。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.488	2026-02-01 12:30:36.853
d26daf4d-a31c-455a-bb64-d9782259095b	动态数组的扩容	补全代码，实现动态数组的扩容	HARD	1-13		\N	\N	20	7	t	FILL_BLANK	{"code": "int *resizeArray(int *oldArray, int oldSize, int newSize) {\\n    int *newArray = new int[newSize];\\n    // 复制旧数组元素\\n    for (int i = 0; i < oldSize && i < newSize; i++) {\\n        newArray[i] = oldArray[i];\\n    }\\n    delete[] oldArray;\\n    return newArray;\\n}", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "动态数组扩容需要创建新的更大的数组，复制旧数组元素，释放旧数组内存，返回新数组指针。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.5	2026-02-01 12:30:37.8
18340a97-423a-4fd5-9cab-2dc8505552ca	多维动态数组	补全代码，创建二维动态数组	HARD	1-13		\N	\N	20	8	t	FILL_BLANK	{"code": "int rows = 3, cols = 4;\\nint **matrix = new int*[rows];\\nfor (int i = 0; i < rows; i++) {\\n    matrix[i] = new int[cols];\\n}\\n// 使用矩阵\\n// 释放内存\\nfor (int i = 0; i < rows; i++) {\\n    delete[] matrix[i];\\n}\\ndelete[] matrix;", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "二维动态数组需要先分配行指针数组，再为每行分配列元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.505	2026-02-01 12:30:38.23
a5bf9bff-b681-4e4c-a90d-4e2518dffc71	动态数组编程	使用动态数组存储并排序用户输入的整数	MEDIUM	1-13	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cout << "请输入数组大小: ";\n    cin >> n;\n    \n    // 分配动态数组\n    // 输入数组元素\n    // 排序数组\n    // 打印排序后的数组\n    // 释放内存\n    \n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "使用new[]分配动态数组，输入元素后进行排序，打印结果后使用delete[]释放内存。", "expectedOutput": "排序后的数组元素"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.511	2026-02-01 12:30:38.709
6acd9dbd-0bfc-4be7-8e57-c9ffbe7a41f0	动态数组的综合应用	使用动态数组实现一个简单的多项式计算器	HARD	1-13	#include <iostream>\nusing namespace std;\n\nint main() {\n    int degree;\n    cout << "请输入多项式的次数: ";\n    cin >> degree;\n    \n    // 分配系数数组\n    // 输入系数\n    // 计算多项式在x=2处的值\n    // 打印结果\n    // 释放内存\n    \n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "使用动态数组存储多项式系数，计算并打印多项式在特定点的值。", "expectedOutput": "多项式在x=2处的值"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.515	2026-02-01 12:30:39.143
78cb79fb-36f0-4e6d-bf47-30b893ecbcb3	内存泄漏的基本概念	内存泄漏是什么？	EASY	1-13		\N	\N	20	1	t	MULTIPLE_CHOICE	{"options": ["分配的内存未释放", "释放的内存被再次使用", "指针指向无效内存", "内存被覆盖"], "explanation": "内存泄漏是指程序分配的内存空间在使用完毕后未被释放，导致内存资源浪费。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.522	2026-02-01 12:30:39.767
6ffd3513-205b-42ad-bec3-020fce5722dd	内存泄漏的危害	匹配内存泄漏危害与描述	MEDIUM	1-13		\N	\N	20	2	t	MATCHING	{"leftItems": ["内存使用增加", "程序性能下降", "系统资源耗尽", "程序崩溃"], "rightItems": ["未释放的内存不断积累", "内存分配和回收开销增加", "导致其他程序无法分配内存", "内存不足时可能崩溃"], "explanation": "内存泄漏的危害包括内存使用增加、程序性能下降、系统资源耗尽和程序崩溃等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.527	2026-02-01 12:30:40.191
b77f38e4-99b2-4875-a1a1-7c92a849c2fe	内存泄漏的避免方法	补全代码，避免内存泄漏	MEDIUM	1-13		\N	\N	20	3	t	FILL_BLANK	{"code": "void func() {\\n    int *ptr = new int(10);\\n    // 使用ptr\\n    {{blank}} ptr; // 避免内存泄漏\\n}", "blanks": [{"hint": "释放内存", "answer": "delete"}], "explanation": "使用完动态分配的内存后，必须使用delete或delete[]运算符释放，避免内存泄漏。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.532	2026-02-01 12:30:40.636
252163a7-99a3-467b-95ab-b001de033934	野指针的基本概念	野指针是什么？	EASY	1-13		\N	\N	20	4	t	MULTIPLE_CHOICE	{"options": ["指向无效内存地址的指针", "未初始化的指针", "已释放内存的指针", "以上都是"], "explanation": "野指针是指向无效内存地址的指针，包括未初始化的指针和已释放内存的指针。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.537	2026-02-01 12:30:41.054
5e0645ca-1aa8-4aec-86c2-46bccab606d1	悬垂指针	补全代码，避免悬垂指针	MEDIUM	1-13		\N	\N	20	7	t	FILL_BLANK	{"code": "int *ptr = new int(10);\\ndelete ptr;\\nptr = nullptr; // 避免悬垂指针\\n// 现在ptr是nullptr，使用前需要检查\\nif (ptr != nullptr) {\\n    *ptr = 20;\\n}", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "释放内存后，将指针设为nullptr，避免悬垂指针。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.55	2026-02-01 12:30:46.747
6d48b19f-81fc-40fc-a416-5a01271b785b	重复释放的危害	重复释放同一块内存会导致什么？	MEDIUM	1-13		\N	\N	20	8	t	MULTIPLE_CHOICE	{"options": ["未定义行为", "程序崩溃", "内存泄漏", "以上都是"], "explanation": "重复释放同一块内存会导致未定义行为，可能引起程序崩溃或其他问题。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.553	2026-02-01 12:30:47.234
5619ed3c-cfb5-4c59-b755-ba34d6daa04b	内存管理编程	修复代码中的内存管理问题	MEDIUM	1-13	#include <iostream>\nusing namespace std;\n\nvoid badFunc() {\n    int *ptr = new int[5];\n    // 使用ptr\n    // 缺少内存释放\n}\n\nint main() {\n    badFunc();\n    badFunc(); // 多次调用导致内存泄漏\n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "在badFunc函数中添加delete[] ptr;语句，释放动态分配的内存。", "expectedOutput": "修复后的代码，无内存泄漏"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.557	2026-02-01 12:30:47.758
947763dc-848a-46dd-a8c8-d858d2cfefd9	内存管理的综合应用	实现一个安全的动态内存管理函数	HARD	1-13	#include <iostream>\nusing namespace std;\n\n// 在这里实现一个函数，安全分配和释放内存\n\nint main() {\n    // 测试安全内存管理函数\n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "实现一个函数，处理内存分配失败的情况，并确保内存正确释放。", "expectedOutput": "安全分配和释放内存的演示"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.561	2026-02-01 12:30:48.624
5f0ed0fc-fe3e-4f7b-b52b-a9394ba51c81	动态内存管理的综合应用	以下哪种情况需要使用动态内存分配？	EASY	1-13		\N	\N	20	1	t	MULTIPLE_CHOICE	{"options": ["数组大小在运行时确定", "需要创建大量对象", "需要在函数间共享大型数据", "以上都是"], "explanation": "当数组大小在运行时确定、需要创建大量对象或需要在函数间共享大型数据时，需要使用动态内存分配。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.565	2026-02-01 12:30:49.472
ebdacf76-dda6-4f8d-8c8b-b52099a0bdc3	动态内存管理的最佳实践	匹配最佳实践与描述	MEDIUM	1-13		\N	\N	20	2	t	MATCHING	{"leftItems": ["使用智能指针", "及时释放内存", "避免野指针", "检查内存分配"], "rightItems": ["自动管理内存生命周期", "使用完内存后立即释放", "释放后将指针置为nullptr", "处理内存分配失败的情况"], "explanation": "动态内存管理的最佳实践包括使用智能指针、及时释放内存、避免野指针和检查内存分配等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.57	2026-02-01 12:30:49.898
dbd459ab-7880-435d-8b5c-b0e4fe1a9ec4	动态内存管理的常见错误	补全代码，修复常见的内存管理错误	MEDIUM	1-13		\N	\N	20	3	t	FILL_BLANK	{"code": "int *createArray(int size) {\\n    int *arr = new int[size];\\n    return arr;\\n}\\n\\nint main() {\\n    int *ptr = createArray(5);\\n    // 使用ptr\\n    {{blank}}[] ptr; // 释放内存，避免内存泄漏\\n    return 0;\\n}", "blanks": [{"hint": "释放数组内存", "answer": "delete"}], "explanation": "函数返回动态分配的内存时，调用者需要负责释放，避免内存泄漏。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.574	2026-02-01 12:30:50.464
00689fad-f1ff-44c0-8918-dfc719d19516	智能指针的概念	智能指针是什么？	HARD	1-13		\N	\N	20	4	t	MULTIPLE_CHOICE	{"options": ["自动管理内存的指针", "指向智能对象的指针", "智能地分配内存的指针", "以上都是"], "explanation": "智能指针是一种自动管理内存的指针，它会在适当的时候自动释放所指向的内存。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.577	2026-02-01 12:30:50.921
828b599b-258f-4b9f-b6cb-caf7e16ffa3b	unique_ptr的使用	补全代码，使用unique_ptr管理动态内存	HARD	1-13		\N	\N	20	5	t	FILL_BLANK	{"code": "#include <memory>\\n#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    unique_ptr<int> ptr = {{blank}} int(10);\\n    cout << *ptr << endl;\\n    // 无需手动释放内存\\n    return 0;\\n}", "blanks": [{"hint": "创建unique_ptr", "answer": "make_unique"}], "explanation": "make_unique是C++14引入的函数，用于创建unique_ptr，自动管理动态内存的释放。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.581	2026-02-01 12:30:51.429
0a8cefa6-a9c9-4485-8c98-fb4c47b11362	shared_ptr的使用	补全代码，使用shared_ptr管理动态内存	HARD	1-13		\N	\N	20	6	t	FILL_BLANK	{"code": "#include <memory>\\n#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    shared_ptr<int> ptr1 = {{blank}} int(10);\\n    shared_ptr<int> ptr2 = ptr1; // 引用计数增加\\n    cout << *ptr1 << \\" \\" << *ptr2 << endl;\\n    // 最后一个shared_ptr销毁时自动释放内存\\n    return 0;\\n}", "blanks": [{"hint": "创建shared_ptr", "answer": "make_shared"}], "explanation": "make_shared是C++11引入的函数，用于创建shared_ptr，通过引用计数自动管理动态内存的释放。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.584	2026-02-01 12:30:52.163
1011b2ee-299f-4e9d-8d6c-0806dd5daa73	综合编程挑战	使用动态内存分配实现一个简单的链表	HARD	1-13	#include <iostream>\nusing namespace std;\n\nstruct Node {\n    int data;\n    Node *next;\n};\n\n// 在这里实现链表的基本操作\n\nint main() {\n    // 测试链表操作\n    return 0;\n}	\N	\N	25	7	t	CODING	{"explanation": "使用动态内存分配实现链表的基本操作，包括创建节点、插入节点、删除节点和遍历链表。", "expectedOutput": "链表的创建、插入、删除和遍历"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.588	2026-02-01 12:30:52.584
3b2422c1-76bc-4b67-b817-c737b7b02165	动态内存管理的实际应用	实现一个简单的向量类，支持动态扩容	HARD	1-13	#include <iostream>\nusing namespace std;\n\nclass Vector {\nprivate:\n    int *data;\n    int size;\n    int capacity;\npublic:\n    Vector() : data(nullptr), size(0), capacity(0) {} \n    // 在这里实现构造函数、析构函数、push_back、pop_back等方法\n};\n\nint main() {\n    // 测试Vector类\n    return 0;\n}	\N	\N	25	8	t	CODING	{"explanation": "实现一个简单的向量类，使用动态内存分配存储元素，支持动态扩容。", "expectedOutput": "向量的创建、添加元素、删除元素和遍历"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.591	2026-02-01 12:30:53.001
1c505285-707f-402b-8e9e-17586226e111	动态内存管理的终极挑战	实现一个简单的内存池	HARD	1-13	#include <iostream>\nusing namespace std;\n\nclass MemoryPool {\nprivate:\n    char *pool;\n    int size;\n    int next;\npublic:\n    MemoryPool(int poolSize) : size(poolSize), next(0) {\n        pool = new char[size];\n    }\n    \n    // 在这里实现分配和释放方法\n    \n    ~MemoryPool() {\n        delete[] pool;\n    }\n};\n\nint main() {\n    // 测试内存池\n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "实现一个简单的内存池，管理一块连续的内存，提供分配和释放方法，提高内存分配效率。", "expectedOutput": "内存池的分配和释放操作"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.598	2026-02-01 12:30:53.847
0470b40a-9749-457c-b38d-573f1a9abecb	STL的基本概念	STL是什么的缩写？	EASY	1-11		\N	\N	15	1	t	MULTIPLE_CHOICE	{"options": ["Standard Template Library", "Standard Type Library", "Standard Tool Library", "Standard Test Library"], "explanation": "STL是Standard Template Library的缩写，即标准模板库。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.602	2026-02-01 12:30:54.328
131ceece-eb70-4dae-833b-dc61bb04ac03	STL的组成部分	匹配STL组件与描述	MEDIUM	1-11		\N	\N	15	2	t	MATCHING	{"leftItems": ["容器", "迭代器", "算法", "函数对象"], "rightItems": ["存储数据的对象", "用于遍历容器的对象", "操作容器元素的函数", "可调用的对象"], "explanation": "STL主要由容器、迭代器、算法和函数对象组成。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.607	2026-02-01 12:30:55.182
808b5fba-bebb-4938-b357-7020c9fbedd7	STL的优势	STL的优势是什么？	EASY	1-11		\N	\N	15	3	t	MULTIPLE_CHOICE	{"options": ["代码复用", "高效实现", "标准化", "以上都是"], "explanation": "STL的优势包括代码复用、高效实现和标准化等。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.611	2026-02-01 12:30:55.734
27e12da6-baec-4868-81fa-018e72906fa5	STL的头文件	补全代码，包含vector容器的头文件	MEDIUM	1-11		\N	\N	15	4	t	FILL_BLANK	{"code": "#include <{{blank}}>", "blanks": [{"hint": "vector容器头文件", "answer": "vector"}], "explanation": "使用vector容器需要包含<vector>头文件。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.615	2026-02-01 12:30:56.446
8dfcb3ad-0f66-478b-95f7-4322bd92b0e2	命名空间	STL组件位于哪个命名空间？	EASY	1-11		\N	\N	15	5	t	MULTIPLE_CHOICE	{"options": ["std", "stl", "container", "algorithm"], "explanation": "STL组件位于std命名空间中。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.619	2026-02-01 12:30:57.607
75cff102-b34a-4468-bcc5-2c762f9daed2	模板的概念	补全代码，定义一个简单的模板函数	MEDIUM	1-11		\N	\N	15	6	t	FILL_BLANK	{"code": "template <typename T>\\nT max(T a, T b) {\\n    return a > b ? a : b;\\n}", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "模板允许我们编写通用的代码，适用于不同的数据类型。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.622	2026-02-01 12:30:58.028
0ced41c1-042d-402c-9869-0aa1864fe1f1	STL的设计理念	匹配STL设计理念与描述	MEDIUM	1-11		\N	\N	15	7	t	MATCHING	{"leftItems": ["泛型编程", "组件分离", "算法与数据结构分离", "高效实现"], "rightItems": ["使用模板实现通用代码", "将不同功能的组件分离", "算法不依赖于具体的容器实现", "注重性能优化"], "explanation": "STL的设计理念包括泛型编程、组件分离、算法与数据结构分离和高效实现等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.626	2026-02-01 12:30:58.452
def26c17-7ab9-4f89-97f2-7db5515ad4f7	STL的版本	C++11对STL做了哪些改进？	EASY	1-11		\N	\N	15	8	t	MULTIPLE_CHOICE	{"options": ["添加了新容器", "改进了现有容器", "添加了Lambda表达式", "以上都是"], "explanation": "C++11对STL做了很多改进，包括添加新容器、改进现有容器和添加Lambda表达式等。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.63	2026-02-01 12:30:58.873
dfa0d7c2-8b65-47a6-9652-1fbfdb08cfe9	STL的应用场景	补全代码，使用vector存储整数	MEDIUM	1-11		\N	\N	15	9	t	FILL_BLANK	{"code": "#include <vector>\\n#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    vector<int> v = {1, 2, 3, 4, 5};\\n    for (int i = 0; i < v.size(); i++) {\\n        cout << v[{{blank}}] << \\" \\";\\n    }\\n    return 0;\\n}", "blanks": [{"hint": "索引", "answer": "i"}], "explanation": "vector是STL中最常用的容器之一，用于存储同类型的元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.634	2026-02-01 12:30:59.83
e72293f2-0afc-45c8-9012-5d8fae8b5d35	STL概念编程	使用STL的vector容器存储用户输入的整数并排序	MEDIUM	1-11	#include <vector>\n#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> v;\n    int n, num;\n    cout << "请输入元素个数: ";\n    cin >> n;\n    \n    // 输入元素\n    // 排序\n    // 打印元素\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用vector容器存储元素，使用sort算法排序。", "expectedOutput": "排序后的元素"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.637	2026-02-01 12:31:00.342
1960f9d6-9849-4140-891f-2b8c2d6c60c7	vector容器	vector容器的特点是什么？	EASY	1-11		\N	\N	15	1	t	MULTIPLE_CHOICE	{"options": ["动态大小", "随机访问", "尾部插入删除高效", "以上都是"], "explanation": "vector容器的特点包括动态大小、随机访问和尾部插入删除高效等。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.641	2026-02-01 12:31:00.76
ba836ba4-9577-45c2-96ab-6b2030b610fe	vector的基本操作	补全代码，使用vector的基本操作	MEDIUM	1-11		\N	\N	15	2	t	FILL_BLANK	{"code": "vector<int> v;\\nv.{{blank}}(1); // 添加元素\\nv.{{blank}}(2); // 添加元素\\nv.{{blank}}(0); // 删除最后一个元素\\ncout << v.size(); // 输出大小", "blanks": [{"hint": "添加元素", "answer": "push_back"}, {"hint": "添加元素", "answer": "push_back"}, {"hint": "删除元素", "answer": "pop_back"}], "explanation": "push_back用于向vector尾部添加元素，pop_back用于删除尾部元素，size用于获取vector的大小。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.646	2026-02-01 12:31:01.188
2b2b6f44-b2b1-4fb3-a9df-019975c4146f	list容器	list容器的特点是什么？	MEDIUM	1-11		\N	\N	15	3	t	MULTIPLE_CHOICE	{"options": ["双向链表", "任意位置插入删除高效", "不支持随机访问", "以上都是"], "explanation": "list容器是双向链表，支持任意位置插入删除高效，但不支持随机访问。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.651	2026-02-01 12:31:02.055
f942a697-a8d1-4e44-9fbd-9de58533fa84	queue容器	补全代码，使用queue的基本操作	MEDIUM	1-11		\N	\N	15	6	t	FILL_BLANK	{"code": "queue<int> q;\\nq.{{blank}}(1); // 入队\\nq.{{blank}}(2); // 入队\\ncout << q.{{blank}}(); // 查看队首元素\\nq.{{blank}}(); // 出队\\ncout << q.size(); // 输出大小", "blanks": [{"hint": "入队", "answer": "push"}, {"hint": "入队", "answer": "push"}, {"hint": "查看队首", "answer": "front"}, {"hint": "出队", "answer": "pop"}], "explanation": "queue是先进先出(FIFO)容器，push用于入队，pop用于出队，front用于查看队首元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.664	2026-02-01 12:31:04.13
fb022f95-fd74-4b98-a571-e4612515d116	priority_queue容器	priority_queue容器的特点是什么？	MEDIUM	1-11		\N	\N	15	7	t	MULTIPLE_CHOICE	{"options": ["优先队列", "自动排序", "默认最大堆", "以上都是"], "explanation": "priority_queue是优先队列，会自动排序，默认是最大堆。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.668	2026-02-01 12:31:05.16
de4e1b2a-4921-435c-b15d-0a414478c488	map容器	map容器的特点是什么？	MEDIUM	1-11		\N	\N	15	8	t	MULTIPLE_CHOICE	{"options": ["键值对", "自动排序", "基于红黑树", "以上都是"], "explanation": "map容器存储键值对，会自动按键排序，基于红黑树实现。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.673	2026-02-01 12:31:05.59
3eb3e02f-aaec-44ed-9522-ea620325e1a3	set容器	补全代码，使用set的基本操作	MEDIUM	1-11		\N	\N	15	9	t	FILL_BLANK	{"code": "set<int> s;\\ns.{{blank}}(1); // 插入元素\\ns.{{blank}}(2); // 插入元素\\ns.{{blank}}(1); // 插入重复元素（会被忽略）\\ncout << s.size(); // 输出大小", "blanks": [{"hint": "插入元素", "answer": "insert"}, {"hint": "插入元素", "answer": "insert"}, {"hint": "插入元素", "answer": "insert"}], "explanation": "set容器存储唯一元素，会自动排序，insert用于插入元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.677	2026-02-01 12:31:07.919
a5742fb4-f374-41cd-964a-3e226350157c	容器编程	使用不同的STL容器解决问题	MEDIUM	1-11	#include <iostream>\n#include <vector>\n#include <stack>\n#include <queue>\n#include <set>\n#include <map>\nusing namespace std;\n\nint main() {\n    // 使用vector存储整数\n    // 使用stack实现括号匹配\n    // 使用queue模拟队列操作\n    // 使用set存储唯一元素\n    // 使用map存储键值对\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用不同的STL容器实现各种操作。", "expectedOutput": "各种容器的操作结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.681	2026-02-01 12:31:09.352
11273681-7754-49c1-bcf9-9d6b44a33482	迭代器的基本概念	迭代器是什么？	EASY	1-11		\N	\N	20	1	t	MULTIPLE_CHOICE	{"options": ["用于遍历容器的对象", "用于修改容器的对象", "用于创建容器的对象", "用于销毁容器的对象"], "explanation": "迭代器是用于遍历容器元素的对象，提供了类似指针的接口。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.686	2026-02-01 12:31:09.989
16ac9ead-7372-44bc-829f-cf05b6da2b4a	迭代器的基本操作	补全代码，使用迭代器遍历vector	MEDIUM	1-11		\N	\N	20	3	t	FILL_BLANK	{"code": "vector<int> v = {1, 2, 3, 4, 5};\\nfor (vector<int>::{{blank}} it = v.begin(); it != v.end(); ++it) {\\n    cout << *it << \\" \\";\\n}", "blanks": [{"hint": "迭代器类型", "answer": "iterator"}], "explanation": "使用迭代器遍历容器，begin()返回指向第一个元素的迭代器，end()返回指向最后一个元素之后的迭代器。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.695	2026-02-01 12:31:10.891
40742eaa-e779-467b-a512-88c4881db6a6	const迭代器	补全代码，使用const迭代器	MEDIUM	1-11		\N	\N	20	4	t	FILL_BLANK	{"code": "const vector<int> v = {1, 2, 3, 4, 5};\\nfor (vector<int>::{{blank}} it = v.begin(); it != v.end(); ++it) {\\n    cout << *it << \\" \\";\\n}", "blanks": [{"hint": "常量迭代器类型", "answer": "const_iterator"}], "explanation": "const迭代器用于遍历const容器，只能读取元素，不能修改元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.699	2026-02-01 12:31:11.348
e50b420d-5b09-451f-bd04-815b4d21bd8b	反向迭代器	补全代码，使用反向迭代器	MEDIUM	1-11		\N	\N	20	5	t	FILL_BLANK	{"code": "vector<int> v = {1, 2, 3, 4, 5};\\nfor (vector<int>::{{blank}} it = v.rbegin(); it != v.rend(); ++it) {\\n    cout << *it << \\" \\";\\n}", "blanks": [{"hint": "反向迭代器类型", "answer": "reverse_iterator"}], "explanation": "反向迭代器用于反向遍历容器，rbegin()返回指向最后一个元素的反向迭代器，rend()返回指向第一个元素之前的反向迭代器。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.703	2026-02-01 12:31:11.875
4855fadf-f8f1-4ce6-a3a6-21329df974a2	迭代器的算术运算	哪些迭代器支持算术运算？	MEDIUM	1-11		\N	\N	20	6	t	MULTIPLE_CHOICE	{"options": ["随机访问迭代器", "双向迭代器", "前向迭代器", "输入迭代器"], "explanation": "只有随机访问迭代器支持算术运算，如+、-、+=、-=等。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.707	2026-02-01 12:31:12.777
8dac4897-e227-4256-828d-3a2ad5e82808	迭代器的比较运算	匹配迭代器类型与支持的比较运算	MEDIUM	1-11		\N	\N	20	7	t	MATCHING	{"leftItems": ["输入迭代器", "前向迭代器", "双向迭代器", "随机访问迭代器"], "rightItems": ["==, !=", "==, !=", "==, !=, <, <=, >, >=", "==, !=, <, <=, >, >="], "explanation": "不同类型的迭代器支持不同的比较运算。", "correctPairs": [[0, 0], [1, 0], [2, 2], [3, 2]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.711	2026-02-01 12:31:13.667
c697376a-48a4-425e-9b63-d7f6ae19fa86	迭代器失效	以下哪种操作可能导致vector的迭代器失效？	HARD	1-11		\N	\N	20	8	t	MULTIPLE_CHOICE	{"options": ["push_back", "insert", "erase", "以上都是"], "explanation": "在vector中，push_back、insert和erase操作都可能导致迭代器失效。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.716	2026-02-01 12:31:14.581
4871a0cd-6919-4d06-95d8-6a7afdd53235	迭代器的综合应用	使用迭代器实现自定义算法	HARD	1-11	#include <iostream>\n#include <vector>\nusing namespace std;\n\n// 在这里实现一个函数，使用迭代器计算容器元素的和\n\nint main() {\n    vector<int> v = {1, 2, 3, 4, 5};\n    cout << "Sum: " << sum(v.begin(), v.end()) << endl;\n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "使用迭代器实现一个通用的求和函数，可以用于不同类型的容器。", "expectedOutput": "容器元素的和"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.724	2026-02-01 12:31:15.546
135061fd-e618-4199-b004-63e52e688125	STL算法的头文件	补全代码，包含算法头文件	EASY	1-11		\N	\N	20	1	t	FILL_BLANK	{"code": "#include <{{blank}}>", "blanks": [{"hint": "算法头文件", "answer": "algorithm"}], "explanation": "使用STL算法需要包含<algorithm>头文件。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.729	2026-02-01 12:31:16.073
dcc376b1-0058-44a8-bfe2-5353947677d6	排序算法	补全代码，使用sort算法排序	MEDIUM	1-11		\N	\N	20	2	t	FILL_BLANK	{"code": "vector<int> v = {5, 2, 8, 1, 9};\\n{{blank}}(v.begin(), v.end());\\nfor (int num : v) {\\n    cout << num << \\" \\";\\n}", "blanks": [{"hint": "排序函数", "answer": "sort"}], "explanation": "sort算法用于对容器元素进行排序，默认是升序排序。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.732	2026-02-01 12:31:17.346
10d12859-a942-4b86-be31-313bb3977db9	查找算法	补全代码，使用find算法查找元素	MEDIUM	1-11		\N	\N	20	3	t	FILL_BLANK	{"code": "vector<int> v = {1, 2, 3, 4, 5};\\nauto it = {{blank}}(v.begin(), v.end(), 3);\\nif (it != v.end()) {\\n    cout << \\"Found at position: \\" << it - v.begin() << endl;\\n} else {\\n    cout << \\"Not found\\" << endl;\\n}", "blanks": [{"hint": "查找函数", "answer": "find"}], "explanation": "find算法用于在容器中查找指定元素，返回指向该元素的迭代器，如果没找到返回end()。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.736	2026-02-01 12:31:17.881
4e31b356-1f44-47c0-a3d1-96aad68dcf3d	计数算法	补全代码，使用count算法计数	MEDIUM	1-11		\N	\N	20	4	t	FILL_BLANK	{"code": "vector<int> v = {1, 2, 2, 3, 2};\\nint count = {{blank}}(v.begin(), v.end(), 2);\\ncout << \\"Count of 2: \\" << count << endl;", "blanks": [{"hint": "计数函数", "answer": "count"}], "explanation": "count算法用于统计容器中指定元素的出现次数。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.741	2026-02-01 12:31:18.415
e107643e-6f8b-4389-9283-dd5c8cd7fd9a	最大值最小值算法	补全代码，使用max_element和min_element算法	MEDIUM	1-11		\N	\N	20	5	t	FILL_BLANK	{"code": "vector<int> v = {5, 2, 8, 1, 9};\\nauto max_it = {{blank}}(v.begin(), v.end());\\nauto min_it = {{blank}}(v.begin(), v.end());\\ncout << \\"Max: \\" << *max_it << endl;\\ncout << \\"Min: \\" << *min_it << endl;", "blanks": [{"hint": "最大值函数", "answer": "max_element"}, {"hint": "最小值函数", "answer": "min_element"}], "explanation": "max_element算法用于查找容器中的最大值，min_element算法用于查找容器中的最小值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.745	2026-02-01 12:31:19.409
a14d0538-f31e-4a8c-99e3-213e7d2cd76e	填充算法	补全代码，使用fill算法填充容器	MEDIUM	1-11		\N	\N	20	6	t	FILL_BLANK	{"code": "vector<int> v(5);\\n{{blank}}(v.begin(), v.end(), 10);\\nfor (int num : v) {\\n    cout << num << \\" \\";\\n}", "blanks": [{"hint": "填充函数", "answer": "fill"}], "explanation": "fill算法用于将容器中的元素填充为指定值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.749	2026-02-01 12:31:19.846
ccc3411b-327d-46d0-b916-447bc5a9e517	复制算法	补全代码，使用copy算法复制容器	MEDIUM	1-11		\N	\N	20	7	t	FILL_BLANK	{"code": "vector<int> v1 = {1, 2, 3, 4, 5};\\nvector<int> v2(v1.size());\\n{{blank}}(v1.begin(), v1.end(), v2.begin());\\nfor (int num : v2) {\\n    cout << num << \\" \\";\\n}", "blanks": [{"hint": "复制函数", "answer": "copy"}], "explanation": "copy算法用于将一个容器的元素复制到另一个容器。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.754	2026-02-01 12:31:20.274
892e535a-263e-4540-b34b-eb7add06a3e8	变换算法	补全代码，使用transform算法变换容器	HARD	1-11		\N	\N	20	8	t	FILL_BLANK	{"code": "vector<int> v1 = {1, 2, 3, 4, 5};\\nvector<int> v2(v1.size());\\n{{blank}}(v1.begin(), v1.end(), v2.begin(), [](int x) { return x * 2; });\\nfor (int num : v2) {\\n    cout << num << \\" \\";\\n}", "blanks": [{"hint": "变换函数", "answer": "transform"}], "explanation": "transform算法用于对容器中的元素进行变换，将结果存储到另一个容器。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.758	2026-02-01 12:31:21.14
8c6505b8-d172-42c1-8add-7609cb169678	算法编程	使用STL算法解决问题	MEDIUM	1-11	#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> v = {5, 2, 8, 1, 9, 3, 7, 4, 6};\n    \n    // 排序\n    // 查找元素\n    // 统计元素出现次数\n    // 计算最大值和最小值\n    // 反转容器\n    \n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "使用不同的STL算法解决问题。", "expectedOutput": "各种算法的执行结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.763	2026-02-01 12:31:22.015
a6447200-bf4c-43e4-b837-25e6ca5fb533	算法的综合应用	使用STL算法实现一个简单的学生管理系统	HARD	1-11	#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nstruct Student {\n    string name;\n    int score;\n};\n\nint main() {\n    vector<Student> students;\n    // 添加学生信息\n    // 按分数排序\n    // 查找指定学生\n    // 计算平均分数\n    \n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "使用STL算法实现学生管理系统的各种功能。", "expectedOutput": "学生管理系统的各种操作结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.767	2026-02-01 12:31:22.435
938d841f-b011-4a69-9ea0-21cd632407ab	STL的综合应用	以下哪种容器最适合频繁插入删除操作？	EASY	1-11		\N	\N	20	1	t	MULTIPLE_CHOICE	{"options": ["vector", "list", "deque", "array"], "explanation": "list容器是双向链表，适合频繁插入删除操作。", "correctIndex": 1}	EXERCISE_LIBRARY	2026-01-30 16:29:56.771	2026-02-01 12:31:22.982
6dbda6db-84e8-44e6-9e4d-9676c88a6e91	容器的选择	匹配场景与最适合的容器	MEDIUM	1-11		\N	\N	20	2	t	MATCHING	{"leftItems": ["需要随机访问", "需要频繁插入删除", "需要键值对", "需要先进先出"], "rightItems": ["vector", "list", "map", "queue"], "explanation": "根据不同的场景选择最适合的容器。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.775	2026-02-01 12:31:23.414
b55bc677-70a8-4685-9764-40948e6b45c3	Lambda表达式	补全代码，使用Lambda表达式	HARD	1-11		\N	\N	20	4	t	FILL_BLANK	{"code": "vector<int> v = {5, 2, 8, 1, 9};\\nsort(v.begin(), v.end(), [](int a, int b) {\\n    return a {{blank}} b; // 降序排序\\n});", "blanks": [{"hint": "大于运算符", "answer": ">"}], "explanation": "Lambda表达式是C++11引入的匿名函数，可以用于简化代码，特别是作为算法的谓词。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.783	2026-02-01 12:31:24.482
6f5a9576-14eb-4d93-a45a-2de7e774e738	STL的性能考虑	以下哪种操作在vector中效率最低？	HARD	1-11		\N	\N	20	5	t	MULTIPLE_CHOICE	{"options": ["尾部插入", "尾部删除", "中间插入", "随机访问"], "explanation": "在vector中，中间插入需要移动元素，效率最低。", "correctIndex": 2}	EXERCISE_LIBRARY	2026-01-30 16:29:56.786	2026-02-01 12:31:24.982
e6f4b950-b8d2-471c-b57c-060b35b83ac5	STL的异常处理	补全代码，处理STL的异常	HARD	1-11		\N	\N	20	6	t	FILL_BLANK	{"code": "try {\\n    vector<int> v;\\n    v.reserve(1000000000); // 尝试分配大量内存\\n} catch (const {{blank}}& e) {\\n    cout << \\"Exception: \\" << e.what() << endl;\\n}", "blanks": [{"hint": "内存分配异常", "answer": "bad_alloc"}], "explanation": "STL在内存分配失败时会抛出bad_alloc异常，需要适当处理。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.789	2026-02-01 12:31:25.401
808c2f8c-aaf3-41f0-8e3d-27c14ed2260c	综合编程挑战	使用STL实现一个简单的词频统计程序	HARD	1-11	#include <iostream>\n#include <string>\n#include <map>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<string> words = {"hello", "world", "hello", "cpp", "world", "hello"};\n    map<string, int> wordCount;\n    \n    // 统计词频\n    // 按词频排序\n    // 打印结果\n    \n    return 0;\n}	\N	\N	25	7	t	CODING	{"explanation": "使用map统计词频，使用vector和sort算法按词频排序。", "expectedOutput": "词频统计结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.793	2026-02-01 12:31:25.9
9bade3b7-06f8-4a92-9330-69bb25eb4832	STL的高级应用	使用STL实现一个简单的图结构	HARD	1-11	#include <iostream>\n#include <vector>\n#include <map>\n#include <queue>\nusing namespace std;\n\nclass Graph {\nprivate:\n    map<int, vector<int>> adjList;\npublic:\n    // 添加边\n    // 广度优先搜索\n    // 深度优先搜索\n};\n\nint main() {\n    Graph g;\n    // 构建图\n    // 遍历图\n    \n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "使用map存储邻接表，使用queue实现广度优先搜索，使用递归实现深度优先搜索。", "expectedOutput": "图的遍历结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.799	2026-02-01 12:31:26.85
5b607c57-0f40-4b9f-81b2-63021699dcb1	STL的终极挑战	使用STL实现一个简单的文本编辑器	HARD	1-11	#include <iostream>\n#include <string>\n#include <vector>\n#include <stack>\nusing namespace std;\n\nclass TextEditor {\nprivate:\n    vector<string> lines;\n    stack<string> undoStack;\npublic:\n    // 添加行\n    // 删除行\n    // 编辑行\n    // 撤销操作\n    // 显示文本\n};\n\nint main() {\n    TextEditor editor;\n    // 测试文本编辑器\n    \n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "使用vector存储文本行，使用stack实现撤销操作。", "expectedOutput": "文本编辑器的各种操作结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.803	2026-02-01 12:31:27.288
e5df045f-16aa-4bf4-94e6-53fcf12c512f	文件操作的基本概念	文件是什么？	EASY	1-14		\N	\N	15	1	t	MULTIPLE_CHOICE	{"options": ["存储在磁盘上的一组相关数据", "内存中的临时数据", "CPU中的寄存器数据", "网络传输的数据"], "explanation": "文件是存储在磁盘等外部存储设备上的一组相关数据的集合。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.807	2026-02-01 12:31:28.653
20ee5e9c-6e3e-41be-9344-86c854404723	文件的分类	匹配文件类型与描述	MEDIUM	1-14		\N	\N	15	2	t	MATCHING	{"leftItems": ["文本文件", "二进制文件", "文本文件", "二进制文件"], "rightItems": ["以字符形式存储", "以二进制形式存储", "可直接阅读", "需要特定程序解析"], "explanation": "文本文件以字符形式存储，可直接阅读；二进制文件以二进制形式存储，需要特定程序解析。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.811	2026-02-01 12:31:29.083
e14ecfcc-77de-4d17-8577-e77d7b351c48	文件操作的基本步骤	文件操作的基本步骤是：打开文件 → {{blank}}文件 → 关闭文件	EASY	1-14		\N	\N	15	3	t	FILL_BLANK	{"code": "// 文件操作的基本步骤是：打开文件 → {{blank}}文件 → 关闭文件", "blanks": [{"hint": "文件操作步骤", "answer": "读写"}], "explanation": "文件操作的基本步骤是：打开文件 → 读写文件 → 关闭文件。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.814	2026-02-01 12:31:29.511
bf32c4a4-438e-47f1-999a-6c8a90686652	文件流的概念	文件流是什么？	EASY	1-14		\N	\N	15	4	t	MULTIPLE_CHOICE	{"options": ["数据在内存和文件之间传输的通道", "文件的大小", "文件的权限", "文件的路径"], "explanation": "文件流是数据在内存和文件之间传输的通道，用于实现文件的读写操作。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.818	2026-02-01 12:31:29.936
177a445c-5421-42e0-86a0-3d8ebe6eef4f	C++中的文件流类	匹配文件流类与功能	MEDIUM	1-14		\N	\N	15	5	t	MATCHING	{"leftItems": ["ifstream", "ofstream", "fstream"], "rightItems": ["输入文件流，用于读取文件", "输出文件流，用于写入文件", "输入输出文件流，用于读写文件"], "explanation": "C++中，ifstream用于读取文件，ofstream用于写入文件，fstream用于读写文件。", "correctPairs": [[0, 0], [1, 1], [2, 2]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.822	2026-02-01 12:31:30.447
5abbbce4-e88c-47a9-b2ca-ee22fd161581	文件操作的头文件	补全代码，包含文件操作的头文件	EASY	1-14		\N	\N	15	6	t	FILL_BLANK	{"code": "#include <{{blank}}>", "blanks": [{"hint": "文件流头文件", "answer": "fstream"}], "explanation": "使用C++的文件流需要包含<fstream>头文件。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.825	2026-02-01 12:31:30.982
d392df6d-3aec-4a74-900a-770c8a433372	文件路径	补全代码，指定文件路径	MEDIUM	1-14		\N	\N	15	8	t	FILL_BLANK	{"code": "ifstream file(\\"{{blank}}\\");", "blanks": [{"hint": "文件路径", "answer": "data.txt"}], "explanation": "文件路径可以是相对路径或绝对路径，指定文件的位置。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.832	2026-02-01 12:31:32.328
3d1e2486-151b-45cf-abf1-700bd000a527	文件操作的异常处理	文件打开失败时，应该怎么做？	MEDIUM	1-14		\N	\N	15	9	t	MULTIPLE_CHOICE	{"options": ["检查文件流状态", "忽略错误", "程序崩溃", "以上都不对"], "explanation": "文件打开失败时，应该检查文件流状态，进行适当的错误处理。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.835	2026-02-01 12:31:32.898
a15df93d-7861-45c5-a290-aa03ea8961b4	文件的打开方式	补全代码，打开文件进行读取	EASY	1-14		\N	\N	15	1	t	FILL_BLANK	{"code": "ifstream file(\\"data.txt\\", {{blank}});", "blanks": [{"hint": "读取模式", "answer": "ios::in"}], "explanation": "使用ios::in模式打开文件进行读取。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.841	2026-02-01 12:31:35.687
3aac5520-ec6e-41a7-b204-803ab416e0ca	文件的关闭	补全代码，关闭文件	EASY	1-14		\N	\N	15	2	t	FILL_BLANK	{"code": "ifstream file(\\"data.txt\\");\\n// 使用文件\\n{{blank}}; // 关闭文件", "blanks": [{"hint": "关闭文件", "answer": "file.close()"}], "explanation": "使用close()方法关闭文件，释放文件资源。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.845	2026-02-01 12:31:37.241
916083ad-99e9-4080-8f09-b44362f25e62	文件打开模式的组合	补全代码，以读写模式打开文件	MEDIUM	1-14		\N	\N	15	3	t	FILL_BLANK	{"code": "fstream file(\\"data.txt\\", {{blank}} | {{blank}});", "blanks": [{"hint": "读取模式", "answer": "ios::in"}, {"hint": "写入模式", "answer": "ios::out"}], "explanation": "使用位运算符|组合多个文件打开模式。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.848	2026-02-01 12:31:38.847
ee8d840f-d5b1-47e6-b086-c80edab77d02	文件打开状态的检查	如何检查文件是否打开成功？	MEDIUM	1-14		\N	\N	15	4	t	MULTIPLE_CHOICE	{"options": ["使用!运算符检查文件流", "使用is_open()方法", "以上都是", "以上都不是"], "explanation": "可以使用!运算符或is_open()方法检查文件是否打开成功。", "correctIndex": 2}	EXERCISE_LIBRARY	2026-01-30 16:29:56.851	2026-02-01 12:31:39.359
f622db2c-7463-4db3-909d-75ded3d31b74	文件打开失败的原因	匹配失败原因与描述	MEDIUM	1-14		\N	\N	15	5	t	MATCHING	{"leftItems": ["文件不存在", "权限不足", "路径错误", "文件被占用"], "rightItems": ["指定的文件不存在", "没有访问文件的权限", "文件路径不正确", "文件正在被其他程序使用"], "explanation": "文件打开失败的原因包括文件不存在、权限不足、路径错误和文件被占用等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.854	2026-02-01 12:31:40.189
8be79067-6042-4b8a-aad1-83ade3314a2f	二进制文件的打开	补全代码，以二进制模式打开文件	MEDIUM	1-14		\N	\N	15	6	t	FILL_BLANK	{"code": "ifstream file(\\"data.bin\\", {{blank}} | {{blank}});", "blanks": [{"hint": "读取模式", "answer": "ios::in"}, {"hint": "二进制模式", "answer": "ios::binary"}], "explanation": "使用ios::binary模式打开二进制文件。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.858	2026-02-01 12:31:40.783
71927a1c-f23d-4e96-a1cc-c60d0a7e8dee	文件的自动关闭	文件流对象销毁时，会自动关闭文件吗？	MEDIUM	1-14		\N	\N	15	7	t	MULTIPLE_CHOICE	{"options": ["会", "不会", "取决于编译器", "取决于文件大小"], "explanation": "文件流对象销毁时，会自动调用close()方法关闭文件。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.861	2026-02-01 12:31:41.463
1d84239c-f464-4c5b-b5a7-e53c4627ad93	文件打开模式的优先级	补全代码，以追加模式打开文件	HARD	1-14		\N	\N	15	8	t	FILL_BLANK	{"code": "ofstream file(\\"data.txt\\", {{blank}} | {{blank}});", "blanks": [{"hint": "写入模式", "answer": "ios::out"}, {"hint": "追加模式", "answer": "ios::app"}], "explanation": "以追加模式打开文件时，新写入的数据会添加到文件末尾。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.864	2026-02-01 12:31:41.974
e887801b-49bb-42e6-bdb1-449dd5095b49	文件打开与关闭编程	打开文件进行读写操作	MEDIUM	1-14	#include <iostream>\n#include <fstream>\nusing namespace std;\n\nint main() {\n    // 打开文件进行写入\n    // 写入数据\n    // 关闭文件\n    // 打开文件进行读取\n    // 读取数据\n    // 关闭文件\n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "使用ofstream打开文件进行写入，使用ifstream打开文件进行读取。", "expectedOutput": "写入和读取的数据"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.867	2026-02-01 12:31:42.395
85e62c7e-a392-4080-9033-3012a1842262	文件打开与关闭的综合应用	实现一个函数，检查文件是否存在	HARD	1-14	#include <iostream>\n#include <fstream>\nusing namespace std;\n\nbool fileExists(const string &filename) {\n    // 检查文件是否存在\n}\n\nint main() {\n    string filename = "data.txt";\n    if (fileExists(filename)) {\n        cout << "文件存在" << endl;\n    } else {\n        cout << "文件不存在" << endl;\n    }\n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用ifstream尝试打开文件，检查是否成功打开来判断文件是否存在。", "expectedOutput": "文件存在或不存在的信息"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.87	2026-02-01 12:31:42.909
a8ce627b-ddbf-41e4-ae58-e4d38933b8ae	文本文件的读取	补全代码，读取文本文件	MEDIUM	1-14		\N	\N	20	1	t	FILL_BLANK	{"code": "ifstream file(\\"data.txt\\");\\nstring line;\\nwhile ({{blank}}) {\\n    getline(file, line);\\n    cout << line << endl;\\n}\\nfile.close();", "blanks": [{"hint": "读取一行", "answer": "getline(file, line)"}], "explanation": "使用getline()函数读取文本文件的一行数据。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.874	2026-02-01 12:31:43.338
0d192d35-1503-4fc7-83b2-6a01bca360f9	文本文件的写入	补全代码，写入文本文件	MEDIUM	1-14		\N	\N	20	2	t	FILL_BLANK	{"code": "ofstream file(\\"data.txt\\");\\nfile << \\"Hello, World!\\" << endl;\\nfile << \\"Welcome to C++ file operations.\\" << endl;\\n{{blank}};", "blanks": [{"hint": "关闭文件", "answer": "file.close()"}], "explanation": "使用<<运算符向文本文件写入数据。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.877	2026-02-01 12:31:43.761
7bf2334e-9f99-407b-a58e-6869214e3be6	二进制文件的写入	补全代码，写入二进制文件	HARD	1-14		\N	\N	20	4	t	FILL_BLANK	{"code": "ofstream file(\\"data.bin\\", ios::out | ios::binary);\\nint num = 123;\\nfile.{{blank}}((char*)&num, sizeof(num));\\nfile.close();", "blanks": [{"hint": "写入二进制数据", "answer": "write"}], "explanation": "使用write()方法向二进制文件写入数据。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.883	2026-02-01 12:31:44.641
b819c7bf-8923-4904-a7b1-1607c8343c9e	文件指针的定位	补全代码，定位文件指针	MEDIUM	1-14		\N	\N	20	5	t	FILL_BLANK	{"code": "fstream file(\\"data.txt\\", ios::in | ios::out);\\nfile.{{blank}}(0, ios::end); // 定位到文件末尾\\nint size = file.tellg(); // 获取文件大小\\nfile.{{blank}}(0, ios::beg); // 定位到文件开头\\nfile.close();", "blanks": [{"hint": "定位输入指针", "answer": "seekg"}, {"hint": "定位输入指针", "answer": "seekg"}], "explanation": "使用seekg()方法定位输入文件指针，使用tellg()方法获取当前输入指针位置。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.887	2026-02-01 12:31:45.228
b44bff91-cb57-4473-a5e8-d2cbcb9dcbec	文件读写的错误处理	文件读写操作失败时，应该怎么做？	MEDIUM	1-14		\N	\N	20	6	t	MULTIPLE_CHOICE	{"options": ["检查文件流状态", "忽略错误", "程序崩溃", "以上都不对"], "explanation": "文件读写操作失败时，应该检查文件流状态，进行适当的错误处理。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.89	2026-02-01 12:31:45.827
145f7ede-4993-4444-990f-71efcb35b4ed	文件读写的效率	匹配读写方式与效率	MEDIUM	1-14		\N	\N	20	7	t	MATCHING	{"leftItems": ["文本文件读写", "二进制文件读写", "缓冲区读写", "直接读写"], "rightItems": ["效率较低", "效率较高", "效率较高", "效率较低"], "explanation": "二进制文件读写和缓冲区读写效率较高，文本文件读写和直接读写效率较低。", "correctPairs": [[0, 0], [1, 1], [2, 1], [3, 0]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.893	2026-02-01 12:31:46.78
680fb86f-1589-4961-9a62-e4c235ce50a3	文件读写的应用场景	以下哪种情况适合使用二进制文件？	MEDIUM	1-14		\N	\N	20	8	t	MULTIPLE_CHOICE	{"options": ["存储结构化数据", "存储文本内容", "存储配置文件", "存储日志"], "explanation": "二进制文件适合存储结构化数据，如图片、音频、视频等。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.897	2026-02-01 12:31:47.229
0b6f3645-fa2f-4e1e-ae96-e7a11def6101	文件读写编程	读取文本文件并统计行数和单词数	MEDIUM	1-14	#include <iostream>\n#include <fstream>\n#include <string>\n#include <sstream>\nusing namespace std;\n\nint main() {\n    ifstream file("data.txt");\n    if (!file) {\n        cout << "文件打开失败" << endl;\n        return 1;\n    }\n    \n    int lineCount = 0;\n    int wordCount = 0;\n    string line;\n    \n    // 统计行数和单词数\n    \n    cout << "行数: " << lineCount << endl;\n    cout << "单词数: " << wordCount << endl;\n    \n    file.close();\n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "使用getline()读取文件的每一行，使用stringstream统计每行的单词数。", "expectedOutput": "文件的行数和单词数"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.9	2026-02-01 12:31:47.753
3108ff57-ee6a-48d8-83f4-97dc9a0d9e4b	文件读写的综合应用	实现一个简单的文件复制功能	HARD	1-14	#include <iostream>\n#include <fstream>\nusing namespace std;\n\nbool copyFile(const string &source, const string &destination) {\n    // 实现文件复制功能\n}\n\nint main() {\n    string source = "source.txt";\n    string destination = "destination.txt";\n    if (copyFile(source, destination)) {\n        cout << "文件复制成功" << endl;\n    } else {\n        cout << "文件复制失败" << endl;\n    }\n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "使用ifstream读取源文件，使用ofstream写入目标文件，实现文件复制功能。", "expectedOutput": "文件复制成功或失败的信息"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.904	2026-02-01 12:32:05.256
8f963b30-430e-460c-adeb-bb364224c232	文本文件的特点	文本文件的特点是什么？	EASY	1-14		\N	\N	20	1	t	MULTIPLE_CHOICE	{"options": ["以字符形式存储", "可直接阅读", "每行以换行符结束", "以上都是"], "explanation": "文本文件以字符形式存储，可直接阅读，每行以换行符结束。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.907	2026-02-01 12:32:10.248
34d5206e-586a-48c3-b764-3f0ee7525871	文本文件的读取方式	匹配读取方式与函数	MEDIUM	1-14		\N	\N	20	2	t	MATCHING	{"leftItems": ["读取单个字符", "读取单个单词", "读取一行", "读取整个文件"], "rightItems": ["get()", ">>运算符", "getline()", "循环读取"], "explanation": "可以使用get()读取单个字符，>>运算符读取单个单词，getline()读取一行，循环读取整个文件。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.911	2026-02-01 12:32:10.691
d786ceaf-d2d2-4a87-bffd-86fde6d0feb5	文本文件的写入方式	补全代码，写入文本文件	MEDIUM	1-14		\N	\N	20	3	t	FILL_BLANK	{"code": "ofstream file(\\"data.txt\\");\\nfile << \\"Name: \\" << \\"Alice\\" << endl;\\nfile << \\"Age: \\" << 20 << endl;\\nfile << \\"Score: \\" << 95.5 << endl;\\n{{blank}};", "blanks": [{"hint": "关闭文件", "answer": "file.close()"}], "explanation": "使用<<运算符向文本文件写入不同类型的数据。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.914	2026-02-01 12:32:11.195
b5f3e535-5a37-46fb-ba23-36edc0b3b2b2	文本文件的格式化输出	补全代码，使用格式化输出	MEDIUM	1-14		\N	\N	20	4	t	FILL_BLANK	{"code": "#include <iostream>\\n#include <fstream>\\n#include <iomanip>\\nusing namespace std;\\n\\nint main() {\\n    ofstream file(\\"data.txt\\");\\n    file << fixed << setprecision(2);\\n    file << \\"Pi: \\" << 3.14159 << endl;\\n    file.close();\\n    return 0;\\n}", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "使用iomanip头文件中的函数进行格式化输出，如fixed和setprecision。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.917	2026-02-01 12:32:11.644
435464d1-ef10-414a-b2d5-fc1840f0e14b	文本文件的追加	补全代码，以追加模式打开文件	MEDIUM	1-14		\N	\N	20	5	t	FILL_BLANK	{"code": "ofstream file(\\"data.txt\\", {{blank}} | {{blank}});\\nfile << \\"This is appended text.\\" << endl;\\nfile.close();", "blanks": [{"hint": "写入模式", "answer": "ios::out"}, {"hint": "追加模式", "answer": "ios::app"}], "explanation": "使用ios::app模式以追加方式打开文件，新写入的数据会添加到文件末尾。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.921	2026-02-01 12:32:12.875
cbbdd9f3-fc6f-487c-89e8-8313bfa0fa45	文本文件的编码	常见的文本文件编码格式有哪些？	HARD	1-14		\N	\N	20	7	t	MULTIPLE_CHOICE	{"options": ["ASCII", "UTF-8", "GBK", "以上都是"], "explanation": "常见的文本文件编码格式包括ASCII、UTF-8和GBK等。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.927	2026-02-01 12:32:13.762
0f3e97b6-3afc-4242-8b1a-b170a6ee24dd	文本文件的大小	补全代码，获取文本文件的大小	MEDIUM	1-14		\N	\N	20	8	t	FILL_BLANK	{"code": "ifstream file(\\"data.txt\\", ios::in | ios::ate);\\nint size = file.tellg();\\ncout << \\"文件大小: \\" << size << \\" 字节\\" << endl;\\nfile.close();", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "使用ios::ate模式打开文件并定位到文件末尾，使用tellg()获取文件大小。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.931	2026-02-01 12:32:14.32
a63dd109-fd0f-458c-97c1-332a73568291	文本文件的综合应用	实现一个简单的学生信息管理系统，使用文本文件存储数据	HARD	1-14	#include <iostream>\n#include <fstream>\n#include <string>\nusing namespace std;\n\nstruct Student {\n    string name;\n    int id;\n    double score;\n};\n\nint main() {\n    // 写入学生信息到文件\n    // 从文件读取学生信息\n    // 打印学生信息\n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "使用文本文件存储学生信息，实现写入和读取功能。", "expectedOutput": "学生信息的写入和读取"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.937	2026-02-01 12:32:15.311
f48731b4-01ae-4ffd-a00e-7f88c0d1dd8c	文件操作的综合应用	以下哪种文件流类可以同时进行读写操作？	EASY	1-14		\N	\N	20	1	t	MULTIPLE_CHOICE	{"options": ["ifstream", "ofstream", "fstream", "以上都不是"], "explanation": "fstream类可以同时进行读写操作。", "correctIndex": 2}	EXERCISE_LIBRARY	2026-01-30 16:29:56.94	2026-02-01 12:32:16.245
347993c4-2bc7-40ae-a791-1210db9b11c3	文件操作的最佳实践	匹配最佳实践与描述	MEDIUM	1-14		\N	\N	20	2	t	MATCHING	{"leftItems": ["总是检查文件打开状态", "使用完文件后关闭", "处理文件操作异常", "使用适当的文件模式"], "rightItems": ["确保文件成功打开", "释放文件资源", "提高程序健壮性", "优化文件操作效率"], "explanation": "文件操作的最佳实践包括总是检查文件打开状态、使用完文件后关闭、处理文件操作异常和使用适当的文件模式等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.944	2026-02-01 12:32:17.033
6f85f4cc-cd44-4f2a-9211-31509904cd69	文件操作的常见错误	补全代码，修复文件操作错误	MEDIUM	1-14		\N	\N	20	3	t	FILL_BLANK	{"code": "ifstream file(\\"data.txt\\");\\nif (!file) {\\n    cout << \\"文件打开失败\\" << endl;\\n    return 1;\\n}\\n// 使用文件\\n{{blank}}; // 关闭文件", "blanks": [{"hint": "关闭文件", "answer": "file.close()"}], "explanation": "使用完文件后必须关闭，释放文件资源。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.948	2026-02-01 12:32:17.486
f9f17839-9513-4dde-8a50-5116d226d660	文件操作的高级应用	补全代码，使用文件流的异常处理	HARD	1-14		\N	\N	20	4	t	FILL_BLANK	{"code": "#include <iostream>\\n#include <fstream>\\nusing namespace std;\\n\\nint main() {\\n    try {\\n        ifstream file(\\"data.txt\\");\\n        file.exceptions(ifstream::failbit | ifstream::badbit);\\n        // 使用文件\\n        file.close();\\n    } catch (const ifstream::failure &e) {\\n        cout << \\"文件操作异常: \\" << e.what() << endl;\\n    }\\n    return 0;\\n}", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "使用exceptions()方法设置文件流的异常标志，捕获文件操作异常。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.951	2026-02-01 12:32:18.128
923a9941-1248-451c-868d-45b169d7f0e6	综合编程挑战	实现一个简单的日志系统，使用文本文件记录日志	HARD	1-14	#include <iostream>\n#include <fstream>\n#include <string>\n#include <ctime>\nusing namespace std;\n\nvoid log(const string &message) {\n    // 打开日志文件\n    // 获取当前时间\n    // 写入日志消息\n    // 关闭文件\n}\n\nint main() {\n    log("程序启动");\n    log("执行操作1");\n    log("执行操作2");\n    log("程序结束");\n    return 0;\n}	\N	\N	25	5	t	CODING	{"explanation": "实现一个log函数，记录带有时间戳的日志消息到文本文件。", "expectedOutput": "日志文件中的日志记录"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.954	2026-02-01 12:32:19.224
0ae1a6d8-da26-46a4-bc19-b22bc9bd1dfe	文件操作的实际应用	实现一个简单的配置文件解析器	HARD	1-14	#include <iostream>\n#include <fstream>\n#include <string>\n#include <map>\nusing namespace std;\n\nmap<string, string> parseConfig(const string &filename) {\n    map<string, string> config;\n    // 打开配置文件\n    // 解析配置项\n    // 返回配置\n    return config;\n}\n\nint main() {\n    map<string, string> config = parseConfig("config.txt");\n    // 打印配置项\n    return 0;\n}	\N	\N	25	6	t	CODING	{"explanation": "实现一个配置文件解析器，读取并解析文本格式的配置文件。", "expectedOutput": "配置文件中的配置项"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.958	2026-02-01 12:32:20.254
71e47b86-3fcb-4a49-aae2-411ad835525f	文件操作的高级挑战	实现一个简单的文件加密和解密功能	HARD	1-14	#include <iostream>\n#include <fstream>\nusing namespace std;\n\nvoid encryptFile(const string &inputFile, const string &outputFile, char key) {\n    // 打开输入文件\n    // 打开输出文件\n    // 读取数据并加密\n    // 写入加密后的数据\n    // 关闭文件\n}\n\nvoid decryptFile(const string &inputFile, const string &outputFile, char key) {\n    // 打开输入文件\n    // 打开输出文件\n    // 读取加密数据并解密\n    // 写入解密后的数据\n    // 关闭文件\n}\n\nint main() {\n    char key = X;\n    encryptFile("plain.txt", "encrypted.txt", key);\n    decryptFile("encrypted.txt", "decrypted.txt", key);\n    return 0;\n}	\N	\N	25	7	t	CODING	{"explanation": "实现文件加密和解密功能，使用简单的异或操作进行加密。", "expectedOutput": "加密和解密后的文件内容"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.962	2026-02-01 12:32:21.084
ce24cfe9-971d-4462-8807-0472d29221ed	文件操作的创意应用	实现一个简单的文本编辑器，使用文件操作保存和加载文本	HARD	1-14	#include <iostream>\n#include <fstream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nclass TextEditor {\nprivate:\n    vector<string> lines;\npublic:\n    void addLine(const string &line) {\n        lines.push_back(line);\n    }\n    \n    void save(const string &filename) {\n        // 保存到文件\n    }\n    \n    void load(const string &filename) {\n        // 从文件加载\n    }\n    \n    void display() {\n        for (const string &line : lines) {\n            cout << line << endl;\n        }\n    }\n};\n\nint main() {\n    TextEditor editor;\n    // 测试文本编辑器\n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "实现一个简单的文本编辑器，支持保存文本到文件和从文件加载文本。", "expectedOutput": "文本编辑器的保存和加载功能"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.969	2026-02-01 12:32:21.926
b798b0ec-11a3-4e87-85f8-0b58a99cecf2	文件操作的综合挑战	实现一个简单的数据库系统，使用二进制文件存储数据	HARD	1-14	#include <iostream>\n#include <fstream>\n#include <string>\nusing namespace std;\n\nstruct Record {\n    int id;\n    string name;\n    int age;\n};\n\nclass Database {\nprivate:\n    fstream file;\npublic:\n    Database(const string &filename) {\n        file.open(filename, ios::in | ios::out | ios::binary | ios::trunc);\n    }\n    \n    void insert(const Record &record) {\n        // 插入记录\n    }\n    \n    Record get(int id) {\n        // 获取记录\n        return Record();\n    }\n    \n    void update(int id, const Record &record) {\n        // 更新记录\n    }\n    \n    void remove(int id) {\n        // 删除记录\n    }\n    \n    ~Database() {\n        file.close();\n    }\n};\n\nint main() {\n    Database db("data.db");\n    // 测试数据库操作\n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "实现一个简单的数据库系统，使用二进制文件存储记录，支持基本的CRUD操作。", "expectedOutput": "数据库的插入、查询、更新和删除操作"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.972	2026-02-01 12:32:22.36
b080cc70-11d1-4602-a87a-b2dbd38f7a4a	异常处理的基本概念	异常是什么？	EASY	1-15		\N	\N	15	1	t	MULTIPLE_CHOICE	{"options": ["程序运行时的错误", "程序编译时的错误", "程序链接时的错误", "程序设计时的错误"], "explanation": "异常是程序运行时发生的错误，如除零、数组越界等。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.976	2026-02-01 12:32:22.881
ab0cfa3f-db14-404a-a809-be1d14aaef64	异常处理的目的	异常处理的主要目的是什么？	EASY	1-15		\N	\N	15	2	t	MULTIPLE_CHOICE	{"options": ["提高程序的健壮性", "提高程序的执行效率", "简化程序的代码结构", "以上都是"], "explanation": "异常处理的主要目的是提高程序的健壮性，使程序能够优雅地处理运行时错误。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.98	2026-02-01 12:32:23.839
1631fd66-2e61-4d51-9899-0f40d72189a2	传统错误处理与异常处理的区别	匹配错误处理方式与特点	MEDIUM	1-15		\N	\N	15	3	t	MATCHING	{"leftItems": ["传统错误处理", "异常处理", "传统错误处理", "异常处理"], "rightItems": ["使用返回值表示错误", "使用try-catch结构", "错误处理代码与业务逻辑混合", "错误处理代码与业务逻辑分离"], "explanation": "传统错误处理使用返回值表示错误，错误处理代码与业务逻辑混合；异常处理使用try-catch结构，错误处理代码与业务逻辑分离。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.984	2026-02-01 12:32:24.264
f8724904-3861-45e8-bd9f-0a31713c3732	异常处理的基本结构	补全代码，使用异常处理的基本结构	EASY	1-15		\N	\N	15	4	t	FILL_BLANK	{"code": "try {\\n    // 可能抛出异常的代码\\n} {{blank}} (exception e) {\\n    // 异常处理代码\\n}", "blanks": [{"hint": "捕获异常", "answer": "catch"}], "explanation": "异常处理的基本结构是try-catch，try块包含可能抛出异常的代码，catch块包含异常处理代码。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.988	2026-02-01 12:32:24.746
96b78eff-f9cd-4c5f-8b2d-a563a5453694	异常的抛出	补全代码，抛出异常	EASY	1-15		\N	\N	15	5	t	FILL_BLANK	{"code": "if (denominator == 0) {\\n    {{blank}} exception(\\"除零错误\\");\\n}", "blanks": [{"hint": "抛出异常", "answer": "throw"}], "explanation": "使用throw关键字抛出异常。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.992	2026-02-01 12:32:25.279
e69aefc5-2b86-4e85-8538-dcf4f2df2612	异常的类型	C++中的异常类型包括哪些？	MEDIUM	1-15		\N	\N	15	6	t	MULTIPLE_CHOICE	{"options": ["内置异常", "自定义异常", "标准异常", "以上都是"], "explanation": "C++中的异常类型包括内置异常、自定义异常和标准异常等。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.996	2026-02-01 12:32:25.807
041d59ab-c3a2-400f-b3a3-e416e637756b	标准异常类	补全代码，使用标准异常	MEDIUM	1-15		\N	\N	15	7	t	FILL_BLANK	{"code": "#include <stdexcept>\\n\\nif (index < 0 || index >= size) {\\n    throw {{blank}}_error(\\"索引越界\\");\\n}", "blanks": [{"hint": "标准异常类", "answer": "out_of_range"}], "explanation": "out_of_range是C++标准库中的异常类，用于表示索引越界错误。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57	2026-02-01 12:32:26.326
ff9daf42-cc37-4d00-a0b9-0a6a8c0e9d4d	异常处理的流程	当发生异常时，程序的执行流程是怎样的？	MEDIUM	1-15		\N	\N	15	8	t	MULTIPLE_CHOICE	{"options": ["终止当前函数执行，跳转到最近的catch块", "继续执行当前函数的剩余代码", "终止整个程序的执行", "以上都不对"], "explanation": "当发生异常时，程序会终止当前函数的执行，沿着调用栈向上查找最近的catch块。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:57.003	2026-02-01 12:32:27.191
79e43692-7d9e-4ebd-80fb-ca8f509ffc8d	异常的抛出方式	补全代码，抛出异常	EASY	1-15		\N	\N	20	1	t	FILL_BLANK	{"code": "void checkAge(int age) {\\n    if (age < 0) {\\n        {{blank}} invalid_argument(\\"年龄不能为负数\\");\\n    }\\n}", "blanks": [{"hint": "抛出异常", "answer": "throw"}], "explanation": "使用throw关键字抛出异常，可以是内置类型、自定义类型或标准异常类型。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.049	2026-02-01 12:32:36.181
3d252443-f768-4631-ad1d-11ad88a1d112	异常处理概念编程	使用异常处理处理除零错误	MEDIUM	1-15	#include <iostream>\n#include <stdexcept>\nusing namespace std;\n\ndouble divide(double numerator, double denominator) {\n    if (denominator == 0) {\n        throw runtime_error("除零错误");\n    }\n    return numerator / denominator;\n}\n\nint main() {\n    try {\n        double result = divide(10, 0);\n        cout << "结果: " << result << endl;\n    } catch (const exception &e) {\n        cout << "异常: " << e.what() << endl;\n    }\n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用try-catch结构捕获并处理除零错误。", "expectedOutput": "异常: 除零错误"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.011	2026-02-01 12:32:28.166
8b34c933-3fda-4c23-a735-a4f17e8cfcfb	try块的作用	try块的作用是什么？	EASY	1-15		\N	\N	15	1	t	MULTIPLE_CHOICE	{"options": ["包含可能抛出异常的代码", "包含异常处理代码", "标记异常的类型", "以上都不对"], "explanation": "try块的作用是包含可能抛出异常的代码。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:57.014	2026-02-01 12:32:28.64
795d44b2-a29d-45a5-aa8b-ac8cc08b1dd9	catch块的作用	catch块的作用是什么？	EASY	1-15		\N	\N	15	2	t	MULTIPLE_CHOICE	{"options": ["包含异常处理代码", "包含可能抛出异常的代码", "标记异常的类型", "以上都不对"], "explanation": "catch块的作用是包含异常处理代码，捕获并处理try块中抛出的异常。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:57.017	2026-02-01 12:32:29.503
4afaf881-17a8-400b-902e-056cc5e965cd	多个catch块的使用	补全代码，使用多个catch块	MEDIUM	1-15		\N	\N	15	3	t	FILL_BLANK	{"code": "try {\\n    // 可能抛出不同类型异常的代码\\n} catch (const out_of_range &e) {\\n    cout << \\"索引越界: \\" << e.what() << endl;\\n} catch (const runtime_error &e) {\\n    cout << \\"运行时错误: \\" << e.what() << endl;\\n} catch (const {{blank}} &e) {\\n    cout << \\"其他异常: \\" << e.what() << endl;\\n}", "blanks": [{"hint": "基类异常", "answer": "exception"}], "explanation": "可以使用多个catch块捕获不同类型的异常，基类异常的catch块应该放在最后。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.021	2026-02-01 12:32:29.998
035323ba-cab9-4df7-9044-371106a94d45	异常的捕获顺序	多个catch块的捕获顺序应该是怎样的？	MEDIUM	1-15		\N	\N	15	4	t	MULTIPLE_CHOICE	{"options": ["从具体到一般", "从一般到具体", "任意顺序", "以上都不对"], "explanation": "多个catch块的捕获顺序应该是从具体到一般，即子类异常的catch块应该放在父类异常的catch块之前。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:57.024	2026-02-01 12:32:31.063
d3fc047a-07ff-4dbb-8597-fb514c4cb115	异常的重新抛出	补全代码，重新抛出异常	MEDIUM	1-15		\N	\N	15	5	t	FILL_BLANK	{"code": "try {\\n    // 可能抛出异常的代码\\n} catch (const exception &e) {\\n    cout << \\"捕获到异常: \\" << e.what() << endl;\\n    {{blank}}; // 重新抛出异常\\n}", "blanks": [{"hint": "重新抛出", "answer": "throw"}], "explanation": "在catch块中使用throw关键字可以重新抛出当前捕获的异常。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.027	2026-02-01 12:32:31.983
a34c60a2-979d-49a2-9f29-268abcbad66d	无类型异常	补全代码，捕获无类型异常	MEDIUM	1-15		\N	\N	15	6	t	FILL_BLANK	{"code": "try {\\n    throw \\"错误信息\\";\\n} catch ({{blank}}) {\\n    cout << \\"捕获到无类型异常\\" << endl;\\n}", "blanks": [{"hint": "捕获所有异常", "answer": "..."}], "explanation": "使用catch(...)可以捕获所有类型的异常，包括无类型异常。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.031	2026-02-01 12:32:32.414
3b25f797-9cc5-46d0-b1a7-71b04ae5244c	异常对象的生命周期	异常对象的生命周期是怎样的？	HARD	1-15		\N	\N	15	7	t	MULTIPLE_CHOICE	{"options": ["从throw语句开始，到catch块结束", "从try块开始，到catch块结束", "从程序开始，到程序结束", "以上都不对"], "explanation": "异常对象的生命周期是从throw语句开始，到catch块结束。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:57.036	2026-02-01 12:32:33.328
d2c296e7-0ecd-4cd4-82d4-c1d21f3c43d8	try-catch的嵌套	补全代码，使用嵌套的try-catch	HARD	1-15		\N	\N	15	8	t	FILL_BLANK	{"code": "try {\\n    try {\\n        // 可能抛出异常的代码\\n    } catch (const runtime_error &e) {\\n        cout << \\"内部catch: \\" << e.what() << endl;\\n        throw; // 重新抛出\\n    }\\n} catch (const exception &e) {\\n    cout << \\"外部catch: \\" << e.what() << endl;\\n}", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "可以嵌套使用try-catch结构，内部catch块可以重新抛出异常，由外部catch块处理。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.04	2026-02-01 12:32:33.752
3c31a824-22a0-482f-8981-f137f4676fbe	try-catch的综合应用	实现一个函数，使用异常处理验证输入	HARD	1-15	#include <iostream>\n#include <stdexcept>\n#include <string>\nusing namespace std;\n\nint getPositiveInteger() {\n    int num;\n    cout << "请输入一个正整数: ";\n    cin >> num;\n    \n    if (cin.fail()) {\n        cin.clear();\n        cin.ignore(numeric_limits<streamsize>::max(), "\n");\n        throw invalid_argument("输入不是整数");\n    }\n    \n    if (num <= 0) {\n        throw out_of_range("输入不是正整数");\n    }\n    \n    return num;\n}\n\nint main() {\n    try {\n        int num = getPositiveInteger();\n        cout << "输入的正整数: " << num << endl;\n    } catch (const exception &e) {\n        cout << "错误: " << e.what() << endl;\n    }\n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用异常处理验证用户输入，确保输入是正整数。", "expectedOutput": "输入验证和错误处理"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.046	2026-02-01 12:32:34.818
aecfacbd-019f-4965-86e9-81e5755d7579	异常的传递	当函数抛出异常但没有捕获时，异常会怎样？	MEDIUM	1-15		\N	\N	20	3	t	MULTIPLE_CHOICE	{"options": ["向上传递给调用者", "终止程序执行", "被系统捕获", "以上都不对"], "explanation": "当函数抛出异常但没有捕获时，异常会向上传递给调用者，直到被捕获或导致程序终止。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:57.056	2026-02-01 12:32:37.548
80b3cce4-c25c-4372-a537-de86a645caea	异常规格说明	补全代码，使用异常规格说明	MEDIUM	1-15		\N	\N	20	4	t	FILL_BLANK	{"code": "void func() {{blank}} (invalid_argument, out_of_range) {\\n    // 可能抛出invalid_argument或out_of_range异常的代码\\n}", "blanks": [{"hint": "异常规格说明", "answer": "throw"}], "explanation": "异常规格说明用于声明函数可能抛出的异常类型，C++11后已被deprecated，推荐使用noexcept。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.06	2026-02-01 12:32:38.453
436ecc59-cdb7-4bf6-8005-b92c31241eac	noexcept关键字	补全代码，使用noexcept关键字	MEDIUM	1-15		\N	\N	20	5	t	FILL_BLANK	{"code": "void func() {{blank}} {\\n    // 不会抛出异常的代码\\n}", "blanks": [{"hint": "不抛出异常", "answer": "noexcept"}], "explanation": "noexcept关键字用于声明函数不会抛出异常。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.063	2026-02-01 12:32:39.121
5c46756e-b997-49f8-90fd-22460d555188	异常与构造函数	构造函数可以抛出异常吗？	HARD	1-15		\N	\N	20	6	t	MULTIPLE_CHOICE	{"options": ["可以", "不可以", "取决于编译器", "取决于构造函数的参数"], "explanation": "构造函数可以抛出异常，但析构函数不应该抛出异常。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:57.066	2026-02-01 12:32:40.204
3af8791c-e2d4-4a04-99df-9da1fdef740d	异常与析构函数	析构函数应该抛出异常吗？	HARD	1-15		\N	\N	20	7	t	MULTIPLE_CHOICE	{"options": ["不应该", "应该", "取决于编译器", "取决于析构函数的实现"], "explanation": "析构函数不应该抛出异常，因为如果在处理异常时析构函数又抛出异常，会导致程序终止。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:57.07	2026-02-01 12:32:40.693
e8d3a9d2-d241-4593-bfc4-ed17b6094d0c	异常与资源管理	补全代码，使用RAII管理资源	HARD	1-15		\N	\N	20	8	t	FILL_BLANK	{"code": "class File {\\nprivate:\\n    FILE *fp;\\npublic:\\n    File(const char *filename) {\\n        fp = fopen(filename, \\"r\\");\\n        if (!fp) {\\n            throw runtime_error(\\"文件打开失败\\");\\n        }\\n    }\\n    \\n    ~File() {\\n        if (fp) {\\n            fclose(fp);\\n        }\\n    }\\n    \\n    // 其他方法\\n};", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "使用RAII（资源获取即初始化）技术管理资源，确保即使发生异常，资源也能被正确释放。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.074	2026-02-01 12:32:41.243
a13e353a-d9a7-43fa-898d-3ad26efad253	异常的抛出与捕获的综合应用	实现一个简单的计算器，使用异常处理处理各种错误	HARD	1-15	#include <iostream>\n#include <stdexcept>\n#include <string>\nusing namespace std;\n\ndouble calculate(double a, double b, char op) {\n    switch (op) {\n        case +:\n            return a + b;\n        case -:\n            return a - b;\n        case *:\n            return a * b;\n        case /:\n            if (b == 0) {\n                throw runtime_error("除零错误");\n            }\n            return a / b;\n        default:\n            throw invalid_argument("无效的运算符");\n    }\n}\n\nint main() {\n    try {\n        double a, b;\n        char op;\n        cout << "请输入表达式 (a op b): ";\n        cin >> a >> op >> b;\n        double result = calculate(a, b, op);\n        cout << "结果: " << result << endl;\n    } catch (const exception &e) {\n        cout << "错误: " << e.what() << endl;\n    }\n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "使用异常处理处理计算器的各种错误，如除零错误和无效运算符。", "expectedOutput": "计算结果或错误信息"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.081	2026-02-01 12:32:42.584
c05fb07e-f5ff-480c-9d27-25fb87ef3af9	自定义异常的基本概念	自定义异常的目的是什么？	EASY	1-15		\N	\N	20	1	t	MULTIPLE_CHOICE	{"options": ["提供更具体的错误信息", "便于错误分类和处理", "提高代码的可读性和可维护性", "以上都是"], "explanation": "自定义异常的目的包括提供更具体的错误信息、便于错误分类和处理、提高代码的可读性和可维护性等。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:57.084	2026-02-01 12:32:43.628
04e75771-8e83-4337-8c12-031e0155cce3	自定义异常的实现方式	补全代码，定义自定义异常类	MEDIUM	1-15		\N	\N	20	2	t	FILL_BLANK	{"code": "#include <stdexcept>\\n#include <string>\\n\\nclass MyException : public {{blank}} {\\nprivate:\\n    std::string message;\\npublic:\\n    MyException(const std::string &msg) : message(msg) {} \\n    \\n    const char* what() const noexcept override {\\n        return message.c_str();\\n    }\\n};", "blanks": [{"hint": "基类异常", "answer": "exception"}], "explanation": "自定义异常类应该继承自std::exception或其派生类，并重写what()方法。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.088	2026-02-01 12:32:44.151
333196bf-7b0a-43c9-a725-a33622ad3cb8	自定义异常的抛出	补全代码，抛出自定义异常	MEDIUM	1-15		\N	\N	20	3	t	FILL_BLANK	{"code": "void checkValue(int value) {\\n    if (value < 0) {\\n        throw MyException(\\"值不能为负数\\");\\n    }\\n}", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "使用throw关键字抛出自定义异常对象。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.091	2026-02-01 12:32:45.105
d365b85a-d8fa-4298-a62c-746d0380e7ad	自定义异常的层次结构	补全代码，定义异常层次结构	HARD	1-15		\N	\N	20	5	t	FILL_BLANK	{"code": "class BaseException : public exception {\\n    // 基类异常\\n};\\n\\nclass DerivedException : public {{blank}} {\\n    // 派生类异常\\n};", "blanks": [{"hint": "基类异常", "answer": "BaseException"}], "explanation": "可以定义异常的层次结构，派生类异常继承自基类异常，便于分类和处理。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.097	2026-02-01 12:32:46.048
6ac06d1e-4c68-4656-96d3-31c5de37dcb9	自定义异常的使用场景	匹配使用场景与自定义异常	MEDIUM	1-15		\N	\N	20	6	t	MATCHING	{"leftItems": ["业务逻辑错误", "系统资源错误", "网络错误", "数据库错误"], "rightItems": ["自定义异常", "自定义异常", "自定义异常", "自定义异常"], "explanation": "自定义异常适用于各种场景，如业务逻辑错误、系统资源错误、网络错误和数据库错误等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:57.101	2026-02-01 12:32:46.838
316ab12e-da15-49c0-a633-0159ca587891	自定义异常的最佳实践	自定义异常的最佳实践是什么？	HARD	1-15		\N	\N	20	7	t	MULTIPLE_CHOICE	{"options": ["继承自std::exception", "提供详细的错误信息", "定义合理的异常层次结构", "以上都是"], "explanation": "自定义异常的最佳实践包括继承自std::exception、提供详细的错误信息和定义合理的异常层次结构等。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:57.104	2026-02-01 12:32:47.307
26c83386-45bf-411f-b63c-76e36725f1a2	异常与错误码的结合	补全代码，在自定义异常中包含错误码	HARD	1-15		\N	\N	20	8	t	FILL_BLANK	{"code": "class ErrorCodeException : public exception {\\nprivate:\\n    int code;\\n    std::string message;\\npublic:\\n    ErrorCodeException(int errCode, const std::string &msg) : code(errCode), message(msg) {} \\n    \\n    int getCode() const {\\n        return code;\\n    }\\n    \\n    const char* what() const noexcept override {\\n        return message.c_str();\\n    }\\n};", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "在自定义异常中可以包含错误码等额外信息，便于更详细地描述错误。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.108	2026-02-01 12:32:47.816
05c6d344-ea47-4b14-a40d-bcf5ee59c3ea	自定义异常的综合应用	实现一个文件操作类，使用自定义异常处理文件操作错误	HARD	1-15	#include <iostream>\n#include <fstream>\n#include <stdexcept>\n#include <string>\nusing namespace std;\n\nclass FileException : public exception {\nprivate:\n    string filename;\n    string message;\npublic:\n    FileException(const string &fname, const string &msg) : filename(fname), message(msg) {} \n    \n    const char* what() const noexcept override {\n        static string fullMessage;\n        fullMessage = "文件错误 (" + filename + "): " + message;\n        return fullMessage.c_str();\n    }\n};\n\nclass FileHandler {\nprivate:\n    string filename;\n    fstream file;\npublic:\n    FileHandler(const string &fname) : filename(fname) {\n        file.open(fname, ios::in | ios::out | ios::binary);\n        if (!file) {\n            throw FileException(fname, "文件打开失败");\n        }\n    }\n    \n    void write(const string &data) {\n        if (!file) {\n            throw FileException(filename, "文件未打开");\n        }\n        file << data;\n        if (!file) {\n            throw FileException(filename, "写入失败");\n        }\n    }\n    \n    string read() {\n        if (!file) {\n            throw FileException(filename, "文件未打开");\n        }\n        file.seekg(0, ios::beg);\n        string data;\n        string line;\n        while (getline(file, line)) {\n            data += line + "\n";\n        }\n        return data;\n    }\n    \n    ~FileHandler() {\n        if (file) {\n            file.close();\n        }\n    }\n};\n\nint main() {\n    try {\n        FileHandler file("test.txt");\n        file.write("Hello, World!");\n        string content = file.read();\n        cout << "文件内容: " << content << endl;\n    } catch (const exception &e) {\n        cout << "错误: " << e.what() << endl;\n    }\n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "使用自定义异常处理文件操作的各种错误，如文件打开失败和写入失败等。", "expectedOutput": "文件操作结果或错误信息"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.115	2026-02-01 12:32:49.61
56d9389a-a5d3-42e5-a6cf-9c6d0a4cfcf0	异常处理的综合应用	以下哪种情况适合使用异常处理？	EASY	1-15		\N	\N	20	1	t	MULTIPLE_CHOICE	{"options": ["处理不可预见的运行时错误", "处理可预见的业务逻辑错误", "处理所有可能的错误", "以上都是"], "explanation": "异常处理适合处理不可预见的运行时错误，对于可预见的业务逻辑错误，使用返回值可能更合适。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:57.118	2026-02-01 12:32:50.839
ea3d33f2-d62f-4c32-a287-9f3a670b89bd	异常处理的最佳实践	匹配最佳实践与描述	MEDIUM	1-15		\N	\N	20	2	t	MATCHING	{"leftItems": ["只在必要时使用异常", "使用具体的异常类型", "使用RAII管理资源", "保持异常处理代码简洁"], "rightItems": ["异常处理有一定的性能开销", "便于精确捕获和处理", "确保资源正确释放", "提高代码可读性"], "explanation": "异常处理的最佳实践包括只在必要时使用异常、使用具体的异常类型、使用RAII管理资源和保持异常处理代码简洁等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:57.123	2026-02-01 12:32:52.017
3a40f8d8-5856-400d-94cf-20bc8f1651d2	异常处理的性能考虑	异常处理对性能有影响吗？	MEDIUM	1-15		\N	\N	20	3	t	MULTIPLE_CHOICE	{"options": ["有，异常处理有一定的性能开销", "没有，异常处理不影响性能", "取决于编译器", "取决于异常的类型"], "explanation": "异常处理有一定的性能开销，包括异常对象的创建、栈展开等，因此应该只在必要时使用异常。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:57.127	2026-02-01 12:32:52.439
ac5c3e4a-ada5-4155-b844-3997544fdaea	异常处理的实际应用	实现一个简单的HTTP客户端，使用异常处理处理网络错误	HARD	1-15	#include <iostream>\n#include <string>\n#include <stdexcept>\nusing namespace std;\n\nclass NetworkException : public exception {\nprivate:\n    string message;\npublic:\n    NetworkException(const string &msg) : message(msg) {} \n    \n    const char* what() const noexcept override {\n        return message.c_str();\n    }\n};\n\nclass HttpException : public NetworkException {\nprivate:\n    int statusCode;\npublic:\n    HttpException(int code, const string &msg) : NetworkException(msg), statusCode(code) {} \n    \n    int getStatusCode() const {\n        return statusCode;\n    }\n};\n\nclass HttpClient {\npublic:\n    string get(const string &url) {\n        // 模拟网络请求\n        if (url.empty()) {\n            throw NetworkException("URL为空");\n        }\n        \n        if (url == "https://example.com/error") {\n            throw HttpException(404, "页面未找到");\n        }\n        \n        return "HTTP 200 OK\nContent-Type: text/html\n\n<h1>Hello, World!</h1>";\n    }\n};\n\nint main() {\n    HttpClient client;\n    \n    try {\n        string response = client.get("https://example.com/error");\n        cout << response << endl;\n    } catch (const HttpException &e) {\n        cout << "HTTP错误: " << e.getStatusCode() << " " << e.what() << endl;\n    } catch (const NetworkException &e) {\n        cout << "网络错误: " << e.what() << endl;\n    } catch (const exception &e) {\n        cout << "未知错误: " << e.what() << endl;\n    }\n    \n    return 0;\n}	\N	\N	25	6	t	CODING	{"explanation": "使用自定义异常处理HTTP客户端的各种错误，如网络错误和HTTP错误等。", "expectedOutput": "HTTP请求的响应或错误信息"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.137	2026-02-01 12:32:54.344
483a5464-fd7c-4768-b4c5-8de7256a8267	异常处理的高级挑战	实现一个简单的数据库连接池，使用异常处理处理连接错误	HARD	1-15	#include <iostream>\n#include <vector>\n#include <stdexcept>\n#include <string>\nusing namespace std;\n\nclass DatabaseException : public exception {\nprivate:\n    string message;\npublic:\n    DatabaseException(const string &msg) : message(msg) {} \n    \n    const char* what() const noexcept override {\n        return message.c_str();\n    }\n};\n\nclass Connection {\nprivate:\n    bool isOpen;\npublic:\n    Connection() : isOpen(false) {} \n    \n    void open(const string &connectionString) {\n        // 模拟连接数据库\n        if (connectionString.empty()) {\n            throw DatabaseException("连接字符串为空");\n        }\n        \n        if (connectionString == "invalid") {\n            throw DatabaseException("无效的连接字符串");\n        }\n        \n        isOpen = true;\n        cout << "数据库连接打开" << endl;\n    }\n    \n    void close() {\n        if (isOpen) {\n            isOpen = false;\n            cout << "数据库连接关闭" << endl;\n        }\n    }\n    \n    bool getIsOpen() const {\n        return isOpen;\n    }\n    \n    ~Connection() {\n        close();\n    }\n};\n\nclass ConnectionPool {\nprivate:\n    vector<Connection*> connections;\n    int maxSize;\npublic:\n    ConnectionPool(int size) : maxSize(size) {\n        for (int i = 0; i < size; i++) {\n            connections.push_back(new Connection());\n        }\n    }\n    \n    Connection* getConnection(const string &connectionString) {\n        for (Connection* conn : connections) {\n            if (!conn->getIsOpen()) {\n                try {\n                    conn->open(connectionString);\n                    return conn;\n                } catch (const DatabaseException &e) {\n                    throw;\n                }\n            }\n        }\n        throw DatabaseException("连接池已满");\n    }\n    \n    void releaseConnection(Connection* conn) {\n        conn->close();\n    }\n    \n    ~ConnectionPool() {\n        for (Connection* conn : connections) {\n            delete conn;\n        }\n    }\n};\n\nint main() {\n    ConnectionPool pool(2);\n    \n    try {\n        Connection* conn1 = pool.getConnection("valid");\n        Connection* conn2 = pool.getConnection("valid");\n        // Connection* conn3 = pool.getConnection("valid"); // 连接池已满\n        \n        pool.releaseConnection(conn1);\n        pool.releaseConnection(conn2);\n    } catch (const DatabaseException &e) {\n        cout << "数据库错误: " << e.what() << endl;\n    }\n    \n    return 0;\n}	\N	\N	25	7	t	CODING	{"explanation": "使用自定义异常处理数据库连接池的各种错误，如连接失败和连接池已满等。", "expectedOutput": "数据库连接池的操作结果或错误信息"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.14	2026-02-01 12:32:55.835
c53bfd68-64ae-4309-bf31-f642913744da	异常处理的终极挑战	实现一个简单的文件系统，使用异常处理处理各种文件操作错误	HARD	1-15	#include <iostream>\n#include <vector>\n#include <string>\n#include <stdexcept>\nusing namespace std;\n\nclass FileSystemException : public exception {\nprivate:\n    string message;\npublic:\n    FileSystemException(const string &msg) : message(msg) {} \n    \n    const char* what() const noexcept override {\n        return message.c_str();\n    }\n};\n\nclass FileNotFoundException : public FileSystemException {\nprivate:\n    string path;\npublic:\n    FileNotFoundException(const string &p) : FileSystemException("文件未找到: " + p), path(p) {} \n};\n\nclass DirectoryNotFoundException : public FileSystemException {\nprivate:\n    string path;\npublic:\n    DirectoryNotFoundException(const string &p) : FileSystemException("目录未找到: " + p), path(p) {} \n};\n\nclass File {\nprivate:\n    string name;\n    string content;\npublic:\n    File(const string &n) : name(n) {} \n    \n    void write(const string &data) {\n        content = data;\n    }\n    \n    string read() const {\n        return content;\n    }\n    \n    string getName() const {\n        return name;\n    }\n};\n\nclass Directory {\nprivate:\n    string name;\n    vector<File*> files;\n    vector<Directory*> subdirectories;\npublic:\n    Directory(const string &n) : name(n) {} \n    \n    void createFile(const string &fileName) {\n        files.push_back(new File(fileName));\n    }\n    \n    File* getFile(const string &fileName) {\n        for (File* file : files) {\n            if (file->getName() == fileName) {\n                return file;\n            }\n        }\n        throw FileNotFoundException(fileName);\n    }\n    \n    void createDirectory(const string &dirName) {\n        subdirectories.push_back(new Directory(dirName));\n    }\n    \n    Directory* getDirectory(const string &dirName) {\n        for (Directory* dir : subdirectories) {\n            if (dir->getName() == dirName) {\n                return dir;\n            }\n        }\n        throw DirectoryNotFoundException(dirName);\n    }\n    \n    string getName() const {\n        return name;\n    }\n    \n    ~Directory() {\n        for (File* file : files) {\n            delete file;\n        }\n        for (Directory* dir : subdirectories) {\n            delete dir;\n        }\n    }\n};\n\nclass FileSystem {\nprivate:\n    Directory* root;\npublic:\n    FileSystem() : root(new Directory("/")) {} \n    \n    Directory* getRoot() {\n        return root;\n    }\n    \n    ~FileSystem() {\n        delete root;\n    }\n};\n\nint main() {\n    FileSystem fs;\n    Directory* root = fs.getRoot();\n    \n    try {\n        root->createDirectory("home");\n        Directory* home = root->getDirectory("home");\n        home->createFile("test.txt");\n        File* file = home->getFile("test.txt");\n        file->write("Hello, File System!");\n        cout << "文件内容: " << file->read() << endl;\n        \n        File* nonExistentFile = home->getFile("nonexistent.txt"); // 文件未找到\n    } catch (const FileSystemException &e) {\n        cout << "文件系统错误: " << e.what() << endl;\n    }\n    \n    return 0;\n}	\N	\N	25	8	t	CODING	{"explanation": "使用自定义异常处理文件系统的各种错误，如文件未找到和目录未找到等。", "expectedOutput": "文件系统的操作结果或错误信息"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.144	2026-02-01 12:32:56.56
ffdb0b63-a18f-45b8-ba26-a2a7d974a2ac	异常处理的创意应用	实现一个简单的游戏引擎，使用异常处理处理各种游戏错误	HARD	1-15	#include <iostream>\n#include <string>\n#include <stdexcept>\nusing namespace std;\n\nclass GameException : public exception {\nprivate:\n    string message;\npublic:\n    GameException(const string &msg) : message(msg) {} \n    \n    const char* what() const noexcept override {\n        return message.c_str();\n    }\n};\n\nclass InvalidMoveException : public GameException {\nprivate:\n    int x, y;\npublic:\n    InvalidMoveException(int xCoord, int yCoord) : GameException("无效的移动: (" + to_string(xCoord) + ", " + to_string(yCoord) + ")"), x(xCoord), y(yCoord) {} \n};\n\nclass GameOverException : public GameException {\nprivate:\n    bool won;\npublic:\n    GameOverException(bool playerWon) : GameException(playerWon ? "游戏胜利!" : "游戏失败!"), won(playerWon) {} \n    \n    bool didWin() const {\n        return won;\n    }\n};\n\nclass TicTacToe {\nprivate:\n    char board[3][3];\n    char currentPlayer;\npublic:\n    TicTacToe() : currentPlayer(X) {\n        for (int i = 0; i < 3; i++) {\n            for (int j = 0; j < 3; j++) {\n                board[i][j] =  ;\n            }\n        }\n    }\n    \n    void makeMove(int x, int y) {\n        if (x < 0 || x >= 3 || y < 0 || y >= 3) {\n            throw InvalidMoveException(x, y);\n        }\n        \n        if (board[x][y] !=  ) {\n            throw InvalidMoveException(x, y);\n        }\n        \n        board[x][y] = currentPlayer;\n        \n        if (checkWin()) {\n            throw GameOverException(true);\n        }\n        \n        if (checkDraw()) {\n            throw GameOverException(false);\n        }\n        \n        currentPlayer = (currentPlayer == X) ? O : X;\n    }\n    \n    bool checkWin() const {\n        // 检查行\n        for (int i = 0; i < 3; i++) {\n            if (board[i][0] == currentPlayer && board[i][1] == currentPlayer && board[i][2] == currentPlayer) {\n                return true;\n            }\n        }\n        \n        // 检查列\n        for (int j = 0; j < 3; j++) {\n            if (board[0][j] == currentPlayer && board[1][j] == currentPlayer && board[2][j] == currentPlayer) {\n                return true;\n            }\n        }\n        \n        // 检查对角线\n        if (board[0][0] == currentPlayer && board[1][1] == currentPlayer && board[2][2] == currentPlayer) {\n            return true;\n        }\n        if (board[0][2] == currentPlayer && board[1][1] == currentPlayer && board[2][0] == currentPlayer) {\n            return true;\n        }\n        \n        return false;\n    }\n    \n    bool checkDraw() const {\n        for (int i = 0; i < 3; i++) {\n            for (int j = 0; j < 3; j++) {\n                if (board[i][j] ==  ) {\n                    return false;\n                }\n            }\n        }\n        return true;\n    }\n    \n    void printBoard() const {\n        for (int i = 0; i < 3; i++) {\n            for (int j = 0; j < 3; j++) {\n                cout << board[i][j];\n                if (j < 2) cout << "|";\n            }\n            cout << endl;\n            if (i < 2) cout << "-+-+-" << endl;\n        }\n    }\n};\n\nint main() {\n    TicTacToe game;\n    \n    try {\n        game.makeMove(0, 0);\n        game.makeMove(1, 1);\n        game.makeMove(0, 1);\n        game.makeMove(1, 0);\n        game.makeMove(0, 2); // 获胜\n    } catch (const InvalidMoveException &e) {\n        cout << "错误: " << e.what() << endl;\n    } catch (const GameOverException &e) {\n        cout << e.what() << endl;\n    }\n    \n    game.printBoard();\n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "使用自定义异常处理井字棋游戏的各种错误，如无效移动和游戏结束等。", "expectedOutput": "井字棋游戏的运行结果或错误信息"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.149	2026-02-01 12:32:58.004
fee3d223-f376-4880-bd06-1ca84dab38e2	认识C++程序结构	下面哪个是C++程序的入口函数？	EASY	1-01		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["main()", "start()", "begin()", "run()"], "explanation": "C++程序从main()函数开始执行，这是程序的入口点。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.382	2026-02-01 12:24:14.798
b76bf06b-cf21-4891-a5e5-051638e9c157	Hello World输出	补全代码，使程序输出 Hello World	EASY	1-01		\N	\N	10	2	t	FILL_BLANK	{"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    {{blank}} << \\"Hello World\\";\\n    return 0;\\n}", "blanks": [{"hint": "标准输出流", "answer": "cout"}], "explanation": "cout是C++的标准输出流，用于向屏幕输出内容。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.388	2026-02-01 12:24:15.984
755db227-bce5-4a32-ba58-c30bc353849c	变量使用	声明两个整型变量a=3和b=5，输出它们的和	MEDIUM	1-01	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 声明变量并输出和\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "声明变量后可以进行运算并输出结果。", "expectedOutput": "8"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.451	2026-02-01 12:24:26.153
22b2f40a-e140-4d33-a6e2-ad72d8e6ada9	类型选择	为下列数据选择合适的类型	MEDIUM	1-01		\N	\N	10	8	t	MATCHING	{"leftItems": ["身高1.75米", "是否及格", "体重65公斤", "是否会员"], "rightItems": ["double", "bool", "double", "bool"], "explanation": "小数用double，是/否判断用bool。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.513	2026-02-01 12:24:37.201
e316f149-8c8e-4de2-a455-f154d2755252	四种类型综合	声明四个变量：整型age=15，字符型grade='A'，浮点型score=95.5，布尔型passed=true，并依次输出	HARD	1-01	#include <iostream>\nusing namespace std;\n\nint main() {\n    // 声明四种类型的变量并输出\n    \n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "综合练习四种基本数据类型。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.52	2026-02-01 12:24:38.043
a3fc7eff-940b-4b7a-837e-59e16bf7f48b	类型综合匹配	将变量与最合适的类型匹配	MEDIUM	1-01		\N	\N	10	8	t	MATCHING	{"leftItems": ["班级人数", "平均分", "性别(M/F)", "是否迟到"], "rightItems": ["int", "double", "char", "bool"], "explanation": "根据数据特点选择合适的类型。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.545	2026-02-01 12:24:44.537
7f5d8b71-a5f4-4271-98d9-fdcb8b2c616a	算术运算综合	已知a=10, b=3，计算并输出：和、差、积、商、余数	MEDIUM	1-02	#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 10, b = 3;\n    // 计算并输出五种运算结果\n    \n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "练习五种基本算术运算。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.591	2026-02-01 12:24:54.809
a0c25124-23a3-4b88-9687-72098d037b84	常见错误	找出判断相等的错误	MEDIUM	1-02		\N	\N	10	7	t	BUG_FIX	{"bugLine": 1, "buggyCode": "if (a = 5) { // 判断a是否等于5\\n    cout << \\"相等\\";\\n}", "correctCode": "if (a == 5) { // 判断a是否等于5\\n    cout << \\"相等\\";\\n}", "explanation": "这是初学者最常犯的错误，=是赋值，==才是判断相等。", "bugDescription": "应该用==判断相等，=是赋值"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.613	2026-02-01 12:24:58.062
d317e25a-ea0e-41a9-8dba-aaaf58db70fd	自减运算	int a = 5; a--; a的值是？	EASY	1-02		\N	\N	10	2	t	MULTIPLE_CHOICE	{"options": ["4", "5", "6", "3"], "explanation": "a--使a的值减少1。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.664	2026-02-01 12:25:07.189
1fac89a9-dd07-485e-bd29-262e6674be13	运算符识别	将运算符与类别匹配	EASY	1-02		\N	\N	10	1	t	MATCHING	{"leftItems": ["+", ">", "&&", "++"], "rightItems": ["算术运算符", "关系运算符", "逻辑运算符", "自增运算符"], "explanation": "熟悉各类运算符。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.695	2026-02-01 12:25:14.328
6ff94fc8-5ebb-4fb0-9945-b8c0dd372afa	输出运算符	补全输出语句	EASY	1-03		\N	\N	10	3	t	FILL_BLANK	{"code": "cout {{blank}} \\"Hello\\";", "blanks": [{"hint": "输出运算符", "answer": "<<"}], "explanation": "<<是输出运算符，用于cout。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.735	2026-02-01 12:25:20.605
21032c75-09cf-4106-b722-d3fd3620dfa7	格式符匹配	将数据类型与格式符匹配	MEDIUM	1-03		\N	\N	10	6	t	MATCHING	{"leftItems": ["int", "double", "char", "long long"], "rightItems": ["%d", "%f 或 %lf", "%c", "%lld"], "explanation": "不同类型使用不同的格式说明符。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:54.778	2026-02-01 12:25:30.043
7a936728-da73-4873-a9f4-9ec3f810d52e	左对齐	让数字左对齐输出	MEDIUM	1-03		\N	\N	10	4	t	FILL_BLANK	{"code": "printf(\\"{{blank}}\\", 42); // 输出\\"42   \\"", "blanks": [{"hint": "负号表示左对齐", "answer": "%-5d"}], "explanation": "%-5d表示宽度5，左对齐。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.805	2026-02-01 12:25:34.506
a8aa7062-b1a6-4085-aec3-6e17660948bb	cout格式控制	cout如何保留2位小数？	MEDIUM	1-03		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["cout << fixed << setprecision(2)", "cout << precision(2)", "cout << decimal(2)", "cout << format(2)"], "explanation": "需要包含<iomanip>头文件，使用fixed和setprecision。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.812	2026-02-01 12:25:35.806
e609ed42-efae-428f-a1e4-4c225a4f84ba	输出格式化	如何输出 "结果是: 3.14"？(pi=3.14159)	MEDIUM	1-03		\N	\N	10	4	t	MULTIPLE_CHOICE	{"options": ["printf(\\"结果是: %.2f\\", pi);", "printf(\\"结果是: %d\\", pi);", "printf(\\"结果是: pi\\");", "printf(\\"结果是: %.2d\\", pi);"], "explanation": "%.2f保留2位小数。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:54.874	2026-02-01 12:25:46.174
9792d979-853e-490b-8c81-3e134dd3b1f2	格式化输出表格	输出一个简单的乘法表格（1-3的乘法），每个结果占4位宽度	HARD	1-03	#include <cstdio>\n\nint main() {\n    // 输出格式化乘法表\n    // 1*1=1    1*2=2    1*3=3\n    // 2*1=2    2*2=4    2*3=6\n    // 3*1=3    3*2=6    3*3=9\n    \n    return 0;\n}	\N	\N	15	9	t	CODING	{"explanation": "综合运用循环和格式化输出。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.89	2026-02-01 12:25:48.683
5cd25d27-32e1-4ff3-9615-3d05719e12a6	多分支语法	补全多分支结构，判断成绩等级	EASY	1-04		\N	\N	10	2	t	FILL_BLANK	{"code": "int score = 85;\\nif (score >= 90) {\\n    cout << \\"优秀\\";\\n} {{blank}} (score >= 80) {\\n    cout << \\"良好\\";\\n} else {\\n    cout << \\"及格\\";\\n}", "blanks": [{"hint": "否则如果", "answer": "else if"}], "explanation": "else if用于添加更多的条件分支。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.94	2026-02-01 12:26:00.063
a86dcd08-7def-4621-98ad-ff3ac5726f0e	switch表达式类型	补全switch语句，使用字符作为表达式	MEDIUM	1-04		\N	\N	10	7	t	FILL_BLANK	{"code": "char op = '+';\\n{{blank}} (op) {\\n    case '+: cout << \\"加法\\"; break;\\n    case '-: cout << \\"减法\\"; break;\\n    default: cout << \\"其他\\"; break;\\n}", "blanks": [{"hint": "开关语句", "answer": "switch"}], "explanation": "switch表达式可以是整数、字符等类型。"}	EXERCISE_LIBRARY	2026-01-30 16:29:54.991	2026-02-01 12:26:09.783
0148852c-a823-4243-b9b3-ffe37604df10	成绩等级判断	补全代码，根据成绩输出等级	MEDIUM	1-04		\N	\N	10	3	t	FILL_BLANK	{"code": "int score = 85;\\nif (score >= 90) {\\n    cout << \\"A\\";\\n} else if (score >= 80) {\\n    cout << \\"{{blank}}\\";\\n} else if (score >= 70) {\\n    cout << \\"C\\";\\n} else {\\n    cout << \\"D\\";\\n}", "blanks": [{"hint": "良好等级", "answer": "B"}], "explanation": "80-89分对应等级B。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.054	2026-02-01 12:26:20.899
91ac6de3-97dc-4f6d-8ba5-141c943deeb4	for循环编程	使用for循环计算1到n的和	MEDIUM	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, sum = 0;\n    cin >> n;\n    // 在这里写代码\n    \n    cout << sum;\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用for循环从1到n累加。", "expectedOutput": "1到n的和"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.119	2026-02-01 12:26:32.436
90806709-c4d3-4bdd-85be-276bf67218b5	while循环的基本语法	while循环的基本语法结构是什么？	EASY	1-05		\N	\N	10	1	t	MULTIPLE_CHOICE	{"options": ["while (条件) { 语句 }", "while { 条件 } 语句", "while (条件) 语句", "while 条件 { 语句 }"], "explanation": "while循环的正确语法是while (条件) { 语句 }。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.127	2026-02-01 12:26:32.966
a1f8545d-392a-4b83-8651-55262e7def43	三种循环的比较	匹配循环类型与特点	MEDIUM	1-05		\N	\N	10	7	t	MATCHING	{"leftItems": ["for循环", "while循环", "do-while循环"], "rightItems": ["适合已知循环次数", "适合未知循环次数", "至少执行一次"], "explanation": "for循环适合已知循环次数，while循环适合未知循环次数，do-while循环至少执行一次。", "correctPairs": [[0, 0], [1, 1], [2, 2]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.196	2026-02-01 12:26:43.669
d3b01e64-b762-4a0d-a590-8368c5736bcc	循环统计的应用	输入n个数，统计其中正数、负数和零的个数	MEDIUM	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, num, pos = 0, neg = 0, zero = 0;\n    cin >> n;\n    // 在这里写代码\n    \n    cout << "正数: " << pos << endl;\n    cout << "负数: " << neg << endl;\n    cout << "零: " << zero << endl;\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用循环和条件判断统计不同类型的数。", "expectedOutput": "正数、负数和零的个数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.244	2026-02-01 12:26:52.568
5f8c8c83-1288-4f4b-8998-577f3c9c75f3	循环的应用	匹配问题与适合的循环类型	MEDIUM	1-05		\N	\N	10	4	t	MATCHING	{"leftItems": ["计算1到n的和", "猜数字游戏", "输入验证", "遍历数组"], "rightItems": ["for循环", "while循环", "do-while循环", "for循环"], "explanation": "根据具体问题选择合适的循环类型。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.258	2026-02-01 12:26:54.726
0b22060a-b403-42e1-a7d5-a693ee62bc4e	找错误	找出嵌套循环的错误	MEDIUM	1-05		\N	\N	10	5	t	BUG_FIX	{"bugLine": 1, "buggyCode": "for (int i = 1; i <= 3; i++)\\n    for (int j = 1; j <= 2; j++)\\n        cout << i << j << \\" \\";\\n    cout << endl;", "correctCode": "for (int i = 1; i <= 3; i++) {\\n    for (int j = 1; j <= 2; j++) {\\n        cout << i << j << \\" \\";\\n    }\\n    cout << endl;\\n}", "explanation": "嵌套循环需要使用花括号来明确循环体的范围。", "bugDescription": "缺少花括号，导致cout << endl只执行一次"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.296	2026-02-01 12:27:04.161
1cff97ba-d949-45e1-a904-7ffc573830bf	循环嵌套的效率	对于嵌套循环，以下哪种优化是有效的？	HARD	1-05		\N	\N	10	9	t	MULTIPLE_CHOICE	{"options": ["将内层循环中不依赖外层循环的计算移到外层", "增加循环的层数", "使用更复杂的循环条件", "减少循环体内的操作"], "explanation": "将内层循环中不依赖外层循环的计算移到外层可以减少重复计算，提高效率。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.309	2026-02-01 12:27:06.512
ed2b572d-0159-4e6f-bd52-188cd3684953	九九乘法表的逻辑	以下代码输出的是什么样的乘法表？\nfor (int i = 1; i <= 9; i++) {\n    for (int j = 1; j <= 9; j++) {\n        cout << i << "*" << j << "=" << i*j << "\t";\n    }\n    cout << endl;\n}	MEDIUM	1-05		\N	\N	10	3	t	MULTIPLE_CHOICE	{"options": ["正方形乘法表", "三角形乘法表", "倒三角形乘法表", "只输出一行"], "explanation": "内层循环j从1到9，所以输出的是正方形的乘法表。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.322	2026-02-01 12:27:09.46
ebd47f82-861f-4645-a80b-a9e3b6fd4547	break语句的执行效果	执行以下代码会输出什么？\nfor (int i = 1; i <= 5; i++) {\n    if (i == 3) {\n        break;\n    }\n    cout << i << " ";\n}	MEDIUM	1-05		\N	\N	10	5	t	MULTIPLE_CHOICE	{"options": ["1 2", "1 2 3", "1 2 3 4 5", "编译错误"], "explanation": "当i=3时，执行break语句，跳出循环，所以只输出1 2。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.363	2026-02-01 12:27:18.686
b28455fb-3d54-4097-8b92-af927746dcfb	continue语句的执行效果	执行以下代码会输出什么？\nfor (int i = 1; i <= 5; i++) {\n    if (i == 3) {\n        continue;\n    }\n    cout << i << " ";\n}	MEDIUM	1-05		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["1 2 4 5", "1 2 3 4 5", "1 2", "编译错误"], "explanation": "当i=3时，执行continue语句，跳过当前循环的剩余部分，直接开始下一次循环，所以输出1 2 4 5。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:55.366	2026-02-01 12:27:19.117
f413e776-b325-408b-afce-301bcdf67444	质数统计编程	输入一个正整数n，统计1到n之间的质数个数	HARD	1-05	#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, count = 0;\n    cin >> n;\n    // 在这里写代码\n    \n    cout << count;\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "使用循环遍历1到n的每个数，判断是否是质数，统计质数的个数。", "expectedOutput": "1到n之间的质数个数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.423	2026-02-01 12:27:28.631
3e987ae8-35a4-47b9-af0b-777ae6d1d95b	循环嵌套与break	补全代码，使用嵌套循环和break语句查找二维数组中的目标值	MEDIUM	1-05		\N	\N	10	2	t	FILL_BLANK	{"code": "int arr[2][3] = {{1, 2, 3}, {4, 5, 6}};\\nint target = 5;\\nbool found = false;\\nfor (int i = 0; i < 2; i++) {\\n    for (int j = 0; j < 3; j++) {\\n        if (arr[i][j] == target) {\\n            found = true;\\n            {{blank}};\\n        }\\n    }\\n    if (found) {\\n        break;\\n    }\\n}\\ncout << (found ? \\"找到\\" : \\"未找到\\");", "blanks": [{"hint": "跳出内层循环", "answer": "break"}], "explanation": "当找到目标值时，使用break语句跳出内层循环。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.436	2026-02-01 12:27:29.588
760ea552-16af-4f35-b1e3-932164d0a582	数组的初始化	以下哪种数组初始化方式是正确的？	MEDIUM	1-06		\N	\N	10	6	t	MULTIPLE_CHOICE	{"options": ["int arr[5] = {1, 2, 3, 4, 5};", "int arr[] = {1, 2, 3};", "int arr[5] = {1, 2};", "以上都是"], "explanation": "以上三种初始化方式都是正确的：指定大小并初始化所有元素，不指定大小由初始化列表决定，指定大小但只初始化部分元素。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:55.488	2026-02-01 12:27:40.188
8e709b09-67df-4f99-b3d8-0cf66ce543b9	while循环遍历数组	补全代码，使用while循环遍历数组	MEDIUM	1-06		\N	\N	10	3	t	FILL_BLANK	{"code": "int arr[5] = {1, 2, 3, 4, 5};\\nint i = 0;\\nwhile (i < 5) {\\n    cout << arr[i] << \\" \\";\\n    {{blank}};\\n}", "blanks": [{"hint": "自增操作", "answer": "i++"}], "explanation": "在while循环中需要手动递增循环变量。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.551	2026-02-01 12:27:49.716
85f23c5b-536e-4f1d-971b-80583f55c580	数组遍历的综合应用	遍历数组，统计其中正数、负数和零的个数	MEDIUM	1-06	#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[10] = {1, -2, 0, 3, -4, 5, -6, 0, 7, -8};\n    int pos = 0, neg = 0, zero = 0;\n    // 在这里写代码\n    \n    cout << "正数: " << pos << endl;\n    cout << "负数: " << neg << endl;\n    cout << "零: " << zero << endl;\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "遍历数组，使用条件判断统计不同类型的数。", "expectedOutput": "正数、负数和零的个数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.575	2026-02-01 12:27:56.02
4e509978-6aee-4eeb-ad73-a7cbd2506ac7	数组统计与排序	匹配统计操作与实现方法	MEDIUM	1-06		\N	\N	10	8	t	MATCHING	{"leftItems": ["求最大值", "求最小值", "求平均值", "统计元素个数"], "rightItems": ["遍历比较", "遍历比较", "求和再平均", "遍历计数"], "explanation": "不同的统计操作需要不同的实现方法。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.602	2026-02-01 12:28:01.697
e17744cc-9dea-46b9-a210-0ed74f4165e6	二维数组的元素访问	补全代码，访问二维数组的第二行第三列元素	EASY	1-06		\N	\N	10	3	t	FILL_BLANK	{"code": "int arr[3][4];\\n// 访问第二行第三列元素\\ncout << arr[{{blank}}][{{blank}}];", "blanks": [{"hint": "行下标", "answer": "1"}, {"hint": "列下标", "answer": "2"}], "explanation": "二维数组的下标从0开始，所以第二行的下标是1，第三列的下标是2。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.653	2026-02-01 12:28:13.094
3faee39e-dce1-4573-9af4-8c5cd1c85464	矩阵操作的应用	匹配矩阵操作与应用场景	MEDIUM	1-06		\N	\N	10	8	t	MATCHING	{"leftItems": ["图像处理", "线性代数", "游戏开发", "数据存储"], "rightItems": ["矩阵变换", "矩阵运算", "坐标变换", "二维数组"], "explanation": "矩阵在各个领域都有广泛的应用，如图像处理中的变换、线性代数中的运算、游戏开发中的坐标变换等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.708	2026-02-01 12:28:23.877
11eada4f-fd10-4044-a20c-8bac6e460523	string类的访问	补全代码，访问string变量的第三个字符	MEDIUM	1-06		\N	\N	10	5	t	FILL_BLANK	{"code": "string str = \\"Hello\\";\\ncout << str[{{blank}}];", "blanks": [{"hint": "字符下标", "answer": "2"}], "explanation": "string类的字符下标从0开始，所以第三个字符的下标是2。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.771	2026-02-01 12:28:33.727
52ca47e3-c087-4936-b330-8a9861106dce	string类的成员函数	匹配string成员函数与功能	MEDIUM	1-06		\N	\N	10	8	t	MATCHING	{"leftItems": ["length()", "empty()", "substr()", "append()"], "rightItems": ["返回字符串长度", "判断字符串是否为空", "返回子字符串", "追加字符串"], "explanation": "string类提供了丰富的成员函数用于字符串操作。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:55.783	2026-02-01 12:28:36.733
c023b9ad-234a-413f-b6f1-2d978432c378	综合应用挑战	输入一个字符串，将其转换为二维数组表示的字符矩阵（每行固定长度）	HARD	1-06	#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string text;\n    int rowLength;\n    cin >> rowLength;\n    cin.ignore();\n    getline(cin, text);\n    // 在这里写代码\n    \n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "将字符串分割为每行固定长度的子字符串，存储到二维数组中并输出。", "expectedOutput": "字符矩阵"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.823	2026-02-01 12:28:43.711
56f25845-6f73-438e-bf26-82b8a894806c	函数的返回值	补全代码，函数返回两个数中的最大值	EASY	1-08		\N	\N	10	4	t	FILL_BLANK	{"code": "int max(int a, int b) {\\n    if (a > b) {\\n        return {{blank}};\\n    } else {\\n        return {{blank}};\\n    }\\n}", "blanks": [{"hint": "第一个参数", "answer": "a"}, {"hint": "第二个参数", "answer": "b"}], "explanation": "函数返回两个数中的较大值。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.875	2026-02-01 12:28:52.439
bc377fdb-121f-40fe-a8e7-620f990325dc	指针的间接访问	执行以下代码，输出结果是什么？\nint num = 10;\nint *ptr = &num;\n*ptr = 20;\ncout << num;	MEDIUM	1-12		\N	\N	15	5	t	MULTIPLE_CHOICE	{"options": ["20", "10", "编译错误", "运行错误"], "explanation": "通过指针的解引用操作可以修改指针指向的变量的值。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.251	2026-02-01 12:29:57.54
a88e6101-16e4-4777-b829-4959b6431d77	函数的声明与定义分离	补全代码，分离函数的声明和定义	MEDIUM	1-08		\N	\N	10	5	t	FILL_BLANK	{"code": "// 函数声明\\n{{blank}} int min(int a, int b);\\n\\nint main() {\\n    cout << min(3, 5);\\n    return 0;\\n}\\n\\n// 函数定义\\nint min(int a, int b) {\\n    return a < b ? a : b;\\n}", "blanks": [{"hint": "函数声明不需要函数体", "answer": ""}], "explanation": "函数声明只需要返回类型、函数名和参数列表，不需要函数体。"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.878	2026-02-01 12:28:53.146
96c5d48e-7f4c-49ee-8b55-039c14b55099	参数默认值编程	定义一个函数，计算矩形的面积，宽度默认为2	HARD	1-08	#include <iostream>\nusing namespace std;\n\n// 在这里定义rectangleArea函数\n\nint main() {\n    int length1, length2, width;\n    cin >> length1 >> length2 >> width;\n    cout << rectangleArea(length1) << endl;\n    cout << rectangleArea(length2, width);\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "为width参数设置默认值2。", "expectedOutput": "第一个矩形的面积（使用默认宽度）和第二个矩形的面积（使用指定宽度）"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.932	2026-02-01 12:29:02.909
c396db13-ce17-4ad3-b203-fd6839e55344	函数重载的综合应用	重载calculate函数，分别计算矩形和圆形的面积	HARD	1-08	#include <iostream>\nusing namespace std;\nconst double PI = 3.14159;\n\n// 在这里定义重载的calculate函数\n\nint main() {\n    double length = 5, width = 3, radius = 2;\n    cout << "矩形面积: " << calculate(length, width) << endl;\n    cout << "圆形面积: " << calculate(radius);\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "定义两个calculate函数，一个接收长和宽计算矩形面积，一个接收半径计算圆形面积。", "expectedOutput": "矩形的面积和圆形的面积"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.976	2026-02-01 12:29:08.795
7318e6f3-cb56-4b10-8cdb-55028a44952f	综合编程挑战	定义一个函数，判断一个数是否是质数	HARD	1-08	#include <iostream>\nusing namespace std;\n\n// 在这里定义isPrime函数\n\nint main() {\n    int n;\n    cin >> n;\n    if (isPrime(n)) {\n        cout << "是质数";\n    } else {\n        cout << "不是质数";\n    }\n    return 0;\n}	\N	\N	20	5	t	CODING	{"explanation": "定义一个isPrime函数，接收一个int参数，返回bool类型表示是否是质数。", "expectedOutput": "是质数或不是质数"}	EXERCISE_LIBRARY	2026-01-30 16:29:55.999	2026-02-01 12:29:11.913
94e28981-a0d7-4dee-9ec3-c37e4448d800	函数重载挑战	重载sort函数，分别对整数数组和浮点数数组进行排序	HARD	1-08	#include <iostream>\nusing namespace std;\n\n// 在这里定义重载的sort函数\n\nvoid printArray(int arr[], int size) {\n    for (int i = 0; i < size; i++) {\n        cout << arr[i] << " ";\n    }\n    cout << endl;\n}\n\nvoid printArray(double arr[], int size) {\n    for (int i = 0; i < size; i++) {\n        cout << arr[i] << " ";\n    }\n    cout << endl;\n}\n\nint main() {\n    int intArr[] = {5, 2, 8, 1, 9};\n    double doubleArr[] = {3.5, 1.2, 4.8, 2.1, 5.6};\n    int size = 5;\n    \n    sort(intArr, size);\n    sort(doubleArr, size);\n    \n    printArray(intArr, size);\n    printArray(doubleArr, size);\n    return 0;\n}	\N	\N	20	6	t	CODING	{"explanation": "定义两个sort函数，一个接收int数组，一个接收double数组，使用冒泡排序算法。", "expectedOutput": "排序后的整数数组和浮点数数组"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.002	2026-02-01 12:29:12.867
0ca40135-d07e-4009-aa6f-6a9e4a3b2eed	递归与栈溢出	递归可能导致栈溢出的原因是？	HARD	1-09		\N	\N	10	8	t	MULTIPLE_CHOICE	{"options": ["递归深度过大", "递归终止条件错误", "递归调用次数过多", "以上都是"], "explanation": "递归深度过大、终止条件错误或调用次数过多都可能导致栈溢出。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.044	2026-02-01 12:29:19.377
6be0961c-8fe6-4189-bdc2-beaf3ce453ee	递归的综合应用	使用递归函数计算斐波那契数列的第n项	HARD	1-09	#include <iostream>\nusing namespace std;\n\n// 在这里定义fibonacci函数\n\nint main() {\n    int n;\n    cin >> n;\n    cout << fibonacci(n);\n    return 0;\n}	\N	\N	15	10	t	CODING	{"explanation": "斐波那契数列：0, 1, 1, 2, 3, 5, 8, ... 终止条件是n==0返回0，n==1返回1。", "expectedOutput": "斐波那契数列的第n项"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.051	2026-02-01 12:29:21.144
4f302bc7-b9df-4c92-a06d-b1175df783ca	结构体变量的定义	补全代码，定义学生结构体变量	EASY	1-09		\N	\N	10	3	t	FILL_BLANK	{"code": "struct Student {\\n    string name;\\n    int age;\\n    double score;\\n};\\n\\nint main() {\\n    {{blank}} stu;\\n    return 0;\\n}", "blanks": [{"hint": "结构体类型", "answer": "Student"}], "explanation": "结构体变量的定义语法是：结构体名 变量名;"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.097	2026-02-01 12:29:28.592
94a339ab-f856-4634-93f0-ac47766ee694	结构体成员的访问	补全代码，访问结构体成员	EASY	1-09		\N	\N	10	4	t	FILL_BLANK	{"code": "struct Student {\\n    string name;\\n    int age;\\n    double score;\\n};\\n\\nint main() {\\n    Student stu;\\n    stu.{{blank}} = \\"John\\";\\n    stu.age = 18;\\n    stu.score = 95.5;\\n    return 0;\\n}", "blanks": [{"hint": "结构体成员", "answer": "name"}], "explanation": "结构体成员的访问使用点运算符：变量名.成员名"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.101	2026-02-01 12:29:29.114
42af9c50-808a-40bd-beb2-b3ed947b9854	结构体数组的输入	补全代码，输入学生结构体数组	MEDIUM	1-09		\N	\N	10	7	t	FILL_BLANK	{"code": "struct Student {\\n    string name;\\n    int age;\\n    double score;\\n};\\n\\nint main() {\\n    Student students[3];\\n    for (int i = 0; i < 3; i++) {\\n        cin >> students[i].name >> students[i].age >> students[i].score;\\n    }\\n    return 0;\\n}", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "使用循环输入结构体数组的每个元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.149	2026-02-01 12:29:36.266
b7f97cc2-aa00-42a3-837b-0c551b1de7bb	综合编程挑战	使用递归函数和结构体实现二叉树的前序遍历	HARD	1-09	#include <iostream>\nusing namespace std;\n\n// 在这里定义TreeNode结构体\n\n// 在这里定义preorderTraversal函数\n\nint main() {\n    // 创建一个简单的二叉树\n    TreeNode* root = new TreeNode(1);\n    root->left = new TreeNode(2);\n    root->right = new TreeNode(3);\n    root->left->left = new TreeNode(4);\n    root->left->right = new TreeNode(5);\n    \n    cout << "前序遍历结果: ";\n    preorderTraversal(root);\n    cout << endl;\n    \n    return 0;\n}	\N	\N	20	5	t	CODING	{"explanation": "前序遍历的顺序是：根节点 → 左子树 → 右子树。", "expectedOutput": "前序遍历结果: 1 2 4 5 3"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.179	2026-02-01 12:29:41.043
fb09b4f1-d9c7-4ae5-9fbb-94fd52cc7e9f	综合应用挑战	实现一个简单的通讯录管理系统，使用结构体存储联系人信息，支持添加、查询、修改和删除操作	HARD	1-09	#include <iostream>\n#include <string>\nusing namespace std;\n\n// 在这里定义Contact结构体\n\n// 在这里定义相关函数\n\nint main() {\n    Contact contacts[100];\n    int count = 0;\n    // 在这里实现通讯录管理系统的各项功能\n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "使用结构体数组存储联系人信息，实现基本的管理功能。", "expectedOutput": "通讯录管理系统的各项操作结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.195	2026-02-01 12:29:43.697
5db53f87-5b6c-4761-bd7d-454b8578b914	引用的特点	匹配引用特点与描述	MEDIUM	1-12		\N	\N	15	3	t	MATCHING	{"leftItems": ["必须初始化", "不能重新绑定", "共享内存地址", "可以作为函数参数"], "rightItems": ["引用定义时必须初始化", "引用一旦绑定到变量就不能改变", "引用与原变量共享内存", "引用可以作为函数参数传递"], "explanation": "引用的特点包括必须初始化、不能重新绑定、共享内存地址、可以作为函数参数等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.28	2026-02-01 12:30:02.46
c442554f-b117-401a-a9d5-370fb29ecab0	引用的综合应用	使用引用作为函数参数计算数组的最大值、最小值和平均值	HARD	1-12	#include <iostream>\nusing namespace std;\n\n// 在这里定义calculateStats函数\n\nint main() {\n    int arr[] = {1, 2, 3, 4, 5};\n    int size = 5;\n    int max, min;\n    double avg;\n    calculateStats(arr, size, max, min, avg);\n    cout << "最大值: " << max << endl;\n    cout << "最小值: " << min << endl;\n    cout << "平均值: " << avg << endl;\n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用引用作为函数参数，返回多个计算结果。", "expectedOutput": "数组的最大值、最小值和平均值"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.305	2026-02-01 12:30:09.92
acdb89ee-4bee-42c6-b5a1-208428b40271	引用传递的实现	补全代码，使用引用传递实现选择排序	MEDIUM	1-12		\N	\N	20	7	t	FILL_BLANK	{"code": "void selectionSort(int arr[], int size) {\\n    for (int i = 0; i < size - 1; i++) {\\n        int minIndex = i;\\n        for (int j = i + 1; j < size; j++) {\\n            if (arr[j] < arr[minIndex]) {\\n                minIndex = j;\\n            }\\n        }\\n        if (minIndex != i) {\\n            swap(arr[i], arr[minIndex]);\\n        }\\n    }\\n}\\n\\n{{blank}}\\n\\nint main() {\\n    int arr[] = {5, 2, 8, 1, 9};\\n    int size = 5;\\n    selectionSort(arr, size);\\n    for (int i = 0; i < size; i++) {\\n        cout << arr[i] << \\" \\";\\n    }\\n    return 0;\\n}", "blanks": [{"hint": "使用引用参数", "answer": "void swap(int& a, int& b)"}], "explanation": "使用引用传递实现swap函数，交换数组中的两个元素。", "expectedOutput": "排序后的数组"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.33	2026-02-01 12:30:13.21
cb8548a1-9f26-494d-bf9f-33080f8436cd	指针与引用的选择	匹配场景与指针/引用选择	MEDIUM	1-12		\N	\N	20	2	t	MATCHING	{"leftItems": ["需要修改参数", "参数可能为空", "避免复制大对象", "需要重新绑定"], "rightItems": ["引用或指针", "指针", "引用或常量引用", "指针"], "explanation": "根据不同的场景选择合适的指针或引用。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.35	2026-02-01 12:30:17.244
5ead90f7-fa94-4d03-b779-62d11217dfef	堆内存与栈内存	匹配内存区域与特点	MEDIUM	1-13		\N	\N	15	6	t	MATCHING	{"leftItems": ["堆内存", "栈内存", "堆内存", "栈内存"], "rightItems": ["动态内存分配", "自动变量存储", "需要手动释放", "自动释放"], "explanation": "堆内存用于动态内存分配，需要手动释放；栈内存用于存储自动变量，函数结束时自动释放。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.402	2026-02-01 12:30:25.951
ad454cff-6dce-426e-88d1-0fc76933b1f4	new与delete的注意事项	匹配注意事项与描述	MEDIUM	1-13		\N	\N	15	8	t	MATCHING	{"leftItems": ["避免重复释放", "避免释放野指针", "避免内存泄漏", "正确配对使用"], "rightItems": ["不要多次释放同一块内存", "不要释放未通过new分配的内存", "使用完内存后及时释放", "new与delete、new[]与delete[]配对"], "explanation": "使用new与delete时需要注意避免重复释放、避免释放野指针、避免内存泄漏和正确配对使用。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.459	2026-02-01 12:30:32.784
8b6bd2c2-e6fb-4e45-b30b-5b2241198f90	动态数组的基本概念	动态数组是什么？	EASY	1-13		\N	\N	20	1	t	MULTIPLE_CHOICE	{"options": ["在运行时分配大小的数组", "在编译时分配大小的数组", "固定大小的数组", "静态存储的数组"], "explanation": "动态数组是在运行时根据需要分配大小的数组。", "correctIndex": 0}	EXERCISE_LIBRARY	2026-01-30 16:29:56.469	2026-02-01 12:30:34.646
80a8c0bf-c23e-4a9b-80ea-6ecdf89dc10f	动态数组的优势	匹配动态数组优势与描述	MEDIUM	1-13		\N	\N	20	6	t	MATCHING	{"leftItems": ["大小灵活", "内存使用高效", "避免栈溢出", "支持运行时调整"], "rightItems": ["可以根据运行时需求确定大小", "只分配需要的内存空间", "存储在堆内存，避免栈空间不足", "可以重新分配大小"], "explanation": "动态数组的优势包括大小灵活、内存使用高效、避免栈溢出和支持运行时调整。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.496	2026-02-01 12:30:37.295
4d7b851a-d61c-4027-8fac-12370d4f3b63	野指针的避免方法	匹配避免方法与描述	MEDIUM	1-13		\N	\N	20	6	t	MATCHING	{"leftItems": ["初始化指针", "释放后置空", "避免悬垂指针", "使用智能指针"], "rightItems": ["定义指针时初始化为nullptr", "释放内存后将指针设为nullptr", "避免指针指向已释放的内存", "自动管理内存生命周期"], "explanation": "避免野指针的方法包括初始化指针、释放后置空、避免悬垂指针和使用智能指针等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.546	2026-02-01 12:30:45.897
98b6571d-c27b-4a50-9276-b334daaac495	智能指针的应用	使用智能指针实现一个简单的二叉树	HARD	1-13	#include <iostream>\n#include <memory>\nusing namespace std;\n\nstruct TreeNode {\n    int data;\n    unique_ptr<TreeNode> left;\n    unique_ptr<TreeNode> right;\n    \n    TreeNode(int val) : data(val), left(nullptr), right(nullptr) {} \n};\n\n// 在这里实现二叉树的基本操作\n\nint main() {\n    // 测试二叉树操作\n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "使用unique_ptr实现二叉树，自动管理节点的内存释放。", "expectedOutput": "二叉树的创建、插入和遍历"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.594	2026-02-01 12:30:53.424
dbdb9774-5930-497d-bb55-c300ff5a3f83	stack容器	补全代码，使用stack的基本操作	MEDIUM	1-11		\N	\N	15	5	t	FILL_BLANK	{"code": "stack<int> s;\\ns.{{blank}}(1); // 入栈\\ns.{{blank}}(2); // 入栈\\ncout << s.{{blank}}(); // 查看栈顶元素\\ns.{{blank}}(); // 出栈\\ncout << s.size(); // 输出大小", "blanks": [{"hint": "入栈", "answer": "push"}, {"hint": "入栈", "answer": "push"}, {"hint": "查看栈顶", "answer": "top"}, {"hint": "出栈", "answer": "pop"}], "explanation": "stack是后进先出(LIFO)容器，push用于入栈，pop用于出栈，top用于查看栈顶元素。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.659	2026-02-01 12:31:03.516
bffa574a-581b-4c24-a6c2-453517a7d7a3	迭代器的类型	匹配迭代器类型与特点	MEDIUM	1-11		\N	\N	20	2	t	MATCHING	{"leftItems": ["输入迭代器", "输出迭代器", "前向迭代器", "双向迭代器", "随机访问迭代器"], "rightItems": ["只读，只能向前移动", "只写，只能向前移动", "可读写，只能向前移动", "可读写，可向前向后移动", "可读写，可随机访问"], "explanation": "STL定义了五种迭代器类型：输入迭代器、输出迭代器、前向迭代器、双向迭代器和随机访问迭代器。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]]}	EXERCISE_LIBRARY	2026-01-30 16:29:56.691	2026-02-01 12:31:10.412
92995ef1-5db8-4da3-8fdb-525bb1b14661	迭代器编程	使用迭代器遍历和修改容器	MEDIUM	1-11	#include <iostream>\n#include <vector>\n#include <list>\nusing namespace std;\n\nint main() {\n    vector<int> v = {1, 2, 3, 4, 5};\n    list<int> l = {10, 20, 30, 40, 50};\n    \n    // 使用迭代器遍历vector并修改元素\n    // 使用迭代器遍历list并修改元素\n    // 使用反向迭代器遍历容器\n    \n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "使用不同类型的迭代器遍历和修改容器。", "expectedOutput": "修改后的容器元素"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.72	2026-02-01 12:31:15.023
80da624b-7fb2-4c4b-984c-c4710caaf5db	STL的最佳实践	补全代码，使用STL的最佳实践	MEDIUM	1-11		\N	\N	20	3	t	FILL_BLANK	{"code": "// 使用auto简化迭代器声明\\nvector<int> v = {1, 2, 3, 4, 5};\\nfor ({{blank}} it = v.begin(); it != v.end(); ++it) {\\n    cout << *it << \\" \\";\\n}", "blanks": [{"hint": "自动类型推导", "answer": "auto"}], "explanation": "使用auto关键字可以简化迭代器的声明，提高代码可读性。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.779	2026-02-01 12:31:23.836
844decbd-57cb-4e04-a639-bceff5232408	STL的实际应用	使用STL实现一个简单的通讯录	HARD	1-11	#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nstruct Contact {\n    string name;\n    string phone;\n};\n\nint main() {\n    vector<Contact> contacts;\n    \n    // 添加联系人\n    // 按姓名排序\n    // 查找联系人\n    // 打印所有联系人\n    \n    return 0;\n}	\N	\N	25	8	t	CODING	{"explanation": "使用vector存储联系人，使用sort算法排序，使用find_if算法查找。", "expectedOutput": "通讯录的各种操作结果"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.796	2026-02-01 12:31:26.421
54483899-034f-48d1-ba2c-9864be7f3adf	文件打开模式	以下哪个是文件打开模式？	MEDIUM	1-14		\N	\N	15	7	t	MULTIPLE_CHOICE	{"options": ["ios::in", "ios::out", "ios::app", "以上都是"], "explanation": "ios::in是读取模式，ios::out是写入模式，ios::app是追加模式，都是文件打开模式。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:56.828	2026-02-01 12:31:31.483
1d7fb0bd-9e0a-455e-9616-14626d332fa9	文件操作概念编程	使用文件流打开文件并检查状态	MEDIUM	1-14	#include <iostream>\n#include <fstream>\nusing namespace std;\n\nint main() {\n    ifstream file("data.txt");\n    // 检查文件是否打开成功\n    if (!file) {\n        cout << "文件打开失败" << endl;\n        return 1;\n    }\n    cout << "文件打开成功" << endl;\n    // 关闭文件\n    file.close();\n    return 0;\n}	\N	\N	20	10	t	CODING	{"explanation": "使用ifstream打开文件，检查文件流状态，关闭文件。", "expectedOutput": "文件打开成功或失败的信息"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.838	2026-02-01 12:31:34.474
5a6e1ace-3f7f-4765-8a28-c4d8ff5f7829	二进制文件的读取	补全代码，读取二进制文件	HARD	1-14		\N	\N	20	3	t	FILL_BLANK	{"code": "ifstream file(\\"data.bin\\", ios::in | ios::binary);\\nint num;\\nfile.{{blank}}((char*)&num, sizeof(num));\\ncout << num << endl;\\nfile.close();", "blanks": [{"hint": "读取二进制数据", "answer": "read"}], "explanation": "使用read()方法读取二进制文件的数据。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.88	2026-02-01 12:31:44.18
59d46000-e3a5-426b-8a2f-bb7e09652b57	文本文件的读取与解析	补全代码，读取并解析文本文件	HARD	1-14		\N	\N	20	6	t	FILL_BLANK	{"code": "ifstream file(\\"data.txt\\");\\nstring name;\\nint age;\\ndouble score;\\nwhile (file >> name >> age >> score) {\\n    cout << \\"Name: \\" << name << \\", Age: \\" << age << \\", Score: \\" << score << endl;\\n}\\nfile.close();", "blanks": [{"hint": "无需补全", "answer": ""}], "explanation": "使用>>运算符按顺序读取文本文件中的数据。"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.924	2026-02-01 12:32:13.296
1a0d71b1-766e-4ac7-80af-e233ad21f08d	文本文件编程	读取文本文件并计算平均值	MEDIUM	1-14	#include <iostream>\n#include <fstream>\nusing namespace std;\n\nint main() {\n    ifstream file("scores.txt");\n    if (!file) {\n        cout << "文件打开失败" << endl;\n        return 1;\n    }\n    \n    double score, sum = 0;\n    int count = 0;\n    \n    // 读取分数并计算平均值\n    \n    if (count > 0) {\n        double average = sum / count;\n        cout << "平均值: " << average << endl;\n    } else {\n        cout << "没有数据" << endl;\n    }\n    \n    file.close();\n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "读取文本文件中的分数，计算它们的平均值。", "expectedOutput": "分数的平均值"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.934	2026-02-01 12:32:14.791
71f4c073-76d7-42f3-8853-a2ae8963d5fe	文件操作的终极挑战	实现一个简单的文件压缩工具	HARD	1-14	#include <iostream>\n#include <fstream>\n#include <string>\nusing namespace std;\n\nvoid compressFile(const string &inputFile, const string &outputFile) {\n    // 打开输入文件\n    // 打开输出文件\n    // 读取数据并压缩\n    // 写入压缩后的数据\n    // 关闭文件\n}\n\nvoid decompressFile(const string &inputFile, const string &outputFile) {\n    // 打开输入文件\n    // 打开输出文件\n    // 读取压缩数据并解压\n    // 写入解压后的数据\n    // 关闭文件\n}\n\nint main() {\n    compressFile("original.txt", "compressed.bin");\n    decompressFile("compressed.bin", "restored.txt");\n    return 0;\n}	\N	\N	25	8	t	CODING	{"explanation": "实现一个简单的文件压缩工具，使用Run-Length Encoding (RLE)算法进行压缩。", "expectedOutput": "压缩和解压后的文件内容"}	EXERCISE_LIBRARY	2026-01-30 16:29:56.965	2026-02-01 12:32:21.508
6c353667-7b9d-4b41-87f2-f3ec32d50133	异常处理的优点	匹配异常处理优点与描述	MEDIUM	1-15		\N	\N	15	9	t	MATCHING	{"leftItems": ["错误处理与业务逻辑分离", "可以传递详细的错误信息", "可以处理不同类型的错误", "可以在适当的层次处理错误"], "rightItems": ["提高代码可读性", "便于调试和错误定位", "提高代码的灵活性", "提高代码的可维护性"], "explanation": "异常处理的优点包括错误处理与业务逻辑分离、可以传递详细的错误信息、可以处理不同类型的错误和可以在适当的层次处理错误等。", "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]}	EXERCISE_LIBRARY	2026-01-30 16:29:57.007	2026-02-01 12:32:27.618
a34e8053-5497-4b8c-ba6a-4a70a6f15109	try-catch编程	使用try-catch处理不同类型的异常	MEDIUM	1-15	#include <iostream>\n#include <stdexcept>\nusing namespace std;\n\nvoid process(int option) {\n    if (option == 1) {\n        throw out_of_range("索引越界");\n    } else if (option == 2) {\n        throw runtime_error("运行时错误");\n    } else if (option == 3) {\n        throw 42; // 抛出整数异常\n    }\n}\n\nint main() {\n    try {\n        process(2);\n    } catch (const out_of_range &e) {\n        cout << "越界错误: " << e.what() << endl;\n    } catch (const runtime_error &e) {\n        cout << "运行时错误: " << e.what() << endl;\n    } catch (int e) {\n        cout << "整数异常: " << e << endl;\n    } catch (...) {\n        cout << "未知异常" << endl;\n    }\n    return 0;\n}	\N	\N	20	9	t	CODING	{"explanation": "使用多个catch块捕获不同类型的异常。", "expectedOutput": "运行时错误: 运行时错误"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.043	2026-02-01 12:32:34.396
1a6c024c-81d8-4b20-9cf1-72831e38215d	异常的捕获方式	补全代码，捕获异常	EASY	1-15		\N	\N	20	2	t	FILL_BLANK	{"code": "try {\\n    checkAge(-1);\\n} {{blank}} (const invalid_argument &e) {\\n    cout << \\"错误: \\" << e.what() << endl;\\n}", "blanks": [{"hint": "捕获异常", "answer": "catch"}], "explanation": "使用catch关键字捕获异常，需要指定异常的类型。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.053	2026-02-01 12:32:37.047
b7325955-8690-4998-907b-0c184e6455b3	异常的抛出与捕获编程	实现一个栈类，使用异常处理处理栈溢出和栈下溢	MEDIUM	1-15	#include <iostream>\n#include <stdexcept>\n#include <vector>\nusing namespace std;\n\nclass Stack {\nprivate:\n    vector<int> data;\n    int maxSize;\npublic:\n    Stack(int size) : maxSize(size) {} \n    \n    void push(int value) {\n        if (data.size() >= maxSize) {\n            throw overflow_error("栈溢出");\n        }\n        data.push_back(value);\n    }\n    \n    int pop() {\n        if (data.empty()) {\n            throw underflow_error("栈下溢");\n        }\n        int value = data.back();\n        data.pop_back();\n        return value;\n    }\n};\n\nint main() {\n    try {\n        Stack s(3);\n        s.push(1);\n        s.push(2);\n        s.push(3);\n        s.push(4); // 栈溢出\n    } catch (const exception &e) {\n        cout << "异常: " << e.what() << endl;\n    }\n    \n    try {\n        Stack s(3);\n        s.pop(); // 栈下溢\n    } catch (const exception &e) {\n        cout << "异常: " << e.what() << endl;\n    }\n    \n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "使用异常处理处理栈的溢出和下溢错误。", "expectedOutput": "异常: 栈溢出\\n异常: 栈下溢"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.077	2026-02-01 12:32:41.742
e905edec-ba7e-4bca-bf2f-87c6aafbfd9a	自定义异常的捕获	补全代码，捕获自定义异常	MEDIUM	1-15		\N	\N	20	4	t	FILL_BLANK	{"code": "try {\\n    checkValue(-1);\\n} catch (const {{blank}} &e) {\\n    cout << \\"错误: \\" << e.what() << endl;\\n}", "blanks": [{"hint": "自定义异常类", "answer": "MyException"}], "explanation": "使用catch关键字捕获自定义异常，需要指定异常的类型。"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.094	2026-02-01 12:32:45.619
0323852c-40f8-42c9-b5c4-a55ab39e20fa	自定义异常编程	实现一个银行账户类，使用自定义异常处理余额不足等错误	MEDIUM	1-15	#include <iostream>\n#include <stdexcept>\n#include <string>\nusing namespace std;\n\nclass InsufficientFundsException : public exception {\nprivate:\n    double balance;\n    double amount;\npublic:\n    InsufficientFundsException(double bal, double amt) : balance(bal), amount(amt) {} \n    \n    const char* what() const noexcept override {\n        static string message;\n        message = "余额不足: 余额 " + to_string(balance) + ", 取款金额 " + to_string(amount);\n        return message.c_str();\n    }\n};\n\nclass BankAccount {\nprivate:\n    double balance;\npublic:\n    BankAccount(double initialBalance) : balance(initialBalance) {} \n    \n    void deposit(double amount) {\n        balance += amount;\n    }\n    \n    void withdraw(double amount) {\n        if (amount > balance) {\n            throw InsufficientFundsException(balance, amount);\n        }\n        balance -= amount;\n    }\n    \n    double getBalance() const {\n        return balance;\n    }\n};\n\nint main() {\n    try {\n        BankAccount account(1000);\n        account.deposit(500);\n        account.withdraw(2000); // 余额不足\n    } catch (const exception &e) {\n        cout << "错误: " << e.what() << endl;\n    }\n    return 0;\n}	\N	\N	25	9	t	CODING	{"explanation": "使用自定义异常处理银行账户的余额不足错误。", "expectedOutput": "错误: 余额不足: 余额 1500, 取款金额 2000"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.111	2026-02-01 12:32:49.159
f3f7b9c1-e7d9-4e51-9624-1ec73b75d6a5	异常处理的替代方案	以下哪种是异常处理的替代方案？	MEDIUM	1-15		\N	\N	20	4	t	MULTIPLE_CHOICE	{"options": ["返回错误码", "使用断言", "使用错误标志", "以上都是"], "explanation": "异常处理的替代方案包括返回错误码、使用断言和使用错误标志等。", "correctIndex": 3}	EXERCISE_LIBRARY	2026-01-30 16:29:57.13	2026-02-01 12:32:53.296
7df9ef98-89f6-4d60-88e3-31c57db8b24f	综合编程挑战	实现一个简单的学生信息管理系统，使用异常处理处理各种错误	HARD	1-15	#include <iostream>\n#include <vector>\n#include <string>\n#include <stdexcept>\nusing namespace std;\n\nclass StudentNotFoundException : public exception {\nprivate:\n    int id;\npublic:\n    StudentNotFoundException(int studentId) : id(studentId) {} \n    \n    const char* what() const noexcept override {\n        static string message;\n        message = "学生未找到: ID " + to_string(id);\n        return message.c_str();\n    }\n};\n\nclass DuplicateStudentException : public exception {\nprivate:\n    int id;\npublic:\n    DuplicateStudentException(int studentId) : id(studentId) {} \n    \n    const char* what() const noexcept override {\n        static string message;\n        message = "学生已存在: ID " + to_string(id);\n        return message.c_str();\n    }\n};\n\nstruct Student {\n    int id;\n    string name;\n    int age;\n};\n\nclass StudentManager {\nprivate:\n    vector<Student> students;\npublic:\n    void addStudent(const Student &student) {\n        // 检查是否已存在\n        for (const auto &s : students) {\n            if (s.id == student.id) {\n                throw DuplicateStudentException(student.id);\n            }\n        }\n        students.push_back(student);\n    }\n    \n    Student getStudent(int id) {\n        for (const auto &s : students) {\n            if (s.id == id) {\n                return s;\n            }\n        }\n        throw StudentNotFoundException(id);\n    }\n    \n    void removeStudent(int id) {\n        for (auto it = students.begin(); it != students.end(); ++it) {\n            if (it->id == id) {\n                students.erase(it);\n                return;\n            }\n        }\n        throw StudentNotFoundException(id);\n    }\n};\n\nint main() {\n    StudentManager manager;\n    \n    try {\n        manager.addStudent({1, "Alice", 20});\n        manager.addStudent({2, "Bob", 21});\n        manager.addStudent({1, "Charlie", 22}); // 重复ID\n    } catch (const exception &e) {\n        cout << "错误: " << e.what() << endl;\n    }\n    \n    try {\n        Student s = manager.getStudent(3); // 不存在的ID\n        cout << "学生: " << s.name << endl;\n    } catch (const exception &e) {\n        cout << "错误: " << e.what() << endl;\n    }\n    \n    return 0;\n}	\N	\N	25	5	t	CODING	{"explanation": "使用自定义异常处理学生管理系统的各种错误，如学生已存在和学生未找到等。", "expectedOutput": "学生管理系统的错误处理"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.134	2026-02-01 12:32:53.804
e0bdf72b-d998-46c7-9f89-7c3ca0f8a53a	异常处理的综合挑战	实现一个简单的配置文件解析器，使用异常处理处理各种解析错误	HARD	1-15	#include <iostream>\n#include <fstream>\n#include <string>\n#include <map>\n#include <stdexcept>\nusing namespace std;\n\nclass ConfigException : public exception {\nprivate:\n    string message;\npublic:\n    ConfigException(const string &msg) : message(msg) {} \n    \n    const char* what() const noexcept override {\n        return message.c_str();\n    }\n};\n\nclass ConfigParserException : public ConfigException {\nprivate:\n    int lineNumber;\npublic:\n    ConfigParserException(int line, const string &msg) : ConfigException("解析错误 (行 " + to_string(line) + "): " + msg), lineNumber(line) {} \n};\n\nclass ConfigNotFoundException : public ConfigException {\nprivate:\n    string key;\npublic:\n    ConfigNotFoundException(const string &k) : ConfigException("配置项未找到: " + k), key(k) {} \n};\n\nclass ConfigParser {\nprivate:\n    map<string, string> config;\npublic:\n    void parse(const string &filename) {\n        ifstream file(filename);\n        if (!file) {\n            throw ConfigException("文件打开失败: " + filename);\n        }\n        \n        string line;\n        int lineNumber = 0;\n        \n        while (getline(file, line)) {\n            lineNumber++;\n            \n            // 跳过空行和注释\n            if (line.empty() || line[0] == #) {\n                continue;\n            }\n            \n            size_t equalsPos = line.find(=);\n            if (equalsPos == string::npos) {\n                throw ConfigParserException(lineNumber, "格式错误: 缺少=");\n            }\n            \n            string key = line.substr(0, equalsPos);\n            string value = line.substr(equalsPos + 1);\n            \n            // 去除首尾空格\n            key.erase(0, key.find_first_not_of(" \t"));\n            key.erase(key.find_last_not_of(" \t") + 1);\n            value.erase(0, value.find_first_not_of(" \t"));\n            value.erase(value.find_last_not_of(" \t") + 1);\n            \n            if (key.empty()) {\n                throw ConfigParserException(lineNumber, "格式错误: 空键");\n            }\n            \n            config[key] = value;\n        }\n        \n        file.close();\n    }\n    \n    string get(const string &key) const {\n        auto it = config.find(key);\n        if (it == config.end()) {\n            throw ConfigNotFoundException(key);\n        }\n        return it->second;\n    }\n    \n    int getInt(const string &key) const {\n        string value = get(key);\n        try {\n            return stoi(value);\n        } catch (const invalid_argument &e) {\n            throw ConfigException("配置项不是整数: " + key);\n        } catch (const out_of_range &e) {\n            throw ConfigException("配置项超出整数范围: " + key);\n        }\n    }\n    \n    double getDouble(const string &key) const {\n        string value = get(key);\n        try {\n            return stod(value);\n        } catch (const invalid_argument &e) {\n            throw ConfigException("配置项不是浮点数: " + key);\n        } catch (const out_of_range &e) {\n            throw ConfigException("配置项超出浮点数范围: " + key);\n        }\n    }\n    \n    bool getBool(const string &key) const {\n        string value = get(key);\n        if (value == "true" || value == "1" || value == "yes") {\n            return true;\n        } else if (value == "false" || value == "0" || value == "no") {\n            return false;\n        } else {\n            throw ConfigException("配置项不是布尔值: " + key);\n        }\n    }\n};\n\nint main() {\n    ConfigParser parser;\n    \n    try {\n        parser.parse("config.txt");\n        cout << "Server IP: " << parser.get("server.ip") << endl;\n        cout << "Server Port: " << parser.getInt("server.port") << endl;\n        cout << "Timeout: " << parser.getDouble("timeout") << endl;\n        cout << "Enabled: " << (parser.getBool("enabled") ? "true" : "false") << endl;\n    } catch (const ConfigException &e) {\n        cout << "错误: " << e.what() << endl;\n    }\n    \n    return 0;\n}	\N	\N	25	10	t	CODING	{"explanation": "使用自定义异常处理配置文件解析的各种错误，如文件打开失败、格式错误和配置项未找到等。", "expectedOutput": "配置文件的解析结果或错误信息"}	EXERCISE_LIBRARY	2026-01-30 16:29:57.153	2026-02-01 12:32:59.734
\.


--
-- Data for Name: ExerciseKnowledgePoint; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."ExerciseKnowledgePoint" (id, "exerciseId", "knowledgePointId") FROM stdin;
\.


--
-- Data for Name: ExerciseProgress; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."ExerciseProgress" (id, "userId", "exerciseId", completed, code, "completedAt", "completedCount", "xpEarned", "createdAt", "updatedAt") FROM stdin;
fcc6d36d-ad92-4916-a07b-246ec3d642a0	8738a703-3540-4842-911e-acaa73a0af9b	fee3d223-f376-4880-bd06-1ca84dab38e2	t	0	2026-01-31 04:43:11.245	0	0	2026-01-31 04:38:42.211	2026-01-31 04:43:11.247
e6a90559-3d46-47b8-81e2-9dd0f645d98d	8738a703-3540-4842-911e-acaa73a0af9b	b76bf06b-cf21-4891-a5e5-051638e9c157	t	{"0":"cout"}	2026-01-31 04:43:16.683	0	0	2026-01-31 04:38:51.998	2026-01-31 04:43:16.684
013639ab-fa43-421b-82c1-f2b42b10e9a7	8738a703-3540-4842-911e-acaa73a0af9b	00cd6fb5-d574-42c6-8aad-cc665ee96659	t	0	2026-01-31 04:43:19.431	0	0	2026-01-31 04:39:23.577	2026-01-31 04:43:19.432
aba53a55-17c0-45b2-8fbe-35e059cf0b42	8738a703-3540-4842-911e-acaa73a0af9b	7f77f98a-875a-4fdc-866c-2e94bfe1ce1d	t	["0","1","2","3","4","5"]	2026-01-31 04:43:46.53	0	0	2026-01-31 04:39:57.833	2026-01-31 04:43:46.531
814de9f8-55a9-4b9b-ab4e-8dd1d061ef43	8738a703-3540-4842-911e-acaa73a0af9b	54179df9-c7e0-4dec-be56-4203149b9e6a	t	0	2026-01-31 04:43:49.843	0	0	2026-01-31 04:40:14.054	2026-01-31 04:43:49.844
39daeba7-23e4-406e-950a-90facabc5e7f	8738a703-3540-4842-911e-acaa73a0af9b	ace5626b-8cf6-4978-89d4-05a1213ed46b	t	{"5":"cout << \\"Hello World\\";"}	2026-01-31 04:47:35.924	0	0	2026-01-31 04:47:35.925	2026-01-31 04:47:35.925
21058c5e-7aa7-4181-ad4e-619ae02eed08	8738a703-3540-4842-911e-acaa73a0af9b	96332c81-0075-4126-91eb-a261cf13f5fb	t	0	2026-01-31 04:47:42.537	0	0	2026-01-31 04:47:42.538	2026-01-31 04:47:42.538
17c0b1d3-8b55-43a9-b05f-c8cb1253cd28	8738a703-3540-4842-911e-acaa73a0af9b	83dce4ad-f279-4053-8d0c-21822e0d61ab	t	{"0":"endl"}	2026-01-31 04:48:10.805	0	0	2026-01-31 04:48:10.806	2026-01-31 04:48:10.806
e1c6950c-756b-440d-a689-e301c943dd4a	8738a703-3540-4842-911e-acaa73a0af9b	5873a619-be16-48a7-8ba6-3b1b28a303bc	t	0	2026-01-31 04:48:23.234	0	0	2026-01-31 04:48:23.235	2026-01-31 04:48:23.235
bab1a5f6-bc11-4d96-8c45-2545d2087571	8738a703-3540-4842-911e-acaa73a0af9b	c4253945-4485-4c63-b73a-3e44a9142235	t	#include <iostream>\nusing namespace std;\n\nint main() { \n    cout << "mud";\n    \n    return 0;\n}	2026-01-31 04:49:30.823	0	0	2026-01-31 04:49:30.824	2026-01-31 04:49:30.824
10da0f00-8745-4b44-95f2-2953c9debf44	8738a703-3540-4842-911e-acaa73a0af9b	82d2b4d8-0da5-43fc-a460-5a7d68605acf	t	0	2026-01-31 04:49:57.938	0	0	2026-01-31 04:49:57.939	2026-01-31 04:49:57.939
4544652f-8cba-4af1-b776-0b83f78afa57	8738a703-3540-4842-911e-acaa73a0af9b	60df9e66-e57e-4f8b-bd00-3ce768f09a88	t	0	2026-01-31 04:50:50.283	0	0	2026-01-31 04:50:50.284	2026-01-31 04:50:50.284
7b9ceb65-0af5-486e-a9b8-0bdd9565f030	8738a703-3540-4842-911e-acaa73a0af9b	d832ae63-409e-47ac-a93e-abe7a188a7d2	t	{"0":"int"}	2026-01-31 04:51:00.441	0	0	2026-01-31 04:51:00.442	2026-01-31 04:51:00.442
67b63d3e-9e09-41cf-8df2-e80c1b10ded7	8738a703-3540-4842-911e-acaa73a0af9b	13a9e3fe-b602-47c2-9d3e-24eb1caf5852	t	{"0":"10"}	2026-01-31 04:51:20.132	0	0	2026-01-31 04:51:20.133	2026-01-31 04:51:20.133
6612068b-d820-47b7-ba1f-5713786e0127	8738a703-3540-4842-911e-acaa73a0af9b	9f6cfd2f-7495-4b47-a227-f0344b4161ed	t	0	2026-01-31 04:51:25.819	0	0	2026-01-31 04:51:25.82	2026-01-31 04:51:25.82
78cdf5b7-61e4-478b-9748-5e293f311331	8738a703-3540-4842-911e-acaa73a0af9b	3b40a9f7-ba1f-4213-b0df-09f71d52f800	t	{"1":"int first_number = 10;"}	2026-01-31 04:52:46.527	0	0	2026-01-31 04:52:46.528	2026-01-31 04:52:46.528
8e4421f7-f832-41eb-b3db-f51f2de6d82c	8738a703-3540-4842-911e-acaa73a0af9b	3b0c7afe-2a5d-4c7d-a4ee-dd951f03d2a8	t	0	2026-01-31 04:52:56.602	0	0	2026-01-31 04:52:56.603	2026-01-31 04:52:56.603
03db1aea-bd52-48a2-9609-7fbe70c265d5	8738a703-3540-4842-911e-acaa73a0af9b	d7236109-37ef-4190-9cdf-b5f392f8e46e	t	{"0":","}	2026-01-31 04:53:45.908	0	0	2026-01-31 04:53:45.909	2026-01-31 04:53:45.909
7ca963b9-262d-49fe-97fc-aacf4aebec1f	8738a703-3540-4842-911e-acaa73a0af9b	755db227-bce5-4a32-ba58-c30bc353849c	t	#include <iostream>\nusing namespace std;\n\nint main() {\n    int a,b;\n    a = 3;\n    b = 5;\n    cout << a + b;\n    return 0;\n}	2026-01-31 04:55:39.513	0	0	2026-01-31 04:55:39.514	2026-01-31 04:55:39.514
80f9f780-6942-4bb2-82d3-83e8a896177d	e00cfaae-5a52-4c55-9807-1e206d0f157e	fee3d223-f376-4880-bd06-1ca84dab38e2	t	0	2026-01-31 05:10:25.782	0	0	2026-01-31 05:10:25.783	2026-01-31 05:10:25.783
8b9ddc14-d21d-4277-9b38-19fbe9c371c1	e00cfaae-5a52-4c55-9807-1e206d0f157e	b76bf06b-cf21-4891-a5e5-051638e9c157	t	{"0":"cout"}	2026-01-31 05:10:31.059	0	0	2026-01-31 05:10:31.06	2026-01-31 05:10:31.06
d2425466-1b7b-4764-990c-ae42480f91fe	e00cfaae-5a52-4c55-9807-1e206d0f157e	00cd6fb5-d574-42c6-8aad-cc665ee96659	t	0	2026-01-31 05:10:33.986	0	0	2026-01-31 05:10:33.987	2026-01-31 05:10:33.987
0f520c56-3927-4c77-a333-30a865353de3	e00cfaae-5a52-4c55-9807-1e206d0f157e	7f77f98a-875a-4fdc-866c-2e94bfe1ce1d	t	["0","1","2","3","4","5"]	2026-01-31 05:10:54.877	0	0	2026-01-31 05:10:54.878	2026-01-31 05:10:54.878
05decb6c-41f3-4992-becf-04e2541162de	e00cfaae-5a52-4c55-9807-1e206d0f157e	54179df9-c7e0-4dec-be56-4203149b9e6a	t	0	2026-01-31 05:10:57.449	0	0	2026-01-31 05:10:57.45	2026-01-31 05:10:57.45
e44641da-de57-4acc-be04-6f8769a101ca	e00cfaae-5a52-4c55-9807-1e206d0f157e	ace5626b-8cf6-4978-89d4-05a1213ed46b	t	{"5":"cout << \\"Hello World\\";"}	2026-01-31 05:11:34.432	0	0	2026-01-31 05:11:34.433	2026-01-31 05:11:34.433
5974b604-0821-4920-8c41-9fb847f748ad	e00cfaae-5a52-4c55-9807-1e206d0f157e	96332c81-0075-4126-91eb-a261cf13f5fb	t	0	2026-01-31 05:11:38.441	0	0	2026-01-31 05:11:38.442	2026-01-31 05:11:38.442
27dce7db-13cf-4147-9e00-6ace03c8ee71	e00cfaae-5a52-4c55-9807-1e206d0f157e	83dce4ad-f279-4053-8d0c-21822e0d61ab	t	{"0":"endl"}	2026-01-31 05:11:45.478	0	0	2026-01-31 05:11:45.479	2026-01-31 05:11:45.479
11c22ea7-5a48-404e-827d-c1d40ebdf50c	e00cfaae-5a52-4c55-9807-1e206d0f157e	5873a619-be16-48a7-8ba6-3b1b28a303bc	t	0	2026-01-31 05:11:48.584	0	0	2026-01-31 05:11:48.585	2026-01-31 05:11:48.585
701fa6d2-ce0b-4d17-a8f9-2bc61ee0a107	e00cfaae-5a52-4c55-9807-1e206d0f157e	c4253945-4485-4c63-b73a-3e44a9142235	t	#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << " MUD ";\n    \n    return 0;\n}	2026-01-31 05:12:16.958	0	0	2026-01-31 05:12:16.959	2026-01-31 05:12:16.959
5d0c05b7-fe12-4e35-9497-67821154864e	e00cfaae-5a52-4c55-9807-1e206d0f157e	82d2b4d8-0da5-43fc-a460-5a7d68605acf	t	0	2026-01-31 05:14:52.841	0	0	2026-01-31 05:14:52.842	2026-01-31 05:14:52.842
f87e2132-3d39-4ee5-b254-1ffe86ef6aff	e00cfaae-5a52-4c55-9807-1e206d0f157e	60df9e66-e57e-4f8b-bd00-3ce768f09a88	t	0	2026-01-31 05:14:57.053	0	0	2026-01-31 05:14:57.054	2026-01-31 05:14:57.054
a2967b54-e6b4-4edf-8416-4401fcbe3f7a	e00cfaae-5a52-4c55-9807-1e206d0f157e	d832ae63-409e-47ac-a93e-abe7a188a7d2	t	{"0":"int"}	2026-01-31 05:15:03.896	0	0	2026-01-31 05:15:03.896	2026-01-31 05:15:03.896
5563e10f-80e0-439b-acc7-20007d07a0dc	e00cfaae-5a52-4c55-9807-1e206d0f157e	13a9e3fe-b602-47c2-9d3e-24eb1caf5852	t	{"0":"10"}	2026-01-31 05:15:11.794	0	0	2026-01-31 05:15:11.795	2026-01-31 05:15:11.795
2f7360d2-4dc9-4572-9b25-9c2d3a0be783	e00cfaae-5a52-4c55-9807-1e206d0f157e	9f6cfd2f-7495-4b47-a227-f0344b4161ed	t	0	2026-01-31 05:15:18.05	0	0	2026-01-31 05:15:18.05	2026-01-31 05:15:18.05
7e636bf6-33d5-4aac-9b66-32dba57b76d8	e00cfaae-5a52-4c55-9807-1e206d0f157e	3b40a9f7-ba1f-4213-b0df-09f71d52f800	t	{"1":"int first_number = 10;"}	2026-01-31 05:15:46.775	0	0	2026-01-31 05:15:46.776	2026-01-31 05:15:46.776
1fa984ed-186b-43e4-9798-b88dd899cd83	e00cfaae-5a52-4c55-9807-1e206d0f157e	3b0c7afe-2a5d-4c7d-a4ee-dd951f03d2a8	t	0	2026-01-31 05:15:52.027	0	0	2026-01-31 05:15:52.028	2026-01-31 05:15:52.028
a68e306d-0c73-4dc2-8850-0a48eabc6e79	e00cfaae-5a52-4c55-9807-1e206d0f157e	d7236109-37ef-4190-9cdf-b5f392f8e46e	t	{"0":","}	2026-01-31 05:15:57.392	0	0	2026-01-31 05:15:57.393	2026-01-31 05:15:57.393
cc719c90-6e75-4d57-91ab-7a9f4d43636a	e00cfaae-5a52-4c55-9807-1e206d0f157e	755db227-bce5-4a32-ba58-c30bc353849c	t	#include <iostream>\nusing namespace std;\n\nint main() {\n    int a , b;\n    a = 3;\n    b = 5;\n    cout << a + b;\n    return 0;\n}	2026-01-31 05:17:03.461	0	0	2026-01-31 05:17:03.462	2026-01-31 05:17:03.462
eb52c76c-4f63-4b40-9fb4-70f09597476c	e00cfaae-5a52-4c55-9807-1e206d0f157e	8c4cb5e8-4918-4a3e-8ea6-e588493fe272	t	0	2026-01-31 05:21:57.928	0	0	2026-01-31 05:17:31.264	2026-01-31 05:21:57.929
020f6b92-e9ae-49ce-891d-e34737981bdc	e00cfaae-5a52-4c55-9807-1e206d0f157e	41574f14-afa9-4292-ac92-8ccb99c65cad	t	0	2026-01-31 05:22:01.245	0	0	2026-01-31 05:18:25.178	2026-01-31 05:22:01.246
96d65c28-cc9e-44a0-97de-9c7cfe884089	e00cfaae-5a52-4c55-9807-1e206d0f157e	ce6be96b-0f32-45da-bdb2-c14a91531549	t	0	2026-01-31 05:23:46.943	0	0	2026-01-31 05:19:52.001	2026-01-31 05:23:46.944
f6115981-59eb-411d-949f-b664a2bd65a6	e00cfaae-5a52-4c55-9807-1e206d0f157e	82d501cf-bd82-430c-b1a9-942392787c2d	t	0	2026-01-31 05:23:50.257	0	0	2026-01-31 05:20:24.853	2026-01-31 05:23:50.258
7432ce15-fd59-49f5-8a31-cf78e9386a11	e00cfaae-5a52-4c55-9807-1e206d0f157e	c3416b44-dca2-42f0-91d7-a0ffc224e109	t	{"0":"grade"}	2026-01-31 05:24:02.137	0	0	2026-01-31 05:21:34.368	2026-01-31 05:24:02.138
6fef484a-7db3-4248-aa34-365537222fae	e00cfaae-5a52-4c55-9807-1e206d0f157e	e1596cc6-c8d3-4ede-ba86-b85d33e20447	t	{"0":"'A'"}	2026-02-01 07:58:37.705	0	0	2026-01-31 05:22:24.166	2026-02-01 07:58:37.706
fe659857-350d-4b2f-81bb-4ce9770d9567	e00cfaae-5a52-4c55-9807-1e206d0f157e	c55e5c6b-c35c-4fd2-8023-0cfe1cf1cf30	t	0	2026-02-01 07:58:57.056	0	0	2026-01-31 05:21:03.037	2026-02-01 07:58:57.057
da08bac0-d6a0-47d4-b778-031c3fe05d11	8738a703-3540-4842-911e-acaa73a0af9b	8c4cb5e8-4918-4a3e-8ea6-e588493fe272	t	0	2026-02-01 12:45:32.775	0	0	2026-02-01 12:45:32.776	2026-02-01 12:45:32.776
538b2380-6462-43e2-b28e-51cfcf01d2b6	8738a703-3540-4842-911e-acaa73a0af9b	41574f14-afa9-4292-ac92-8ccb99c65cad	t	0	2026-02-01 12:45:37.937	0	0	2026-02-01 12:45:37.938	2026-02-01 12:45:37.938
32a3ed51-2baf-4545-a817-aa723bd3bc42	8738a703-3540-4842-911e-acaa73a0af9b	e1596cc6-c8d3-4ede-ba86-b85d33e20447	t	{"0":"'A'"}	2026-02-01 12:45:46.826	0	0	2026-02-01 12:45:46.827	2026-02-01 12:45:46.827
ede4f733-3d5d-4ab6-9fa3-604fd23af989	8738a703-3540-4842-911e-acaa73a0af9b	ce6be96b-0f32-45da-bdb2-c14a91531549	t	0	2026-02-01 12:45:58.321	0	0	2026-02-01 12:45:58.322	2026-02-01 12:45:58.322
f413eb7e-8578-4ea5-b42a-199b0a044922	8738a703-3540-4842-911e-acaa73a0af9b	82d501cf-bd82-430c-b1a9-942392787c2d	t	0	2026-02-01 12:46:02.538	0	0	2026-02-01 12:46:02.539	2026-02-01 12:46:02.539
b08c4651-fa98-4b1f-81a8-4cc1fa4b8db3	8738a703-3540-4842-911e-acaa73a0af9b	c55e5c6b-c35c-4fd2-8023-0cfe1cf1cf30	t	0	2026-02-01 12:46:08.324	0	0	2026-02-01 12:46:08.325	2026-02-01 12:46:08.325
112b6658-d194-4d8a-8195-99ee0833b858	8738a703-3540-4842-911e-acaa73a0af9b	c3416b44-dca2-42f0-91d7-a0ffc224e109	t	{"0":"grade"}	2026-02-01 12:46:22.445	0	0	2026-02-01 12:46:22.446	2026-02-01 12:46:22.446
\.


--
-- Data for Name: ExerciseStatistics; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."ExerciseStatistics" (id, "exerciseId", "totalAttempts", "correctFirst", "totalCorrect", "uniqueUsers", "totalTimeSeconds", "skippedCount", "commonMistakes", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Homework; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."Homework" (id, title, description, "classId", "teacherId", "dueDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HomeworkExercise; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."HomeworkExercise" (id, "homeworkId", "exerciseId", "orderIndex") FROM stdin;
\.


--
-- Data for Name: InviteCode; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."InviteCode" (id, code, "createdBy", "usedBy", "usedAt", "expiresAt", "maxUses", "usedCount", type, note, "createdAt") FROM stdin;
7d60fe70-ba0a-4a5d-a437-8d65891a5d38	BEE40355	974d5607-f00a-478f-a37b-3e31c6f68f08	\N	\N	2026-02-09 16:43:28.483	1	0	STUDENT	xhs	2026-01-30 16:43:28.485
a82c8131-a961-4d2d-902d-3d18698082bd	C3AA4287	974d5607-f00a-478f-a37b-3e31c6f68f08	\N	\N	2026-02-09 16:43:28.483	1	0	STUDENT	xhs	2026-01-30 16:43:28.488
e9fe98a9-75d8-4489-b02f-0ab24d362ee1	FFC52E6A	974d5607-f00a-478f-a37b-3e31c6f68f08	\N	\N	2026-02-09 16:43:28.483	1	0	STUDENT	xhs	2026-01-30 16:43:28.49
7a92be56-5448-4777-bf43-b3b33d49eba9	4F909F5F	974d5607-f00a-478f-a37b-3e31c6f68f08	\N	\N	2026-02-09 16:43:28.483	1	0	STUDENT	xhs	2026-01-30 16:43:28.491
fb8cabec-a483-4567-9e05-d607c73e460d	B9DDA2AD	974d5607-f00a-478f-a37b-3e31c6f68f08	\N	\N	2026-02-09 16:43:28.483	1	0	STUDENT	xhs	2026-01-30 16:43:28.493
9c2e403a-ca7b-476f-9461-430d16f3ac6f	A8FAC313	974d5607-f00a-478f-a37b-3e31c6f68f08	\N	\N	2026-02-09 16:43:28.483	1	0	STUDENT	xhs	2026-01-30 16:43:28.494
58436b58-400f-469c-967d-2583321189bb	5FB146C0	974d5607-f00a-478f-a37b-3e31c6f68f08	\N	\N	2026-02-09 16:43:28.483	1	0	STUDENT	xhs	2026-01-30 16:43:28.496
b9c9f556-6198-4fe1-9220-55a4ab14f0a6	6B96A470	974d5607-f00a-478f-a37b-3e31c6f68f08	\N	\N	2026-02-09 16:43:28.483	1	0	STUDENT	xhs	2026-01-30 16:43:28.497
8f9b7b33-01e6-4f34-99ff-90d3fb2fc2bb	626E012B	974d5607-f00a-478f-a37b-3e31c6f68f08	\N	\N	2026-02-09 16:43:28.483	1	0	STUDENT	xhs	2026-01-30 16:43:28.499
95bb1a45-db68-4fc6-8de2-a74f292762c1	C139E01C	974d5607-f00a-478f-a37b-3e31c6f68f08	\N	2026-01-31 05:07:18.426	2026-02-09 16:43:28.483	1	1	STUDENT	xhs	2026-01-30 16:43:28.501
\.


--
-- Data for Name: KnowledgeMastery; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."KnowledgeMastery" (id, "userId", "knowledgeKey", "knowledgeType", "masteryLevel", "lastReviewedAt", "nextReviewAt", "reviewCount", "correctCount", "incorrectCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: KnowledgePoint; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."KnowledgePoint" (id, name, category, "orderIndex", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LeaderboardEntry; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."LeaderboardEntry" (id, "userId", period, "periodKey", xp, rank, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LearningSession; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."LearningSession" (id, "userId", "sessionType", "startedAt", "endedAt", duration, "exerciseCount", "correctCount", "xpEarned") FROM stdin;
\.


--
-- Data for Name: MistakeRecord; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."MistakeRecord" (id, "userId", "exerciseId", "sessionId", source, status, "wrongCount", "correctStreak", "userAnswer", "correctAnswer", "wrongAnswers", "lastWrongAt", "reviewedAt", "masteredAt", "createdAt", "updatedAt") FROM stdin;
52e35a6c-0e85-4b1d-b8f7-c93059cc2c33	8738a703-3540-4842-911e-acaa73a0af9b	00cd6fb5-d574-42c6-8aad-cc665ee96659	\N	COURSE	UNREVIEWED	1	0	"1"	"0"	\N	2026-01-31 04:39:13.483	\N	\N	2026-01-31 04:39:13.484	2026-01-31 04:39:13.484
9db50a16-89a0-48c1-a4e1-08be5a869c6c	8738a703-3540-4842-911e-acaa73a0af9b	ace5626b-8cf6-4978-89d4-05a1213ed46b	\N	COURSE	UNREVIEWED	4	0	{"5": "cout << “Hello World”;"}	{"5": {"correct": false, "expected": "cout << \\"Hello World\\";"}}	\N	2026-01-31 04:42:55.077	\N	\N	2026-01-31 04:41:01.946	2026-01-31 04:42:55.078
7ebcf9c9-e2a5-403c-87ec-9d0a6026c64f	8738a703-3540-4842-911e-acaa73a0af9b	83dce4ad-f279-4053-8d0c-21822e0d61ab	\N	COURSE	UNREVIEWED	1	0	{"0": "endless"}	{"0": {"correct": false, "expected": "endl"}}	\N	2026-01-31 04:48:02.841	\N	\N	2026-01-31 04:48:02.842	2026-01-31 04:48:02.842
06f0798c-0b6e-4191-bda0-2c61883663c6	8738a703-3540-4842-911e-acaa73a0af9b	3b40a9f7-ba1f-4213-b0df-09f71d52f800	\N	COURSE	UNREVIEWED	1	0	{"1": "int num = 10;"}	{"1": {"correct": false, "expected": "int first_number = 10;"}}	\N	2026-01-31 04:52:11.218	\N	\N	2026-01-31 04:52:11.219	2026-01-31 04:52:11.219
58d874c6-c6da-4ea9-a5bc-11b55722c579	e00cfaae-5a52-4c55-9807-1e206d0f157e	e1596cc6-c8d3-4ede-ba86-b85d33e20447	\N	COURSE	MASTERED	1	1	{"0": "‘ A ‘"}	{"0": {"correct": false, "expected": "'A'"}}	\N	2026-01-31 05:19:22.246	2026-02-01 07:58:42.548	\N	2026-01-31 05:19:22.247	2026-02-01 07:58:42.55
12d94513-6300-4002-a101-49c3c475b9a2	e00cfaae-5a52-4c55-9807-1e206d0f157e	c55e5c6b-c35c-4fd2-8023-0cfe1cf1cf30	\N	COURSE	MASTERED	1	1	"2"	"0"	\N	2026-01-31 05:20:56.04	2026-02-01 07:58:58.209	\N	2026-01-31 05:20:56.041	2026-02-01 07:58:58.21
\.


--
-- Data for Name: Module; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."Module" (id, name, icon, color, "orderIndex", "createdAt", "updatedAt") FROM stdin;
1	编程语言基础	📝	#22c55e	1	2026-01-30 16:29:52.674	2026-02-01 12:18:12.824
2	数据结构	🏗️	#3b82f6	2	2026-01-30 16:29:52.678	2026-02-01 12:18:13.419
3	算法基础	⚡	#eab308	3	2026-01-30 16:29:52.68	2026-02-01 12:18:14.5
4	数论与多项式	🔢	#a855f7	4	2026-01-30 16:29:52.683	2026-02-01 12:18:14.709
5	图论	🕸️	#ef4444	5	2026-01-30 16:29:52.685	2026-02-01 12:18:15.423
6	字符串与几何	📐	#06b6d4	6	2026-01-30 16:29:52.687	2026-02-01 12:18:15.679
7	博弈论	🎮	#f97316	7	2026-01-30 16:29:52.689	2026-02-01 12:18:15.935
\.


--
-- Data for Name: RedeemCode; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."RedeemCode" (id, code, type, value, "maxUses", "usedCount", "expiresAt", "createdBy", note, "createdAt") FROM stdin;
\.


--
-- Data for Name: RedeemRecord; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."RedeemRecord" (id, "userId", "codeId", "redeemedAt") FROM stdin;
\.


--
-- Data for Name: ReviewReminder; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."ReviewReminder" (id, "userId", type, title, message, data, read, dismissed, "createdAt") FROM stdin;
\.


--
-- Data for Name: SessionExercise; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."SessionExercise" (id, "sessionId", "exerciseId", "orderIndex") FROM stdin;
4abddb2a-2b43-4e6d-9f1d-aa7c15a68a05	ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	fee3d223-f376-4880-bd06-1ca84dab38e2	1
f9296a21-23f5-4c98-801b-b5bc70a1fb3f	ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	b76bf06b-cf21-4891-a5e5-051638e9c157	2
990ed672-73a6-47a3-892b-e57bef780ca7	ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	00cd6fb5-d574-42c6-8aad-cc665ee96659	3
60cc75e8-16db-4b2a-b159-6bf1b83f72fa	ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	7f77f98a-875a-4fdc-866c-2e94bfe1ce1d	4
759a137b-9f52-4c5f-9571-e7c0e32f124a	ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	54179df9-c7e0-4dec-be56-4203149b9e6a	5
cf445513-0fd1-476f-b248-9b3115be816d	ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	ace5626b-8cf6-4978-89d4-05a1213ed46b	6
0c1814d1-4658-4407-9dd0-202d88f364d2	ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	96332c81-0075-4126-91eb-a261cf13f5fb	7
5e696a76-b565-40e3-9005-59dd7ed53be0	ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	83dce4ad-f279-4053-8d0c-21822e0d61ab	8
9180fdea-5b7e-4283-b466-af37fe8806a5	ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	5873a619-be16-48a7-8ba6-3b1b28a303bc	9
8c7686e8-5e43-4263-8bb4-e3d084bc13c4	ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	c4253945-4485-4c63-b73a-3e44a9142235	10
8031f3fe-14bb-4cce-9134-deef4d129fd3	e5d1c27f-474b-4085-846e-7f438fad7d3d	82d2b4d8-0da5-43fc-a460-5a7d68605acf	1
8a7f6e9d-d2b4-46cd-865d-67123a787161	e5d1c27f-474b-4085-846e-7f438fad7d3d	60df9e66-e57e-4f8b-bd00-3ce768f09a88	2
4b4e16b9-e96c-4dd7-b0d7-55cbb29ea976	e5d1c27f-474b-4085-846e-7f438fad7d3d	d832ae63-409e-47ac-a93e-abe7a188a7d2	3
6b089da3-3e00-4c83-b501-d7389d81602a	e5d1c27f-474b-4085-846e-7f438fad7d3d	13a9e3fe-b602-47c2-9d3e-24eb1caf5852	4
227c19c1-a469-466b-9153-4d35a9ad6e99	e5d1c27f-474b-4085-846e-7f438fad7d3d	9f6cfd2f-7495-4b47-a227-f0344b4161ed	5
49566a10-f198-40df-b78e-8d338f0a9014	e5d1c27f-474b-4085-846e-7f438fad7d3d	3b40a9f7-ba1f-4213-b0df-09f71d52f800	7
e0af1f6b-4d66-41ba-ab2b-1b7cb0e7e7eb	e5d1c27f-474b-4085-846e-7f438fad7d3d	3b0c7afe-2a5d-4c7d-a4ee-dd951f03d2a8	8
c180643f-aa86-40c8-8d93-06731d708941	e5d1c27f-474b-4085-846e-7f438fad7d3d	d7236109-37ef-4190-9cdf-b5f392f8e46e	9
a21f4134-815a-4db4-8d7e-73f23d19b29e	e5d1c27f-474b-4085-846e-7f438fad7d3d	755db227-bce5-4a32-ba58-c30bc353849c	10
997a48de-8ba8-48b2-9957-c771d603629f	747327b0-56fe-4814-bc53-48d97d4f9ab6	8c4cb5e8-4918-4a3e-8ea6-e588493fe272	1
e94ba06e-dace-44e8-ae0d-b2c0dc96aaa1	747327b0-56fe-4814-bc53-48d97d4f9ab6	41574f14-afa9-4292-ac92-8ccb99c65cad	2
da310186-121d-4353-b08d-4efa34b074f5	747327b0-56fe-4814-bc53-48d97d4f9ab6	e1596cc6-c8d3-4ede-ba86-b85d33e20447	3
7378816a-f7d5-4fac-9f06-c3e0d44721a6	747327b0-56fe-4814-bc53-48d97d4f9ab6	ce6be96b-0f32-45da-bdb2-c14a91531549	4
6e4da173-2484-4e7e-a076-2ae3667b3f0e	747327b0-56fe-4814-bc53-48d97d4f9ab6	82d501cf-bd82-430c-b1a9-942392787c2d	5
f7428307-28d1-4771-ae03-d16c7ecde55a	747327b0-56fe-4814-bc53-48d97d4f9ab6	c55e5c6b-c35c-4fd2-8023-0cfe1cf1cf30	6
ba91de8c-8ebf-4379-be1f-c99f44cbf5ee	747327b0-56fe-4814-bc53-48d97d4f9ab6	c3416b44-dca2-42f0-91d7-a0ffc224e109	7
494111b5-6613-4c95-9a70-507e2a194ac1	747327b0-56fe-4814-bc53-48d97d4f9ab6	3be0a4fe-ad30-4b3c-9c37-9d5ec29d2880	8
b197ea8a-0980-4024-b8ad-6e5d71d31855	747327b0-56fe-4814-bc53-48d97d4f9ab6	cb4886ea-dd70-4d0b-9876-380de8fe4d98	9
7f7b494f-2562-4e64-90bb-dc73f9aa4f93	747327b0-56fe-4814-bc53-48d97d4f9ab6	801a3778-af6a-4288-8858-84e5378d19b7	10
de1fc121-a468-4f5f-ae93-3c131553baa2	dfaf7d92-3b6b-43ac-bd06-b2eb6bb7ded0	16287fc9-9b8f-4421-905c-02e329518a73	1
3d473fd7-2a8b-4baa-95fa-3b6000922a6b	dfaf7d92-3b6b-43ac-bd06-b2eb6bb7ded0	dfadbe05-4469-44c2-b425-17e53518a9a2	2
a80aeab7-54ef-441e-8d41-d5d6737058cd	dfaf7d92-3b6b-43ac-bd06-b2eb6bb7ded0	e6d34d19-8c95-4ae8-826a-5a3e132bdc2e	3
b7f310cc-2dfa-44fd-8ad1-3947de03a9d2	dfaf7d92-3b6b-43ac-bd06-b2eb6bb7ded0	25df6116-349c-4351-a3d1-af000a05e70b	4
f3e0b59f-ec07-4624-9502-d7815a2c75fe	dfaf7d92-3b6b-43ac-bd06-b2eb6bb7ded0	0121dba7-104b-4e00-aca7-6232a2bbfa84	5
6fec3573-e2c4-470a-964f-4f7a13139de1	dfaf7d92-3b6b-43ac-bd06-b2eb6bb7ded0	18d9f30a-9971-466b-9b43-68e984d86a8e	6
08d7c5cc-51cf-45c7-95b1-840a1fd48101	dfaf7d92-3b6b-43ac-bd06-b2eb6bb7ded0	7977004c-c301-4054-bc31-3385d0d9c126	7
917b2b4c-97f4-42d0-ae3f-830bbfdbbf0b	dfaf7d92-3b6b-43ac-bd06-b2eb6bb7ded0	22b2f40a-e140-4d33-a6e2-ad72d8e6ada9	8
b1d0fe41-ccf3-4b2e-866a-eb9aeb352fca	dfaf7d92-3b6b-43ac-bd06-b2eb6bb7ded0	9476f46a-bb54-410d-9f19-7a11147d987d	9
49f5c9c1-3197-48bb-aedc-a905ac276f4d	dfaf7d92-3b6b-43ac-bd06-b2eb6bb7ded0	e316f149-8c8e-4de2-a455-f154d2755252	10
e7fd4cdb-970a-4d7f-a6a2-bd2d00790231	ccce2aa1-6042-4b18-a6d1-6fae5748dd40	4ef60a9a-f759-4c72-84b6-008e2e5086f7	1
a4fb670e-bd77-4917-b476-73a65942c0de	ccce2aa1-6042-4b18-a6d1-6fae5748dd40	f4f22b97-78c0-4a75-838d-d6cfb7f5b44c	2
65b0ba06-4e16-4492-b6a3-19e35a3a616e	ccce2aa1-6042-4b18-a6d1-6fae5748dd40	a8952a6b-87ae-4cef-9716-ec3357cb386b	3
d8363b63-73ed-4775-b35c-4f10a7a205ec	ccce2aa1-6042-4b18-a6d1-6fae5748dd40	bc7ec928-9527-4697-8172-cfbfecde2fc9	4
568b35fb-1849-48e6-a911-d055fe84d190	ccce2aa1-6042-4b18-a6d1-6fae5748dd40	b736eeef-1e50-4e23-831e-2426c5255052	5
63f9d487-dab7-4bb4-8eff-b1d123f5c2d6	ccce2aa1-6042-4b18-a6d1-6fae5748dd40	899b8921-e850-45f9-b1ed-d0509f2314dc	6
465ff3b8-b314-4ede-ac74-103050e8f912	ccce2aa1-6042-4b18-a6d1-6fae5748dd40	88fb509e-0569-4f4d-b023-15519c7ff870	7
fce94775-28b4-43e8-a2fd-358d09180825	ccce2aa1-6042-4b18-a6d1-6fae5748dd40	a3fc7eff-940b-4b7a-837e-59e16bf7f48b	8
1c2b3494-e3aa-4544-a42d-2a7a19200bf6	ccce2aa1-6042-4b18-a6d1-6fae5748dd40	10fbb77b-88be-45c6-953d-17e7564ec682	9
5951c798-e68a-4e3a-8064-20c017d2947f	ccce2aa1-6042-4b18-a6d1-6fae5748dd40	512a9c23-ebac-47a8-b918-22f16e7289ef	10
2185685c-0c15-4121-96b1-3811257831a3	d1f349a5-c602-4555-b114-578a6bdc2357	8d539307-f5c0-4a87-8ef8-2a43a7e9bdc2	1
2b707cda-6b13-4895-b288-e9424ef19e19	d1f349a5-c602-4555-b114-578a6bdc2357	d49cabd5-0a8e-4c0d-90a0-d13336f1fffd	2
ab385c21-ae53-43f7-91cf-9e31963afe46	d1f349a5-c602-4555-b114-578a6bdc2357	a8fa895e-2f33-4f2b-ae9d-590bdb3fc749	3
81af9650-4fb3-412c-bbff-b337bf35be4a	d1f349a5-c602-4555-b114-578a6bdc2357	9000c402-e04c-4313-b08c-f2cbd96410c3	4
68301ba2-15db-4d88-b5e7-74f46984afce	d1f349a5-c602-4555-b114-578a6bdc2357	61e7b279-c4a1-45bd-ab55-cbdd4d81fe71	5
73231766-5533-493b-a34d-6e5575875d67	d1f349a5-c602-4555-b114-578a6bdc2357	dd0e80f3-0bd4-4a63-8daa-a7421da0cb7c	6
c44c5762-8f1e-4685-b353-18abe342e1de	d1f349a5-c602-4555-b114-578a6bdc2357	ea115bcf-3a34-4d3d-b85d-864429fa23a2	7
68fda65a-e8b2-4525-8246-6070461ffe13	d1f349a5-c602-4555-b114-578a6bdc2357	97019edb-82f8-40ed-bf14-99f474e3878d	8
7f396b53-8b9d-4326-a4cd-561c34aa5903	d1f349a5-c602-4555-b114-578a6bdc2357	af3b2186-4d20-4f21-a058-34a212db06e7	9
269025f9-368b-4d74-a361-c7a71877c007	d1f349a5-c602-4555-b114-578a6bdc2357	7f5d8b71-a5f4-4271-98d9-fdcb8b2c616a	10
12f33b36-6f9f-4f66-9b2f-153eeb9e002b	e5ae3fc3-69aa-4605-af13-abca6627a007	93ba4558-1ccc-4e08-afd2-1bb37e2e4251	1
14188098-3630-4209-b3ba-e81a7b0acfc6	e5ae3fc3-69aa-4605-af13-abca6627a007	b3a1a356-01a3-4695-9816-f9f06662d443	2
53ac5362-ea33-4a0e-927e-46a00ecc1600	e5ae3fc3-69aa-4605-af13-abca6627a007	c03c004e-90d8-46cd-bc13-8fd7fee22f9e	3
d35e7e96-0c65-493e-a80c-3aa6afec04a2	e5ae3fc3-69aa-4605-af13-abca6627a007	32a0cc4a-18be-4a3f-99f7-4b69299b9e09	4
8ae5abc9-1aaa-495f-a8fe-98c028f4b7b8	e5ae3fc3-69aa-4605-af13-abca6627a007	ff656187-75a5-4e85-a854-2878f2896846	5
70230012-31f7-4971-883f-8c929ce4b886	e5ae3fc3-69aa-4605-af13-abca6627a007	ab5c2017-5c22-422d-8936-222a7318314c	6
5d8df24d-3bee-4bfb-9857-53b5b16a6bb8	e5ae3fc3-69aa-4605-af13-abca6627a007	a0c25124-23a3-4b88-9687-72098d037b84	7
8e445bfd-4c80-4403-b399-ddafa438fd22	e5ae3fc3-69aa-4605-af13-abca6627a007	532b524b-8fa6-47fb-b608-0eea49f8836e	8
24c5e6ab-c912-48b5-8988-941d11d7531e	e5ae3fc3-69aa-4605-af13-abca6627a007	fdc1c29d-5aef-483c-9048-8d28479a894c	9
5967bb08-a3dd-4bfe-9536-76d94647b7b4	e5ae3fc3-69aa-4605-af13-abca6627a007	384b16c6-f624-4d8c-9ae7-da04fc962dcc	10
9671c86c-abca-4aa5-8321-50ac733feaba	b466fc2e-9c3f-40b8-a164-560eff53eef6	5d91e522-b6a9-4b7b-a148-ddcb1503349c	1
df0e953c-55ac-45d4-a10e-ad1610634f8d	b466fc2e-9c3f-40b8-a164-560eff53eef6	c0d00ed3-3ee6-4e7c-9a6a-307fcb36265f	2
9df28725-c754-451b-97d9-c29810be75a1	b466fc2e-9c3f-40b8-a164-560eff53eef6	0c5045e7-3a0a-4b39-923a-e29e6dd3ef14	3
d252cea4-6db1-4637-a03b-b13350dbe4fb	b466fc2e-9c3f-40b8-a164-560eff53eef6	640169fd-90e2-4250-a5f8-63d03d0ba388	4
a0a94c15-c124-490e-8b4a-e0df6ad0748e	b466fc2e-9c3f-40b8-a164-560eff53eef6	11d2b5f7-bde3-443f-a6be-eec67665e9cd	5
5bd7e633-ba7a-4c4f-9a95-2030ec71fe41	b466fc2e-9c3f-40b8-a164-560eff53eef6	b52167c0-9914-47ad-aa83-405b20117520	6
5754f4df-100a-470b-98c7-5e15e5ee2a27	b466fc2e-9c3f-40b8-a164-560eff53eef6	ec71b23d-4053-4660-96d5-203c019aad4f	7
fb22e31b-bba9-457d-81fe-13424e6425df	b466fc2e-9c3f-40b8-a164-560eff53eef6	dbcce51d-f370-440a-8755-34fdd0790e43	8
4eb3e971-1f27-4910-af70-ec029dccc5d2	b466fc2e-9c3f-40b8-a164-560eff53eef6	374b518c-01f8-47d9-a969-86c15a93f5f6	9
8efdb3d0-37df-4148-adfe-9aef61ba5c8a	b466fc2e-9c3f-40b8-a164-560eff53eef6	329032b7-6951-4fe7-845c-39ad2be075f8	10
cd9731d5-ed48-4d64-aa86-cc24f2a8912b	f6e4a18e-4233-4164-ab2f-784a96137f7f	cfccb05b-4322-4992-8f9b-482469ab9685	1
6e53fbeb-44b7-4b5a-926c-601cf767daf7	f6e4a18e-4233-4164-ab2f-784a96137f7f	d317e25a-ea0e-41a9-8dba-aaaf58db70fd	2
d493791b-d074-4e56-89fb-604bafb64766	f6e4a18e-4233-4164-ab2f-784a96137f7f	5d000617-1211-404d-8c4d-6c2851192bb5	3
01cad66a-e4bb-4877-9baf-a2715ca54b68	f6e4a18e-4233-4164-ab2f-784a96137f7f	79f08b0f-cbfe-4bc3-b398-4ad08f53238c	4
a6721d57-1b52-45c6-bc8b-3bb34fd9f87a	f6e4a18e-4233-4164-ab2f-784a96137f7f	ca0cd0a9-8a6f-4ede-980b-d11503561457	5
d500cdb3-dde2-4fd7-b69b-9d81c20e4b8c	f6e4a18e-4233-4164-ab2f-784a96137f7f	2daaeb39-7b8f-40b8-98cf-3a8022ce2e04	6
0658521b-f54b-4d65-8e03-e584d51fd8ba	f6e4a18e-4233-4164-ab2f-784a96137f7f	4c01ae05-d5d7-4360-84eb-ca41740cd6dd	7
fa504bd9-1166-498d-810b-3bc72ff1c692	f6e4a18e-4233-4164-ab2f-784a96137f7f	044b6fd5-4e83-407f-9ba1-bd8755ab833b	8
e35fa301-e50a-4701-8a71-46d958bc06ee	f6e4a18e-4233-4164-ab2f-784a96137f7f	dd626e6b-3694-4f22-845a-4b624c71aab3	9
f51bdbf7-51c0-4efc-a143-409970445186	f6e4a18e-4233-4164-ab2f-784a96137f7f	23bc6401-e910-401a-a3a0-da71a863e76e	10
50d6344c-6aa9-423f-9f01-71ce8fdc602e	d9ec109e-a744-40fe-8bd9-339d86345a37	1fac89a9-dd07-485e-bd29-262e6674be13	1
c2d32c78-f562-4c2b-a977-3bddde96a70c	d9ec109e-a744-40fe-8bd9-339d86345a37	1a7f7e72-442c-4e0f-b636-9cd4797c2549	2
5dedde09-cf15-499a-bb2a-8480e06998eb	d9ec109e-a744-40fe-8bd9-339d86345a37	52b21354-c311-4bbf-9eba-d50927f03443	3
a7e0e62f-ff47-421f-9708-917f8f88b3c6	d9ec109e-a744-40fe-8bd9-339d86345a37	8086f91f-d006-45bb-915d-a4f974f90767	4
4c3b2602-a404-49f1-9db3-fc73bc9737fa	d9ec109e-a744-40fe-8bd9-339d86345a37	b9f5ccb3-4639-424c-98fb-2e054adc8f3e	5
80a6d6fc-3706-4fd8-9cff-9a6d3d7bcb47	d9ec109e-a744-40fe-8bd9-339d86345a37	27551feb-48ef-4c5f-8ca8-8e517af1465d	6
016d96dc-75eb-4d20-b7aa-c4c7067afcf5	d9ec109e-a744-40fe-8bd9-339d86345a37	c2e56e52-8d94-450d-972c-4ea7bcd7fed2	7
c00a80dd-487b-4181-8b8c-8ed819c10a68	d9ec109e-a744-40fe-8bd9-339d86345a37	e7a25d55-ecbc-41fd-a4ff-994de6bede83	8
9722636b-bdd9-4742-86e2-4cf5180b1d1a	d9ec109e-a744-40fe-8bd9-339d86345a37	122e9241-5b49-4f7a-8e7c-cc47da6b3325	9
86ed39cc-7cbf-4008-aa3c-b165d27a6a33	d9ec109e-a744-40fe-8bd9-339d86345a37	747829be-1468-4066-8aab-38d24fb3dd19	10
be77bcce-cbdc-4c2b-9fc8-f5b913ccd7ae	2eb3fb1e-c0e2-4d4b-b647-f2894b592fe7	5cea1f88-0515-4b0d-bb66-538488136ca4	1
11c591d3-971b-42d0-a8f2-ec38f253b5ff	2eb3fb1e-c0e2-4d4b-b647-f2894b592fe7	d3e085fd-427c-402e-b043-0f04bcb2549b	2
3b907f5f-f1cc-4673-ac10-fc04deb3cfea	2eb3fb1e-c0e2-4d4b-b647-f2894b592fe7	6ff94fc8-5ebb-4fb0-9945-b8c0dd372afa	3
b625638e-f2d9-419c-bf09-3da84f68866e	2eb3fb1e-c0e2-4d4b-b647-f2894b592fe7	fcd863e8-69d0-429c-95e3-529c9e2333e5	4
f1949aab-f91b-46da-94ec-bdba304d63a5	2eb3fb1e-c0e2-4d4b-b647-f2894b592fe7	80ec0c80-a9b9-45d1-9e74-c60cf05d1e94	5
183fc11d-b18b-486b-ae29-d8eae611790f	2eb3fb1e-c0e2-4d4b-b647-f2894b592fe7	c04c3c39-4351-4b73-acfc-f5fba91c474e	6
b7eb4a12-ae93-45fe-95c9-9ed5e06ce3aa	2eb3fb1e-c0e2-4d4b-b647-f2894b592fe7	b3980246-37d0-4e05-bee1-939c2a0959ed	7
a68b3471-e5ca-4915-855e-4bd111491c01	2eb3fb1e-c0e2-4d4b-b647-f2894b592fe7	baae7e5c-8ce7-4893-8bd8-cde0671b4fca	8
f7ddb47e-797b-4d70-8d6a-655155aeb204	2eb3fb1e-c0e2-4d4b-b647-f2894b592fe7	2623459f-9c9f-4e06-b0fa-2b96bb0a5221	9
ee281617-3825-45b9-a69b-56019d0a8425	2eb3fb1e-c0e2-4d4b-b647-f2894b592fe7	138baf60-5f7a-4a53-a87d-c898bce79c0b	10
cf22fd33-594f-4485-8f16-414c223d8fa4	862330ac-ad50-46a2-b8fe-99759d5c8a1c	f411ce91-d907-42e9-862f-2ed8d3d0d68a	1
3f592d61-864e-4e50-bf51-20296bb03c10	862330ac-ad50-46a2-b8fe-99759d5c8a1c	12f6f33a-5f49-4c70-9e42-867de2b283ab	2
7649b769-f41f-431f-a067-9f82a7c94792	862330ac-ad50-46a2-b8fe-99759d5c8a1c	33ff8392-82b6-418f-9cc5-45b744ebc3b4	3
a1a5449b-281c-4d5e-b7b7-31711a51d92e	862330ac-ad50-46a2-b8fe-99759d5c8a1c	75738583-6605-4529-833d-64bbfd910cf0	4
d388735c-c390-4238-8bc2-ca29d8dd001d	862330ac-ad50-46a2-b8fe-99759d5c8a1c	bbe18fae-b798-4714-8fbd-dce2b67256cf	5
b596ec8e-3a6d-4de6-a96b-5fcccf3d3c26	862330ac-ad50-46a2-b8fe-99759d5c8a1c	21032c75-09cf-4106-b722-d3fd3620dfa7	6
9dcc1e44-26f6-4e94-8e73-acf6f34270be	862330ac-ad50-46a2-b8fe-99759d5c8a1c	c13a3b54-b52f-4c68-8db8-f851b7b46ac8	7
a59f4ed4-f2f5-4822-869f-4e9be32ba521	862330ac-ad50-46a2-b8fe-99759d5c8a1c	d85c9a14-502b-4fd5-a741-4fe9f0a3c062	8
4729829c-6ca6-4809-b4ca-544fe310723a	862330ac-ad50-46a2-b8fe-99759d5c8a1c	e7c284dc-b0be-468b-9b1d-c22306bfe08c	9
6008ce3c-ee43-4395-ae73-3018eaa2fcd5	862330ac-ad50-46a2-b8fe-99759d5c8a1c	40ea431b-27b6-4506-8de8-d98d78296c8f	10
ddb35101-6e05-47fd-95e3-d6636aa9f076	8176c340-62e7-4fb7-a6a2-964be7de9d03	40ab78a3-1657-4ea5-8d0c-043686707e3b	1
2c5aa450-42dd-4d41-b5bd-83e4274c84f6	8176c340-62e7-4fb7-a6a2-964be7de9d03	f993f658-6038-4199-91be-18b07bc07ec0	2
0303dca8-bb37-47ca-b711-ca849acd5523	8176c340-62e7-4fb7-a6a2-964be7de9d03	ceeaf6a5-a7ae-4618-bdb2-5afcf6452d54	3
dfc3432a-671d-4c34-ae85-b705567a0b35	8176c340-62e7-4fb7-a6a2-964be7de9d03	7a936728-da73-4873-a9f4-9ec3f810d52e	4
48feb11f-7a1f-420f-88e1-a9e762f9fa02	8176c340-62e7-4fb7-a6a2-964be7de9d03	e017ea3c-fb53-44dc-9f88-b93a308f91ad	5
e83dfec9-11db-44cc-9a78-cab777a5ec15	8176c340-62e7-4fb7-a6a2-964be7de9d03	a8aa7062-b1a6-4085-aec3-6e17660948bb	6
36d1f7f4-aec6-458e-abcc-8860c3a4b025	8176c340-62e7-4fb7-a6a2-964be7de9d03	9f3d8d0f-f89f-4ba6-be42-a00ddfb0101d	7
56b03230-d867-4ae1-aab5-e38b213e732a	8176c340-62e7-4fb7-a6a2-964be7de9d03	b87ce5b2-9129-42c3-a534-ce630e174f3d	8
ae80b74a-aaee-4d88-85fb-18a75b2d8199	8176c340-62e7-4fb7-a6a2-964be7de9d03	ab30638d-6a28-4ba8-8ad7-93530b6e8408	9
a8bbebb0-bd0f-4485-887b-510756b5075d	8176c340-62e7-4fb7-a6a2-964be7de9d03	041f2d1f-889a-48d8-834a-5f8fdedb05a9	10
dbf77bde-c537-4f8e-9974-c7e59d2353b8	e1d5927f-2ad9-4f03-9f91-68a938fdec7c	0ce71487-5000-48d3-af0a-8215850d19d1	1
3fa7825b-60a5-4a87-86f2-843194d80f66	e1d5927f-2ad9-4f03-9f91-68a938fdec7c	e8be1f3d-d811-4e8a-9ea5-61e367824433	2
36bac78f-5c40-4a98-a539-a6e0505c3d57	e1d5927f-2ad9-4f03-9f91-68a938fdec7c	93648b6b-10ea-4e13-a3c2-be70ed29110e	3
07a03a86-122e-49bf-ae80-45667413f1bf	e1d5927f-2ad9-4f03-9f91-68a938fdec7c	da0dda3f-0ce8-4683-bb73-12ae63a70509	4
05b78853-62e2-4b11-8fe5-b5eb4c0d552c	e1d5927f-2ad9-4f03-9f91-68a938fdec7c	63f151b8-44da-4b93-a1b4-686dcd46b15c	5
99b23188-e2c9-4b76-b92e-3a3850ecc51d	e1d5927f-2ad9-4f03-9f91-68a938fdec7c	986c3432-4c49-4662-9415-eafbd981457d	6
ed2a31d8-39d4-4561-89b3-766c9bec34ad	e1d5927f-2ad9-4f03-9f91-68a938fdec7c	68d37b2a-69c9-4221-9826-e2331c8e49e8	7
d168c57f-6fda-4903-b62e-3431e77d36ab	e1d5927f-2ad9-4f03-9f91-68a938fdec7c	812d218e-65bf-440a-bcf8-a46a64268477	8
4d5e8ef8-92f6-4251-ac14-4452bbf4472b	e1d5927f-2ad9-4f03-9f91-68a938fdec7c	5b816c7a-142a-4cf6-be2f-1f403597330c	9
f094145a-8ba4-4ff9-bee5-821cf2dc4ea6	e1d5927f-2ad9-4f03-9f91-68a938fdec7c	8244b000-0cf9-4023-be75-ebcaa6608ec3	10
5a9b0785-aca7-4351-a858-c586456309c9	93b0fe2d-157c-43e7-b091-d0bd3049f6ac	603fa2fc-40a6-49ce-bae9-2a3b766943d7	1
13aa14ce-747b-45db-a08c-3d9009db5ce2	93b0fe2d-157c-43e7-b091-d0bd3049f6ac	dee19a49-4b2d-46dd-82b5-cd86bad57337	2
7b6d0688-7185-46bb-9d72-a867b7f65681	93b0fe2d-157c-43e7-b091-d0bd3049f6ac	0f8f8f76-d013-4d50-ab90-89c747d25d8c	3
05e1e2f1-e71e-47f3-a924-7c362c313447	93b0fe2d-157c-43e7-b091-d0bd3049f6ac	e609ed42-efae-428f-a1e4-4c225a4f84ba	4
e18e8c41-71fb-41fb-a3bc-88d2f3861b81	93b0fe2d-157c-43e7-b091-d0bd3049f6ac	254886e4-75d6-437c-ac85-6c7a6c67cdaf	5
2f3952cd-fdcc-4daf-a1d4-521c209dc0c7	93b0fe2d-157c-43e7-b091-d0bd3049f6ac	977ba7e8-cce7-4739-8104-3eda2be11945	6
9396b6a6-5ed2-40e8-a97d-b59ece196c55	93b0fe2d-157c-43e7-b091-d0bd3049f6ac	fccb9a60-e71b-4ea4-ba24-78dff4655303	7
7d60ddd8-341d-4ccd-8287-4e4afba56a2f	93b0fe2d-157c-43e7-b091-d0bd3049f6ac	90404293-c40d-4c19-9aa7-bea7863793e5	8
18d28674-449f-469a-8e72-7d38cd98f07a	93b0fe2d-157c-43e7-b091-d0bd3049f6ac	9792d979-853e-490b-8c81-3e134dd3b1f2	9
d7858400-c1a4-4262-bc88-25594bbee3c2	93b0fe2d-157c-43e7-b091-d0bd3049f6ac	e7436677-238d-485a-9bd6-3c73e5476ff4	10
39706e2d-3159-4af7-8a3d-fae6c447246e	60e7f193-2ea7-4f05-ae88-3de870728db3	92ce6e63-289a-4e7c-ae7b-7b4fb0b30177	1
3ea1ec84-8229-43a2-bd7d-37b1f8d3a8d1	60e7f193-2ea7-4f05-ae88-3de870728db3	5650000d-3aa2-4cd4-9e02-46e55da367b0	2
b5e5b2ad-eed6-4d5d-b653-802df8912b46	60e7f193-2ea7-4f05-ae88-3de870728db3	7a7954e6-3254-4e43-add8-f8081e7a1e9a	3
1cd2c310-e3a4-44f3-8b4c-f5bc41e50143	60e7f193-2ea7-4f05-ae88-3de870728db3	4f151382-aa9e-47ea-bd59-c35da91ba68b	4
a62f6c8e-9fd0-49ab-bb04-e64c7248338c	60e7f193-2ea7-4f05-ae88-3de870728db3	319a776b-f845-4eec-a64d-63a5b9eeed76	5
01ec4173-7018-414f-926f-5caeb5bfb840	60e7f193-2ea7-4f05-ae88-3de870728db3	586bb17f-2988-4a44-bba9-2a6fa4d226dc	6
3b223088-2b20-4e81-9140-b131de066f8f	60e7f193-2ea7-4f05-ae88-3de870728db3	d03845b8-c533-4480-aa39-321c03acb924	7
732cb756-1d27-4775-ac86-0792c3298c54	60e7f193-2ea7-4f05-ae88-3de870728db3	560fb9c4-66e1-4e1a-a1cc-2cdcb8961149	8
bbee832f-b7c5-4f59-856e-84b132127797	60e7f193-2ea7-4f05-ae88-3de870728db3	a91ca07a-a802-4988-bea7-e2561a09cb4e	9
efff71c8-e953-4f1a-b7c1-a99fa53caf8e	60e7f193-2ea7-4f05-ae88-3de870728db3	c30e86dd-07a4-4195-89ff-ebd1cc743669	10
968bfd11-2248-4db5-bb67-c468eb2b0bfb	7716e2e7-cd32-4e09-86f0-ab2fa24d0956	6046b0d4-fff0-4a01-a1be-5c9f5c17dad6	1
81d5a7c6-8455-41a7-b235-0bdd3c16b59b	7716e2e7-cd32-4e09-86f0-ab2fa24d0956	5cd25d27-32e1-4ff3-9615-3d05719e12a6	2
49450c88-ac2f-4734-af7b-e33eb5aae0a1	7716e2e7-cd32-4e09-86f0-ab2fa24d0956	f99ff1fb-5ae8-4150-aa7e-5ee2ba3e65e1	3
05ff217d-f886-489f-9f87-4588f8e4a871	7716e2e7-cd32-4e09-86f0-ab2fa24d0956	0fcb4098-4e02-41a5-b679-99871892221d	4
6e59ed5d-e370-4807-8bd9-50daffbe092d	7716e2e7-cd32-4e09-86f0-ab2fa24d0956	821933db-cf8d-4bb4-8d3c-810615aa8f29	5
07009f3b-f08e-4057-97e0-beeac7e4bc7b	7716e2e7-cd32-4e09-86f0-ab2fa24d0956	e891ecbd-c01f-4802-8a50-a1518590104a	6
2b4fb2fc-2871-4f57-9bd4-44d198085332	7716e2e7-cd32-4e09-86f0-ab2fa24d0956	71d76495-9ade-4b03-9f35-59e72729c06b	7
f28b622b-592f-42dc-b3d5-6006d507826c	7716e2e7-cd32-4e09-86f0-ab2fa24d0956	ba93fc12-c082-4b73-b410-4c663f35f7dd	8
583cbab7-2fd5-4d16-9e0e-c44ac09f36b9	7716e2e7-cd32-4e09-86f0-ab2fa24d0956	1a444534-f9d8-4331-84dc-7932f19c4dfa	9
65875b67-6c4a-47b0-b5e6-e6baea3a56cf	7716e2e7-cd32-4e09-86f0-ab2fa24d0956	1a38f228-66c7-4f2e-a313-140b2ec95cec	10
5fd1fdd2-d71f-4e8a-9322-3e70635cdd77	4e67fe17-1710-4f88-8812-eccef8217c95	187d0116-61df-49db-872d-bc70fd5a4148	1
7381c566-fe3f-45c4-89aa-d505e414e733	4e67fe17-1710-4f88-8812-eccef8217c95	8f214237-9d90-4499-9c3e-891c6662c937	2
029549a3-a5ce-49db-a77d-b16129d6d569	4e67fe17-1710-4f88-8812-eccef8217c95	ae518193-faca-435e-91b6-d983f3fa5220	3
53f2f718-16fb-4d97-a128-bf6c1056d7ee	4e67fe17-1710-4f88-8812-eccef8217c95	8b68b455-ee87-46ce-852b-84f322e3f9cf	4
806554b8-168d-453d-87e3-ecb98d4f79e6	4e67fe17-1710-4f88-8812-eccef8217c95	a821ae64-ddf7-4328-a65f-8150c150652b	5
5a637095-6d69-4915-8122-9d78d6cb3478	4e67fe17-1710-4f88-8812-eccef8217c95	78e24b70-7bc8-4b23-9f00-4ca7154df0a4	6
c496dfba-cb48-4f89-84a4-53049004dba2	4e67fe17-1710-4f88-8812-eccef8217c95	a86dcd08-7def-4621-98ad-ff3ac5726f0e	7
0ec03584-9b3c-4184-b90d-4963551052ef	4e67fe17-1710-4f88-8812-eccef8217c95	79360a65-2637-4c24-bfef-8704f86d4ba0	8
03c3d04f-d56e-40df-b604-276007d79d2f	4e67fe17-1710-4f88-8812-eccef8217c95	5ce93bfc-8306-4be1-bca1-de0af1076f25	9
22223dd5-3319-4043-918c-696e4996fbfe	4e67fe17-1710-4f88-8812-eccef8217c95	29120753-4597-455d-a73f-5f416f3276fe	10
13f7dbb4-c434-4227-a107-12d738138948	26084db8-bb12-41a0-b5c3-3e9977fc2de1	dc1aee83-0113-4af4-9c64-3fa4784336d1	1
6f31c5a8-c517-4e00-830d-816ffe27919a	26084db8-bb12-41a0-b5c3-3e9977fc2de1	b9f8cf12-2507-4913-a61e-784421067a80	2
e9f02d96-ca24-4fa4-8595-88b1e98c3364	26084db8-bb12-41a0-b5c3-3e9977fc2de1	d7b3d021-787e-4050-83c9-02db54c589c8	3
d8d49a23-cfdb-422f-809d-01c1970f1904	26084db8-bb12-41a0-b5c3-3e9977fc2de1	04b1aee1-f1a6-4151-82f6-032b20180856	4
e0880b17-746e-409b-a3d5-0a7fc68ffd86	26084db8-bb12-41a0-b5c3-3e9977fc2de1	18e78c87-9396-4dd0-aa93-b0bf1158a04a	5
6baa17e7-5f18-42b8-87e4-6713f6fa633d	26084db8-bb12-41a0-b5c3-3e9977fc2de1	72110a2c-fc89-413d-b994-41da5876440e	6
23e7ed46-3c0c-456a-9934-717ed4b2511c	26084db8-bb12-41a0-b5c3-3e9977fc2de1	85980a3d-8206-4575-9a55-03cf7edc2283	7
def433d0-5ead-491b-9789-d34b6b0b0bc2	26084db8-bb12-41a0-b5c3-3e9977fc2de1	73a0fc99-c880-4fae-926b-2c5dcfd4728b	8
fcfd269b-0461-41f0-8f01-81b6aca4947d	26084db8-bb12-41a0-b5c3-3e9977fc2de1	83afa1a3-965e-48fb-bfea-d6515643299c	9
db24a4a7-44f7-4032-87c7-fad8a0de0a8d	26084db8-bb12-41a0-b5c3-3e9977fc2de1	f989fe3b-0c43-4859-aec9-caf3829e87be	10
b3d59ef3-29b9-4b51-a93d-6a65a9214c6d	182c24d5-7b8a-42cc-81fe-bf150ca96008	fdc49f8f-35b1-439d-8a30-81f07e596b50	1
19ba22c3-2859-4b60-a5f1-68e716bf5665	182c24d5-7b8a-42cc-81fe-bf150ca96008	b11aba84-6def-46e6-b885-c2964824db5f	2
dc4dccf2-e2c9-4ddd-8475-6036fad6014e	182c24d5-7b8a-42cc-81fe-bf150ca96008	0148852c-a823-4243-b9b3-ffe37604df10	3
88ec3cdf-84df-40c7-bfbb-02a623d4a35b	182c24d5-7b8a-42cc-81fe-bf150ca96008	ec851181-0136-44b0-928d-9af5669afb64	4
0bba193d-7a33-4db9-b4b8-089b8a39520d	182c24d5-7b8a-42cc-81fe-bf150ca96008	7eb23f37-893c-4adc-a0e7-534517375108	5
59d1116a-293f-4970-ad92-3feedea44c67	182c24d5-7b8a-42cc-81fe-bf150ca96008	e5802405-d39e-4d4c-a26a-2f354133a32a	6
d20e031b-1b13-4464-9a28-a8e19e01a89b	182c24d5-7b8a-42cc-81fe-bf150ca96008	84b28759-362f-4e01-b22a-a5b9b553c724	7
6961960e-b378-4589-bf63-fb2e8669ffe5	182c24d5-7b8a-42cc-81fe-bf150ca96008	e4d30838-b71f-4b13-a181-5ef8914b3b2d	8
9dc88cfb-f835-4183-8ab7-41b9909b5367	182c24d5-7b8a-42cc-81fe-bf150ca96008	ce1f7e63-5de1-42a6-8a3c-cea37d194833	9
0dbec089-73a8-4861-aa0d-ce1faf959d0b	182c24d5-7b8a-42cc-81fe-bf150ca96008	84a2496e-86cb-42b3-8383-93e210c5b1c2	10
427cdd9f-90a6-4dec-b5bb-af0e536ce278	46992a34-aa33-4a42-87fa-988d3b8095ed	a41588ab-8ca9-4693-83e0-5d26e493a8b9	1
67e2518f-4532-4071-87ad-7ee7eef0ca6f	46992a34-aa33-4a42-87fa-988d3b8095ed	ad9bc702-8cd0-4a6b-a3ae-24d85d4b627e	2
ac32be92-30b6-478c-8fd0-0da070de7ed2	46992a34-aa33-4a42-87fa-988d3b8095ed	d46f2a87-d462-4541-b1e7-55ca2b907061	3
0eaad95c-51eb-464d-a5e3-6584c80b6a53	46992a34-aa33-4a42-87fa-988d3b8095ed	a0c622a4-3bf5-4766-a261-55e8506b146b	4
e1566ae6-17e3-412a-86e7-9980fa82d04c	46992a34-aa33-4a42-87fa-988d3b8095ed	21dfbb54-b0cc-46b9-acf2-fdb8f66d4c97	5
47772d41-7df8-4654-aa2c-52b23297b7e9	46992a34-aa33-4a42-87fa-988d3b8095ed	688e3634-7b0f-4c4d-a7af-2368e504127d	6
023f8df2-e7af-4261-a5bd-34249c2c4758	46992a34-aa33-4a42-87fa-988d3b8095ed	2cfff5f6-989f-4c54-9ed2-c545ddf9100e	7
d7ccf76f-dbb3-4d55-9693-284c7207eb41	46992a34-aa33-4a42-87fa-988d3b8095ed	986aa020-f987-4857-aa18-240ae7c427a0	8
952490f9-1512-44d5-b34f-3bae71fb4c97	46992a34-aa33-4a42-87fa-988d3b8095ed	052a67bf-a65d-4739-a345-b986630673d8	9
e66de719-2b28-4e4d-8db5-b73938ae6a1f	46992a34-aa33-4a42-87fa-988d3b8095ed	91ac6de3-97dc-4f6d-8ba5-141c943deeb4	10
72f06f0f-802f-4406-8b1a-bd415f5e96b8	a8680c6c-5648-4d80-9f19-9805389f33bd	90806709-c4d3-4bdd-85be-276bf67218b5	1
d45888bc-1347-4bf9-844b-10b25a805264	a8680c6c-5648-4d80-9f19-9805389f33bd	eed6a558-64e5-43e5-b446-f55dfdcac02b	2
87b49b0c-c360-4fca-a6bd-845a4cb1d111	a8680c6c-5648-4d80-9f19-9805389f33bd	57ac7adc-819c-4927-a377-5c848a7cf826	3
12fc0000-45a7-4e95-b771-436955cf3475	a8680c6c-5648-4d80-9f19-9805389f33bd	cfd67924-250d-44bb-9cec-36bf88cda44b	4
671f3b87-afd4-43b6-8538-d3c1693e6748	a8680c6c-5648-4d80-9f19-9805389f33bd	8f4df26e-0cd6-408a-a888-547d8c373178	5
a90596f3-b924-43e0-af33-53b63bf4fc4a	a8680c6c-5648-4d80-9f19-9805389f33bd	13c8bd09-665d-4034-b4e3-a75348bb0764	6
26d866f7-25fa-40a8-834d-0cde5f6b48ac	a8680c6c-5648-4d80-9f19-9805389f33bd	411bdc56-82de-4493-a32d-861abf80bac5	7
aeda3c67-e484-4dcd-9341-6a74e003983f	a8680c6c-5648-4d80-9f19-9805389f33bd	be1f7966-25c1-46f4-9488-dd0ec853b445	8
fcf8e007-669d-4583-a347-d940aaef188b	a8680c6c-5648-4d80-9f19-9805389f33bd	8962490d-7b02-4ca2-a3ba-9a44d293dedc	9
d46b1b31-226b-49cc-a545-78d3a265bff0	a8680c6c-5648-4d80-9f19-9805389f33bd	d4d3bdec-6278-479f-ac4b-4e3bff9a1314	10
9560e885-99e5-4ddf-9ec8-5949414bd0ec	49602caf-6f59-4bb5-a8b9-84332e3f6ef0	ba903b63-dc0e-4391-962c-fc6d45bc99d5	1
204ba63b-e6a7-4f3a-9020-36056fb29d49	49602caf-6f59-4bb5-a8b9-84332e3f6ef0	c901fe24-bc53-430b-816e-fa5c572ea1d0	2
ff18f9c7-084d-475d-a1ea-1a21d09523fe	49602caf-6f59-4bb5-a8b9-84332e3f6ef0	1014e38b-4937-466e-9b5e-827c60db90a8	3
1b867cb8-f52c-473f-b8d6-52f270aa5ca8	49602caf-6f59-4bb5-a8b9-84332e3f6ef0	8448af78-0e18-446f-abfd-ecb0accc122e	4
f9de5ab6-623b-42df-b87e-72bec55f9d44	49602caf-6f59-4bb5-a8b9-84332e3f6ef0	fc08031a-496b-4bb4-ab1c-528c5fdc4d34	5
8489c5d7-1ce3-4603-8fdf-57039fb3e76f	49602caf-6f59-4bb5-a8b9-84332e3f6ef0	5ba8b943-e7be-41bc-b347-5fd88e30255f	6
345190b3-3237-4e7c-abaa-f68cc477ab35	49602caf-6f59-4bb5-a8b9-84332e3f6ef0	a1f8545d-392a-4b83-8651-55262e7def43	7
da907746-acdd-489f-a148-508fe78b6ab2	49602caf-6f59-4bb5-a8b9-84332e3f6ef0	3e2a234b-1e88-4545-b8a6-217264da8657	8
1e163e22-b73e-47ac-a986-b281e0293b7f	49602caf-6f59-4bb5-a8b9-84332e3f6ef0	7a1ea68b-c583-4bdb-ab7f-7a65399ecab5	9
e256aa52-c938-4e7e-a674-d0cde6e175e4	49602caf-6f59-4bb5-a8b9-84332e3f6ef0	9fb8002c-56a2-4b4c-9c61-e745bf6743b9	10
59353010-4be9-4019-b7f0-bc0256c0151c	e2a575cf-1c68-4772-b72f-9471de076f9d	ea82a618-be42-4536-9af0-e4576f7056ba	1
fe331fde-45be-42db-a534-714c100464d5	e2a575cf-1c68-4772-b72f-9471de076f9d	32d61cc9-8237-43f0-af5d-01db6650a56f	2
888eecc7-b0b0-405a-bf2f-e196253d3cad	e2a575cf-1c68-4772-b72f-9471de076f9d	ea87878f-471a-4f91-ae5b-3ed7a9c16209	3
2724af6b-2481-41da-98f6-9d4174e10508	e2a575cf-1c68-4772-b72f-9471de076f9d	95743909-a972-4d10-876e-d1a715ab3889	4
43f3e90c-e365-4862-8d02-00c110202ece	e2a575cf-1c68-4772-b72f-9471de076f9d	ba15eb5d-1877-4d89-aac5-2068534ffc06	5
ebead560-220c-443d-bc9e-96a612f26985	e2a575cf-1c68-4772-b72f-9471de076f9d	81fe41eb-ca94-4de2-adac-1d4614546a09	6
5e957017-474f-4396-9ab6-99403c3b5980	e2a575cf-1c68-4772-b72f-9471de076f9d	2f122acb-0f25-4b8a-b5df-d5d748c02b30	7
bd69f0fe-02a2-4db0-b8a4-075ad8cb75cb	e2a575cf-1c68-4772-b72f-9471de076f9d	513b0032-8a4e-430e-a53c-72f26f991587	8
4a83cdae-c900-46c4-a7f5-3314ef5eb6da	e2a575cf-1c68-4772-b72f-9471de076f9d	9ef9564d-cd4e-415c-996b-4d4cbb138ebd	9
bdd64e22-3aba-4571-87a8-69836ccdb3b2	e2a575cf-1c68-4772-b72f-9471de076f9d	d3b01e64-b762-4a0d-a590-8368c5736bcc	10
a021105a-d447-4d15-99c1-cbe36a4d9210	77b339a2-231a-4afc-993a-185b06631027	073ac357-89c3-403b-ba6e-bb69dd17c36c	1
8f0f5b13-8863-42e7-873e-52f327d5d9e0	77b339a2-231a-4afc-993a-185b06631027	8b57b09d-ed1d-4f96-8426-7d4a4cd9e637	2
29953f47-0129-483e-99ef-999e6e82ede2	77b339a2-231a-4afc-993a-185b06631027	45b581d9-e8ab-456a-9347-f6b5d75a930e	3
da9a53af-14a7-4d5a-abc3-937b156b23e6	77b339a2-231a-4afc-993a-185b06631027	5f8c8c83-1288-4f4b-8998-577f3c9c75f3	4
d599b587-3aec-4852-802c-d011557bb3e0	77b339a2-231a-4afc-993a-185b06631027	c6bc1c0c-c2b6-4d3e-9077-1f43f8b58d9f	5
1214feeb-58f4-4be0-a747-d8c094720f52	77b339a2-231a-4afc-993a-185b06631027	6abbe39c-d4ef-4b3c-9013-97716a21ab5e	6
e8ad31af-620f-473f-8010-6dd7765218d4	77b339a2-231a-4afc-993a-185b06631027	bb17a3d9-d55f-4efd-ab86-8537dceaf9b7	7
49fa0f30-b14c-4a20-a99b-e323fdd8ce10	77b339a2-231a-4afc-993a-185b06631027	f8aca3ca-991c-4384-af2e-cf45fa9e64fd	8
3eae8ec1-6a30-4ddc-b63c-1afdebd507d8	77b339a2-231a-4afc-993a-185b06631027	cb39c92f-563c-4fa2-b1bd-dccb9d9ce590	9
928dda38-02a1-4f92-894e-628ae4660b34	77b339a2-231a-4afc-993a-185b06631027	ec221978-604f-4b20-a038-237b83a69c78	10
0556abb5-a24c-4b1e-9171-a2b224daffec	01fab7c7-d7dd-444d-b40d-ec67c3c68f70	f6e001ee-b842-4b2f-91bd-6db182654f62	1
be840eb7-3e0a-4731-a562-4143347670c2	01fab7c7-d7dd-444d-b40d-ec67c3c68f70	35cb7318-94d8-4537-9688-4a53d683288f	2
aaece715-b7e5-41b2-be2c-bc2033025fe1	01fab7c7-d7dd-444d-b40d-ec67c3c68f70	4fef008a-5c15-41d6-873e-e32861602baf	3
8530e939-12a5-4eb3-bbcb-cdc0b5a7cccc	01fab7c7-d7dd-444d-b40d-ec67c3c68f70	48a66ae0-7219-46f4-9d67-f825e94a3201	4
027ba347-06bb-49e6-b1dd-42bab2373630	01fab7c7-d7dd-444d-b40d-ec67c3c68f70	0b22060a-b403-42e1-a7d5-a693ee62bc4e	5
330df081-2707-45be-bfc1-4084f06fd4e9	01fab7c7-d7dd-444d-b40d-ec67c3c68f70	3f88fa93-ab57-45c7-bf25-a7db5e71cddf	6
94c71845-069b-4a24-bdec-8ba5d2d36d9d	01fab7c7-d7dd-444d-b40d-ec67c3c68f70	c7338bfc-c2a4-482a-ac4a-0451037e0142	7
7f8ccf15-e962-4aff-8689-1b68758b519b	01fab7c7-d7dd-444d-b40d-ec67c3c68f70	69ee83da-0e0d-4433-a616-487d17c490f4	8
61ca7c47-02e4-47be-8a74-8b1b6d12fc35	01fab7c7-d7dd-444d-b40d-ec67c3c68f70	1cff97ba-d949-45e1-a904-7ffc573830bf	9
c5762df6-f50e-4d3f-b4a7-263f40a15794	01fab7c7-d7dd-444d-b40d-ec67c3c68f70	1ee08a42-b2cc-45cf-898f-cbff1106153c	10
ce018dd1-b4df-4027-bd85-549e8fb8fea1	649c2505-4a4b-48e0-9792-a702e8d8342b	75cabe3d-8175-45aa-b2ae-db9aee2091b1	1
9ad40e31-634b-4ebd-a671-1e9f6a263125	649c2505-4a4b-48e0-9792-a702e8d8342b	41a21dd5-4280-444f-a6c3-9bf1bfa8f259	2
b5c2733b-8644-4844-aab2-040efdb7af36	649c2505-4a4b-48e0-9792-a702e8d8342b	ed2b572d-0159-4e6f-bd52-188cd3684953	3
3f929af5-2ea0-4096-bd3f-4e7954ea8427	649c2505-4a4b-48e0-9792-a702e8d8342b	547b194d-eca6-4b6f-ba99-42cb7ac3a78c	4
05822a07-5556-448f-9947-92204a580835	649c2505-4a4b-48e0-9792-a702e8d8342b	ac4c959b-f768-48ee-9370-59c3c75da1a9	5
a89fbc04-0f1b-493e-a595-fd1a173eaa1f	649c2505-4a4b-48e0-9792-a702e8d8342b	ac59eb6e-2271-44d6-b44b-094e0d4b21a6	6
da05798a-8a2a-4d27-a5a8-af24e672bc4a	649c2505-4a4b-48e0-9792-a702e8d8342b	f4367ff7-7b92-45dd-a0a8-51642ab518d5	7
a1cd19fb-c000-4f66-ad86-6aab15dd1285	649c2505-4a4b-48e0-9792-a702e8d8342b	c792b6e4-d9a8-4903-9e48-c0fd55193d0d	8
337af004-609e-4071-a9c7-01af5a4dbcd4	649c2505-4a4b-48e0-9792-a702e8d8342b	3ddbd8ad-4d94-45c4-8f5f-9f24426725a6	9
444f3d44-d1b1-4f6f-9e54-4a8165ea9ef9	649c2505-4a4b-48e0-9792-a702e8d8342b	4f22f58e-b7e5-45a0-8fdb-c7fff043ad9b	10
e0fd79fa-f819-48b0-b45d-c69818753b02	9e3a4488-8fd4-4d90-a672-ad2bbe6107fc	4fd0b6a5-bf14-40f3-be5b-9dedaa9b17cc	1
ccc174ea-9670-41fe-bda0-8a5cee3631e1	9e3a4488-8fd4-4d90-a672-ad2bbe6107fc	d71efb00-13d6-40d9-a52f-574b052bc8c3	2
76b09d6d-b5c3-4db8-bc3d-c58044cebfc1	9e3a4488-8fd4-4d90-a672-ad2bbe6107fc	e848077b-b8dc-4518-ab04-c920c68801bf	3
d3ab99d9-1cec-4af5-be23-e44f48cd549a	9e3a4488-8fd4-4d90-a672-ad2bbe6107fc	cd43a5f6-95c7-4879-b1fc-8c7d69aa592e	4
3b1438ed-bd61-4508-9d22-74cd0fcc6b7a	9e3a4488-8fd4-4d90-a672-ad2bbe6107fc	ebd47f82-861f-4645-a80b-a9e3b6fd4547	5
21c43bce-6b21-488c-8f0e-5d8c26c3f09b	9e3a4488-8fd4-4d90-a672-ad2bbe6107fc	b28455fb-3d54-4097-8b92-af927746dcfb	6
c2a585fc-679c-4dff-8877-156fd3c37dd3	9e3a4488-8fd4-4d90-a672-ad2bbe6107fc	9e4041d8-1e80-4fe6-bd6d-b8f62e78f522	7
f3a8c842-ebeb-4156-b563-875c87206b1b	9e3a4488-8fd4-4d90-a672-ad2bbe6107fc	02479fab-f639-42c1-afbe-0a7031bf93de	8
517651ec-8245-49d1-b324-f6cea0b018bf	9e3a4488-8fd4-4d90-a672-ad2bbe6107fc	4ff34c44-e103-4b73-9218-7a4519a64f40	9
f38f3220-c9e2-448e-8a88-fad31892f1b6	9e3a4488-8fd4-4d90-a672-ad2bbe6107fc	6da8da51-5874-41c4-848b-b5d0ffc16a3a	10
cb31f79f-49dc-4f9d-9a5f-a50df623e7f8	2fea5add-3c66-4829-a052-15531ffab4af	7eb9b59b-15db-4a80-b143-db049d291b8c	1
5350a312-deb8-4a18-9048-77037e67a81b	2fea5add-3c66-4829-a052-15531ffab4af	603d55d8-af19-4850-92a1-6e2240f179d1	2
065d717b-3678-4447-ae56-e26258f81ea8	2fea5add-3c66-4829-a052-15531ffab4af	e41d713c-22e3-43b5-af8f-fa041fa4cdcb	3
b52bf116-abc4-4a3b-be38-7318f9e314f3	2fea5add-3c66-4829-a052-15531ffab4af	24ee6fd6-e7b4-41ca-9a41-a825e3c7cc8a	4
e06fd695-a04a-4e9e-adde-37dfb8f73d99	2fea5add-3c66-4829-a052-15531ffab4af	c29387b5-1340-4008-81a2-777866bd1703	5
1f0cfb99-be27-46b1-a5cb-90a8c2b8527f	2fea5add-3c66-4829-a052-15531ffab4af	028c1730-aedf-47ba-ada4-ca41b45a5bb7	6
9a6605f1-fc7b-4122-b9bc-35cd4463c5f2	2fea5add-3c66-4829-a052-15531ffab4af	1c6e2ed9-799e-4c4e-8ff4-849cccfbcb8b	7
b4258e46-fbf9-4064-b6a3-e1274b511b91	2fea5add-3c66-4829-a052-15531ffab4af	b5563d0b-b09d-4b81-95f6-3e40c14d7f69	8
cd159a76-f8f6-49f7-9a39-f869cb00b82f	2fea5add-3c66-4829-a052-15531ffab4af	519e8361-fbfe-42e4-b50b-24ef66e64ed6	9
e6ddc090-b548-4b12-bb45-66f02c57681b	2fea5add-3c66-4829-a052-15531ffab4af	f413e776-b325-408b-afce-301bcdf67444	10
1a4fdc0b-ca06-4951-9974-b2cf14fff6a0	9a25dbc3-b7bc-43e4-abe6-0b52da13ddf1	9aca3f84-432d-4884-a5cd-2e6c4b2d818a	1
d832b4d8-f260-4f57-bc3f-cd0aa4ae4db5	9a25dbc3-b7bc-43e4-abe6-0b52da13ddf1	3e987ae8-35a4-47b9-af0b-777ae6d1d95b	2
f63db11a-4a99-41ff-bd26-39a2631b2411	9a25dbc3-b7bc-43e4-abe6-0b52da13ddf1	0d5a7be4-f931-4678-b654-50a8e6083da8	3
c66306fe-9785-4f6a-8b6d-1737af04b147	9a25dbc3-b7bc-43e4-abe6-0b52da13ddf1	2973da44-ce2b-4a44-a4a2-9e9163556f0f	4
9f5f4da1-d1cd-4de2-bf10-ae550f825dbb	9a25dbc3-b7bc-43e4-abe6-0b52da13ddf1	11474d51-aa54-46b3-8547-33a55afcddc0	5
ce5e9059-17ef-4c19-8b00-9b5cb916732d	9a25dbc3-b7bc-43e4-abe6-0b52da13ddf1	3b42936e-57d7-41fa-b2b5-cff5d7d8bfcd	6
01cf5699-b58b-4d7a-8548-91fc82f3e422	9a25dbc3-b7bc-43e4-abe6-0b52da13ddf1	10da074e-d9a0-4719-acc9-4f09a6b255b5	7
590562da-bf74-4362-96d3-a6b0350b8e9d	9a25dbc3-b7bc-43e4-abe6-0b52da13ddf1	775d30e3-7e31-4907-9796-e5ab99550a9a	8
41f9a11a-45ea-4077-8fb5-3412d2ec80ff	9a25dbc3-b7bc-43e4-abe6-0b52da13ddf1	b40013ae-eec0-4c6d-abe8-b006dbfc1232	9
b732edb7-ab21-4124-90c5-63e1fdebc796	9a25dbc3-b7bc-43e4-abe6-0b52da13ddf1	9fdee97f-48ea-4002-9fb1-8413ec93a5ec	10
26dbf54d-c1e6-4b2e-8d72-f8fc979fd6fc	121b7eb0-c04c-4411-8571-79184c813d0f	a94c7688-e581-4785-aae6-6d58e948b8b2	1
9b3945f6-cb5b-48a5-aeea-bb4672e8e4db	121b7eb0-c04c-4411-8571-79184c813d0f	6ed8fc8c-b45d-47f1-80c5-dc6a85976873	2
19b984c3-958d-4188-b4d2-967ca366c2df	121b7eb0-c04c-4411-8571-79184c813d0f	6ce60822-f9ba-45b2-a9bd-c43d3aba95ad	3
2cb3f680-8174-48a6-a8b0-432a7f6694f6	121b7eb0-c04c-4411-8571-79184c813d0f	9c2e54bf-d76a-4486-80a4-97f4e667d688	4
29b0f7d3-4ced-4b22-b81b-dec3586b63dc	121b7eb0-c04c-4411-8571-79184c813d0f	3a29e036-c2ef-4183-a01f-20972648ecdc	5
1e203d6e-c5f7-4ce5-8554-41ebea4d2fa0	121b7eb0-c04c-4411-8571-79184c813d0f	760ea552-16af-4f35-b1e3-932164d0a582	6
f49e56e7-9f74-4953-9a5b-36e6dd080859	121b7eb0-c04c-4411-8571-79184c813d0f	7f52ccaf-beec-4572-9461-57cf84c2b1e1	7
66cfd993-e633-4826-ae7d-a71d114e6d43	121b7eb0-c04c-4411-8571-79184c813d0f	3bc8da8b-4a6e-458e-bcf5-0026bc93cd16	8
762bee1f-aeac-4822-872c-0b6834cf45d1	121b7eb0-c04c-4411-8571-79184c813d0f	8e267da7-4baf-4b23-904d-c510b28b5bb7	9
272a8ea3-d862-4489-92c3-2684f174b744	121b7eb0-c04c-4411-8571-79184c813d0f	31d884d6-c75a-4a54-8c28-3566f35c7830	10
a0f588b3-acb6-4f31-b49b-f2913650711e	50b12224-c4f6-400d-9f30-f28e9db9565e	b4938be2-3bd8-4a47-81d3-42cbaefd336b	1
cea6446d-3785-45c7-960f-cc0790b7a3c0	50b12224-c4f6-400d-9f30-f28e9db9565e	e6bc91b9-e550-4a8e-9f18-d69548eb01f9	2
3f3248f4-9adb-437d-a039-cf0207462b96	50b12224-c4f6-400d-9f30-f28e9db9565e	6d751b7f-ac3c-4798-8222-6c9e0f0310b1	3
db555f84-108e-4a22-baf0-98f253a83011	50b12224-c4f6-400d-9f30-f28e9db9565e	9c344dc6-0fd8-4929-96b2-324df4384466	4
978a6412-ac8e-4acb-9143-0dbfede2c62e	50b12224-c4f6-400d-9f30-f28e9db9565e	301ad109-74d0-4885-aa16-33170425f158	5
5501e3fd-76d2-4f4b-9344-d99fcb126921	50b12224-c4f6-400d-9f30-f28e9db9565e	132c2005-bdb2-4f55-9a71-fcae240b959f	6
ba692977-5112-4074-9919-d73171308c13	50b12224-c4f6-400d-9f30-f28e9db9565e	24696f23-3407-4945-a0e6-ffa0f755dde9	7
0268acaf-d788-4ead-8035-12688e8cced6	50b12224-c4f6-400d-9f30-f28e9db9565e	95259d9a-1731-4ac4-875a-77210ab6fcfe	8
5ac1293a-6c6d-4632-a5cd-12b20dbf7252	50b12224-c4f6-400d-9f30-f28e9db9565e	eb7219de-0b9f-432f-98e1-8c04ebc3ff23	9
d874cc24-b977-44bf-b6c2-00c071f6c595	50b12224-c4f6-400d-9f30-f28e9db9565e	8a140601-431b-4792-8024-3abc4ca59818	10
5e8151f2-afde-4d1b-a59d-1818638a2733	e5a64287-666d-43a9-b7fc-4d504ad91e96	3be01758-1140-4cc6-9976-d1f6185165ef	1
21cc2d4f-8981-4334-81b5-7eb6e186f473	e5a64287-666d-43a9-b7fc-4d504ad91e96	12e3979c-7ac7-48ad-b7be-858afd95cf08	2
a787c43d-3d13-436f-bf6d-e96277e59a09	e5a64287-666d-43a9-b7fc-4d504ad91e96	8e709b09-67df-4f99-b3d8-0cf66ce543b9	3
6f6bc98c-d712-44e2-806a-e6a374c26849	e5a64287-666d-43a9-b7fc-4d504ad91e96	97d64357-a93b-4052-ac7f-8d7ac4281800	4
a57d6d98-70d5-4f6b-8fed-29c9c9a5a042	e5a64287-666d-43a9-b7fc-4d504ad91e96	429ef768-6e04-4160-a0ec-423175ad1f26	5
4cba58c5-2e5f-4172-9718-13b59ea528ae	e5a64287-666d-43a9-b7fc-4d504ad91e96	e2277108-2a8f-45ab-aa10-914c33e47626	6
47067677-e3f0-48e2-8f94-592d4967378c	e5a64287-666d-43a9-b7fc-4d504ad91e96	416b231d-2f97-45a7-8c87-7c8ed7e713b2	7
e642a43a-741c-4be5-b4df-3d4c41ad7763	e5a64287-666d-43a9-b7fc-4d504ad91e96	c61c7219-38b6-4f0d-a609-b134c1cf66d8	8
5d8673f0-9f53-4dbe-a0c8-0a84c005bf64	e5a64287-666d-43a9-b7fc-4d504ad91e96	294a8245-da1c-4d02-a382-cec33ffad93f	9
83ac2b02-d01d-48da-be83-8ec50f67c638	e5a64287-666d-43a9-b7fc-4d504ad91e96	85f23c5b-536e-4f1d-971b-80583f55c580	10
f5e99eb7-76b9-4105-8769-3ca562ef5c42	fbbc77b0-5569-4c63-a951-a3ccc8f6ffcd	89e35669-6a7f-47b8-9444-fe0a76b2a3b2	1
274c6303-399d-4a6c-8ccb-543db222a189	fbbc77b0-5569-4c63-a951-a3ccc8f6ffcd	6211284e-e8d0-42fa-81ef-7f37ebb267bb	2
76782ee7-b2bd-42fb-b4b3-cedb05c3b048	fbbc77b0-5569-4c63-a951-a3ccc8f6ffcd	eb1a1733-3c8b-4020-83cd-6736f9c0eb81	3
0f49cac6-f4dc-4eef-965e-925f28396ca9	fbbc77b0-5569-4c63-a951-a3ccc8f6ffcd	09135479-52da-4b02-8bb4-3dda365bb3e8	4
7a5aa04d-f066-4a3a-95e0-e9114d80f0da	fbbc77b0-5569-4c63-a951-a3ccc8f6ffcd	69b837b4-bc44-499d-ac00-7701418bc511	5
b4190389-0bff-42a0-9bdc-ca616392f72a	fbbc77b0-5569-4c63-a951-a3ccc8f6ffcd	13588941-8a29-4e62-b32b-41231db08660	6
3bbcb555-fa5c-4ed1-9034-cad75dd8e4d3	fbbc77b0-5569-4c63-a951-a3ccc8f6ffcd	3ae17173-1b3e-476e-8108-a0a4e3641f93	7
75325cc1-7eec-458c-bb41-d68680090f6d	fbbc77b0-5569-4c63-a951-a3ccc8f6ffcd	4e509978-6aee-4eeb-ad73-a7cbd2506ac7	8
25f18750-2839-4ec8-9262-7b7a466133a9	fbbc77b0-5569-4c63-a951-a3ccc8f6ffcd	4e470be2-92e0-46ad-a4d3-be711d83f697	9
cf4af411-5738-416e-8457-7f768994ea11	fbbc77b0-5569-4c63-a951-a3ccc8f6ffcd	d8639551-b9e5-403e-b66b-79d0199b02e3	10
1fcc313c-2f5d-45d3-ad2a-fe4877e2f017	f3b28902-b237-46ce-953d-82cde6353d4d	1a4652e2-eab7-4545-9a5d-880c288ac6f7	1
6d7a41a8-3596-45b8-aa60-0e2c443bc2ba	f3b28902-b237-46ce-953d-82cde6353d4d	c0d37e2a-5683-4d45-a29e-f2dca88a234f	2
eb4d8dce-31d7-4284-a6ea-d68401f1eaa8	f3b28902-b237-46ce-953d-82cde6353d4d	7793ae20-5e46-4503-858d-bc78b9b67b04	3
bcd801d7-6c27-4101-8302-b80f4c3d255d	f3b28902-b237-46ce-953d-82cde6353d4d	acc3ab4f-c548-4e0f-8c7c-201674fe5bf3	4
4963e97e-4426-48bc-8eea-97aaf605ab90	f3b28902-b237-46ce-953d-82cde6353d4d	8ae1da1c-a25b-49c9-bd21-76b847116bb0	5
36355bff-7b2f-4f31-b745-56310531ca25	f3b28902-b237-46ce-953d-82cde6353d4d	fbf8ed8c-6073-4039-a1f3-174928caf8a1	6
721dbde5-85de-4e0c-bd4b-49dd68c84698	f3b28902-b237-46ce-953d-82cde6353d4d	9770d01f-6200-4b30-9f8b-cab99854641e	7
8939a540-7efc-4e40-87c2-6c3119b7bf4b	f3b28902-b237-46ce-953d-82cde6353d4d	e78c6445-bbda-472b-b711-f20c72494b17	8
32f77484-b1ac-46aa-81ad-a2cab4b88d0d	f3b28902-b237-46ce-953d-82cde6353d4d	bf231a6f-6868-43ce-9896-05e493814c17	9
4bd9e492-2625-4b5a-b8f6-0659ca852652	f3b28902-b237-46ce-953d-82cde6353d4d	81ba4642-249d-4cbe-b948-d43500ff674d	10
f5e311e3-7594-497c-adb9-ab34a6fe82ac	c08f9189-2404-4fbf-b5de-7bbe7a359798	3a9e58e7-5cc5-48b2-99bd-83f2a2b49047	1
6d52b7c9-11b6-48bb-a712-4aa8c4a5c797	c08f9189-2404-4fbf-b5de-7bbe7a359798	cfa00932-c2e4-439f-a9ea-9f58182f5579	2
850f2e25-423c-458f-bc2f-a498e856ea34	c08f9189-2404-4fbf-b5de-7bbe7a359798	e17744cc-9dea-46b9-a210-0ed74f4165e6	3
04328791-754b-40d2-815c-46244ccba78e	c08f9189-2404-4fbf-b5de-7bbe7a359798	7b4abcbe-29e5-4b6d-9906-c6db061a5b3d	4
42e12c8a-32dc-4172-b417-6a61fa0b91aa	c08f9189-2404-4fbf-b5de-7bbe7a359798	ddc95a2f-797a-482e-aff0-a6c82b1fa43b	5
2e7f4024-86a1-458e-ab46-344306f4f2f6	c08f9189-2404-4fbf-b5de-7bbe7a359798	850624c8-8a6b-4064-9068-95d7f38cfa74	6
db6cacde-8484-4f1a-8c5a-d63c1257febe	c08f9189-2404-4fbf-b5de-7bbe7a359798	5055dbc6-e56b-436a-bf9f-cb89eeb6a4e1	7
9c7fc9d4-63a5-4e3f-ad92-8f9f831549f7	c08f9189-2404-4fbf-b5de-7bbe7a359798	5aca3ba3-02e5-4f2f-ae70-7899d953df00	8
3bf1b083-4522-4767-8489-41d5ac49a50e	c08f9189-2404-4fbf-b5de-7bbe7a359798	f6c666cb-a01d-4f66-86ea-c085c64d4e95	9
afee6688-68c8-4170-b27d-69ce407421ba	c08f9189-2404-4fbf-b5de-7bbe7a359798	7eeb5b5d-51d2-4575-8c1d-9d3cea156f19	10
b2d574f0-d372-442f-99ee-bb62ba97fca7	5e6545d6-6d55-4edc-9cef-77f0fc935708	aabaad10-5e2c-411d-9771-f45c36f621ce	1
0cefb709-c782-44f9-b944-d94d22d720d0	5e6545d6-6d55-4edc-9cef-77f0fc935708	69848bb5-0bf5-4683-aa78-f602b9bbcb70	2
c1caa5a6-2645-4ec5-9725-3b69116cbbb9	5e6545d6-6d55-4edc-9cef-77f0fc935708	4bc3860a-dc28-4c9f-8301-a174493c6ba3	3
35ca06e4-4c29-4065-80b6-f41f31c6e498	5e6545d6-6d55-4edc-9cef-77f0fc935708	340294cc-9e0e-4630-a7eb-c5d62a27c5ab	4
17ca04b9-8b95-424e-803b-98943974da02	5e6545d6-6d55-4edc-9cef-77f0fc935708	d943e896-d985-4183-988f-fd1dd5dc7a0d	5
91db330a-57d6-404e-9202-609e785320b1	5e6545d6-6d55-4edc-9cef-77f0fc935708	b4234c6b-b2af-4c3a-9e02-5fe3c290d28b	6
ba71eeff-59cb-44af-a396-32f614cf3e0b	5e6545d6-6d55-4edc-9cef-77f0fc935708	dfb9c25f-0f3d-4c71-bc4c-617b1d1ba6ab	7
46905cc6-9162-4164-ba50-cf2bf7592e4a	5e6545d6-6d55-4edc-9cef-77f0fc935708	3faee39e-dce1-4573-9af4-8c5cd1c85464	8
c1d45ad3-77f2-47fe-aebd-b743b86c6fed	5e6545d6-6d55-4edc-9cef-77f0fc935708	092eb0d0-b2a3-438a-b7fe-2cdcc63bff98	9
d0787f66-d797-4d33-b3de-d51b733aa226	5e6545d6-6d55-4edc-9cef-77f0fc935708	c63b69a0-b3cc-436b-a428-8b0a02417d6e	10
3378d929-3b53-4131-a478-88e657f0fb58	26e8d2e9-50a9-4c0a-92d8-0a8c50a56c7a	8ab09a30-c4b5-490b-b6f1-800840a00e43	1
f42bdf4e-3b27-4590-a63f-a867290b1dce	26e8d2e9-50a9-4c0a-92d8-0a8c50a56c7a	e722a952-4ab1-4825-825f-a61ff3de0220	2
ecc98dbd-7e40-4c03-9c6b-7b80264d8b68	26e8d2e9-50a9-4c0a-92d8-0a8c50a56c7a	1563e32f-2cd7-462a-92b5-78265312b9a7	3
e25a0f7b-2840-4506-99ff-46265e2f70fc	26e8d2e9-50a9-4c0a-92d8-0a8c50a56c7a	ee62e532-5d7e-4e65-8cd7-a9298782c413	4
eb3d2a21-6425-4d64-8d14-3c56b26b31ab	26e8d2e9-50a9-4c0a-92d8-0a8c50a56c7a	202628c5-945d-4db5-b55b-dbe8613c7b90	5
80ebd109-152e-46d5-ae4c-ae5c53ffbdc7	26e8d2e9-50a9-4c0a-92d8-0a8c50a56c7a	d2a9954c-d74f-40e7-ac41-b025cfab266e	6
b357bbc8-4da8-4c08-8d3a-63cd55561683	26e8d2e9-50a9-4c0a-92d8-0a8c50a56c7a	1f60199f-3592-49fa-888e-2173ed0a5afb	7
44d0a3fe-49bc-451e-84a2-c8febc5ed415	26e8d2e9-50a9-4c0a-92d8-0a8c50a56c7a	cbaa815f-e5de-43c3-abe4-f5c23e6dd78d	8
021699ed-0e68-409c-aa49-12769c9ced08	26e8d2e9-50a9-4c0a-92d8-0a8c50a56c7a	829710b4-9ccb-422c-a2f8-a631f4505058	9
a3326f73-d897-42fe-a91d-675c22fd9bd4	26e8d2e9-50a9-4c0a-92d8-0a8c50a56c7a	fdc64cd6-32bc-4315-9b90-03638caa9077	10
dfd28c7a-20d8-4026-bf5f-06213333e08a	d710bb48-7d6b-47b9-a270-a991af71c642	693ae984-728c-4f35-a1ec-4dbe74ef2d65	1
4fa2173c-fcec-4909-9696-fc58cf25c4cb	d710bb48-7d6b-47b9-a270-a991af71c642	f2c4fd69-7c4a-4137-a0ed-5f16ee237164	2
10f08700-5845-4c40-915c-f83ce534d4bc	d710bb48-7d6b-47b9-a270-a991af71c642	467c39d5-f180-45a3-8c3c-7073effe9bab	3
5a811a52-a87a-4760-a1e4-a3af660b7aa3	d710bb48-7d6b-47b9-a270-a991af71c642	ee40aef4-f524-41ff-8a75-e599dd94716f	4
ed4ced9e-a1dd-4460-aca6-973ca173ad14	d710bb48-7d6b-47b9-a270-a991af71c642	11eada4f-fd10-4044-a20c-8bac6e460523	5
2aa117eb-c475-4d4f-abdf-a3e7b8b1d4c6	d710bb48-7d6b-47b9-a270-a991af71c642	e271f489-b507-4ea1-aa89-22e7a80f3f2d	6
a9116582-4e11-4338-9ebd-28a7eccc2653	d710bb48-7d6b-47b9-a270-a991af71c642	05afd422-e82a-4d96-9663-5e7a87124188	7
55264d51-fbb1-4451-a0b9-97aab09bf7fd	d710bb48-7d6b-47b9-a270-a991af71c642	52ca47e3-c087-4936-b330-8a9861106dce	8
4256666b-bfa9-4636-b9f0-b3d6608458bf	d710bb48-7d6b-47b9-a270-a991af71c642	527bdd1b-0375-40a0-bb5a-6825a5634fcd	9
08b7a69e-9f47-4bb7-b7fe-53c88b56ebc1	d710bb48-7d6b-47b9-a270-a991af71c642	f1477e77-0b40-4358-838d-e71c8fd03690	10
fcdd23c9-079d-46e1-8e8c-1a0e59dc7495	3c946ba6-ade3-48ac-9ca7-c33270e45f8e	17da7481-89e4-4d94-bd0b-faf2cbebcf15	1
3def3257-fa57-4129-b645-7e05ac25037c	3c946ba6-ade3-48ac-9ca7-c33270e45f8e	f65b0a82-6e97-41e0-b3a6-af7ce48f4554	2
dcf971c0-1559-4bd1-8304-57ca3f47dd96	3c946ba6-ade3-48ac-9ca7-c33270e45f8e	3cfc43ee-02c2-45c1-a537-913cf0f4a55d	3
0c9ea9e0-833c-4637-b988-44663d2d6fff	3c946ba6-ade3-48ac-9ca7-c33270e45f8e	600d17f6-7481-479c-b9b7-fc73a039c052	4
b4bb7a53-9039-4cf1-914b-72efecc5abb7	3c946ba6-ade3-48ac-9ca7-c33270e45f8e	cf2f958f-85fb-4ea7-937e-96a14ccae4b1	5
4eb69bde-c723-498f-a7d0-af9ee389aead	3c946ba6-ade3-48ac-9ca7-c33270e45f8e	40855d56-a4b1-41f4-aefd-67bbad4b4b4c	6
3b0aa4f6-14d4-426a-99a2-3fd62be78aae	3c946ba6-ade3-48ac-9ca7-c33270e45f8e	390df7dc-2a1a-4f1d-b0ea-7eaea95e238e	7
f5569dc1-0ffa-4f53-bc18-0deb4b13d0dd	3c946ba6-ade3-48ac-9ca7-c33270e45f8e	45941edd-5bd8-4da1-8f8f-544bd4b71009	8
77acf6a6-0b5a-4978-acb1-bf1d32cac51e	3c946ba6-ade3-48ac-9ca7-c33270e45f8e	c023b9ad-234a-413f-b6f1-2d978432c378	9
27aa6276-f1d5-46c9-95ba-bbef94466cfc	3c946ba6-ade3-48ac-9ca7-c33270e45f8e	d92fe1a5-9775-443d-a614-be95538ff614	10
1d5fd30d-3d65-400d-996d-ca5c03dbf9fd	1ac383f1-69d1-4497-af43-2dcd1b6ac603	d8f8f239-103f-4769-a958-148c7acca3a9	1
5caab38e-f4a6-425f-b532-6a29e62d3fc4	1ac383f1-69d1-4497-af43-2dcd1b6ac603	68d2d5da-45db-4152-a173-b1e648e19ee6	2
b48ef789-bd97-4b26-92b3-ce665277058d	1ac383f1-69d1-4497-af43-2dcd1b6ac603	fa49a3d2-73f2-440f-9327-e79c31bdbfeb	3
575cf046-42dd-4c66-8330-fdeb13317adb	1ac383f1-69d1-4497-af43-2dcd1b6ac603	be6aa59e-f7da-4b04-b998-7791367e1309	4
0366e0e9-3db1-491d-99b9-1b89aa54aad3	1ac383f1-69d1-4497-af43-2dcd1b6ac603	66b7074f-2fd0-4591-ac81-c17bae483be2	5
be41b6af-8579-4d6a-b547-8e95659db73c	1ac383f1-69d1-4497-af43-2dcd1b6ac603	84ca7a32-a4e0-4699-a481-1158e681d1bf	6
8dc5e7c7-390a-4b4a-aaaa-e37600d5295d	1ac383f1-69d1-4497-af43-2dcd1b6ac603	a49b60c6-823c-4980-a6ed-fc32bb439009	7
3e821185-84fc-49d3-af42-898bbcbfb308	1ac383f1-69d1-4497-af43-2dcd1b6ac603	6e7a38b6-fb43-4e44-a82e-65dbdbe0be64	8
b70c02c7-4bc5-48aa-9f1a-2d5e9d3054a8	1ac383f1-69d1-4497-af43-2dcd1b6ac603	b9ea388b-f7ad-4834-9d3a-96d4e873a10a	9
77d54957-9138-4c87-a595-9d84351af6bf	1ac383f1-69d1-4497-af43-2dcd1b6ac603	2f69d725-c78c-4138-9deb-d45ab1e8a1c0	10
69cf7885-d070-4738-a795-8e843efaf9ca	543075fc-8281-484d-a61e-06ba59e7853a	178f649f-78eb-4be5-9876-40a116cc5990	1
2510f97d-1bf8-45bb-a1f4-3f43f0e7852c	543075fc-8281-484d-a61e-06ba59e7853a	0760a3e4-9ae5-4792-b6c2-6f824f7076ba	2
628fe7ca-0480-484d-b2f8-bb83e12b8250	543075fc-8281-484d-a61e-06ba59e7853a	7a8c9c69-e7f1-48b7-af91-fd399919b7c3	3
0fb76d41-b524-4270-8e18-66e27e492633	543075fc-8281-484d-a61e-06ba59e7853a	56f25845-6f73-438e-bf26-82b8a894806c	4
5e54d9de-26e5-4e0e-86a7-9f271fb24e1f	543075fc-8281-484d-a61e-06ba59e7853a	a88e6101-16e4-4777-b829-4959b6431d77	5
3e863304-5d41-46a3-aa9a-b279b5b7b1fd	543075fc-8281-484d-a61e-06ba59e7853a	8c6f91c5-98e9-4ae8-b409-a98d638dea32	6
5fb0c99d-6b05-4c2b-872e-a11e0a2dc60e	543075fc-8281-484d-a61e-06ba59e7853a	d2fdaba2-8fcd-4068-b068-35ea5c4e8c51	7
6434d53f-0871-4834-835f-51d98ed822db	543075fc-8281-484d-a61e-06ba59e7853a	6a9664c5-5801-4cad-aaba-017f948aae13	8
bf2165af-54b5-45c1-82ff-3e65934025d1	543075fc-8281-484d-a61e-06ba59e7853a	7de223d1-e8ad-425a-9aed-d35bb6ff6d42	9
b2349293-c838-4f3b-9d13-36d7d3632d7e	543075fc-8281-484d-a61e-06ba59e7853a	565e2260-55a7-46a0-a604-7d7cbd23e3aa	10
edc0ac23-85c6-4ef2-bf1c-1f82b4d36317	6685513a-8ec8-4448-90dc-5c11c1034d7d	4a455cb0-f492-4e24-b13a-ca3542428b54	1
c8fc97ae-133d-4211-998e-6d22af251026	6685513a-8ec8-4448-90dc-5c11c1034d7d	c67224be-632d-419b-9527-36a0b59ee54b	2
3877eab3-26f5-44a3-9ac8-41f7b416dc30	6685513a-8ec8-4448-90dc-5c11c1034d7d	677f4354-53c3-47c3-a87e-68bb3e58ef18	3
e6ed117f-66e9-43cb-b64a-0b2225428b47	6685513a-8ec8-4448-90dc-5c11c1034d7d	29f1aff7-b754-4ee7-9baa-e785ba5e3325	4
ae11952f-5188-482d-bca6-ecf9494a5ac0	6685513a-8ec8-4448-90dc-5c11c1034d7d	ca3506db-044d-41c8-abcf-e69deef74d79	5
ef0b9d1e-a245-47cb-a2ae-ab01ed38c14c	6685513a-8ec8-4448-90dc-5c11c1034d7d	7f525ed1-b9a8-4b3c-b45e-55d8307daeb9	6
3740ae0d-3e30-41ab-a75b-38d0d18cd84f	6685513a-8ec8-4448-90dc-5c11c1034d7d	83226a91-73c1-4cb8-84fd-a4d1150067ee	7
047b651f-478e-4a24-a519-17e7f6ad592b	6685513a-8ec8-4448-90dc-5c11c1034d7d	b7d773e0-6eed-41d3-9d98-9d7dd7f43dc3	8
5c262657-a5e7-4855-98df-08f7964f3080	6685513a-8ec8-4448-90dc-5c11c1034d7d	79216e29-111f-4489-b18f-304c115e8138	9
fb3784ef-916b-4cb0-9a5b-2ad122d53c81	6685513a-8ec8-4448-90dc-5c11c1034d7d	96c5d48e-7f4c-49ee-8b55-039c14b55099	10
d404f3f6-330c-43ab-8233-9f28870c075e	ab31ad31-7b3a-46ab-a293-85a8366c65d6	2e500c9a-dd05-4f2f-9446-2cc850e581dc	1
bedf1a59-b7e1-4c83-9c70-5eca08ea3bd7	ab31ad31-7b3a-46ab-a293-85a8366c65d6	e6a9a51e-9871-42ea-8a02-c54944de3fe6	2
2c285320-84c3-4cae-bac0-c876e2088350	ab31ad31-7b3a-46ab-a293-85a8366c65d6	f0f494ab-4fca-424b-8c79-773335b0cef8	3
223bee83-5b6d-43a0-bbef-eb56ff5d006c	ab31ad31-7b3a-46ab-a293-85a8366c65d6	ad03c5ce-5241-4730-960c-c827a32a726a	4
f939aa8a-33b8-4884-80ac-7e70aa7fdd30	ab31ad31-7b3a-46ab-a293-85a8366c65d6	b5708464-c494-4281-83e5-556f665c84c0	5
b6099a71-8846-4a67-b23d-3df4074c4391	ab31ad31-7b3a-46ab-a293-85a8366c65d6	610ed963-da11-4fe5-8da1-3141fc349ec9	6
19d85d4c-f701-4dff-8476-f0829ed15215	ab31ad31-7b3a-46ab-a293-85a8366c65d6	90ba0ef6-2946-4e03-876e-e9e489c7f4f8	7
662101c1-53fd-43c6-95df-167697637ace	ab31ad31-7b3a-46ab-a293-85a8366c65d6	31bf6bb5-55b1-4a05-8331-ba324b537dcd	8
ac22e420-b521-4736-a668-4a8374158b4d	ab31ad31-7b3a-46ab-a293-85a8366c65d6	bed0ccb4-ce56-4bb2-b476-41f844f71c78	9
eb548c80-38bb-44c9-bee2-2b09f7be9890	ab31ad31-7b3a-46ab-a293-85a8366c65d6	c396db13-ce17-4ad3-b203-fd6839e55344	10
9138ba4a-c863-4eca-ae60-e8295eb533e3	2c821141-0c7f-414f-8012-4b159dcc8497	f6f088b3-40fe-4880-8a46-858206b9b296	1
97463026-26fe-4672-a1e6-4abbd03127a8	2c821141-0c7f-414f-8012-4b159dcc8497	e0ff52b9-787d-4827-964b-83a7d286355c	2
3517476f-69b6-417e-9484-83e2dc1fe12f	2c821141-0c7f-414f-8012-4b159dcc8497	b4b236d9-22e9-4ab0-85e6-d7d2fd290cca	3
e6bc7f5e-21d8-4101-8c27-bcef07ef3bbc	2c821141-0c7f-414f-8012-4b159dcc8497	355c1e8a-8dc0-4d17-be0d-61dd54d298ae	4
bcf68e0a-a957-4317-aa5a-80d12ae2e8c9	2c821141-0c7f-414f-8012-4b159dcc8497	7318e6f3-cb56-4b10-8cdb-55028a44952f	5
ef8a7521-0641-40c2-abba-8f8c3743989b	2c821141-0c7f-414f-8012-4b159dcc8497	94e28981-a0d7-4dee-9ec3-c37e4448d800	6
a3b52ead-b668-48d2-9001-adc700778c1e	2c821141-0c7f-414f-8012-4b159dcc8497	bcf24fe9-1b60-4fc5-8d20-c87a689085a2	7
f58155cc-10d3-4663-ac3a-e972a5ea2ebf	2c821141-0c7f-414f-8012-4b159dcc8497	5ae52604-a536-4871-9bfb-118c0acd4ea3	8
256921fa-11fc-43d6-9e3b-1f9231b81ed0	2c821141-0c7f-414f-8012-4b159dcc8497	07ab9021-36af-4435-8c66-64ad40068a85	9
1d5a40c1-ff48-4d38-b2d4-1c9393c33076	2c821141-0c7f-414f-8012-4b159dcc8497	90c40e7c-e6d9-4c95-9808-546e3c22a9f7	10
65770204-e577-444e-ad15-87906916781a	5d5fd5c6-95cf-4061-babe-4a05330e2420	866135d1-6747-4dbc-bb03-acf0f7ca4a03	1
b03b6191-9e25-4c05-af66-9127da8cb216	5d5fd5c6-95cf-4061-babe-4a05330e2420	beb1f333-cd35-4812-a3e6-06aa494bb6f5	2
35eaa133-49a7-4f6c-b510-89ae68809e4b	5d5fd5c6-95cf-4061-babe-4a05330e2420	6191c6da-71b3-4c5f-af81-e2420b455621	3
0991ea21-909d-4015-9b83-3645ac0480f4	5d5fd5c6-95cf-4061-babe-4a05330e2420	4430eac8-9446-4413-9768-90f4f6518f74	4
46619aea-d4cc-4c56-9214-4ef3dffb3399	5d5fd5c6-95cf-4061-babe-4a05330e2420	8c2bd9b6-2ca5-4579-b8ea-1f159f14eefb	5
cbb0b129-4e73-464b-b2aa-830374403e27	5d5fd5c6-95cf-4061-babe-4a05330e2420	71459da5-3160-45fa-aee8-48fecb197ccd	6
608fbe06-7675-43e2-bdae-593a8fe8df28	5d5fd5c6-95cf-4061-babe-4a05330e2420	05537c92-3291-4236-b1c3-bafab245a52d	7
e9a082f7-de0b-4aba-b623-d4ae2449980f	5d5fd5c6-95cf-4061-babe-4a05330e2420	0ca40135-d07e-4009-aa6f-6a9e4a3b2eed	8
71ac13a3-d330-4ca5-9dbd-107ca16e06d1	5d5fd5c6-95cf-4061-babe-4a05330e2420	9d285484-62ba-4b54-9be6-086638ca1cd8	9
36a3be41-90a3-4c8d-820e-086d33abe272	5d5fd5c6-95cf-4061-babe-4a05330e2420	6be0961c-8fe6-4189-bdc2-beaf3ce453ee	10
fddb0753-e50f-40fa-90d1-26bf79f977e6	2cb8d9e7-a36d-4a44-b1c5-daa3fa987c3d	888b536e-df25-4927-aeee-8890c284676b	1
e8b90cfd-5e0b-4e5e-b883-545b92e395ad	2cb8d9e7-a36d-4a44-b1c5-daa3fa987c3d	9148d9e2-7448-44a5-a915-1af086e1a569	2
898cbba0-7f0c-41de-ab19-0e7f94cf83b8	2cb8d9e7-a36d-4a44-b1c5-daa3fa987c3d	c2c7fa4b-77a0-4f57-bea4-69efe41eafb2	3
4a4bb589-d4c1-44ef-a3ec-b52bc129c2a9	2cb8d9e7-a36d-4a44-b1c5-daa3fa987c3d	f7f255d7-765f-4ef3-9827-f6d9fa76760c	4
c71b47c4-1024-4201-978f-4af5da6888d4	2cb8d9e7-a36d-4a44-b1c5-daa3fa987c3d	e0f43800-3bbc-4fcf-b6de-49e18861b0a4	5
b02e0983-1f2e-4163-b0ae-89e36d6ac33f	2cb8d9e7-a36d-4a44-b1c5-daa3fa987c3d	2cb6b3bc-bc74-4367-9bf6-e78fca2522f8	6
1b49c27e-2f59-4772-bb15-8ed49e388b60	2cb8d9e7-a36d-4a44-b1c5-daa3fa987c3d	ef12c747-bd78-48a1-850d-ebb6b65ff59d	7
6eb8937d-3dc7-42c4-ae67-f1425ce58ce1	2cb8d9e7-a36d-4a44-b1c5-daa3fa987c3d	333e6f56-6026-4e3f-98c1-7f3cc24c2c23	8
cbf45e68-e9e7-467f-88a1-e2ee733f220e	2cb8d9e7-a36d-4a44-b1c5-daa3fa987c3d	fb64cffb-9b12-471e-9d72-b41db3a66371	9
8cb2c0a6-b90e-46cc-9401-4ebf976f1a32	2cb8d9e7-a36d-4a44-b1c5-daa3fa987c3d	c2b89a96-1f8f-4897-b566-c81c3fb99e6f	10
316d9cf1-966a-475c-bd55-f1abefd0f218	827c4749-e0c9-4935-9212-90a8b725fbab	ab051bbb-2e89-4138-834c-9e36c4bd0c75	1
8255b0d2-bcf7-4a93-a73d-ba0aa2b540fd	827c4749-e0c9-4935-9212-90a8b725fbab	7c7a833c-901c-48cc-b7af-798e541ecdfd	2
4798b073-cea7-4e6e-9314-5e946d05853a	827c4749-e0c9-4935-9212-90a8b725fbab	4f302bc7-b9df-4c92-a06d-b1175df783ca	3
b0b42dab-2512-4386-b536-4a4e6dc5d2f0	827c4749-e0c9-4935-9212-90a8b725fbab	94a339ab-f856-4634-93f0-ac47766ee694	4
3e511f34-bdb2-4d43-b125-0fb69e1ab05a	827c4749-e0c9-4935-9212-90a8b725fbab	99fd98bf-fe9f-43e0-90fc-6a9b499c807c	5
2330b114-7a64-43f5-a71a-2319b18b0c88	827c4749-e0c9-4935-9212-90a8b725fbab	7e986a4d-bddf-42fd-9ff6-910e17e94946	6
75535b24-c417-4b1b-907d-aa29a13004f0	827c4749-e0c9-4935-9212-90a8b725fbab	4f966fac-57c3-4d18-ab17-0a8a6e77ee3e	7
6b50d643-ae8a-4733-82a5-3b1d681d9786	827c4749-e0c9-4935-9212-90a8b725fbab	63f5d6d0-0efb-44b5-bce5-55453ee02b7f	8
3f759dc1-8a5a-4847-b8e4-08743aaf501e	827c4749-e0c9-4935-9212-90a8b725fbab	36a23a0e-fccd-4c3c-860c-40259c17bbae	9
be8c8721-16ff-411b-87b8-4ffff35966ae	827c4749-e0c9-4935-9212-90a8b725fbab	346fbada-af17-473f-b626-da0446da857f	10
7bc8df9b-d5fe-4269-be5b-439fd5de5b22	12d2519d-fe1a-4d84-bb35-2d82b846b688	07c53ca0-1e5c-41a9-81cc-b0b2c897e1d5	1
5b473ead-3ea4-455e-aa27-bb66593f382b	12d2519d-fe1a-4d84-bb35-2d82b846b688	f9e022a2-de94-4397-b71e-6a32812fede5	2
2db87dc3-60d9-4d27-b8b6-bd4dd7a63a20	12d2519d-fe1a-4d84-bb35-2d82b846b688	0d2641ac-877a-4dd9-a333-962c991fb413	3
48b010ee-e542-482e-812f-6afae35fe2e2	12d2519d-fe1a-4d84-bb35-2d82b846b688	777d531e-0b3b-4f66-9b27-ed851ec435d2	4
3af6e349-0d4c-43c0-b4b4-43a27d5b729f	12d2519d-fe1a-4d84-bb35-2d82b846b688	84ebf3b3-d808-4008-b141-fe300d0ceada	5
6498496c-5f2d-4699-b9a7-711acb8720ba	12d2519d-fe1a-4d84-bb35-2d82b846b688	31b867d4-66fa-4bdc-8696-38465ae72376	6
3f70d286-5865-42b8-b9ba-83c61b5947f3	12d2519d-fe1a-4d84-bb35-2d82b846b688	42af9c50-808a-40bd-beb2-b3ed947b9854	7
b924a471-f9eb-49b8-8b7b-1daa53134d82	12d2519d-fe1a-4d84-bb35-2d82b846b688	58115cec-73f0-4145-8a99-7796c89f7ac1	8
4cee6b0f-21f7-4ba5-a85a-2ea8dd6e9321	12d2519d-fe1a-4d84-bb35-2d82b846b688	ba5423f8-2eee-43fd-a81a-ec9fba2e9356	9
ccf035d4-8feb-435a-9465-5f3c527d2c7c	12d2519d-fe1a-4d84-bb35-2d82b846b688	82efe820-fb5e-4a2c-a69d-7aa1824687c4	10
df53ed16-96d1-410f-b938-c6054552aed8	470d8a30-43e0-4a26-8c73-b91dd7415b3c	37ee948e-a007-4ba3-a365-1fa136551ee6	1
ba5e83eb-634d-4caa-9f70-42ec7a9e577e	470d8a30-43e0-4a26-8c73-b91dd7415b3c	39f70311-5a6f-4ebc-99a3-9f42d70d69ce	2
27663c4c-d347-4ae0-9300-ff66eb559c97	470d8a30-43e0-4a26-8c73-b91dd7415b3c	69482b56-2fff-4951-af7b-333656fbee1e	3
57487534-04c2-4dd5-b1c3-9f7be01a10d9	470d8a30-43e0-4a26-8c73-b91dd7415b3c	cd1a27dd-b495-4802-832e-49ad807fcd36	4
db197b7e-53b0-487d-b412-df0176f87e3f	470d8a30-43e0-4a26-8c73-b91dd7415b3c	b7f97cc2-aa00-42a3-837b-0c551b1de7bb	5
bafcb3d0-e77a-4a3f-9de2-09836f75d909	470d8a30-43e0-4a26-8c73-b91dd7415b3c	0133d685-73a8-4b8a-ab4a-a8394b5064ca	6
5e0177ea-3820-4bfc-b4fc-490b25027f19	470d8a30-43e0-4a26-8c73-b91dd7415b3c	511d295d-d45d-4715-9e91-850a799d1a07	7
3be09795-27ca-49e8-9b17-b357161d0e2d	470d8a30-43e0-4a26-8c73-b91dd7415b3c	6f252552-1dd0-4934-aaa9-21b11f5f84a9	8
a896604e-5f52-48f8-9078-16b4248d0ab0	470d8a30-43e0-4a26-8c73-b91dd7415b3c	fb09b4f1-d9c7-4ae5-9fbb-94fd52cc7e9f	9
7b19c329-64da-4c8d-94a5-55df4e725861	470d8a30-43e0-4a26-8c73-b91dd7415b3c	e46be044-7384-445e-99bb-a4b067e3ad77	10
350e5aa8-fa51-46d5-a94c-e757986a4b2d	8399d96d-c405-40ed-a251-3af106282c07	9f728266-4d6b-46aa-a53a-758143dfab7d	1
37601829-bf83-4288-9936-8b9558d46f2e	8399d96d-c405-40ed-a251-3af106282c07	d2a185df-f286-4826-a1bd-55235a07f678	2
9f466446-1a20-45f2-99b4-c7f21b91b1e5	8399d96d-c405-40ed-a251-3af106282c07	f97731cf-1cbf-4808-a14d-71a91b2c3783	3
fb807db0-f614-4bff-9e40-18a0bf1d4b5b	8399d96d-c405-40ed-a251-3af106282c07	e4b258da-109f-4929-b1cd-85252702d33b	4
4ed1214e-303d-43ae-bfc4-29024ae20c83	8399d96d-c405-40ed-a251-3af106282c07	93a19908-b645-4b6c-a67e-6798f71900d7	5
881c6562-e3ef-46ad-8c2f-b7675de7e354	8399d96d-c405-40ed-a251-3af106282c07	c6918a8c-1d5d-4598-9230-315a254031ac	6
374d9247-9e94-4360-bd0f-5ca5d91d4dd6	8399d96d-c405-40ed-a251-3af106282c07	bb1c3100-1285-4df3-b2be-243588adf53b	7
e15aade2-1f60-40f9-80be-ffeaf7925144	8399d96d-c405-40ed-a251-3af106282c07	be38c248-eecb-41d3-a5e9-373b2febfdf1	8
bf78da04-a85d-44b3-9791-f4ec453f9bdb	8399d96d-c405-40ed-a251-3af106282c07	c7045b37-46e9-48d9-8f6e-05afd53c5af1	9
1009c5d7-5ef5-4d67-b7e0-113e1b3ebf7f	8399d96d-c405-40ed-a251-3af106282c07	f7249afd-5fbf-40e5-9997-ae68e6df858a	10
c40c4a7b-bdf3-4249-b0ca-804833d7fafb	352f54b0-bfe7-41c0-9502-6a8a0139f348	1673aff4-d091-4767-9bac-44ce698e0784	1
a29a328f-c836-4516-8bf7-48b2d6f2ef53	352f54b0-bfe7-41c0-9502-6a8a0139f348	cc72ea71-c90e-496d-b66d-d9d0c219f317	2
1348aa17-8fee-49e2-babf-5f5fa23c5171	352f54b0-bfe7-41c0-9502-6a8a0139f348	48a90939-ffdb-4d6d-a048-e13bb95e2c5c	3
21090d3d-06ae-4345-bc09-87a93357aeef	352f54b0-bfe7-41c0-9502-6a8a0139f348	45656081-9f9b-4f15-baa2-91e4c1518229	4
2c9b1bd1-d0fb-454b-b4af-8846bbb40286	352f54b0-bfe7-41c0-9502-6a8a0139f348	bc377fdb-121f-40fe-a8e7-620f990325dc	5
25a0f161-f56a-4639-ab12-f6542ee2131b	352f54b0-bfe7-41c0-9502-6a8a0139f348	901e687a-2771-4e1e-9c58-229d8c6261dd	6
4e95c942-f857-4be9-80d3-19bafafecda4	352f54b0-bfe7-41c0-9502-6a8a0139f348	175ae5ea-0918-4ea2-b9ca-ff6417226628	7
b6463706-60a1-4c5f-a9aa-d38bd84fb2f3	352f54b0-bfe7-41c0-9502-6a8a0139f348	d8cd7977-9fb9-4958-84c9-64b8ba262046	8
3e828ce1-bef4-4d75-9246-1b228c389cff	352f54b0-bfe7-41c0-9502-6a8a0139f348	84e1d116-13b5-475c-a1e7-da70149b30b6	9
28e2cff5-83cc-4fcc-b5cc-fdff3578d53b	352f54b0-bfe7-41c0-9502-6a8a0139f348	29f667a2-7fa4-47f0-9591-36fac4f1ee05	10
06f9084d-a296-4dcc-8abe-d348cd01a5e9	6268a922-4530-456d-9576-e2c611bea413	ce6e20c1-e8d8-4c9b-b57a-91075c86d8b1	1
5fc2b257-8932-4e44-8f1e-7f2f4b3e8153	6268a922-4530-456d-9576-e2c611bea413	c867b650-5749-41c8-8fd8-740533e2f260	2
ab5b11e8-36b6-49bf-81cc-3b65e8728ea5	6268a922-4530-456d-9576-e2c611bea413	5db53f87-5b6c-4761-bd7d-454b8578b914	3
92d835cb-5fdd-4b0e-8184-6a1e1d320aab	6268a922-4530-456d-9576-e2c611bea413	240dee87-452f-4f81-bc3e-13df47346416	4
6ce97cbb-671e-4b50-a4e2-9779f372641c	6268a922-4530-456d-9576-e2c611bea413	6b9c7dd0-9292-4609-b391-91b2f8029962	5
66c23846-e0ac-47e7-9432-2b4f1a911830	6268a922-4530-456d-9576-e2c611bea413	4a05a65c-fa3b-495f-98a3-ba428d4a246d	6
df8fda0e-8384-4365-8592-dc35be91cf52	6268a922-4530-456d-9576-e2c611bea413	54392b42-c15e-42ea-b930-e625fd8a6433	7
d27e069f-426c-4285-822e-aba5a41692f1	6268a922-4530-456d-9576-e2c611bea413	c72d07d1-4e9a-49a7-8133-236da21d507d	8
dc638276-6e24-4654-8bfe-54e3c2e06799	6268a922-4530-456d-9576-e2c611bea413	a360ae54-2527-407d-b324-c804904ee3aa	9
9aae97ab-11a2-49dd-9dda-d0ec49d4429c	6268a922-4530-456d-9576-e2c611bea413	c442554f-b117-401a-a9d5-370fb29ecab0	10
f026fb95-61bc-491f-9ed4-35cfeea8bff8	453dd855-ac43-4e74-bf8a-b38ef7cf2ca9	d4e3df8c-fbdb-4e13-ba60-35a0026960dc	1
c1f248f7-2e9a-415c-bb87-7a86e2427bb8	453dd855-ac43-4e74-bf8a-b38ef7cf2ca9	6162b017-7c11-4984-a89d-19e250fc0a5e	2
18224ab5-39fb-4d27-9498-6bf4c6287a60	453dd855-ac43-4e74-bf8a-b38ef7cf2ca9	4f2e35aa-81df-413c-908c-b32af27066f0	3
f211dfdf-c501-46ca-8442-4e1a1f0829c3	453dd855-ac43-4e74-bf8a-b38ef7cf2ca9	cf079d9f-b62c-4c89-975f-088fa6d0aa57	4
dce498d8-4362-44c3-ba86-d5cc08b76fed	453dd855-ac43-4e74-bf8a-b38ef7cf2ca9	dc260776-7a86-4b90-91ae-34575b6b5632	5
3b37bab5-624e-441c-a5d7-5d2a2262f1ee	453dd855-ac43-4e74-bf8a-b38ef7cf2ca9	2871184c-2e07-4001-b8d5-2e35bb2f88fd	6
4b42b53e-0541-45db-8866-ded327afe87d	453dd855-ac43-4e74-bf8a-b38ef7cf2ca9	acdb89ee-4bee-42c6-b5a1-208428b40271	7
c5b0ef8e-8b4e-4673-8b7d-3f7e945c5417	453dd855-ac43-4e74-bf8a-b38ef7cf2ca9	5ccb3b26-6e47-44a3-9901-2e0c9937ce92	8
97bda639-1342-4551-b9e5-ef3f58587436	453dd855-ac43-4e74-bf8a-b38ef7cf2ca9	6a84c41d-0de0-48e5-a847-61c83127280e	9
65c1452d-8ea2-4892-b254-35b0798cb2bb	453dd855-ac43-4e74-bf8a-b38ef7cf2ca9	843a9335-570e-4f6a-a2a4-a5d061c38552	10
0b455547-f00c-4781-af09-4919b0dcbdc3	d8b0e134-44bf-4c70-89c4-78a9d07d6c47	281e8305-066d-4898-9efb-e4a8bc8558b2	1
6ccbb998-1651-4a48-9da7-f0cff84502f0	d8b0e134-44bf-4c70-89c4-78a9d07d6c47	cb8548a1-9f26-494d-bf9f-33080f8436cd	2
e9a6e32d-abf3-43d8-8e0d-091415b45fae	d8b0e134-44bf-4c70-89c4-78a9d07d6c47	67e714b6-b754-49e5-ab10-1ac6e90ffa39	3
fbf7ad1a-3c9f-4adf-909d-2c433e968180	d8b0e134-44bf-4c70-89c4-78a9d07d6c47	76a98b47-6bbb-4859-9822-6f3a0be59b28	4
748a0ed3-6aa6-4a42-a190-eddb053fa695	d8b0e134-44bf-4c70-89c4-78a9d07d6c47	460f4eb5-e08d-4537-ba65-cbd1977d2090	5
6e6cbfbe-6b64-406c-a015-9a160cbdb600	d8b0e134-44bf-4c70-89c4-78a9d07d6c47	0251ff51-622e-4ea9-8c82-25bd163261cc	6
b4c529ee-c924-41fa-8f64-f3ee89a792a7	d8b0e134-44bf-4c70-89c4-78a9d07d6c47	ee96773b-9c1a-4077-83ea-7151d9bab944	7
be11bc35-aa5d-4a6a-b051-916a8b54cc2a	d8b0e134-44bf-4c70-89c4-78a9d07d6c47	683a736f-00c4-4201-9528-aed3d89934ae	8
bacf6678-f871-4213-ad19-3a27f306f103	d8b0e134-44bf-4c70-89c4-78a9d07d6c47	ec12b934-7a09-4696-ab19-3a38da903736	9
3f00d543-d7ce-4ffb-8ba5-a8b219a8176d	d8b0e134-44bf-4c70-89c4-78a9d07d6c47	9285195e-96ba-491d-8e7c-43607ce399f5	10
3e595254-e6db-46f3-b5db-adc250d42e6e	9bc8ad45-e0b8-4a0d-ae3a-65168e2bb71e	091398b7-6484-4527-bdc0-491d1e15ffc2	1
13be6a33-661c-4131-8ba9-c0d86bb1ddc6	9bc8ad45-e0b8-4a0d-ae3a-65168e2bb71e	0bab697f-6a81-4743-af88-0c6e2bfe8cc8	2
9d8c58a3-00b6-4dbe-9556-f450b56470c3	9bc8ad45-e0b8-4a0d-ae3a-65168e2bb71e	8167fcb6-c4c8-45f2-8c36-416cd29969e9	3
9578c1a3-5fc9-42ed-805e-84b640a7519a	9bc8ad45-e0b8-4a0d-ae3a-65168e2bb71e	9bf6854c-0a05-4634-90d0-e21cb417ecc9	4
f601291b-47f5-486c-89fc-5db53c2ee1d1	9bc8ad45-e0b8-4a0d-ae3a-65168e2bb71e	3ffbc5d2-a942-4057-b9b9-48711605dd95	5
cc36354d-3f6f-4c76-8c1b-e2950d538d38	9bc8ad45-e0b8-4a0d-ae3a-65168e2bb71e	5ead90f7-fa94-4d03-b779-62d11217dfef	6
32478291-576b-42e5-9014-c42373e0f4e7	9bc8ad45-e0b8-4a0d-ae3a-65168e2bb71e	11620b5d-7747-47c3-958c-91118877d6c4	7
a816b031-a17d-4f05-8dc9-a313b607afd1	9bc8ad45-e0b8-4a0d-ae3a-65168e2bb71e	23980a80-4994-4e7c-8593-bacb3274a791	8
96e5160e-b49a-4895-bd38-0162c8e54866	9bc8ad45-e0b8-4a0d-ae3a-65168e2bb71e	a22e6945-6935-4485-bcfd-9e5d17e9e0ee	9
919d796a-c0b1-482a-8ab4-caf29936cee5	9bc8ad45-e0b8-4a0d-ae3a-65168e2bb71e	b931d8c8-8e2d-405b-85ad-0412ebdea9bb	10
fe69c788-f9d9-4ac6-83d1-7b8297e5ad53	0be8e28c-d83d-4ea3-b0d9-7751e55b20c0	2182de57-e0a6-42d7-8a4e-8e40dca54ed1	1
1d327819-2a2a-4f58-9826-5900f8d1c9bf	0be8e28c-d83d-4ea3-b0d9-7751e55b20c0	b2d274f5-7e18-47f8-b6a2-803154947f09	2
7f455950-1380-4733-a33d-f767116aa1d1	0be8e28c-d83d-4ea3-b0d9-7751e55b20c0	aa5b5eaf-385b-44dd-bcc0-8d63b35b94d6	3
00eca398-2f1e-46d1-b9bb-e5c742292521	0be8e28c-d83d-4ea3-b0d9-7751e55b20c0	2d26c020-be90-4f7f-b88d-dbb054d7ea23	4
f1397f10-e823-416a-ad0b-17f407536816	0be8e28c-d83d-4ea3-b0d9-7751e55b20c0	7137c568-924e-4b0c-be4e-59c953785e3e	5
8a8ac5b6-28ba-4a55-99fa-11b4ef2a3468	0be8e28c-d83d-4ea3-b0d9-7751e55b20c0	c6a075b4-c57c-4f66-83d0-a8ad05b12132	6
12ae536c-62e2-4cf8-a67d-3fb05ebf3b3b	0be8e28c-d83d-4ea3-b0d9-7751e55b20c0	10d3fb9f-4a8c-471c-958d-9d1ad543f723	7
def88ad9-450c-4f77-bc23-8277dd4c7fcc	0be8e28c-d83d-4ea3-b0d9-7751e55b20c0	ad454cff-6dce-426e-88d1-0fc76933b1f4	8
a3fedb9b-4f8a-4444-9bf8-9d3b5ff9507c	0be8e28c-d83d-4ea3-b0d9-7751e55b20c0	b6bc8be4-73d1-4b1d-af18-a2d526b38dd9	9
5d5598b7-143e-4e2c-8894-c31955c0818f	0be8e28c-d83d-4ea3-b0d9-7751e55b20c0	097f33c0-9ab5-4e25-9ef4-63b6be38f497	10
8c4c63ba-3a28-4d68-b999-ee91ce86a06b	10393334-bbba-456e-989f-b719aaa2e47a	8b6bd2c2-e6fb-4e45-b30b-5b2241198f90	1
36ee63a3-30c0-48bf-a3d5-932ab8a5a54c	10393334-bbba-456e-989f-b719aaa2e47a	f2e24c01-44c5-42fb-bea1-bfb4534e7cce	2
0c84b728-6c75-4524-a0c9-d9b5ce85a323	10393334-bbba-456e-989f-b719aaa2e47a	8d6a2507-797c-42f4-94be-0198c2f257bf	3
1c60d566-6392-4645-be7d-5b8921951a69	10393334-bbba-456e-989f-b719aaa2e47a	4d60aa6b-b64c-4b86-995c-0d2b95c4d82f	4
8f472a82-7f81-4a33-934a-31b4f87c2ae7	10393334-bbba-456e-989f-b719aaa2e47a	a26fe954-5408-4438-a5f4-6060dc638fc9	5
6f71eb2b-0a38-4258-8e01-a00366470388	10393334-bbba-456e-989f-b719aaa2e47a	80a8c0bf-c23e-4a9b-80ea-6ecdf89dc10f	6
fbfa83a3-1707-4a76-a698-fe8d845316bc	10393334-bbba-456e-989f-b719aaa2e47a	d26daf4d-a31c-455a-bb64-d9782259095b	7
4ad9f4fb-c4ff-42a1-8eb3-fa1d8818890c	10393334-bbba-456e-989f-b719aaa2e47a	18340a97-423a-4fd5-9cab-2dc8505552ca	8
cbac1399-0fe3-4e4a-9d7a-d8863a830e26	10393334-bbba-456e-989f-b719aaa2e47a	a5bf9bff-b681-4e4c-a90d-4e2518dffc71	9
c1528360-1fc4-49d7-aa18-f91550c281a6	10393334-bbba-456e-989f-b719aaa2e47a	6acd9dbd-0bfc-4be7-8e57-c9ffbe7a41f0	10
ca7851c9-bf7a-4f11-9177-de6beeabb1b6	146f2ab8-2533-44e5-bb24-6710a5e5d737	78cb79fb-36f0-4e6d-bf47-30b893ecbcb3	1
17a51e04-4f01-4bec-83cf-a72edf09438c	146f2ab8-2533-44e5-bb24-6710a5e5d737	6ffd3513-205b-42ad-bec3-020fce5722dd	2
05f5575a-1ba8-4dbe-9019-6ec2b24cb961	146f2ab8-2533-44e5-bb24-6710a5e5d737	b77f38e4-99b2-4875-a1a1-7c92a849c2fe	3
d47c2b9b-dbca-43bf-8dce-7c79f3763aa4	146f2ab8-2533-44e5-bb24-6710a5e5d737	252163a7-99a3-467b-95ab-b001de033934	4
630d17b4-1e72-4b05-8dff-e07c9bc9590f	146f2ab8-2533-44e5-bb24-6710a5e5d737	f54d7e33-00df-43b9-b27b-96dba1a1120b	5
93604c1c-5db8-4eb2-aaa8-545b5340b53b	146f2ab8-2533-44e5-bb24-6710a5e5d737	4d7b851a-d61c-4027-8fac-12370d4f3b63	6
80a8b56a-0c46-48df-a760-17d8ab68ea7c	146f2ab8-2533-44e5-bb24-6710a5e5d737	5e0645ca-1aa8-4aec-86c2-46bccab606d1	7
2ee750e0-9951-42c9-b419-bce01351a479	146f2ab8-2533-44e5-bb24-6710a5e5d737	6d48b19f-81fc-40fc-a416-5a01271b785b	8
d4332e17-c945-4548-b9f3-67f94e11fee5	146f2ab8-2533-44e5-bb24-6710a5e5d737	5619ed3c-cfb5-4c59-b755-ba34d6daa04b	9
2fc9d3bc-9166-416e-9487-6203f0bd1c83	146f2ab8-2533-44e5-bb24-6710a5e5d737	947763dc-848a-46dd-a8c8-d858d2cfefd9	10
a23e9336-f696-4cb5-a687-0a8fe2b303f3	0c395f27-842f-49ed-9209-05c4a23c933b	5f0ed0fc-fe3e-4f7b-b52b-a9394ba51c81	1
12d300c7-2f05-4739-a443-037f73daa0b7	0c395f27-842f-49ed-9209-05c4a23c933b	ebdacf76-dda6-4f8d-8c8b-b52099a0bdc3	2
bfdf750e-3fab-4edc-97d6-bce508eb9e63	0c395f27-842f-49ed-9209-05c4a23c933b	dbd459ab-7880-435d-8b5c-b0e4fe1a9ec4	3
6971772f-1dae-4501-b486-8250ff8b5931	0c395f27-842f-49ed-9209-05c4a23c933b	00689fad-f1ff-44c0-8918-dfc719d19516	4
90ab651b-f52b-48ff-aed1-514d9fd4a37b	0c395f27-842f-49ed-9209-05c4a23c933b	828b599b-258f-4b9f-b6cb-caf7e16ffa3b	5
1fe926e6-d594-4e1f-a8c9-1e1f69fe50fe	0c395f27-842f-49ed-9209-05c4a23c933b	0a8cefa6-a9c9-4485-8c98-fb4c47b11362	6
c8f58d37-a1d2-4f86-9a25-a455d564033a	0c395f27-842f-49ed-9209-05c4a23c933b	1011b2ee-299f-4e9d-8d6c-0806dd5daa73	7
01742c0e-5528-469d-9d96-a1a79f5ec66c	0c395f27-842f-49ed-9209-05c4a23c933b	3b2422c1-76bc-4b67-b817-c737b7b02165	8
f5748d86-8109-4df6-97ee-0e0138ee320e	0c395f27-842f-49ed-9209-05c4a23c933b	98b6571d-c27b-4a50-9276-b334daaac495	9
c35acb21-d7b3-4f13-aea7-194d84cc62d7	0c395f27-842f-49ed-9209-05c4a23c933b	1c505285-707f-402b-8e9e-17586226e111	10
06ebd4bb-eea8-40c8-8d33-402609ec90ff	d9f05418-995a-4973-a3d8-f182fe7d1b44	0470b40a-9749-457c-b38d-573f1a9abecb	1
bdaf8acb-406c-4e41-b4ea-d749e3e3671e	d9f05418-995a-4973-a3d8-f182fe7d1b44	131ceece-eb70-4dae-833b-dc61bb04ac03	2
e3b7b01f-780f-4625-aa6a-6e3f379cc019	d9f05418-995a-4973-a3d8-f182fe7d1b44	808b5fba-bebb-4938-b357-7020c9fbedd7	3
1160281c-1c30-40f0-9fd5-bd051aa82cf1	d9f05418-995a-4973-a3d8-f182fe7d1b44	27e12da6-baec-4868-81fa-018e72906fa5	4
2e1afd2e-bfe3-47d8-83f0-d69c64810321	d9f05418-995a-4973-a3d8-f182fe7d1b44	8dfcb3ad-0f66-478b-95f7-4322bd92b0e2	5
d0c6de94-9f19-46a8-a2ca-b050e4acb049	d9f05418-995a-4973-a3d8-f182fe7d1b44	75cff102-b34a-4468-bcc5-2c762f9daed2	6
05f59150-450c-4822-8752-3ea38c8fbc00	d9f05418-995a-4973-a3d8-f182fe7d1b44	0ced41c1-042d-402c-9869-0aa1864fe1f1	7
b2505fe4-61c3-4987-a651-2b076321cfa8	d9f05418-995a-4973-a3d8-f182fe7d1b44	def26c17-7ab9-4f89-97f2-7db5515ad4f7	8
f89dc44c-bdcf-4a39-89e8-4303aef8996c	d9f05418-995a-4973-a3d8-f182fe7d1b44	dfa0d7c2-8b65-47a6-9652-1fbfdb08cfe9	9
9c8234a1-df27-4c2d-bd97-b76b84a2e9ba	d9f05418-995a-4973-a3d8-f182fe7d1b44	e72293f2-0afc-45c8-9012-5d8fae8b5d35	10
3ad39f7c-12c3-43b8-835a-01a190464cf5	9bc8e470-7d6a-4374-99c1-f97ec0e5084d	1960f9d6-9849-4140-891f-2b8c2d6c60c7	1
d53e0874-745c-4e07-bf64-9a1c56072c01	9bc8e470-7d6a-4374-99c1-f97ec0e5084d	ba836ba4-9577-45c2-96ab-6b2030b610fe	2
d32a59cb-ad9d-4a1f-924d-2eda798312bf	9bc8e470-7d6a-4374-99c1-f97ec0e5084d	2b2b6f44-b2b1-4fb3-a9df-019975c4146f	3
57b9dcc3-8910-489a-9457-6e71a6af6506	9bc8e470-7d6a-4374-99c1-f97ec0e5084d	eb803956-5959-4ed7-b12e-c18c2e95ea1d	4
501c66e1-ed9b-4794-992f-c2163392e1aa	9bc8e470-7d6a-4374-99c1-f97ec0e5084d	dbdb9774-5930-497d-bb55-c300ff5a3f83	5
94080f30-014f-4753-89c1-a5dfd11533c8	9bc8e470-7d6a-4374-99c1-f97ec0e5084d	f942a697-a8d1-4e44-9fbd-9de58533fa84	6
1f9cadbf-2b22-4c73-b9de-efc451faaa01	9bc8e470-7d6a-4374-99c1-f97ec0e5084d	fb022f95-fd74-4b98-a571-e4612515d116	7
eb1a7a1c-828f-4935-9094-1fcd2460a2db	9bc8e470-7d6a-4374-99c1-f97ec0e5084d	de4e1b2a-4921-435c-b15d-0a414478c488	8
f7b2ee04-af0d-44fb-9114-88f6b231cf26	9bc8e470-7d6a-4374-99c1-f97ec0e5084d	3eb3e02f-aaec-44ed-9522-ea620325e1a3	9
dae3ad86-e821-45fe-9236-f240dfbba7c6	9bc8e470-7d6a-4374-99c1-f97ec0e5084d	a5742fb4-f374-41cd-964a-3e226350157c	10
8fed7d28-aae6-47f1-a7ea-440ab900a9a4	11567da0-2fa5-4d0e-911b-02c270ce35cf	11273681-7754-49c1-bcf9-9d6b44a33482	1
e0a42d01-fd35-457d-8b45-516217a866da	11567da0-2fa5-4d0e-911b-02c270ce35cf	bffa574a-581b-4c24-a6c2-453517a7d7a3	2
b41a59ec-a406-483c-82fa-615b80c83955	11567da0-2fa5-4d0e-911b-02c270ce35cf	16ac9ead-7372-44bc-829f-cf05b6da2b4a	3
822421d5-96c4-4025-bfd1-8f61b58e24a0	11567da0-2fa5-4d0e-911b-02c270ce35cf	40742eaa-e779-467b-a512-88c4881db6a6	4
de5e5f9d-bc74-4af1-a9c5-c95ae19179ef	11567da0-2fa5-4d0e-911b-02c270ce35cf	e50b420d-5b09-451f-bd04-815b4d21bd8b	5
65de45e0-e5e4-4f62-b051-dd1b30e633ab	11567da0-2fa5-4d0e-911b-02c270ce35cf	4855fadf-f8f1-4ce6-a3a6-21329df974a2	6
2b68c2ee-6e31-47a6-9f5e-ee2befc3857b	11567da0-2fa5-4d0e-911b-02c270ce35cf	8dac4897-e227-4256-828d-3a2ad5e82808	7
bf6c4dd6-d648-4ab5-9f75-6a533a0b177a	11567da0-2fa5-4d0e-911b-02c270ce35cf	c697376a-48a4-425e-9b63-d7f6ae19fa86	8
5529646c-9358-4342-9513-2b1fc3f7a549	11567da0-2fa5-4d0e-911b-02c270ce35cf	92995ef1-5db8-4da3-8fdb-525bb1b14661	9
7cccd2dc-bd4c-41b3-a42e-4900eee5b9b0	11567da0-2fa5-4d0e-911b-02c270ce35cf	4871a0cd-6919-4d06-95d8-6a7afdd53235	10
9a5cf376-1686-409e-a876-1988ae34e1ff	5ac8a02f-2a6d-4a2a-bbbe-511904edf9c8	135061fd-e618-4199-b004-63e52e688125	1
af0926c2-dc27-4510-9188-a51516f7753c	5ac8a02f-2a6d-4a2a-bbbe-511904edf9c8	dcc376b1-0058-44a8-bfe2-5353947677d6	2
8c520738-c032-4ef6-9d24-e5b6b06aea9e	5ac8a02f-2a6d-4a2a-bbbe-511904edf9c8	10d12859-a942-4b86-be31-313bb3977db9	3
2ae9d2b3-2c18-4e91-8bb7-98d90659a3f5	5ac8a02f-2a6d-4a2a-bbbe-511904edf9c8	4e31b356-1f44-47c0-a3d1-96aad68dcf3d	4
35c44f1a-a5ae-45f6-88f5-1064ea0a0e47	5ac8a02f-2a6d-4a2a-bbbe-511904edf9c8	e107643e-6f8b-4389-9283-dd5c8cd7fd9a	5
6f356f29-fdd5-42c0-9555-5a6d1c927994	5ac8a02f-2a6d-4a2a-bbbe-511904edf9c8	a14d0538-f31e-4a8c-99e3-213e7d2cd76e	6
eb0b97c7-84bf-4955-8d0f-d1872bb36ba8	5ac8a02f-2a6d-4a2a-bbbe-511904edf9c8	ccc3411b-327d-46d0-b916-447bc5a9e517	7
614f0a43-d966-48c8-9ba0-aa9ae7bde206	5ac8a02f-2a6d-4a2a-bbbe-511904edf9c8	892e535a-263e-4540-b34b-eb7add06a3e8	8
0f1e0dd5-a149-429f-a8c2-dd620c3f8f6e	5ac8a02f-2a6d-4a2a-bbbe-511904edf9c8	8c6505b8-d172-42c1-8add-7609cb169678	9
e2bf5c16-5e4c-42c1-9f3a-e0adfdcab7fa	5ac8a02f-2a6d-4a2a-bbbe-511904edf9c8	a6447200-bf4c-43e4-b837-25e6ca5fb533	10
67051b01-507d-4e78-b320-b0bcfb459bcd	d09eebbd-2a07-475b-b0e2-29b65cb40cba	938d841f-b011-4a69-9ea0-21cd632407ab	1
57f51852-7709-4f1f-9b43-21d2b076534e	d09eebbd-2a07-475b-b0e2-29b65cb40cba	6dbda6db-84e8-44e6-9e4d-9676c88a6e91	2
2cf07b4d-e447-47c0-a5b7-666db1920373	d09eebbd-2a07-475b-b0e2-29b65cb40cba	80da624b-7fb2-4c4b-984c-c4710caaf5db	3
2793ed2e-6454-4d90-8696-1f92f2d8309f	d09eebbd-2a07-475b-b0e2-29b65cb40cba	b55bc677-70a8-4685-9764-40948e6b45c3	4
80efcb5d-b36a-41e3-850b-d32da2dcaff5	d09eebbd-2a07-475b-b0e2-29b65cb40cba	6f5a9576-14eb-4d93-a45a-2de7e774e738	5
88ab6547-6fd1-4922-8699-67e0dc7c8511	d09eebbd-2a07-475b-b0e2-29b65cb40cba	e6f4b950-b8d2-471c-b57c-060b35b83ac5	6
cc89c8ad-bee0-4e69-9849-c0dbf100e9ff	d09eebbd-2a07-475b-b0e2-29b65cb40cba	808c2f8c-aaf3-41f0-8e3d-27c14ed2260c	7
2c028bca-2eb4-4406-8f2f-2cd678dc40b2	d09eebbd-2a07-475b-b0e2-29b65cb40cba	844decbd-57cb-4e04-a639-bceff5232408	8
ea3b7e14-19ce-4852-9f92-1efca7e45bc4	d09eebbd-2a07-475b-b0e2-29b65cb40cba	9bade3b7-06f8-4a92-9330-69bb25eb4832	9
61069e4d-d5ff-4b63-8bf1-32ebd01da491	d09eebbd-2a07-475b-b0e2-29b65cb40cba	5b607c57-0f40-4b9f-81b2-63021699dcb1	10
fa13a240-c5ae-4194-8968-fed601bc076d	f0eb80ce-b3c7-4ed4-8a9d-b380e9221785	e5df045f-16aa-4bf4-94e6-53fcf12c512f	1
29516d24-6bb2-47e6-8c26-9218692d7ac0	f0eb80ce-b3c7-4ed4-8a9d-b380e9221785	20ee5e9c-6e3e-41be-9344-86c854404723	2
765b77c8-885d-44e0-85a2-c13f651ad933	f0eb80ce-b3c7-4ed4-8a9d-b380e9221785	e14ecfcc-77de-4d17-8577-e77d7b351c48	3
41af5580-f2c5-4283-844e-262e8c2de5e9	f0eb80ce-b3c7-4ed4-8a9d-b380e9221785	bf32c4a4-438e-47f1-999a-6c8a90686652	4
0b285eb0-be92-485f-840e-0b33741d16e9	f0eb80ce-b3c7-4ed4-8a9d-b380e9221785	177a445c-5421-42e0-86a0-3d8ebe6eef4f	5
d440e194-1b7f-40b0-8bfd-5f81f834a0f9	f0eb80ce-b3c7-4ed4-8a9d-b380e9221785	5abbbce4-e88c-47a9-b2ca-ee22fd161581	6
f6a9dc4d-2ed8-48c1-a041-18d99a62615a	f0eb80ce-b3c7-4ed4-8a9d-b380e9221785	54483899-034f-48d1-ba2c-9864be7f3adf	7
f2e21dc4-62ec-48d7-a09d-427e5ed3e9bd	f0eb80ce-b3c7-4ed4-8a9d-b380e9221785	d392df6d-3aec-4a74-900a-770c8a433372	8
54420727-f802-405f-99e1-7b24e121f1d4	f0eb80ce-b3c7-4ed4-8a9d-b380e9221785	3d1e2486-151b-45cf-abf1-700bd000a527	9
f6640119-fd03-47be-aff7-7763ea1c41ab	f0eb80ce-b3c7-4ed4-8a9d-b380e9221785	1d7fb0bd-9e0a-455e-9616-14626d332fa9	10
5a163466-b828-4ee9-8015-683a56d0dd6a	fbe69347-7fb0-4bdd-adbd-da180afc26ff	a15df93d-7861-45c5-a290-aa03ea8961b4	1
cdc92c90-9f9b-4818-9868-c3e9d917adaa	fbe69347-7fb0-4bdd-adbd-da180afc26ff	3aac5520-ec6e-41a7-b204-803ab416e0ca	2
0676d77d-b89f-4fe4-b15a-dbf5192c7103	fbe69347-7fb0-4bdd-adbd-da180afc26ff	916083ad-99e9-4080-8f09-b44362f25e62	3
01507951-7944-482e-9eee-265741e8656f	fbe69347-7fb0-4bdd-adbd-da180afc26ff	ee8d840f-d5b1-47e6-b086-c80edab77d02	4
665f8fe8-66b4-4dc4-b873-dcc97d844518	fbe69347-7fb0-4bdd-adbd-da180afc26ff	f622db2c-7463-4db3-909d-75ded3d31b74	5
f9da8c04-8d19-480a-bb5e-b81d9538a8f7	fbe69347-7fb0-4bdd-adbd-da180afc26ff	8be79067-6042-4b8a-aad1-83ade3314a2f	6
612296cb-a06f-4fa7-9856-4dd2c58e2ccc	fbe69347-7fb0-4bdd-adbd-da180afc26ff	71927a1c-f23d-4e96-a1cc-c60d0a7e8dee	7
ead563e1-ce03-490b-8dbf-766d3b306520	fbe69347-7fb0-4bdd-adbd-da180afc26ff	1d84239c-f464-4c5b-b5a7-e53c4627ad93	8
d32a1298-1b26-4e73-a3fc-c2354893faf3	fbe69347-7fb0-4bdd-adbd-da180afc26ff	e887801b-49bb-42e6-bdb1-449dd5095b49	9
b8dce49f-44e0-46ef-af18-c6c1637f4a4e	fbe69347-7fb0-4bdd-adbd-da180afc26ff	85e62c7e-a392-4080-9033-3012a1842262	10
4d8698df-c50a-4afd-9e07-9838d55ede7d	d0903a92-1824-47d9-b03f-dde01d52f311	a8ce627b-ddbf-41e4-ae58-e4d38933b8ae	1
38571c07-1111-49e6-91e8-72316c843930	d0903a92-1824-47d9-b03f-dde01d52f311	0d192d35-1503-4fc7-83b2-6a01bca360f9	2
850362df-9217-430b-8596-875dbf9e8093	d0903a92-1824-47d9-b03f-dde01d52f311	5a6e1ace-3f7f-4765-8a28-c4d8ff5f7829	3
1ac74632-7388-417a-934b-13eead7c5412	d0903a92-1824-47d9-b03f-dde01d52f311	7bf2334e-9f99-407b-a58e-6869214e3be6	4
a7a7d007-9cf7-4260-9f6e-1fe76697eeea	d0903a92-1824-47d9-b03f-dde01d52f311	b819c7bf-8923-4904-a7b1-1607c8343c9e	5
321ff8ef-f89f-4362-9bc1-1f271ebe2ca8	d0903a92-1824-47d9-b03f-dde01d52f311	b44bff91-cb57-4473-a5e8-d2cbcb9dcbec	6
4aedee4f-7645-40d3-9cd4-e6f650c435e4	d0903a92-1824-47d9-b03f-dde01d52f311	145f7ede-4993-4444-990f-71efcb35b4ed	7
ec1eff34-6da9-48da-bc2f-8ae805179cd2	d0903a92-1824-47d9-b03f-dde01d52f311	680fb86f-1589-4961-9a62-e4c235ce50a3	8
62868dc9-70f2-4e54-9dc8-834f54bcd333	d0903a92-1824-47d9-b03f-dde01d52f311	0b6f3645-fa2f-4e1e-ae96-e7a11def6101	9
c99487f9-0bb0-4068-9cd5-0c6ffa564497	d0903a92-1824-47d9-b03f-dde01d52f311	3108ff57-ee6a-48d8-83f4-97dc9a0d9e4b	10
6cf2b274-b88e-4592-9347-622481db1778	2dc603fd-e2c9-45e2-99e7-acbf28a869fa	8f963b30-430e-460c-adeb-bb364224c232	1
99e0fd12-89a8-4411-b84a-4dab4ae3b203	2dc603fd-e2c9-45e2-99e7-acbf28a869fa	34d5206e-586a-48c3-b764-3f0ee7525871	2
4e2b3374-74e8-4e91-871b-94db55e1853a	2dc603fd-e2c9-45e2-99e7-acbf28a869fa	d786ceaf-d2d2-4a87-bffd-86fde6d0feb5	3
9a6f21b7-b8cf-4459-8a71-8e8e194afea3	2dc603fd-e2c9-45e2-99e7-acbf28a869fa	b5f3e535-5a37-46fb-ba23-36edc0b3b2b2	4
38f92c20-b996-49cd-a3f8-bc6ee5c8536b	2dc603fd-e2c9-45e2-99e7-acbf28a869fa	435464d1-ef10-414a-b2d5-fc1840f0e14b	5
4f2039f7-12bb-4cd0-b206-3307f08cdfd8	2dc603fd-e2c9-45e2-99e7-acbf28a869fa	59d46000-e3a5-426b-8a2f-bb7e09652b57	6
52b543ac-347c-437d-bd2a-99d3da9d32b2	2dc603fd-e2c9-45e2-99e7-acbf28a869fa	cbbdd9f3-fc6f-487c-89e8-8313bfa0fa45	7
c2224d57-d58a-49c6-81bc-80fa63cc7f09	2dc603fd-e2c9-45e2-99e7-acbf28a869fa	0f3e97b6-3afc-4242-8b1a-b170a6ee24dd	8
6107d5a6-9ed9-4a94-b650-ec29e1a61cec	2dc603fd-e2c9-45e2-99e7-acbf28a869fa	1a0d71b1-766e-4ac7-80af-e233ad21f08d	9
ce7b880e-3cc8-4ff6-af49-6512dcc19644	2dc603fd-e2c9-45e2-99e7-acbf28a869fa	a63dd109-fd0f-458c-97c1-332a73568291	10
8ce8816b-d98f-4021-82e1-99e3736b6f99	9545b868-da78-41f2-87b6-c8038a62fc7e	f48731b4-01ae-4ffd-a00e-7f88c0d1dd8c	1
61dcd02d-e656-4104-b854-b3d2cca6751b	9545b868-da78-41f2-87b6-c8038a62fc7e	347993c4-2bc7-40ae-a791-1210db9b11c3	2
a0ebd599-363b-4576-9a82-0819cd0d34e5	9545b868-da78-41f2-87b6-c8038a62fc7e	6f85f4cc-cd44-4f2a-9211-31509904cd69	3
abfd995e-ec23-4783-aabd-bc568772f6f2	9545b868-da78-41f2-87b6-c8038a62fc7e	f9f17839-9513-4dde-8a50-5116d226d660	4
044240e8-7e79-41b1-b571-a6655ae46f4c	9545b868-da78-41f2-87b6-c8038a62fc7e	923a9941-1248-451c-868d-45b169d7f0e6	5
ae03ddab-c934-4afc-853d-52278fbbc160	9545b868-da78-41f2-87b6-c8038a62fc7e	0ae1a6d8-da26-46a4-bc19-b22bc9bd1dfe	6
c5679432-a8a9-4c72-83ff-80799a3f824a	9545b868-da78-41f2-87b6-c8038a62fc7e	71e47b86-3fcb-4a49-aae2-411ad835525f	7
69ee4247-d094-40eb-b206-ca7da17cb4d5	9545b868-da78-41f2-87b6-c8038a62fc7e	71f4c073-76d7-42f3-8853-a2ae8963d5fe	8
811419e7-6f2f-45d7-8b48-476b3390d327	9545b868-da78-41f2-87b6-c8038a62fc7e	ce24cfe9-971d-4462-8807-0472d29221ed	9
c567bf17-e357-41ca-99c5-69f5518c62b8	9545b868-da78-41f2-87b6-c8038a62fc7e	b798b0ec-11a3-4e87-85f8-0b58a99cecf2	10
3feb0fe3-a74d-4d49-ab7a-b133b52ee7d4	7daa41ea-d47d-4404-b55e-dc91f893a109	b080cc70-11d1-4602-a87a-b2dbd38f7a4a	1
abdd60e3-acbe-4270-8843-2aba7b9832cb	7daa41ea-d47d-4404-b55e-dc91f893a109	ab0cfa3f-db14-404a-a809-be1d14aaef64	2
a6b771c3-0198-4337-a84c-34a54824c735	7daa41ea-d47d-4404-b55e-dc91f893a109	1631fd66-2e61-4d51-9899-0f40d72189a2	3
d95909c3-fb7c-420f-ba0d-7c6e05bade60	7daa41ea-d47d-4404-b55e-dc91f893a109	f8724904-3861-45e8-bd9f-0a31713c3732	4
a3ecd01e-62ed-412c-a8c5-69a2f7927f10	7daa41ea-d47d-4404-b55e-dc91f893a109	96b78eff-f9cd-4c5f-8b2d-a563a5453694	5
9a51dc16-8fd3-46a3-917c-d91888b55f11	7daa41ea-d47d-4404-b55e-dc91f893a109	e69aefc5-2b86-4e85-8538-dcf4f2df2612	6
7344db4c-2c15-43fc-9367-9920b714c466	7daa41ea-d47d-4404-b55e-dc91f893a109	041d59ab-c3a2-400f-b3a3-e416e637756b	7
c2f404c3-0813-4355-91e2-b8ff56a49902	7daa41ea-d47d-4404-b55e-dc91f893a109	ff9daf42-cc37-4d00-a0b9-0a6a8c0e9d4d	8
a4f5fbf1-366f-4411-b89c-d57627cf4e3c	7daa41ea-d47d-4404-b55e-dc91f893a109	6c353667-7b9d-4b41-87f2-f3ec32d50133	9
ab7ac0b6-ec87-467a-a1f7-37b29d122b15	7daa41ea-d47d-4404-b55e-dc91f893a109	3d252443-f768-4631-ad1d-11ad88a1d112	10
2ae99fca-5054-4ac8-a466-8bdfee7d084a	5a2b7c5f-6980-4018-a6c2-c0aa79d66b9c	8b34c933-3fda-4c23-a735-a4f17e8cfcfb	1
92523b20-7bb3-4525-b844-04056b52a98e	5a2b7c5f-6980-4018-a6c2-c0aa79d66b9c	795d44b2-a29d-45a5-aa8b-ac8cc08b1dd9	2
cbc91c0a-9d45-43f5-ae2b-fa5339535a76	5a2b7c5f-6980-4018-a6c2-c0aa79d66b9c	4afaf881-17a8-400b-902e-056cc5e965cd	3
f63b638c-6629-4f29-b19c-d8c32a872aae	5a2b7c5f-6980-4018-a6c2-c0aa79d66b9c	035323ba-cab9-4df7-9044-371106a94d45	4
24b3916d-a00b-4aa8-b68d-e580883f7f56	5a2b7c5f-6980-4018-a6c2-c0aa79d66b9c	d3fc047a-07ff-4dbb-8597-fb514c4cb115	5
c5fee97b-7f93-4ac1-af7b-f984b34327f6	5a2b7c5f-6980-4018-a6c2-c0aa79d66b9c	a34c60a2-979d-49a2-9f29-268abcbad66d	6
f3bbc52f-0490-4794-91f2-3c5c57580fc7	5a2b7c5f-6980-4018-a6c2-c0aa79d66b9c	3b25f797-9cc5-46d0-b1a7-71b04ae5244c	7
001ea1b0-9898-43ca-b863-70c4dc574025	5a2b7c5f-6980-4018-a6c2-c0aa79d66b9c	d2c296e7-0ecd-4cd4-82d4-c1d21f3c43d8	8
08526c4a-16d8-4c8d-a9da-bab1470da382	5a2b7c5f-6980-4018-a6c2-c0aa79d66b9c	a34e8053-5497-4b8c-ba6a-4a70a6f15109	9
52185bd0-f678-4392-b0ac-86acca4a1e6b	5a2b7c5f-6980-4018-a6c2-c0aa79d66b9c	3c31a824-22a0-482f-8981-f137f4676fbe	10
940864bb-bc98-4b08-8265-7c6c16b80275	4b10906f-2abb-4f0b-a0ba-b79233075693	79e43692-7d9e-4ebd-80fb-ca8f509ffc8d	1
cf7c9acd-8fa9-4401-b59d-6317b0ac3dd2	4b10906f-2abb-4f0b-a0ba-b79233075693	1a6c024c-81d8-4b20-9cf1-72831e38215d	2
d6e14c70-2579-4aea-b2ee-a21183da56a4	4b10906f-2abb-4f0b-a0ba-b79233075693	aecfacbd-019f-4965-86e9-81e5755d7579	3
52049aee-eca8-4f0a-a223-9754311df55d	4b10906f-2abb-4f0b-a0ba-b79233075693	80b3cce4-c25c-4372-a537-de86a645caea	4
a553f3b0-9d7a-4036-ba8a-c11adac7d207	4b10906f-2abb-4f0b-a0ba-b79233075693	436ecc59-cdb7-4bf6-8005-b92c31241eac	5
2a5a4ad0-2b19-46b6-a476-0b1b1922e822	4b10906f-2abb-4f0b-a0ba-b79233075693	5c46756e-b997-49f8-90fd-22460d555188	6
bf7c619b-cb84-4721-9c16-edc43cb2dd7c	4b10906f-2abb-4f0b-a0ba-b79233075693	3af8791c-e2d4-4a04-99df-9da1fdef740d	7
bb39f8cd-6b23-45a4-855d-e4389a2365e3	4b10906f-2abb-4f0b-a0ba-b79233075693	e8d3a9d2-d241-4593-bfc4-ed17b6094d0c	8
59bcbc78-21ca-4743-a4e3-c330c1438c26	4b10906f-2abb-4f0b-a0ba-b79233075693	b7325955-8690-4998-907b-0c184e6455b3	9
00c138e0-2e6f-4bea-9310-b1f3f10d2f48	4b10906f-2abb-4f0b-a0ba-b79233075693	a13e353a-d9a7-43fa-898d-3ad26efad253	10
ecb5699c-fc59-4276-8748-d6728706c816	85e0c6e5-5f07-4db2-8d2a-9e0c4b5d6e74	c05fb07e-f5ff-480c-9d27-25fb87ef3af9	1
b18889bb-84f9-4808-a976-25716072e484	85e0c6e5-5f07-4db2-8d2a-9e0c4b5d6e74	04e75771-8e83-4337-8c12-031e0155cce3	2
7a8868e6-c3cd-4eb1-af9a-a6b7bf07f482	85e0c6e5-5f07-4db2-8d2a-9e0c4b5d6e74	333196bf-7b0a-43c9-a725-a33622ad3cb8	3
51dd4007-b5ee-4d18-8280-ed9331a031c3	85e0c6e5-5f07-4db2-8d2a-9e0c4b5d6e74	e905edec-ba7e-4bca-bf2f-87c6aafbfd9a	4
e9b1e1d6-520a-437c-b203-0a25625985b3	85e0c6e5-5f07-4db2-8d2a-9e0c4b5d6e74	d365b85a-d8fa-4298-a62c-746d0380e7ad	5
3ad31e0e-a5d6-488c-bedf-1e3777b75440	85e0c6e5-5f07-4db2-8d2a-9e0c4b5d6e74	6ac06d1e-4c68-4656-96d3-31c5de37dcb9	6
bf5aff6e-e21a-4f31-bc1a-9bf9d6fa962c	85e0c6e5-5f07-4db2-8d2a-9e0c4b5d6e74	316ab12e-da15-49c0-a633-0159ca587891	7
83af7388-2a7b-4b15-9989-14841ea0287e	85e0c6e5-5f07-4db2-8d2a-9e0c4b5d6e74	26c83386-45bf-411f-b63c-76e36725f1a2	8
802965a0-520a-43c5-8151-e26ed2636916	85e0c6e5-5f07-4db2-8d2a-9e0c4b5d6e74	0323852c-40f8-42c9-b5c4-a55ab39e20fa	9
ba95c0fc-c5bc-42f3-8bbd-ac5ed882f72d	85e0c6e5-5f07-4db2-8d2a-9e0c4b5d6e74	05c6d344-ea47-4b14-a40d-bcf5ee59c3ea	10
dd3eec26-0862-4761-b36b-b6c168c478a0	9b42e6c5-0c4c-48a1-956d-7aa90b3607cb	56d9389a-a5d3-42e5-a6cf-9c6d0a4cfcf0	1
01cdb2e9-2a3e-4bb9-8459-c3ef85eaf8b8	9b42e6c5-0c4c-48a1-956d-7aa90b3607cb	ea3d33f2-d62f-4c32-a287-9f3a670b89bd	2
0fe3f4af-4bad-42fd-b447-042e6e2be540	9b42e6c5-0c4c-48a1-956d-7aa90b3607cb	3a40f8d8-5856-400d-94cf-20bc8f1651d2	3
c5e40b27-ce57-40a9-955a-74f23641500f	9b42e6c5-0c4c-48a1-956d-7aa90b3607cb	f3f7b9c1-e7d9-4e51-9624-1ec73b75d6a5	4
b710faa8-5ed2-4d0d-b4e2-687485131168	9b42e6c5-0c4c-48a1-956d-7aa90b3607cb	7df9ef98-89f6-4d60-88e3-31c57db8b24f	5
93bd19a0-3048-4252-a843-74091ab02a66	9b42e6c5-0c4c-48a1-956d-7aa90b3607cb	ac5c3e4a-ada5-4155-b844-3997544fdaea	6
4095282d-89f6-4911-a84c-d2ab101158f7	9b42e6c5-0c4c-48a1-956d-7aa90b3607cb	483a5464-fd7c-4768-b4c5-8de7256a8267	7
54a6a1d1-e486-44d8-a7e0-ee88ebe6bd6d	9b42e6c5-0c4c-48a1-956d-7aa90b3607cb	c53bfd68-64ae-4309-bf31-f642913744da	8
9ed25797-9f1e-4c3f-9f8e-7853fa9dd5d8	9b42e6c5-0c4c-48a1-956d-7aa90b3607cb	ffdb0b63-a18f-45b8-ba26-a2a7d974a2ac	9
fc032dc6-e207-40ae-89fa-4a13326ddd57	9b42e6c5-0c4c-48a1-956d-7aa90b3607cb	e0bdf72b-d998-46c7-9f89-7c3ca0f8a53a	10
\.


--
-- Data for Name: SkillUnit; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."SkillUnit" (id, title, description, icon, color, "orderIndex", "requiredXp", "isPublished", code, tier, "moduleId", "coreLevel", "createdAt", "updatedAt", "codeExamples", "commonMistakes", content, "estimatedTime", "references", tips, "videoUrl") FROM stdin;
68e1485b-12a2-4a5b-a222-10303068f950	循环结构	含循环嵌套、break/continue	📝	from-green-400 to-green-600	5	0	t	1-05	CSP_J	1	5	2026-01-30 16:29:52.707	2026-02-01 12:18:19.938	\N	\N	\N	\N	\N	\N	\N
d237e481-b06b-468d-a70a-653a4230e765	字符串	遍历、拼接、截取、比较	📝	from-green-400 to-green-600	7	0	t	1-07	CSP_J	1	5	2026-01-30 16:29:52.712	2026-02-01 12:18:21.915	\N	\N	\N	\N	\N	\N	\N
76794f94-a309-4391-8dc2-859457d224af	函数	含值传递、函数重载基础	📝	from-green-400 to-green-600	8	0	t	1-08	CSP_J	1	5	2026-01-30 16:29:52.714	2026-02-01 12:18:22.339	\N	\N	\N	\N	\N	\N	\N
c48a3092-2787-40dc-b2d1-a0ed191cdf91	递归	阶乘、斐波那契等基础递归	📝	from-green-400 to-green-600	9	0	t	1-09	CSP_J	1	4	2026-01-30 16:29:52.716	2026-02-01 12:18:23.291	\N	\N	\N	\N	\N	\N	\N
6442e653-0432-4c43-9b84-9d01e0f75ea9	结构体与枚举	结构体定义、成员访问、枚举使用	📝	from-green-400 to-green-600	10	0	t	1-10	CSP_J	1	3	2026-01-30 16:29:52.718	2026-02-01 12:18:23.8	\N	\N	\N	\N	\N	\N	\N
42b3943e-4c43-4397-a673-07ce0dce925c	文件操作	竞赛必备输入输出重定向	📝	from-green-400 to-green-600	11	0	t	1-11	CSP_J	1	3	2026-01-30 16:29:52.72	2026-02-01 12:18:24.32	\N	\N	\N	\N	\N	\N	\N
c5c4d326-4899-4008-bb18-fdc366121570	指针与引用	指针地址、引用传递、数组与指针	📝	from-green-400 to-green-600	12	0	t	1-12	CSP_S	1	4	2026-01-30 16:29:52.722	2026-02-01 12:18:24.961	\N	\N	\N	\N	\N	\N	\N
e00aa8a6-9755-46ec-aac6-1a589150d9e9	STL容器vector	动态数组，增删改查、遍历	📝	from-green-400 to-green-600	13	0	t	1-13	CSP_S	1	5	2026-01-30 16:29:52.724	2026-02-01 12:18:25.383	\N	\N	\N	\N	\N	\N	\N
0d47246e-6c5b-44da-8d0c-51fd376c5595	STL容器	集合、映射、队列、栈、双端队列	📝	from-green-400 to-green-600	14	0	t	1-14	CSP_S	1	4	2026-01-30 16:29:52.726	2026-02-01 12:18:25.888	\N	\N	\N	\N	\N	\N	\N
d28310b9-7551-4a4b-b41d-22ad981df234	STL算法	排序、交换、查找等常用算法	📝	from-green-400 to-green-600	15	0	t	1-15	CSP_S	1	5	2026-01-30 16:29:52.728	2026-02-01 12:18:26.307	\N	\N	\N	\N	\N	\N	\N
ba94af1a-f949-4f75-9be3-edf65f3de716	位运算	位运算优化、状态压缩基础	📝	from-green-400 to-green-600	16	0	t	1-16	CSP_S	1	4	2026-01-30 16:29:52.73	2026-02-01 12:18:27.199	\N	\N	\N	\N	\N	\N	\N
5ea37a34-465d-4760-9b34-e5483e1d3495	快速读写优化	大数据输入输出必备	📝	from-green-400 to-green-600	17	0	t	1-17	PROVINCIAL	1	5	2026-01-30 16:29:52.732	2026-02-01 12:18:29.038	\N	\N	\N	\N	\N	\N	\N
f30747a3-0fe8-428c-874e-f3e0e627e4b2	模板函数/类	通用代码复用，竞赛简化模板	📝	from-green-400 to-green-600	18	0	t	1-18	PROVINCIAL	1	3	2026-01-30 16:29:52.734	2026-02-01 12:18:29.952	\N	\N	\N	\N	\N	\N	\N
ee0d9bf3-0c9a-44a8-aad5-0dd3fcc1517b	模拟栈	入栈、出栈、判空	🏗️	from-blue-400 to-blue-600	19	0	t	2-01	CSP_J	2	4	2026-01-30 16:29:52.736	2026-02-01 12:18:30.373	\N	\N	\N	\N	\N	\N	\N
0403803d-8bdc-4fee-9acb-e4ca69f807e2	模拟队列	入队、出队、判空	🏗️	from-blue-400 to-blue-600	20	0	t	2-02	CSP_J	2	4	2026-01-30 16:29:52.738	2026-02-01 12:18:30.868	\N	\N	\N	\N	\N	\N	\N
c7ab6263-a31e-4b9d-99ba-79ce802a2343	静态链表	链表节点、增删、遍历	🏗️	from-blue-400 to-blue-600	21	0	t	2-03	CSP_J	2	3	2026-01-30 16:29:52.74	2026-02-01 12:18:31.896	\N	\N	\N	\N	\N	\N	\N
624d5ac9-a2bc-4ba1-a6ad-a68bee09fe52	简单哈希表	哈希映射、冲突处理	🏗️	from-blue-400 to-blue-600	22	0	t	2-04	CSP_J	2	3	2026-01-30 16:29:52.742	2026-02-01 12:18:32.391	\N	\N	\N	\N	\N	\N	\N
c0852243-0142-407b-a128-d666fe5ef76d	STL队列	BFS、任务调度等应用	🏗️	from-blue-400 to-blue-600	24	0	t	2-06	CSP_S	2	5	2026-01-30 16:29:52.746	2026-02-01 12:18:33.531	\N	\N	\N	\N	\N	\N	\N
66ebeb2f-20ac-49e0-bba1-c06ce55896dd	二叉树基础	存储、前中后序遍历、层序遍历	🏗️	from-blue-400 to-blue-600	25	0	t	2-07	CSP_S	2	4	2026-01-30 16:29:52.748	2026-02-01 12:18:34.51	\N	\N	\N	\N	\N	\N	\N
af10e683-9f20-4eec-b10b-beb731158aa1	堆/优先队列	大根堆/小根堆、堆排序	🏗️	from-blue-400 to-blue-600	26	0	t	2-08	CSP_S	2	5	2026-01-30 16:29:52.749	2026-02-01 12:18:35.069	\N	\N	\N	\N	\N	\N	\N
06fd03e1-50ae-4d46-85f5-d2365a6cdf88	并查集基础	查找、合并、路径压缩	🏗️	from-blue-400 to-blue-600	27	0	t	2-09	CSP_S	2	5	2026-01-30 16:29:52.751	2026-02-01 12:18:35.538	\N	\N	\N	\N	\N	\N	\N
048bdc8d-29b1-4e0b-9a35-abc489bbd539	并查集进阶	处理关系类问题	🏗️	from-blue-400 to-blue-600	28	0	t	2-10	CSP_S	2	4	2026-01-30 16:29:52.753	2026-02-01 12:18:36.259	\N	\N	\N	\N	\N	\N	\N
5f29d989-d8a2-42cb-a4ea-ad1f777fa85b	单调栈	找下一个更大/更小元素	🏗️	from-blue-400 to-blue-600	29	0	t	2-11	CSP_S	2	5	2026-01-30 16:29:52.755	2026-02-01 12:18:36.691	\N	\N	\N	\N	\N	\N	\N
2a224c59-ade2-4efa-8b98-bfa1bc347034	单调队列	滑动窗口最值	🏗️	from-blue-400 to-blue-600	30	0	t	2-12	CSP_S	2	5	2026-01-30 16:29:52.757	2026-02-01 12:18:37.322	\N	\N	\N	\N	\N	\N	\N
4aa0a985-1bfe-4470-9896-3807d10f8a32	字典树Trie	前缀匹配、单词统计	🏗️	from-blue-400 to-blue-600	31	0	t	2-13	CSP_S	2	5	2026-01-30 16:29:52.759	2026-02-01 12:18:37.967	\N	\N	\N	\N	\N	\N	\N
c7525e6f-1e8e-4a01-92d8-bbb160be222f	ST表	RMQ问题O(1)查询，倍增思想	🏗️	from-blue-400 to-blue-600	32	0	t	2-14	CSP_S	2	5	2026-01-30 16:29:52.761	2026-02-01 12:18:39.06	\N	\N	\N	\N	\N	\N	\N
3e9ea945-cc9e-46a3-9e64-ef8b1ea2e95b	树状数组一维	单点修改、区间查询	🏗️	from-blue-400 to-blue-600	33	0	t	2-15	PROVINCIAL	2	5	2026-01-30 16:29:52.762	2026-02-01 12:18:40.1	\N	\N	\N	\N	\N	\N	\N
8f79bf52-5317-4d16-be78-777e1fd6bc6e	树状数组二维	二维区间修改、查询	🏗️	from-blue-400 to-blue-600	34	0	t	2-16	PROVINCIAL	2	4	2026-01-30 16:29:52.764	2026-02-01 12:18:41.15	\N	\N	\N	\N	\N	\N	\N
de1a0c21-4839-4f16-a6a9-b4f0f952ec9d	树状数组区间	差分思想应用	🏗️	from-blue-400 to-blue-600	35	0	t	2-17	PROVINCIAL	2	5	2026-01-30 16:29:52.766	2026-02-01 12:18:42.707	\N	\N	\N	\N	\N	\N	\N
81c32093-9fe9-4d95-97ac-1237c9f359c4	线段树基础	区间修改、区间查询、单点更新	🏗️	from-blue-400 to-blue-600	36	0	t	2-18	PROVINCIAL	2	5	2026-01-30 16:29:52.768	2026-02-01 12:18:43.196	\N	\N	\N	\N	\N	\N	\N
5012cfff-ad4f-4357-a07f-f5b172a25b42	线段树懒标记	延迟更新，区间加/乘	🏗️	from-blue-400 to-blue-600	37	0	t	2-19	PROVINCIAL	2	5	2026-01-30 16:29:52.77	2026-02-01 12:18:44.388	\N	\N	\N	\N	\N	\N	\N
2c8c1630-3f38-430b-8e02-0c8e4bef1110	线段树区间合并	处理区间连续问题	🏗️	from-blue-400 to-blue-600	38	0	t	2-20	PROVINCIAL	2	4	2026-01-30 16:29:52.771	2026-02-01 12:18:44.844	\N	\N	\N	\N	\N	\N	\N
8cec9228-3775-488a-a5e8-b29f647fc0c5	主席树	历史版本查询、区间第k大	🏗️	from-blue-400 to-blue-600	39	0	t	2-21	PROVINCIAL	2	4	2026-01-30 16:29:52.774	2026-02-01 12:18:45.328	\N	\N	\N	\N	\N	\N	\N
aa012a89-c3e5-4d06-8acd-150575e3f43e	平衡树Splay	伸展操作、区间翻转	🏗️	from-blue-400 to-blue-600	41	0	t	2-23	PROVINCIAL	2	3	2026-01-30 16:29:52.778	2026-02-01 12:18:46.613	\N	\N	\N	\N	\N	\N	\N
97077ea8-8ea4-4fbe-9a11-7f6665e71a6f	替罪羊树	平衡树简化版	🏗️	from-blue-400 to-blue-600	42	0	t	2-24	PROVINCIAL	2	3	2026-01-30 16:29:52.78	2026-02-01 12:18:47.136	\N	\N	\N	\N	\N	\N	\N
ca1a2e0d-b1c1-4043-9e31-9ce313e243b5	树链剖分	树路径修改、查询	🏗️	from-blue-400 to-blue-600	44	0	t	2-26	PROVINCIAL	2	5	2026-01-30 16:29:52.784	2026-02-01 12:18:49.878	\N	\N	\N	\N	\N	\N	\N
5e1b616b-9c14-464e-b790-b417093a3222	虚树	树上关键点问题优化	🏗️	from-blue-400 to-blue-600	45	0	t	2-27	PROVINCIAL	2	4	2026-01-30 16:29:52.786	2026-02-01 12:18:50.295	\N	\N	\N	\N	\N	\N	\N
1fd05430-c2b9-4e6f-8e35-adb952a73521	可持久化并查集	历史版本并查集查询	🏗️	from-blue-400 to-blue-600	46	0	t	2-28	PROVINCIAL	2	3	2026-01-30 16:29:52.788	2026-02-01 12:18:51.72	\N	\N	\N	\N	\N	\N	\N
068607de-be75-4fd1-96da-ad752e614dd8	块状数组分块	区间操作、根号算法	🏗️	from-blue-400 to-blue-600	47	0	t	2-29	PROVINCIAL	2	4	2026-01-30 16:29:52.79	2026-02-01 12:18:52.184	\N	\N	\N	\N	\N	\N	\N
ba156bb7-2910-4f54-bd22-ce07179c0114	动态开点线段树	大数据范围线段树优化	🏗️	from-blue-400 to-blue-600	48	0	t	2-30	PROVINCIAL	2	4	2026-01-30 16:29:52.792	2026-02-01 12:18:53.042	\N	\N	\N	\N	\N	\N	\N
73fdd7fd-ac1f-47a5-8072-6a3f719f624a	李超线段树	维护直线/线段最值	🏗️	from-blue-400 to-blue-600	49	0	t	2-31	PROVINCIAL	2	4	2026-01-30 16:29:52.794	2026-02-01 12:18:53.46	\N	\N	\N	\N	\N	\N	\N
65e60013-2f3b-4e16-b69d-aae17e1bf300	可撤销并查集	支持撤销操作	🏗️	from-blue-400 to-blue-600	50	0	t	2-32	PROVINCIAL	2	3	2026-01-30 16:29:52.796	2026-02-01 12:18:53.889	\N	\N	\N	\N	\N	\N	\N
63d313ed-4a81-4d25-afa2-2970d1bce1ef	块状链表	大数据量链表操作优化	🏗️	from-blue-400 to-blue-600	51	0	t	2-33	IOI	2	3	2026-01-30 16:29:52.798	2026-02-01 12:18:54.777	\N	\N	\N	\N	\N	\N	\N
625d8b46-83a1-4cb3-95a1-9b10c3e6fb37	左偏树	堆合并、带权合并	🏗️	from-blue-400 to-blue-600	52	0	t	2-34	IOI	2	3	2026-01-30 16:29:52.8	2026-02-01 12:18:55.623	\N	\N	\N	\N	\N	\N	\N
77a882f6-76d8-4c3f-ab90-595fe898fa0f	珂朵莉树ODT	区间赋值、随机数据优化	🏗️	from-blue-400 to-blue-600	53	0	t	2-35	IOI	2	3	2026-01-30 16:29:52.802	2026-02-01 12:18:56.512	\N	\N	\N	\N	\N	\N	\N
d087e8e4-0fb1-4dd0-b309-5d79cfe83bca	树套树	二维数点、区间第k大进阶	🏗️	from-blue-400 to-blue-600	54	0	t	2-36	IOI	2	3	2026-01-30 16:29:52.804	2026-02-01 12:18:57.359	\N	\N	\N	\N	\N	\N	\N
71f7c1d5-7c85-4e07-9488-50544fa391fa	Link-Cut Tree	动态树，支持链修改/查询	🏗️	from-blue-400 to-blue-600	55	0	t	2-37	IOI	2	4	2026-01-30 16:29:52.806	2026-02-01 12:18:57.781	\N	\N	\N	\N	\N	\N	\N
c5ab5667-ab05-4484-a718-5030535f2b64	K-D Tree	多维空间查询、最近邻搜索	🏗️	from-blue-400 to-blue-600	56	0	t	2-38	IOI	2	3	2026-01-30 16:29:52.808	2026-02-01 12:18:58.4	\N	\N	\N	\N	\N	\N	\N
f4dd3700-adc5-4ebb-9c42-3bbd07fc3b1a	枚举	基础穷举，优化剪枝基础	⚡	from-yellow-400 to-yellow-600	58	0	t	3-01	CSP_J	3	5	2026-01-30 16:29:52.812	2026-02-01 12:18:59.994	\N	\N	\N	\N	\N	\N	\N
d89822a4-866b-4892-b375-91803027bb66	模拟	按题目步骤模拟执行	⚡	from-yellow-400 to-yellow-600	59	0	t	3-02	CSP_J	3	5	2026-01-30 16:29:52.813	2026-02-01 12:19:00.874	\N	\N	\N	\N	\N	\N	\N
acb63f0e-6faa-429e-ad1d-3c9b81ccff1f	贪心简单	区间选点、找零钱、排序贪心	⚡	from-yellow-400 to-yellow-600	60	0	t	3-03	CSP_J	3	4	2026-01-30 16:29:52.815	2026-02-01 12:19:01.587	\N	\N	\N	\N	\N	\N	\N
57e11ea6-0deb-4beb-ac1d-d614a894768f	递推	斐波那契、递推公式推导	⚡	from-yellow-400 to-yellow-600	61	0	t	3-04	CSP_J	3	4	2026-01-30 16:29:52.817	2026-02-01 12:19:02.678	\N	\N	\N	\N	\N	\N	\N
f27c8b5a-8e1c-4f2a-ac78-e79d1a800730	基础排序	冒泡/选择/插入排序	⚡	from-yellow-400 to-yellow-600	62	0	t	3-05	CSP_J	3	4	2026-01-30 16:29:52.819	2026-02-01 12:19:03.788	\N	\N	\N	\N	\N	\N	\N
020ff657-e54d-4d6c-b536-24af9e92d1cb	快速排序	分治思想，竞赛常用	⚡	from-yellow-400 to-yellow-600	63	0	t	3-06	CSP_J	3	5	2026-01-30 16:29:52.821	2026-02-01 12:19:04.206	\N	\N	\N	\N	\N	\N	\N
215b6796-0bec-4b70-bcb0-9fda6e24aa38	归并排序	稳定排序，逆序对统计	⚡	from-yellow-400 to-yellow-600	64	0	t	3-07	CSP_J	3	4	2026-01-30 16:29:52.823	2026-02-01 12:19:04.685	\N	\N	\N	\N	\N	\N	\N
49228e4f-3698-46d2-b624-fdfcd2e21cf6	离散化	坐标压缩，降低数据范围	⚡	from-yellow-400 to-yellow-600	65	0	t	3-08	CSP_J	3	4	2026-01-30 16:29:52.825	2026-02-01 12:19:05.104	\N	\N	\N	\N	\N	\N	\N
b4b413c3-fd5a-46b9-9feb-807a8cdd1f2e	DFS深搜	递归深搜、回溯、剪枝基础	⚡	from-yellow-400 to-yellow-600	66	0	t	3-09	CSP_S	3	5	2026-01-30 16:29:52.827	2026-02-01 12:19:05.608	\N	\N	\N	\N	\N	\N	\N
ce260160-76c4-4d00-a48a-15e81a26ba57	BFS广搜	队列实现、最短路径	⚡	from-yellow-400 to-yellow-600	67	0	t	3-10	CSP_S	3	5	2026-01-30 16:29:52.829	2026-02-01 12:19:06.028	\N	\N	\N	\N	\N	\N	\N
38ff12ab-63ec-4262-bd33-829e9ef0a791	回溯法	组合、排列、子集生成	⚡	from-yellow-400 to-yellow-600	68	0	t	3-11	CSP_S	3	4	2026-01-30 16:29:52.83	2026-02-01 12:19:06.477	\N	\N	\N	\N	\N	\N	\N
58ad41d0-8692-4799-9e44-caa399ad2934	分治	分而治之，归并/快排应用	⚡	from-yellow-400 to-yellow-600	69	0	t	3-12	CSP_S	3	4	2026-01-30 16:29:52.832	2026-02-01 12:19:06.898	\N	\N	\N	\N	\N	\N	\N
c6586a3a-4484-424d-b0f3-bc3fe4029645	二分答案	最大化最小值、最小化最大值	⚡	from-yellow-400 to-yellow-600	70	0	t	3-13	CSP_S	3	5	2026-01-30 16:29:52.834	2026-02-01 12:19:07.324	\N	\N	\N	\N	\N	\N	\N
5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37	线性DP	最长上升子序列、最大子段和	⚡	from-yellow-400 to-yellow-600	71	0	t	3-14	CSP_S	3	5	2026-01-30 16:29:52.836	2026-02-01 12:19:08.602	\N	\N	\N	\N	\N	\N	\N
595c4060-418d-45e6-8d99-11990e83fc32	背包DP	01背包、完全背包、多重背包	⚡	from-yellow-400 to-yellow-600	72	0	t	3-15	CSP_S	3	5	2026-01-30 16:29:52.838	2026-02-01 12:19:09.102	\N	\N	\N	\N	\N	\N	\N
a8e77b4b-774d-48d3-a252-90fe263e26aa	区间DP	石子合并、矩阵链乘、回文串	⚡	from-yellow-400 to-yellow-600	73	0	t	3-16	CSP_S	3	5	2026-01-30 16:29:52.839	2026-02-01 12:19:09.617	\N	\N	\N	\N	\N	\N	\N
5d5422e6-440c-47e2-8c77-8f7f71bd65cb	贪心进阶	哈夫曼编码、活动安排	⚡	from-yellow-400 to-yellow-600	74	0	t	3-17	CSP_S	3	4	2026-01-30 16:29:52.841	2026-02-01 12:19:10.041	\N	\N	\N	\N	\N	\N	\N
d2c17bd1-fdf9-4455-8f2d-bed901819bca	迭代加深搜索	深度限制逐步增加	⚡	from-yellow-400 to-yellow-600	76	0	t	3-19	CSP_S	3	4	2026-01-30 16:29:52.845	2026-02-01 12:19:14.933	\N	\N	\N	\N	\N	\N	\N
5d96d5a8-306d-45f5-8b7c-e55efbae077a	高级剪枝	可行性剪枝、最优性剪枝	⚡	from-yellow-400 to-yellow-600	77	0	t	3-20	PROVINCIAL	3	4	2026-01-30 16:29:52.847	2026-02-01 12:19:15.387	\N	\N	\N	\N	\N	\N	\N
bea227c0-a6da-4dd9-a261-d49ffc4ec022	状态压缩DP	二进制状态、旅行商问题	⚡	from-yellow-400 to-yellow-600	78	0	t	3-21	PROVINCIAL	3	5	2026-01-30 16:29:52.849	2026-02-01 12:19:16.749	\N	\N	\N	\N	\N	\N	\N
67aa1221-00da-4157-8775-4821bb390197	数位DP	数字统计、数位限制问题	⚡	from-yellow-400 to-yellow-600	79	0	t	3-22	PROVINCIAL	3	4	2026-01-30 16:29:52.851	2026-02-01 12:19:17.272	\N	\N	\N	\N	\N	\N	\N
95e27c67-5e16-4500-a8af-c1b5e31f7488	树形DP	树的最大独立集、树上背包	⚡	from-yellow-400 to-yellow-600	80	0	t	3-23	PROVINCIAL	3	5	2026-01-30 16:29:52.853	2026-02-01 12:19:17.796	\N	\N	\N	\N	\N	\N	\N
bfcdae1d-5ab5-4340-8617-c94b64efcb9d	期望概率DP	期望计算、概率转移	⚡	from-yellow-400 to-yellow-600	81	0	t	3-24	PROVINCIAL	3	4	2026-01-30 16:29:52.855	2026-02-01 12:19:18.657	\N	\N	\N	\N	\N	\N	\N
bded16e6-9f82-4c5d-bd69-06c4de95700b	插头DP	网格路径、连通性问题	⚡	from-yellow-400 to-yellow-600	82	0	t	3-25	PROVINCIAL	3	3	2026-01-30 16:29:52.856	2026-02-01 12:19:19.076	\N	\N	\N	\N	\N	\N	\N
82ca4227-de4c-4172-beb5-9613fca1322b	斜率优化DP	线性DP优化	⚡	from-yellow-400 to-yellow-600	83	0	t	3-26	PROVINCIAL	3	4	2026-01-30 16:29:52.858	2026-02-01 12:19:19.577	\N	\N	\N	\N	\N	\N	\N
5074d38c-288b-4962-9384-36030c481392	单调队列优化DP	滑动窗口优化DP转移	⚡	from-yellow-400 to-yellow-600	84	0	t	3-27	PROVINCIAL	3	4	2026-01-30 16:29:52.86	2026-02-01 12:19:19.995	\N	\N	\N	\N	\N	\N	\N
1f9b017a-2717-4034-b811-2171978317e6	点分治	树上路径统计，分治思想	⚡	from-yellow-400 to-yellow-600	86	0	t	3-29	PROVINCIAL	3	5	2026-01-30 16:29:52.864	2026-02-01 12:19:20.942	\N	\N	\N	\N	\N	\N	\N
2f32150b-a330-4c93-8067-756890108a76	边分治	树上分治变种	⚡	from-yellow-400 to-yellow-600	87	0	t	3-30	PROVINCIAL	3	4	2026-01-30 16:29:52.865	2026-02-01 12:19:21.469	\N	\N	\N	\N	\N	\N	\N
571a3faf-0224-4c44-b6d3-536e835f0f59	CDQ分治	离线处理、DP优化、三维偏序	⚡	from-yellow-400 to-yellow-600	88	0	t	3-31	PROVINCIAL	3	4	2026-01-30 16:29:52.867	2026-02-01 12:19:21.993	\N	\N	\N	\N	\N	\N	\N
5b80f3e0-7b30-4ab6-abb0-5a8c600774b4	整体二分	区间第k大、多询问处理	⚡	from-yellow-400 to-yellow-600	89	0	t	3-32	PROVINCIAL	3	4	2026-01-30 16:29:52.869	2026-02-01 12:19:22.605	\N	\N	\N	\N	\N	\N	\N
59ecbadf-a4cf-4b91-8753-2d69a774093b	莫队算法	离线区间查询，根号分块	⚡	from-yellow-400 to-yellow-600	90	0	t	3-33	PROVINCIAL	3	5	2026-01-30 16:29:52.871	2026-02-01 12:19:23.039	\N	\N	\N	\N	\N	\N	\N
bbb75142-e03c-4b25-a594-caa8e80f1cb8	带修改莫队	支持单点修改的莫队	⚡	from-yellow-400 to-yellow-600	91	0	t	3-34	PROVINCIAL	3	4	2026-01-30 16:29:52.873	2026-02-01 12:19:23.457	\N	\N	\N	\N	\N	\N	\N
717e8a65-4299-4e5d-a2c5-fdced9fe3637	树上莫队	树上路径查询	⚡	from-yellow-400 to-yellow-600	92	0	t	3-35	PROVINCIAL	3	3	2026-01-30 16:29:52.875	2026-02-01 12:19:23.878	\N	\N	\N	\N	\N	\N	\N
7458cd4c-ac53-4c37-8f51-fa075031e088	回滚莫队	只增不删，处理不可减信息	⚡	from-yellow-400 to-yellow-600	93	0	t	3-36	PROVINCIAL	3	3	2026-01-30 16:29:52.877	2026-02-01 12:19:24.3	\N	\N	\N	\N	\N	\N	\N
bfd85697-1e30-48a9-a041-6ff9cdf5dce7	折半搜索	搜索空间折半，双向合并	⚡	from-yellow-400 to-yellow-600	94	0	t	3-37	PROVINCIAL	3	4	2026-01-30 16:29:52.879	2026-02-01 12:19:24.785	\N	\N	\N	\N	\N	\N	\N
ce4c0ea7-4a61-42f9-ac79-ab3f142f6b5e	IDA*算法	迭代加深+启发式估价	⚡	from-yellow-400 to-yellow-600	95	0	t	3-38	PROVINCIAL	3	4	2026-01-30 16:29:52.881	2026-02-01 12:19:25.21	\N	\N	\N	\N	\N	\N	\N
c52ef5aa-2316-46a3-9892-6feb5775736a	扫描线算法	区间覆盖、矩形面积并	⚡	from-yellow-400 to-yellow-600	96	0	t	3-39	PROVINCIAL	3	4	2026-01-30 16:29:52.883	2026-02-01 12:19:25.67	\N	\N	\N	\N	\N	\N	\N
7a344f40-da95-4faf-86ae-8d59ec119581	DSU on Tree	树上子树统计问题	⚡	from-yellow-400 to-yellow-600	98	0	t	3-41	PROVINCIAL	3	4	2026-01-30 16:29:52.887	2026-02-01 12:19:26.605	\N	\N	\N	\N	\N	\N	\N
18a87c61-7251-4db2-abff-dd54f39154aa	蒙特卡洛算法	概率性算法，近似解求解	⚡	from-yellow-400 to-yellow-600	99	0	t	3-42	PROVINCIAL	3	3	2026-01-30 16:29:52.889	2026-02-01 12:19:27.026	\N	\N	\N	\N	\N	\N	\N
f3f7ab14-7af0-4d36-9e2b-a45cebecef3f	模拟退火	随机化优化，求解最优解	⚡	from-yellow-400 to-yellow-600	100	0	t	3-43	IOI	3	3	2026-01-30 16:29:52.892	2026-02-01 12:19:27.444	\N	\N	\N	\N	\N	\N	\N
591be1ff-7e5a-4238-b0a0-80c74944ab71	爬山算法	局部最优解搜索	⚡	from-yellow-400 to-yellow-600	101	0	t	3-44	IOI	3	3	2026-01-30 16:29:52.894	2026-02-01 12:19:27.872	\N	\N	\N	\N	\N	\N	\N
81136c7a-c3dc-4e91-9b98-9f158a8b821b	三分法	单峰函数极值	⚡	from-yellow-400 to-yellow-600	102	0	t	3-45	IOI	3	3	2026-01-30 16:29:52.897	2026-02-01 12:19:28.801	\N	\N	\N	\N	\N	\N	\N
ecf61093-3d5c-4e33-bc2e-87157eb1799d	倍增进阶	树上倍增、RMQ问题	⚡	from-yellow-400 to-yellow-600	103	0	t	3-46	IOI	3	4	2026-01-30 16:29:52.899	2026-02-01 12:19:29.343	\N	\N	\N	\N	\N	\N	\N
6d0fefe6-adf2-4223-97e1-920c92300fc3	离线算法	把所有询问收集后统一处理	⚡	from-yellow-400 to-yellow-600	104	0	t	3-47	IOI	3	4	2026-01-30 16:29:52.901	2026-02-01 12:19:30.429	\N	\N	\N	\N	\N	\N	\N
be4011cf-a634-45fa-adb9-dc61f333d6af	在线算法	边读入边处理，无后效性	⚡	from-yellow-400 to-yellow-600	105	0	t	3-48	IOI	3	3	2026-01-30 16:29:52.903	2026-02-01 12:19:31.595	\N	\N	\N	\N	\N	\N	\N
5a2fa7ee-89ba-4acc-b25e-df2f3be178fb	近似算法	非精确解，时间换精度	⚡	from-yellow-400 to-yellow-600	106	0	t	3-49	IOI	3	3	2026-01-30 16:29:52.905	2026-02-01 12:19:32.03	\N	\N	\N	\N	\N	\N	\N
cfea52c0-525a-4b83-b6d7-338c4c34c831	进制转换	进制运算、位权理解	🔢	from-purple-400 to-purple-600	107	0	t	4-01	CSP_J	4	4	2026-01-30 16:29:52.907	2026-02-01 12:19:32.525	\N	\N	\N	\N	\N	\N	\N
ad4560d6-7389-4698-84aa-27062544abca	GCD/LCM	欧几里得算法、辗转相除法	🔢	from-purple-400 to-purple-600	108	0	t	4-02	CSP_J	4	5	2026-01-30 16:29:52.91	2026-02-01 12:19:33.384	\N	\N	\N	\N	\N	\N	\N
fa948162-50fc-4390-a6ef-fd51629d5b79	质数判断	试除法判断质数	🔢	from-purple-400 to-purple-600	109	0	t	4-03	CSP_J	4	4	2026-01-30 16:29:52.912	2026-02-01 12:19:33.803	\N	\N	\N	\N	\N	\N	\N
be168a7c-0aa5-4d1d-a371-7490e24d41b6	因数倍数	因数分解、因数个数统计	🔢	from-purple-400 to-purple-600	110	0	t	4-04	CSP_J	4	3	2026-01-30 16:29:52.914	2026-02-01 12:19:35.189	\N	\N	\N	\N	\N	\N	\N
3d1da173-5964-475b-a359-c39383f44437	分解质因数	质因数分解、唯一分解定理	🔢	from-purple-400 to-purple-600	111	0	t	4-05	CSP_J	4	4	2026-01-30 16:29:52.916	2026-02-01 12:19:35.622	\N	\N	\N	\N	\N	\N	\N
c8e027bb-7a9d-42c7-9c18-8b3a3622da81	快速幂	模运算下的幂/乘法优化	🔢	from-purple-400 to-purple-600	112	0	t	4-06	CSP_S	4	5	2026-01-30 16:29:52.917	2026-02-01 12:19:36.469	\N	\N	\N	\N	\N	\N	\N
a38e22a1-4413-4806-96c0-a2e0bc8907f7	同余定理	同余性质、模运算规则	🔢	from-purple-400 to-purple-600	113	0	t	4-07	CSP_S	4	4	2026-01-30 16:29:52.919	2026-02-01 12:19:36.886	\N	\N	\N	\N	\N	\N	\N
a8fd1183-59d5-4263-a164-28332e7190f1	欧拉函数	欧拉函数定义、计算	🔢	from-purple-400 to-purple-600	114	0	t	4-08	CSP_S	4	4	2026-01-30 16:29:52.921	2026-02-01 12:19:37.303	\N	\N	\N	\N	\N	\N	\N
6e5c962c-0429-4564-b987-4d31e04374a4	埃氏筛	批量找质数	🔢	from-purple-400 to-purple-600	115	0	t	4-09	CSP_S	4	4	2026-01-30 16:29:52.923	2026-02-01 12:19:37.741	\N	\N	\N	\N	\N	\N	\N
0446e38b-1680-4bb0-9fcf-77ffe2af0574	逆元费马	模运算除法转换为乘法	🔢	from-purple-400 to-purple-600	117	0	t	4-11	CSP_S	4	5	2026-01-30 16:29:52.928	2026-02-01 12:19:38.677	\N	\N	\N	\N	\N	\N	\N
17dfb436-8ece-4f7c-8e84-a5d629290e1a	逆元扩欧	非质数模数下的逆元求解	🔢	from-purple-400 to-purple-600	118	0	t	4-12	PROVINCIAL	4	4	2026-01-30 16:29:52.93	2026-02-01 12:19:39.616	\N	\N	\N	\N	\N	\N	\N
805ab3c0-6e73-46c5-aa83-172ffa622015	中国剩余定理	多模数同余方程求解	🔢	from-purple-400 to-purple-600	119	0	t	4-13	PROVINCIAL	4	4	2026-01-30 16:29:52.932	2026-02-01 12:19:40.233	\N	\N	\N	\N	\N	\N	\N
a6a35e19-2503-43fd-b395-7f7a58177deb	扩展中国剩余定理	模数不互质的同余方程求解	🔢	from-purple-400 to-purple-600	120	0	t	4-14	PROVINCIAL	4	4	2026-01-30 16:29:52.934	2026-02-01 12:19:41.605	\N	\N	\N	\N	\N	\N	\N
9543d4b6-70f6-4e47-a827-1064a669ebfb	卢卡斯定理	大组合数取模（模数为质数）	🔢	from-purple-400 to-purple-600	121	0	t	4-15	PROVINCIAL	4	4	2026-01-30 16:29:52.936	2026-02-01 12:19:42.039	\N	\N	\N	\N	\N	\N	\N
44ef4523-d0ae-450b-83bb-0491833c81a0	扩展卢卡斯	大组合数取模（模数为合数）	🔢	from-purple-400 to-purple-600	122	0	t	4-16	PROVINCIAL	4	4	2026-01-30 16:29:52.939	2026-02-01 12:19:42.971	\N	\N	\N	\N	\N	\N	\N
bdd897ae-f4df-495b-9f8b-efaee66ba3fd	莫比乌斯函数	莫比乌斯函数定义、性质	🔢	from-purple-400 to-purple-600	123	0	t	4-17	PROVINCIAL	4	4	2026-01-30 16:29:52.941	2026-02-01 12:19:43.395	\N	\N	\N	\N	\N	\N	\N
51512984-11b6-4e5f-9e85-538bfa1c43d0	莫比乌斯反演	数论统计问题	🔢	from-purple-400 to-purple-600	124	0	t	4-18	PROVINCIAL	4	5	2026-01-30 16:29:52.943	2026-02-01 12:19:43.813	\N	\N	\N	\N	\N	\N	\N
a14bb2d5-709a-48ec-a15d-530a73f52b8d	杜教筛	快速求积性函数前缀和	🔢	from-purple-400 to-purple-600	125	0	t	4-19	PROVINCIAL	4	4	2026-01-30 16:29:52.944	2026-02-01 12:19:44.231	\N	\N	\N	\N	\N	\N	\N
b6b6782c-f79c-40a5-94e8-52dc81a7e35c	积性函数	狄利克雷卷积	🔢	from-purple-400 to-purple-600	126	0	t	4-20	PROVINCIAL	4	3	2026-01-30 16:29:52.946	2026-02-01 12:19:44.652	\N	\N	\N	\N	\N	\N	\N
dd6262d4-d765-4097-a92a-3a9046351afb	高斯消元	线性方程组求解	🔢	from-purple-400 to-purple-600	128	0	t	4-22	PROVINCIAL	4	4	2026-01-30 16:29:52.95	2026-02-01 12:19:45.578	\N	\N	\N	\N	\N	\N	\N
c03173a7-ec14-4a64-9ab7-eae01a939bac	BSGS算法	离散对数求解	🔢	from-purple-400 to-purple-600	129	0	t	4-23	PROVINCIAL	4	4	2026-01-30 16:29:52.952	2026-02-01 12:19:46.208	\N	\N	\N	\N	\N	\N	\N
06fd9e46-be8e-4c06-9405-e7d6f8247d30	Miller-Rabin	大数素性判断，概率算法	🔢	from-purple-400 to-purple-600	130	0	t	4-24	PROVINCIAL	4	4	2026-01-30 16:29:52.954	2026-02-01 12:19:48.434	\N	\N	\N	\N	\N	\N	\N
efc82de4-4868-4f40-b32c-15a88c5f0c44	线性基	异或空间、极大无关组	🔢	from-purple-400 to-purple-600	131	0	t	4-25	PROVINCIAL	4	5	2026-01-30 16:29:52.956	2026-02-01 12:19:48.955	\N	\N	\N	\N	\N	\N	\N
769c7a22-1103-4ad1-80ea-8b40da836e63	Pollard-Rho	大数分解	🔢	from-purple-400 to-purple-600	132	0	t	4-26	IOI	4	3	2026-01-30 16:29:52.958	2026-02-01 12:19:49.461	\N	\N	\N	\N	\N	\N	\N
30f987e2-0408-49f4-b988-7dae6a57e020	二次剩余	模运算下的平方根求解	🔢	from-purple-400 to-purple-600	133	0	t	4-27	IOI	4	3	2026-01-30 16:29:52.96	2026-02-01 12:19:50.308	\N	\N	\N	\N	\N	\N	\N
045e0163-4f2e-4d77-a5cd-b18a3560ef3d	原根指数	高级数论，离散对数问题	🔢	from-purple-400 to-purple-600	134	0	t	4-28	IOI	4	3	2026-01-30 16:29:52.961	2026-02-01 12:19:50.84	\N	\N	\N	\N	\N	\N	\N
16ae4ae7-680c-4875-bfbe-059db58af922	矩阵求逆	矩阵逆、线性变换	🔢	from-purple-400 to-purple-600	135	0	t	4-29	IOI	4	3	2026-01-30 16:29:52.963	2026-02-01 12:19:51.745	\N	\N	\N	\N	\N	\N	\N
caffa6ee-b331-447a-a854-eb5953c6fd42	Min_25筛	快速求积性函数前缀和	🔢	from-purple-400 to-purple-600	136	0	t	4-30	IOI	4	3	2026-01-30 16:29:52.965	2026-02-01 12:19:53.037	\N	\N	\N	\N	\N	\N	\N
a85a4fbb-fb1e-4527-882e-77b407b9d55f	FFT	多项式乘法，O(n log n)	🔢	from-purple-400 to-purple-600	137	0	t	4-31	PROVINCIAL	4	5	2026-01-30 16:29:52.967	2026-02-01 12:19:53.458	\N	\N	\N	\N	\N	\N	\N
bc749420-e4bb-4d64-b897-422b8e9a4346	NTT	模意义下的FFT	🔢	from-purple-400 to-purple-600	138	0	t	4-32	PROVINCIAL	4	5	2026-01-30 16:29:52.969	2026-02-01 12:19:53.974	\N	\N	\N	\N	\N	\N	\N
61f5b2fc-6a42-4c05-9050-e5caaf5859e2	多项式求逆	多项式除法基础	🔢	from-purple-400 to-purple-600	139	0	t	4-33	IOI	4	4	2026-01-30 16:29:52.97	2026-02-01 12:19:54.889	\N	\N	\N	\N	\N	\N	\N
b34d421f-6b77-402f-ab43-7ff5761f309a	多项式开根	牛顿迭代法	🔢	from-purple-400 to-purple-600	140	0	t	4-34	IOI	4	3	2026-01-30 16:29:52.972	2026-02-01 12:19:55.308	\N	\N	\N	\N	\N	\N	\N
07cf0a5f-4b9b-4fa8-818b-310a098fee3c	多项式ln/exp	高级多项式运算	🔢	from-purple-400 to-purple-600	141	0	t	4-35	IOI	4	3	2026-01-30 16:29:52.974	2026-02-01 12:19:55.974	\N	\N	\N	\N	\N	\N	\N
e58b6b14-b058-4d93-9178-36da8329f190	生成函数	组合计数重要工具	🔢	from-purple-400 to-purple-600	142	0	t	4-36	PROVINCIAL	4	4	2026-01-30 16:29:52.976	2026-02-01 12:19:56.487	\N	\N	\N	\N	\N	\N	\N
8e756a96-d255-44f5-af16-0175f510c0ef	卡特兰数	括号匹配、路径计数	🔢	from-purple-400 to-purple-600	144	0	t	4-38	PROVINCIAL	4	4	2026-01-30 16:29:52.98	2026-02-01 12:19:57.935	\N	\N	\N	\N	\N	\N	\N
810a7b88-4dca-4c9c-9b8d-eb3dfdb93556	康托展开	排列与序号的双向映射	🔢	from-purple-400 to-purple-600	145	0	t	4-39	CSP_S	4	3	2026-01-30 16:29:52.982	2026-02-01 12:19:58.84	\N	\N	\N	\N	\N	\N	\N
1fcf308a-cf90-4126-bb1d-0a6ead8e1498	斯特林数	排列/划分计数	🔢	from-purple-400 to-purple-600	146	0	t	4-40	IOI	4	3	2026-01-30 16:29:52.984	2026-02-01 12:19:59.297	\N	\N	\N	\N	\N	\N	\N
8ee7529c-c0bd-4bff-abd1-36f9ed7f17a1	贝尔数	集合划分计数	🔢	from-purple-400 to-purple-600	147	0	t	4-41	IOI	4	3	2026-01-30 16:29:52.986	2026-02-01 12:19:59.764	\N	\N	\N	\N	\N	\N	\N
17070098-ff0b-4a01-a5d7-fff75f209d3a	拉格朗日插值	多项式插值、求和公式	🔢	from-purple-400 to-purple-600	148	0	t	4-42	PROVINCIAL	4	4	2026-01-30 16:29:52.988	2026-02-01 12:20:00.659	\N	\N	\N	\N	\N	\N	\N
9b9b8a4c-71c3-4c16-9814-ee60b1640a5d	Burnside/Polya	等价类计数、染色问题	🔢	from-purple-400 to-purple-600	149	0	t	4-43	IOI	4	3	2026-01-30 16:29:52.989	2026-02-01 12:20:01.209	\N	\N	\N	\N	\N	\N	\N
c126d734-219f-4e96-b6c0-7f9f937a1256	鸽巢原理	存在性证明、构造问题	🔢	from-purple-400 to-purple-600	150	0	t	4-44	CSP_S	4	3	2026-01-30 16:29:52.991	2026-02-01 12:20:02.261	\N	\N	\N	\N	\N	\N	\N
cc2329aa-0e41-4468-9524-250ca67c2762	邻接矩阵	二维数组存储，适合稠密图	🕸️	from-red-400 to-red-600	151	0	t	5-01	CSP_J	5	4	2026-01-30 16:29:52.994	2026-02-01 12:20:02.721	\N	\N	\N	\N	\N	\N	\N
b0ee516b-0cba-4475-b2f0-9045f69d1ec4	邻接表	数组+链表存储，适合稀疏图	🕸️	from-red-400 to-red-600	152	0	t	5-02	CSP_J	5	5	2026-01-30 16:29:52.996	2026-02-01 12:20:03.142	\N	\N	\N	\N	\N	\N	\N
597a3fc4-2c62-43b2-baaa-e3a986edbd56	图DFS遍历	连通性、环检测	🕸️	from-red-400 to-red-600	153	0	t	5-03	CSP_J	5	4	2026-01-30 16:29:52.998	2026-02-01 12:20:03.613	\N	\N	\N	\N	\N	\N	\N
0ef00d12-4d7d-422b-ad77-ba6dd9bb87a5	图BFS遍历	无权图最短路径	🕸️	from-red-400 to-red-600	154	0	t	5-04	CSP_J	5	4	2026-01-30 16:29:53	2026-02-01 12:20:04.051	\N	\N	\N	\N	\N	\N	\N
a99d428b-21d5-40f4-9621-0e5c49848376	Floyd最短路	多源最短路，O(n³)	🕸️	from-red-400 to-red-600	155	0	t	5-05	CSP_S	5	4	2026-01-30 16:29:53.002	2026-02-01 12:20:04.53	\N	\N	\N	\N	\N	\N	\N
551b8c50-6dc5-4d0c-b95f-027eed46ddca	Dijkstra最短路	单源最短路，堆优化	🕸️	from-red-400 to-red-600	156	0	t	5-06	CSP_S	5	5	2026-01-30 16:29:53.004	2026-02-01 12:20:04.985	\N	\N	\N	\N	\N	\N	\N
2787122f-1f3e-497f-b49b-ee8dc70fc439	SPFA最短路	处理负权边，判负环	🕸️	from-red-400 to-red-600	157	0	t	5-07	CSP_S	5	4	2026-01-30 16:29:53.005	2026-02-01 12:20:05.837	\N	\N	\N	\N	\N	\N	\N
a8f77db7-5f4d-4daf-8cf5-77bb00351275	Bellman-Ford	基础负权边最短路	🕸️	from-red-400 to-red-600	158	0	t	5-08	CSP_S	5	3	2026-01-30 16:29:53.007	2026-02-01 12:20:06.264	\N	\N	\N	\N	\N	\N	\N
fca57ccd-14b6-418f-b9d0-b62eea4a0a6a	Kruskal最小生成树	贪心+并查集	🕸️	from-red-400 to-red-600	160	0	t	5-10	CSP_S	5	5	2026-01-30 16:29:53.011	2026-02-01 12:20:07.681	\N	\N	\N	\N	\N	\N	\N
f1086a2c-cd16-4614-ab3b-3f343592bbbc	Prim最小生成树	适合稠密图，堆优化	🕸️	from-red-400 to-red-600	161	0	t	5-11	CSP_S	5	4	2026-01-30 16:29:53.013	2026-02-01 12:20:08.128	\N	\N	\N	\N	\N	\N	\N
74742585-4fdd-457c-9b0b-c5c9ea41ad76	拓扑排序	DAG排序，判环	🕸️	from-red-400 to-red-600	162	0	t	5-12	CSP_S	5	5	2026-01-30 16:29:53.015	2026-02-01 12:20:08.864	\N	\N	\N	\N	\N	\N	\N
7244bd0c-ff95-439f-ab25-4f218f502f2d	二分图匹配	匈牙利算法，最大匹配	🕸️	from-red-400 to-red-600	163	0	t	5-13	CSP_S	5	4	2026-01-30 16:29:53.017	2026-02-01 12:20:09.952	\N	\N	\N	\N	\N	\N	\N
6ced40b3-51b7-496d-8040-132e299fd59b	强连通分量Tarjan	缩点、DAG转化	🕸️	from-red-400 to-red-600	164	0	t	5-14	CSP_S	5	5	2026-01-30 16:29:53.019	2026-02-01 12:20:10.432	\N	\N	\N	\N	\N	\N	\N
f522a7ab-939a-49ec-8e89-b8ae6e834c35	差分约束	不等式系统转最短路	🕸️	from-red-400 to-red-600	165	0	t	5-15	CSP_S	5	4	2026-01-30 16:29:53.021	2026-02-01 12:20:10.85	\N	\N	\N	\N	\N	\N	\N
20880c5e-8a82-42f4-ba33-251617e72a20	LCA倍增	树上两点最近公共祖先	🕸️	from-red-400 to-red-600	166	0	t	5-16	PROVINCIAL	5	5	2026-01-30 16:29:53.023	2026-02-01 12:20:11.28	\N	\N	\N	\N	\N	\N	\N
aebdee76-3a76-4b33-8866-87def5351e77	LCA树剖	结合树链剖分求解	🕸️	from-red-400 to-red-600	167	0	t	5-17	PROVINCIAL	5	4	2026-01-30 16:29:53.025	2026-02-01 12:20:11.698	\N	\N	\N	\N	\N	\N	\N
9d7578ff-1b16-4ad3-afb6-746557bfb8df	最大流EK	增广路算法	🕸️	from-red-400 to-red-600	168	0	t	5-18	PROVINCIAL	5	4	2026-01-30 16:29:53.027	2026-02-01 12:20:12.116	\N	\N	\N	\N	\N	\N	\N
ee972a3b-eeca-45a7-abca-5b367b65580f	最大流Dinic	分层图+DFS	🕸️	from-red-400 to-red-600	169	0	t	5-19	PROVINCIAL	5	5	2026-01-30 16:29:53.029	2026-02-01 12:20:12.972	\N	\N	\N	\N	\N	\N	\N
054c96a7-0db2-4232-a9f5-de96d46ec984	费用流	最小费用最大流	🕸️	from-red-400 to-red-600	171	0	t	5-21	PROVINCIAL	5	4	2026-01-30 16:29:53.033	2026-02-01 12:20:14.42	\N	\N	\N	\N	\N	\N	\N
f60984a8-f1bc-4e23-b19c-ad1033d6eb75	上下界网络流	有上下界的流网络	🕸️	from-red-400 to-red-600	172	0	t	5-22	PROVINCIAL	5	3	2026-01-30 16:29:53.035	2026-02-01 12:20:15.278	\N	\N	\N	\N	\N	\N	\N
3f193912-741a-455d-a382-f12e7b8c6fbc	KM算法	带权二分图匹配	🕸️	from-red-400 to-red-600	173	0	t	5-23	PROVINCIAL	5	4	2026-01-30 16:29:53.037	2026-02-01 12:20:16.201	\N	\N	\N	\N	\N	\N	\N
2df026fb-c43a-4050-ae76-570f1f776873	2-SAT	布尔可满足性	🕸️	from-red-400 to-red-600	175	0	t	5-25	PROVINCIAL	5	4	2026-01-30 16:29:53.041	2026-02-01 12:20:17.589	\N	\N	\N	\N	\N	\N	\N
80dd40cb-f82b-4795-9340-6fcfdf89352e	缩点缩边	图的简化	🕸️	from-red-400 to-red-600	176	0	t	5-26	PROVINCIAL	5	3	2026-01-30 16:29:53.044	2026-02-01 12:20:18.746	\N	\N	\N	\N	\N	\N	\N
afb340f4-cddd-4fd3-80f2-67a843c55bad	基环树	树+环，找环、拆环处理	🕸️	from-red-400 to-red-600	177	0	t	5-27	PROVINCIAL	5	4	2026-01-30 16:29:53.046	2026-02-01 12:20:19.233	\N	\N	\N	\N	\N	\N	\N
6bdb44f5-3fad-4d01-8b8e-598d6062a3f5	树的直径	树上最长路径	🕸️	from-red-400 to-red-600	178	0	t	5-28	PROVINCIAL	5	5	2026-01-30 16:29:53.048	2026-02-01 12:20:19.686	\N	\N	\N	\N	\N	\N	\N
9161de90-1b87-43a8-8a04-75f215a1f7c3	树的重心	树的中心节点	🕸️	from-red-400 to-red-600	179	0	t	5-29	PROVINCIAL	5	4	2026-01-30 16:29:53.05	2026-02-01 12:20:20.259	\N	\N	\N	\N	\N	\N	\N
a9302edf-c148-4aff-83bb-17c43f89da5b	树的中心	到所有节点距离最小的点	🕸️	from-red-400 to-red-600	180	0	t	5-30	PROVINCIAL	5	3	2026-01-30 16:29:53.052	2026-02-01 12:20:20.848	\N	\N	\N	\N	\N	\N	\N
e361d00e-6c7b-4fe1-932e-a07a11470939	欧拉图	欧拉路径、欧拉回路	🕸️	from-red-400 to-red-600	181	0	t	5-31	PROVINCIAL	5	3	2026-01-30 16:29:53.055	2026-02-01 12:20:21.97	\N	\N	\N	\N	\N	\N	\N
82443a49-63fc-4f44-8bc7-b135eaca17e8	哈密顿图	哈密顿路径、回路判断	🕸️	from-red-400 to-red-600	182	0	t	5-32	PROVINCIAL	5	3	2026-01-30 16:29:53.057	2026-02-01 12:20:22.403	\N	\N	\N	\N	\N	\N	\N
3a48f71d-48ee-469f-9bab-3cb94d64620d	双连通分量	图的连通性进阶	🕸️	from-red-400 to-red-600	183	0	t	5-33	PROVINCIAL	5	4	2026-01-30 16:29:53.059	2026-02-01 12:20:22.823	\N	\N	\N	\N	\N	\N	\N
46a45347-be5d-4883-973b-34a26f44d674	仙人掌图	每个边最多在一个环中	🕸️	from-red-400 to-red-600	184	0	t	5-34	IOI	5	3	2026-01-30 16:29:53.061	2026-02-01 12:20:24.019	\N	\N	\N	\N	\N	\N	\N
f2e93b90-ad02-4370-9a5b-1a77c2cfdeef	支配树	图的支配关系	🕸️	from-red-400 to-red-600	185	0	t	5-35	IOI	5	3	2026-01-30 16:29:53.063	2026-02-01 12:20:24.46	\N	\N	\N	\N	\N	\N	\N
76c4329a-151a-4f96-bce1-cb566573f59c	平面图	平面图判定、欧拉公式	🕸️	from-red-400 to-red-600	186	0	t	5-36	IOI	5	3	2026-01-30 16:29:53.065	2026-02-01 12:20:25.43	\N	\N	\N	\N	\N	\N	\N
586eeeda-b6bd-4c45-9801-fac087810ea5	字符串暴力匹配	逐个字符比对	📐	from-cyan-400 to-cyan-600	187	0	t	6-01	CSP_J	6	4	2026-01-30 16:29:53.067	2026-02-01 12:20:25.963	\N	\N	\N	\N	\N	\N	\N
b036e41e-e4ce-4799-898d-9e17bf8b0eb1	字符串操作	string类常用操作	📐	from-cyan-400 to-cyan-600	188	0	t	6-02	CSP_J	6	4	2026-01-30 16:29:53.068	2026-02-01 12:20:26.385	\N	\N	\N	\N	\N	\N	\N
26575fb5-08d4-44e6-aab7-a86c38342c53	KMP算法	模式匹配，失配函数	📐	from-cyan-400 to-cyan-600	189	0	t	6-03	CSP_S	6	5	2026-01-30 16:29:53.071	2026-02-01 12:20:27.257	\N	\N	\N	\N	\N	\N	\N
cbe4abed-bdd9-4c92-bc1c-6db9b2de077d	字符串哈希	快速比较字符串	📐	from-cyan-400 to-cyan-600	191	0	t	6-05	CSP_S	6	5	2026-01-30 16:29:53.074	2026-02-01 12:20:28.812	\N	\N	\N	\N	\N	\N	\N
43784e74-df63-4bd3-b555-3fb8d900cd58	AC自动机	多模式匹配，Trie+KMP	📐	from-cyan-400 to-cyan-600	192	0	t	6-06	PROVINCIAL	6	5	2026-01-30 16:29:53.076	2026-02-01 12:20:29.345	\N	\N	\N	\N	\N	\N	\N
f4f5dd57-8cf2-48e0-a50c-7260465c05b2	AC自动机进阶	fail树遍历	📐	from-cyan-400 to-cyan-600	193	0	t	6-07	PROVINCIAL	6	4	2026-01-30 16:29:53.078	2026-02-01 12:20:29.826	\N	\N	\N	\N	\N	\N	\N
ee88b900-df76-4387-968f-35f7e5c67540	Manacher	最长回文子串	📐	from-cyan-400 to-cyan-600	194	0	t	6-08	PROVINCIAL	6	4	2026-01-30 16:29:53.081	2026-02-01 12:20:30.836	\N	\N	\N	\N	\N	\N	\N
b6af7b67-c0bd-4505-aa0c-3190e52bc74a	后缀数组SA	后缀排序、height数组	📐	from-cyan-400 to-cyan-600	195	0	t	6-09	PROVINCIAL	6	4	2026-01-30 16:29:53.083	2026-02-01 12:20:31.293	\N	\N	\N	\N	\N	\N	\N
57797f6a-9ff5-40e0-aef9-4fdb760947c5	后缀数组应用	最长公共前缀	📐	from-cyan-400 to-cyan-600	196	0	t	6-10	PROVINCIAL	6	4	2026-01-30 16:29:53.085	2026-02-01 12:20:32.517	\N	\N	\N	\N	\N	\N	\N
6fd01578-33bb-40af-b195-d4e236e848a2	后缀自动机SAM	子串统计、最长公共子串	📐	from-cyan-400 to-cyan-600	197	0	t	6-11	PROVINCIAL	6	5	2026-01-30 16:29:53.086	2026-02-01 12:20:32.974	\N	\N	\N	\N	\N	\N	\N
21ac0db1-1599-4a74-9c11-ccab5e762dc4	回文自动机PAM	回文子串统计	📐	from-cyan-400 to-cyan-600	198	0	t	6-12	PROVINCIAL	6	3	2026-01-30 16:29:53.089	2026-02-01 12:20:33.932	\N	\N	\N	\N	\N	\N	\N
f4ac4c74-390c-4b05-a080-8146771733f7	最小表示法	字符串最小循环表示	📐	from-cyan-400 to-cyan-600	199	0	t	6-13	PROVINCIAL	6	3	2026-01-30 16:29:53.09	2026-02-01 12:20:34.583	\N	\N	\N	\N	\N	\N	\N
83a26811-ccc6-40be-8902-f128229ee956	扩展KMP	Z算法	📐	from-cyan-400 to-cyan-600	200	0	t	6-14	PROVINCIAL	6	3	2026-01-30 16:29:53.092	2026-02-01 12:20:35.181	\N	\N	\N	\N	\N	\N	\N
7b22c201-d331-444b-9b5e-138244770876	后缀树	多模式匹配、子串查询	📐	from-cyan-400 to-cyan-600	201	0	t	6-15	IOI	6	3	2026-01-30 16:29:53.094	2026-02-01 12:20:35.608	\N	\N	\N	\N	\N	\N	\N
79398a6a-4150-48a0-a20b-6c2b16366b94	广义后缀自动机	多字符串后缀自动机	📐	from-cyan-400 to-cyan-600	202	0	t	6-16	IOI	6	3	2026-01-30 16:29:53.096	2026-02-01 12:20:36.031	\N	\N	\N	\N	\N	\N	\N
73ccff28-5a8c-46b1-9862-58e949f4e4af	字符串压缩	Run-Length编码	📐	from-cyan-400 to-cyan-600	203	0	t	6-17	IOI	6	3	2026-01-30 16:29:53.098	2026-02-01 12:20:36.454	\N	\N	\N	\N	\N	\N	\N
a5a1f31d-ac98-439f-ab87-5cefa161351c	点与向量	点坐标、向量运算	📐	from-cyan-400 to-cyan-600	204	0	t	6-18	CSP_S	6	4	2026-01-30 16:29:53.1	2026-02-01 12:20:37.49	\N	\N	\N	\N	\N	\N	\N
6a71b067-d484-4d52-a924-cfbfa7894d6b	线段相交	线段相交判断	📐	from-cyan-400 to-cyan-600	206	0	t	6-20	CSP_S	6	4	2026-01-30 16:29:53.104	2026-02-01 12:20:38.326	\N	\N	\N	\N	\N	\N	\N
6045975a-8b04-4045-b821-50f662db8426	斜率截距	直线斜率、截距	📐	from-cyan-400 to-cyan-600	207	0	t	6-21	CSP_S	6	3	2026-01-30 16:29:53.106	2026-02-01 12:20:38.943	\N	\N	\N	\N	\N	\N	\N
790c93ad-5916-47c3-b802-7c14229aab23	凸包Graham	极角排序，求凸包	📐	from-cyan-400 to-cyan-600	208	0	t	6-22	PROVINCIAL	6	5	2026-01-30 16:29:53.108	2026-02-01 12:20:39.996	\N	\N	\N	\N	\N	\N	\N
a736f850-3391-494f-81d5-a3faa97419d5	凸包Andrew	排序+单调栈	📐	from-cyan-400 to-cyan-600	209	0	t	6-23	PROVINCIAL	6	5	2026-01-30 16:29:53.11	2026-02-01 12:20:40.434	\N	\N	\N	\N	\N	\N	\N
badaab5e-ed61-4305-8297-d3f9fb048449	旋转卡壳	凸包直径、最远点对	📐	from-cyan-400 to-cyan-600	210	0	t	6-24	PROVINCIAL	6	5	2026-01-30 16:29:53.112	2026-02-01 12:20:41.173	\N	\N	\N	\N	\N	\N	\N
b2ef2d61-0e76-4877-935b-5bd307399256	半平面交	多边形裁剪	📐	from-cyan-400 to-cyan-600	211	0	t	6-25	PROVINCIAL	6	4	2026-01-30 16:29:53.114	2026-02-01 12:20:41.685	\N	\N	\N	\N	\N	\N	\N
a4933cba-1494-4e78-8d83-51763d182ebb	平面最近点对	分治求解	📐	from-cyan-400 to-cyan-600	212	0	t	6-26	PROVINCIAL	6	4	2026-01-30 16:29:53.116	2026-02-01 12:20:42.103	\N	\N	\N	\N	\N	\N	\N
0d77aa2f-2af6-48cf-b4a6-499e79cd4473	几何变换	平移/旋转/缩放	📐	from-cyan-400 to-cyan-600	213	0	t	6-27	PROVINCIAL	6	3	2026-01-30 16:29:53.119	2026-02-01 12:20:42.521	\N	\N	\N	\N	\N	\N	\N
c033880b-22ba-401c-ba38-efc32aa74491	多边形面积	叉积求和	📐	from-cyan-400 to-cyan-600	214	0	t	6-28	PROVINCIAL	6	4	2026-01-30 16:29:53.122	2026-02-01 12:20:42.965	\N	\N	\N	\N	\N	\N	\N
8a271029-3500-4753-aac1-c341003bef3c	数组	含数组下标、遍历、初始化	📝	from-green-400 to-green-600	6	0	t	1-06	CSP_J	1	5	2026-01-30 16:29:52.71	2026-02-01 12:18:21.432	\N	\N	\N	\N	\N	\N	\N
a45fda86-07ad-4636-86e5-571c61d1c49f	STL栈	括号匹配、表达式求值等应用	🏗️	from-blue-400 to-blue-600	23	0	t	2-05	CSP_S	2	5	2026-01-30 16:29:52.744	2026-02-01 12:18:33.1	\N	\N	\N	\N	\N	\N	\N
27af42c1-7355-4719-bbc4-ec0e86658d7f	平衡树Treap	插入、删除、查询排名	🏗️	from-blue-400 to-blue-600	40	0	t	2-22	PROVINCIAL	2	3	2026-01-30 16:29:52.776	2026-02-01 12:18:46.194	\N	\N	\N	\N	\N	\N	\N
b1c2ad77-e1d9-446e-a565-003d884ed78a	笛卡尔树	堆性质+BST性质	🏗️	from-blue-400 to-blue-600	43	0	t	2-25	PROVINCIAL	2	4	2026-01-30 16:29:52.782	2026-02-01 12:18:47.601	\N	\N	\N	\N	\N	\N	\N
eb5b289a-0704-429c-8b05-134faa545698	可持久化字典树	历史版本前缀查询	🏗️	from-blue-400 to-blue-600	57	0	t	2-39	IOI	2	3	2026-01-30 16:29:52.81	2026-02-01 12:18:58.926	\N	\N	\N	\N	\N	\N	\N
f55b1082-d016-44fd-a6e4-e064cf63121d	倍增算法	快速幂、LCA预处理	⚡	from-yellow-400 to-yellow-600	75	0	t	3-18	CSP_S	3	4	2026-01-30 16:29:52.843	2026-02-01 12:19:10.879	\N	\N	\N	\N	\N	\N	\N
a4f5277b-9f26-4857-9d95-7b8d098fffb7	四边形不等式优化	区间DP优化	⚡	from-yellow-400 to-yellow-600	85	0	t	3-28	PROVINCIAL	3	3	2026-01-30 16:29:52.862	2026-02-01 12:19:20.492	\N	\N	\N	\N	\N	\N	\N
3bbebebb-83a9-4702-8e80-23469aeee7fb	启发式合并	合并集合/树，复杂度优化	⚡	from-yellow-400 to-yellow-600	97	0	t	3-40	PROVINCIAL	3	4	2026-01-30 16:29:52.885	2026-02-01 12:19:26.188	\N	\N	\N	\N	\N	\N	\N
0ee04dee-a689-41d4-9555-276de14a9a17	线性筛	线性时间找质数，同时求欧拉函数	🔢	from-purple-400 to-purple-600	116	0	t	4-10	CSP_S	4	5	2026-01-30 16:29:52.925	2026-02-01 12:19:38.248	\N	\N	\N	\N	\N	\N	\N
842d22e0-a037-4584-88cd-c16094bbd8ae	矩阵快速幂	线性递推优化、DP优化	🔢	from-purple-400 to-purple-600	127	0	t	4-21	PROVINCIAL	4	5	2026-01-30 16:29:52.948	2026-02-01 12:19:45.07	\N	\N	\N	\N	\N	\N	\N
170da289-839c-4fd2-9955-598a7b81aae5	容斥原理	计数问题去重	🔢	from-purple-400 to-purple-600	143	0	t	4-37	PROVINCIAL	4	4	2026-01-30 16:29:52.978	2026-02-01 12:19:56.988	\N	\N	\N	\N	\N	\N	\N
a81f60eb-04bc-465f-a6df-2d603e45ff16	Johnson最短路	带负权边的全源最短路	🕸️	from-red-400 to-red-600	159	0	t	5-09	PROVINCIAL	5	3	2026-01-30 16:29:53.009	2026-02-01 12:20:06.758	\N	\N	\N	\N	\N	\N	\N
f33943a0-885c-4d06-92dc-94d078eee315	最小割	最大流最小割定理	🕸️	from-red-400 to-red-600	170	0	t	5-20	PROVINCIAL	5	4	2026-01-30 16:29:53.031	2026-02-01 12:20:13.899	\N	\N	\N	\N	\N	\N	\N
ddf8d759-cc27-44c9-9ebc-37b49c86301c	多重匹配	多对多匹配问题	🕸️	from-red-400 to-red-600	174	0	t	5-24	PROVINCIAL	5	3	2026-01-30 16:29:53.04	2026-02-01 12:20:17.071	\N	\N	\N	\N	\N	\N	\N
bf8dd7d5-d77e-4fef-9e80-60f0ef91f8a9	KMP进阶	循环节、最小表示法	📐	from-cyan-400 to-cyan-600	190	0	t	6-04	CSP_S	6	4	2026-01-30 16:29:53.072	2026-02-01 12:20:27.751	\N	\N	\N	\N	\N	\N	\N
061fc565-fe2e-4e4b-89a4-01c0dd995944	距离计算	欧几里得/曼哈顿距离	📐	from-cyan-400 to-cyan-600	205	0	t	6-19	CSP_S	6	4	2026-01-30 16:29:53.102	2026-02-01 12:20:37.907	\N	\N	\N	\N	\N	\N	\N
260e3f52-d38f-4bf5-ac7d-b47b726a7f23	点在多边形内	射线法	📐	from-cyan-400 to-cyan-600	215	0	t	6-29	PROVINCIAL	6	4	2026-01-30 16:29:53.124	2026-02-01 12:20:43.525	\N	\N	\N	\N	\N	\N	\N
86c23e82-7202-4740-990c-936986e671f0	圆与直线相交	交点计算、相切判断	📐	from-cyan-400 to-cyan-600	216	0	t	6-30	IOI	6	3	2026-01-30 16:29:53.126	2026-02-01 12:20:44.17	\N	\N	\N	\N	\N	\N	\N
3f99f958-0878-49d2-b7e4-29047884cfc3	圆与圆相交	交点计算	📐	from-cyan-400 to-cyan-600	217	0	t	6-31	IOI	6	3	2026-01-30 16:29:53.128	2026-02-01 12:20:44.68	\N	\N	\N	\N	\N	\N	\N
ab2cf0dd-a8f2-4f1f-bb6a-71f5be6596eb	三维点向量	三维坐标、点积/叉积	📐	from-cyan-400 to-cyan-600	218	0	t	6-32	IOI	6	3	2026-01-30 16:29:53.13	2026-02-01 12:20:45.216	\N	\N	\N	\N	\N	\N	\N
309e2c18-44e8-4dc4-b242-53e57a7df9b3	三维凸包	三维点集的凸包	📐	from-cyan-400 to-cyan-600	219	0	t	6-33	IOI	6	3	2026-01-30 16:29:53.133	2026-02-01 12:20:46.11	\N	\N	\N	\N	\N	\N	\N
b56b03c8-9a54-4f9c-8560-3211efca5693	平面分割	直线/圆分割平面	📐	from-cyan-400 to-cyan-600	220	0	t	6-34	IOI	6	3	2026-01-30 16:29:53.135	2026-02-01 12:20:46.604	\N	\N	\N	\N	\N	\N	\N
628a680f-d8da-4d26-a21f-d2b64d828721	三角剖分	多边形三角剖分	📐	from-cyan-400 to-cyan-600	221	0	t	6-35	IOI	6	3	2026-01-30 16:29:53.138	2026-02-01 12:20:48.364	\N	\N	\N	\N	\N	\N	\N
61796ad5-4ffa-4efa-b47d-1dda37b1585f	最小圆覆盖	覆盖点集的最小圆	📐	from-cyan-400 to-cyan-600	222	0	t	6-36	IOI	6	3	2026-01-30 16:29:53.14	2026-02-01 12:20:48.781	\N	\N	\N	\N	\N	\N	\N
a96a9ec9-ed66-48eb-8f9b-dac2656350af	几何偏序	点集的偏序关系	📐	from-cyan-400 to-cyan-600	223	0	t	6-37	IOI	6	3	2026-01-30 16:29:53.142	2026-02-01 12:20:49.236	\N	\N	\N	\N	\N	\N	\N
26eff53e-cbe6-4320-93fd-4385b53d9973	闵可夫斯基和	凸包加法	📐	from-cyan-400 to-cyan-600	224	0	t	6-38	IOI	6	3	2026-01-30 16:29:53.144	2026-02-01 12:20:49.655	\N	\N	\N	\N	\N	\N	\N
fd1fe096-e8f1-4a16-b9ee-f0c2b0c6867b	SG函数	博弈论核心，组合游戏通用方法	🎮	from-orange-400 to-orange-600	225	0	t	7-01	PROVINCIAL	7	5	2026-01-30 16:29:53.147	2026-02-01 12:20:50.073	\N	\N	\N	\N	\N	\N	\N
44c0c9f4-5000-4bc8-ab84-f642223a02d5	Nim游戏	异或和、必胜/必败态	🎮	from-orange-400 to-orange-600	226	0	t	7-02	PROVINCIAL	7	4	2026-01-30 16:29:53.149	2026-02-01 12:20:50.592	\N	\N	\N	\N	\N	\N	\N
865aa4d9-4b87-468b-9638-6dcb98a1883e	阶梯博弈	阶梯上的Nim游戏	🎮	from-orange-400 to-orange-600	227	0	t	7-03	PROVINCIAL	7	3	2026-01-30 16:29:53.152	2026-02-01 12:20:51.157	\N	\N	\N	\N	\N	\N	\N
73a9d33d-0562-4eb5-8764-c4c349e36dc4	巴什博弈	取石子游戏，模运算求解	🎮	from-orange-400 to-orange-600	228	0	t	7-04	PROVINCIAL	7	3	2026-01-30 16:29:53.154	2026-02-01 12:20:51.639	\N	\N	\N	\N	\N	\N	\N
1eb8cb9e-f807-4369-930a-0f4e1104f6db	威佐夫博弈	两堆石子，黄金分割数	🎮	from-orange-400 to-orange-600	229	0	t	7-05	IOI	7	3	2026-01-30 16:29:53.157	2026-02-01 12:20:52.181	\N	\N	\N	\N	\N	\N	\N
d3188ade-a47e-4db5-8229-dce9f983c59d	反Nim游戏	取最后一个者输	🎮	from-orange-400 to-orange-600	230	0	t	7-06	IOI	7	3	2026-01-30 16:29:53.159	2026-02-01 12:20:53.001	\N	\N	\N	\N	\N	\N	\N
a4b74658-c5cc-4dcb-8b18-75aff72809c0	Alpha-Beta剪枝	对抗搜索、极大极小算法	🎮	from-orange-400 to-orange-600	231	0	t	7-07	IOI	7	3	2026-01-30 16:29:53.161	2026-02-01 12:20:53.509	\N	\N	\N	\N	\N	\N	\N
8a37c02b-e3ad-4de5-8329-5a22f4ec3b64	变量与基本数据类型	入门核心，含类型范围、转换	📝	from-green-400 to-green-600	1	0	t	1-01	CSP_J	1	5	2026-01-30 16:29:52.692	2026-02-01 12:20:53.74	[{"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    cout << \\"Hello, World!\\" << endl;\\n    return 0;\\n}", "title": "Hello World - 第一个程序", "language": "cpp", "explanation": "这是你的第一个C++程序！cout用于输出文字，endl表示换行。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int age = 10;\\n    int apples = 5;\\n    int score = 95;\\n    \\n    cout << \\"我的年龄是：\\" << age << \\"岁\\" << endl;\\n    cout << \\"我有\\" << apples << \\"个苹果\\" << endl;\\n    cout << \\"我的分数是：\\" << score << \\"分\\" << endl;\\n    \\n    return 0;\\n}", "title": "定义整型变量", "language": "cpp", "explanation": "int用于定义整数变量，可以存放年龄、数量、分数等整数。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    char grade = 'A';\\n    char firstLetter = 'X';\\n    char symbol = '+';\\n    \\n    cout << \\"成绩等级：\\" << grade << endl;\\n    cout << \\"首字母：\\" << firstLetter << endl;\\n    cout << \\"运算符号：\\" << symbol << endl;\\n    \\n    return 0;\\n}", "title": "定义字符型变量", "language": "cpp", "explanation": "char用于定义单个字符，用单引号括起来，如'A'、'X'、'+'。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    double height = 1.45;\\n    double weight = 35.5;\\n    double pi = 3.14159;\\n    \\n    cout << \\"身高：\\" << height << \\"米\\" << endl;\\n    cout << \\"体重：\\" << weight << \\"公斤\\" << endl;\\n    cout << \\"圆周率：\\" << pi << endl;\\n    \\n    return 0;\\n}", "title": "定义浮点型变量", "language": "cpp", "explanation": "double用于定义带小数点的数，可以存放身高、体重、价格等小数。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    bool isPass = true;\\n    bool isRainy = false;\\n    bool hasHomework = true;\\n    \\n    cout << \\"考试及格了吗？\\" << (isPass ? \\"是的\\" : \\"不是\\") << endl;\\n    cout << \\"今天下雨了吗？\\" << (isRainy ? \\"是的\\" : \\"不是\\") << endl;\\n    cout << \\"有作业吗？\\" << (hasHomework ? \\"有的\\" : \\"没有\\") << endl;\\n    \\n    return 0;\\n}", "title": "定义布尔型变量", "language": "cpp", "explanation": "bool用于定义真假值，只有true（真）和false（假）两个值。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int score = 85;\\n    cout << \\"初始分数：\\" << score << endl;\\n    \\n    score = 90;\\n    cout << \\"修改后分数：\\" << score << endl;\\n    \\n    score = score + 5;\\n    cout << \\"加5分后：\\" << score << endl;\\n    \\n    score += 10;\\n    cout << \\"再加10分：\\" << score << endl;\\n    \\n    return 0;\\n}", "title": "变量赋值和修改", "language": "cpp", "explanation": "变量的值可以随时修改。score = score + 5表示score增加5，score += 10是简写形式。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int chinese = 85;\\n    int math = 92;\\n    int english = 88;\\n    double average;\\n    \\n    average = (chinese + math + english) / 3.0;\\n    \\n    cout << \\"语文：\\" << chinese << \\"分\\" << endl;\\n    cout << \\"数学：\\" << math << \\"分\\" << endl;\\n    cout << \\"英语：\\" << english << \\"分\\" << endl;\\n    cout << \\"平均分：\\" << average << \\"分\\" << endl;\\n    \\n    return 0;\\n}", "title": "计算平均分", "language": "cpp", "explanation": "计算平均分时要注意除以3.0而不是3，这样才能得到小数结果。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int score = 75;\\n    bool isPass;\\n    \\n    isPass = (score >= 60);\\n    \\n    cout << \\"考试分数：\\" << score << \\"分\\" << endl;\\n    if (isPass) {\\n        cout << \\"恭喜你，及格了！\\" << endl;\\n    } else {\\n        cout << \\"很遗憾，没有及格。\\" << endl;\\n    }\\n    \\n    return 0;\\n}", "title": "判断是否及格", "language": "cpp", "explanation": "使用布尔型变量存储判断结果，然后用if语句进行条件判断。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    string name = \\"小明\\";\\n    int age = 10;\\n    char grade = 'A';\\n    double height = 1.45;\\n    double weight = 35.5;\\n    bool likesProgramming = true;\\n    \\n    cout << \\"===== 学生信息 =====\\" << endl;\\n    cout << \\"姓名：\\" << name << endl;\\n    cout << \\"年龄：\\" << age << \\"岁\\" << endl;\\n    cout << \\"身高：\\" << height << \\"米\\" << endl;\\n    cout << \\"体重：\\" << weight << \\"公斤\\" << endl;\\n    cout << \\"成绩等级：\\" << grade << endl;\\n    cout << \\"喜欢编程：\\" << (likesProgramming ? \\"是\\" : \\"否\\") << endl;\\n    \\n    return 0;\\n}", "title": "综合示例：学生信息", "language": "cpp", "explanation": "综合使用各种数据类型，展示一个完整的学生信息。注意string类型用于存放字符串。"}]	{忘记初始化变量，导致变量的值不确定,"用双引号括起字符，应该用单引号：char grade = \\"A\\"（错误）→ char grade = 'A'（正确）","把小数赋给整型：int age = 10.5（错误）→ double age = 10.5（正确）","重复定义同名变量：int age = 10; int age = 12;（错误）→ int age = 10; age = 12;（正确）",忘记包含头文件：使用cout和endl需要包含<iostream>,"忘记using namespace std;，需要写成std::cout","计算平均分时除以整数导致结果也是整数：(a+b+c)/3（错误）→ (a+b+c)/3.0（正确）","变量名没有意义：用a、b、c作为变量名（不推荐）→ 用age、score、name（推荐）","混淆字符和字符串：char name = \\"Tom\\"（错误）→ string name = \\"Tom\\"（正确）","忘记return 0;在main函数末尾"}	# 变量与基本数据类型\n\n## 📚 什么是变量？\n\n想象一下，你的书包里有很多小盒子，每个盒子上都贴着标签。你可以往盒子里放东西，也可以从盒子里拿东西。在编程中，**变量**就像这些小盒子！\n\n### 🎯 变量的作用\n\n- **存储数据**：像盒子一样，可以存放各种信息\n- **方便使用**：给盒子起个名字，以后就能通过名字找到它\n- **可以改变**：盒子里装的东西可以随时更换\n\n### 📝 变量的命名规则\n\n给变量起名字就像给你的小宠物起名字一样，有一些规则要遵守：\n\n✅ **正确的命名**：\n- `age` - 年龄\n- `name` - 名字\n- `score1` - 第一个分数\n- `my_score` - 我的分数\n\n❌ **错误的命名**：\n- `1st` - 不能以数字开头\n- `my name` - 不能有空格\n- `class` - 不能使用特殊关键字\n- `a` - 太简单，不清楚是什么意思\n\n## 🔢 基本数据类型\n\n在C++中，我们最常用的有四种基本数据类型，就像四种不同大小的盒子：\n\n### 1️⃣ 整型（int）- 整数盒子\n\n**用途**：存放整数，比如年龄、数量、分数等\n\n**特点**：\n- 只能存放整数（没有小数点）\n- 范围大约是 -20亿 到 +20亿\n- 最常用的数据类型\n\n**示例**：\n```cpp\nint age = 10;           // 年龄是10岁\nint apples = 5;         // 有5个苹果\nint score = 95;         // 考了95分\nint students = 30;      // 班里有30个学生\n```\n\n**生活中的例子**：\n- 你今年几岁？→ 用 `int` 存放\n- 班里有几个同学？→ 用 `int` 存放\n- 你考试得了多少分？→ 用 `int` 存放\n\n---\n\n### 2️⃣ 字符型（char）- 单个字符盒子\n\n**用途**：存放单个字符，比如字母、数字、符号\n\n**特点**：\n- 只能存放**一个**字符\n- 用单引号括起来：`'A'`\n- 也可以存放数字字符：`'5'`\n\n**示例**：\n```cpp\nchar grade = 'A';       // 成绩等级是A\nchar firstLetter = 'X'; // 名字首字母是X\nchar symbol = '+';      // 符号是加号\nchar digit = '5';       // 数字字符5\n```\n\n**生活中的例子**：\n- 你的成绩等级（A、B、C）→ 用 `char` 存放\n- 你的名字首字母 → 用 `char` 存放\n- 数学运算符号（+、-、*、/）→ 用 `char` 存放\n\n**⚠️ 注意**：\n- `char` 存放的是字符，不是数字！\n- `'5'` 是字符，`5` 是数字\n- `'A'` 是字符，`A` 是变量名\n\n---\n\n### 3️⃣ 浮点型（double）- 小数盒子\n\n**用途**：存放带小数点的数，比如身高、体重、成绩\n\n**特点**：\n- 可以存放小数\n- 比整型更精确\n- 范围更大\n\n**示例**：\n```cpp\ndouble height = 1.45;     // 身高1.45米\ndouble weight = 35.5;     // 体重35.5公斤\ndouble pi = 3.14159;      // 圆周率\ndouble score = 89.5;      // 考了89.5分\ndouble price = 12.99;     // 价格12.99元\n```\n\n**生活中的例子**：\n- 你的身高是多少米？→ 用 `double` 存放\n- 你的体重是多少公斤？→ 用 `double` 存放\n- 圆周率是多少？→ 用 `double` 存放\n- 商品价格是多少？→ 用 `double` 存放\n\n**💡 小知识**：\n- `double` 是"双精度浮点数"的意思\n- 还有 `float` 类型，但 `double` 更常用、更精确\n- `double` 可以存放很大的数，也可以存放很小的小数\n\n---\n\n### 4️⃣ 布尔型（bool）- 真假盒子\n\n**用途**：存放"是"或"否"这样的判断结果\n\n**特点**：\n- 只有两个值：`true`（真）或 `false`（假）\n- 用于条件判断\n- 就像回答"是"或"否"\n\n**示例**：\n```cpp\nbool isPass = true;       // 考试通过了\nbool isRainy = false;     // 今天没有下雨\nbool hasHomework = true;  // 有作业\nbool isWeekend = false;   // 今天不是周末\n```\n\n**生活中的例子**：\n- 你今天完成作业了吗？→ 用 `bool` 存放\n- 今天是周末吗？→ 用 `bool` 存放\n- 外面在下雨吗？→ 用 `bool` 存放\n- 考试及格了吗？→ 用 `bool` 存放\n\n**💡 小知识**：\n- `true` 等于 `1`\n- `false` 等于 `0`\n- 布尔型在条件判断中非常重要\n\n---\n\n## 🎯 如何选择合适的数据类型？\n\n| 情况                 | 选择类型 | 示例                  ||----------------------|----------|-----------------------|| 整数（年龄、数量）   | int      | int age = 10;         || 单个字符（字母、符号）| char     | char grade = 'A';     || 小数（身高、体重）   | double   | double height = 1.45; || 是/否判断            | bool     | bool isPass = true;   |\n\n---\n\n## 📝 变量的定义和使用\n\n### 定义变量\n\n定义变量就像准备一个盒子并贴上标签：\n\n```cpp\nint age = 10;           // 定义一个整型变量age，初始值是10\nchar grade = 'A';       // 定义一个字符型变量grade，初始值是'A'\ndouble height = 1.45;   // 定义一个浮点型变量height，初始值是1.45\nbool isPass = true;     // 定义一个布尔型变量isPass，初始值是true\n```\n\n### 使用变量\n\n定义后，就可以使用变量了：\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // 定义变量\n    int age = 10;\n    char grade = 'A';\n    double height = 1.45;\n    bool isPass = true;\n\n    // 输出变量的值\n    cout << "我的年龄是：" << age << "岁" << endl;\n    cout << "我的成绩等级是：" << grade << endl;\n    cout << "我的身高是：" << height << "米" << endl;\n    cout << "我考试及格了吗？" << (isPass ? "是的" : "不是") << endl;\n\n    return 0;\n}\n```\n\n---\n\n## 🔧 变量的赋值\n\n变量的值可以随时改变，就像盒子里可以换不同的东西：\n\n```cpp\nint score = 85;      // 初始分数是85\ncout << score << endl;  // 输出：85\n\nscore = 90;          // 分数改为90\ncout << score << endl;  // 输出：90\n\nscore = score + 5;   // 分数加5，现在是95\ncout << score << endl;  // 输出：95\n```\n\n---\n\n## 🎮 实战练习\n\n### 练习1：自我介绍小程序\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // 定义变量\n    int age = 10;\n    char grade = 'A';\n    double height = 1.45;\n    bool likesProgramming = true;\n\n    // 输出自我介绍\n    cout << "===== 自我介绍 =====" << endl;\n    cout << "大家好！" << endl;\n    cout << "我今年" << age << "岁" << endl;\n    cout << "我的身高是" << height << "米" << endl;\n    cout << "我的成绩等级是" << grade << endl;\n    cout << "我喜欢编程吗？" << (likesProgramming ? "是的！" : "不是") << endl;\n\n    return 0;\n}\n```\n\n### 练习2：计算平均分\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // 定义变量\n    int chinese = 85;\n    int math = 92;\n    int english = 88;\n    double average;\n\n    // 计算平均分\n    average = (chinese + math + english) / 3.0;\n\n    // 输出结果\n    cout << "===== 成绩单 =====" << endl;\n    cout << "语文：" << chinese << "分" << endl;\n    cout << "数学：" << math << "分" << endl;\n    cout << "英语：" << english << "分" << endl;\n    cout << "平均分：" << average << "分" << endl;\n\n    return 0;\n}\n```\n\n### 练习3：判断是否及格\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // 定义变量\n    int score = 75;\n    bool isPass;\n\n    // 判断是否及格\n    isPass = (score >= 60);\n\n    // 输出结果\n    cout << "考试分数：" << score << "分" << endl;\n    cout << "是否及格：" << (isPass ? "及格" : "不及格") << endl;\n\n    return 0;\n}\n```\n\n---\n\n## ⚠️ 常见错误\n\n### 错误1：忘记初始化变量\n\n❌ **错误写法**：\n```cpp\nint age;\ncout << age << endl;  // age的值不确定！\n```\n\n✅ **正确写法**：\n```cpp\nint age = 10;  // 给变量一个初始值\ncout << age << endl;\n```\n\n### 错误2：类型不匹配\n\n❌ **错误写法**：\n```cpp\nint age = 10.5;  // 不能把小数赋给整型\nchar grade = "A"; // 不能用双引号，应该用单引号\n```\n\n✅ **正确写法**：\n```cpp\nint age = 10;     // 整数用整型\nchar grade = 'A';  // 字符用单引号\ndouble height = 10.5;  // 小数用浮点型\n```\n\n### 错误3：变量名重复\n\n❌ **错误写法**：\n```cpp\nint age = 10;\nint age = 12;  // 不能重复定义同名变量\n```\n\n✅ **正确写法**：\n```cpp\nint age = 10;\nage = 12;  // 直接赋值，不要重复定义\n```\n\n---\n\n## 💡 学习小贴士\n\n1. **命名要有意义**：给变量起一个清楚的名字，比如 `age` 比 `a` 更好\n2. **初始化变量**：定义变量时最好初始化，给一个初始值\n3. **选择合适的类型**：根据数据的特点选择合适的数据类型\n4. **多练习**：多写代码，多尝试不同的变量类型\n5. **理解概念**：不要死记硬背，要理解每个类型的特点和用途\n\n---\n\n## 🎓 总结\n\n今天我们学习了：\n\n- ✅ **变量**：像盒子一样存储数据的容器\n- ✅ **整型（int）**：存放整数\n- ✅ **字符型（char）**：存放单个字符\n- ✅ **浮点型（double）**：存放小数\n- ✅ **布尔型（bool）**：存放真假值\n- ✅ **变量命名规则**：要有意义、不能以数字开头、不能有空格\n- ✅ **变量的定义和使用**：如何定义、赋值、使用变量\n\n**记住**：选择合适的数据类型就像选择合适的盒子装东西一样重要！\n\n---\n\n## 🚀 下一步\n\n掌握了变量和数据类型后，你就可以：\n- 学习运算符，对变量进行计算\n- 学习输入输出，让程序和用户交互\n- 开始编写更复杂的程序\n\n继续加油，编程世界的大门已经为你打开！🎉\n	120	[{"url": "https://www.runoob.com/cplusplus/cpp-variables.html", "title": "C++ 变量与数据类型详解"}, {"url": "https://www.runoob.com/cplusplus/cpp-data-types.html", "title": "C++ 基本数据类型"}, {"url": "https://www.runoob.com/cplusplus/cpp-variable-names.html", "title": "C++ 变量命名规则"}]	{变量名要有意义，比如用age表示年龄，用score表示分数,定义变量时最好初始化，给一个初始值,根据数据的特点选择合适的数据类型,整数用int，小数用double，单个字符用char，真假判断用bool,字符要用单引号括起来，如'A',"字符串要用双引号括起来，如\\"Hello\\"",注意区分字符和数字：'5'是字符，5是数字,布尔型的true等于1，false等于0,变量名不能以数字开头，不能包含空格,不要使用C++的关键字作为变量名}	https://www.bilibili.com/video/BV1et411b73Z
3da91943-dffe-49e9-b5dd-d5657c0a8196	运算符与表达式	含运算符优先级、结合性	📝	from-green-400 to-green-600	2	0	t	1-02	CSP_J	1	5	2026-01-30 16:29:52.698	2026-02-01 12:20:55.108	[{"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int a = 10, b = 3;\\n    \\n    cout << \\"a + b = \\" << a + b << endl;      // 13\\n    cout << \\"a - b = \\" << a - b << endl;      // 7\\n    cout << \\"a * b = \\" << a * b << endl;      // 30\\n    cout << \\"a / b = \\" << a / b << endl;      // 3（整数除法）\\n    cout << \\"a % b = \\" << a % b << endl;      // 1\\n    \\n    return 0;\\n}", "title": "基本算术运算", "language": "cpp", "explanation": "展示了五种基本算术运算符的使用，注意整数除法的结果仍然是整数。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int a = 5;\\n    int b, c;\\n    \\n    // 后自增：先使用a的值，再增加1\\n    b = a++;\\n    cout << \\"b = a++ 后：\\" << endl;\\n    cout << \\"b = \\" << b << endl;  // 5\\n    cout << \\"a = \\" << a << endl;  // 6\\n    \\n    // 前自增：先增加1，再使用a的值\\n    c = ++a;\\n    cout << \\"c = ++a 后：\\" << endl;\\n    cout << \\"c = \\" << c << endl;  // 7\\n    cout << \\"a = \\" << a << endl;  // 7\\n    \\n    return 0;\\n}", "title": "自增自减运算符", "language": "cpp", "explanation": "展示了自增运算符的两种形式：后自增(a++)和前自增(++a)，它们的执行顺序不同。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int age = 10;\\n    int score = 85;\\n    \\n    cout << \\"age < 18: \\" << (age < 18) << endl;        // 1（true）\\n    cout << \\"score >= 60: \\" << (score >= 60) << endl;  // 1（true）\\n    cout << \\"age == 10: \\" << (age == 10) << endl;      // 1（true）\\n    cout << \\"score != 100: \\" << (score != 100) << endl; // 1（true）\\n    \\n    return 0;\\n}", "title": "关系运算符", "language": "cpp", "explanation": "展示了关系运算符的使用，用于比较两个值的大小关系，结果是布尔值。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    bool hasHomework = true;\\n    bool isWeekend = false;\\n    bool isChild = true;\\n    \\n    cout << \\"!hasHomework: \\" << !hasHomework << endl;                // 0（false）\\n    cout << \\"isWeekend || isChild: \\" << (isWeekend || isChild) << endl; // 1（true）\\n    cout << \\"hasHomework && isChild: \\" << (hasHomework && isChild) << endl; // 1（true）\\n    \\n    return 0;\\n}", "title": "逻辑运算符", "language": "cpp", "explanation": "展示了逻辑运算符的使用，用于连接多个条件进行逻辑判断。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int a = 10;\\n    \\n    cout << \\"初始值: a = \\" << a << endl;  // 10\\n    \\n    a += 5;  // 等价于 a = a + 5\\n    cout << \\"a += 5: \\" << a << endl;      // 15\\n    \\n    a -= 3;  // 等价于 a = a - 3\\n    cout << \\"a -= 3: \\" << a << endl;      // 12\\n    \\n    a *= 2;  // 等价于 a = a * 2\\n    cout << \\"a *= 2: \\" << a << endl;      // 24\\n    \\n    a /= 4;  // 等价于 a = a / 4\\n    cout << \\"a /= 4: \\" << a << endl;      // 6\\n    \\n    return 0;\\n}", "title": "复合赋值运算符", "language": "cpp", "explanation": "展示了复合赋值运算符的使用，它们是赋值运算符和算术运算符的结合，使代码更简洁。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int a = 10, b = 3, c = 2;\\n    \\n    // 先乘除后加减\\n    cout << \\"a + b * c = \\" << a + b * c << endl;       // 16\\n    \\n    // 括号改变优先级\\n    cout << \\"(a + b) * c = \\" << (a + b) * c << endl;   // 26\\n    \\n    // 混合运算\\n    cout << \\"a * b + c / b = \\" << a * b + c / b << endl; // 30\\n    \\n    return 0;\\n}", "title": "运算符优先级", "language": "cpp", "explanation": "展示了运算符的优先级，先乘除后加减，括号可以改变运算顺序。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int chinese, math, english;\\n    int total;\\n    double average;\\n    \\n    cout << \\"请输入语文分数：\\" ;\\n    cin >> chinese;\\n    \\n    cout << \\"请输入数学分数：\\" ;\\n    cin >> math;\\n    \\n    cout << \\"请输入英语分数：\\" ;\\n    cin >> english;\\n    \\n    total = chinese + math + english;\\n    average = total / 3.0;\\n    \\n    cout << \\"总分：\\" << total << \\"分\\" << endl;\\n    cout << \\"平均分：\\" << average << \\"分\\" << endl;\\n    \\n    return 0;\\n}", "title": "表达式的应用：计算总分和平均分", "language": "cpp", "explanation": "展示了表达式在实际问题中的应用，计算学生的总分和平均分。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int year;\\n    bool isLeapYear;\\n    \\n    cout << \\"请输入年份：\\" ;\\n    cin >> year;\\n    \\n    // 闰年的判断条件：能被4整除但不能被100整除，或者能被400整除\\n    isLeapYear = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);\\n    \\n    if (isLeapYear) {\\n        cout << year << \\"年是闰年\\" << endl;\\n    } else {\\n        cout << year << \\"年不是闰年\\" << endl;\\n    }\\n    \\n    return 0;\\n}", "title": "表达式的应用：判断是否为闰年", "language": "cpp", "explanation": "展示了如何使用复杂的逻辑表达式来判断一个年份是否为闰年。"}]	{"混淆赋值运算符=和等于运算符==：if (a = 5)（错误）→ if (a == 5)（正确）","整数除法的结果还是整数，忘记转换为浮点数：int a=10, b=3; double c=a/b;（结果是3.0，错误）→ double c=(double)a/b;（正确）","使用取模运算符%处理浮点数：double a=10.5, b=3.2; a%b;（错误）→ 只能用于整数",忽略运算符优先级，导致计算结果错误：3+5*2（结果是13，不是16）,在逻辑表达式中使用单个&或|，它们是位运算符，不是逻辑运算符,"在复合赋值运算符中忘记变量名：a += 5;（正确）→ += 5;（错误）","自增自减运算符的滥用，导致代码可读性差：a = ++b + c--;（不推荐）",在表达式中混合使用不同类型的变量，导致类型转换错误,忘记在关系表达式和逻辑表达式周围添加括号，导致优先级错误,"在条件判断中直接使用赋值表达式，而不是关系表达式：if (a = 5)（错误，总是为真）→ if (a == 5)（正确）"}	# 运算符与表达式\n\n## 📚 什么是运算符和表达式？\n\n想象一下，你在做数学题的时候，需要用到加号(+)、减号(-)、乘号(×)、除号(÷)等符号。在编程中，这些符号被称为**运算符**！\n\n而**表达式**就是用运算符把变量和常量连接起来的式子，就像数学中的算式一样。\n\n### 🎯 运算符的作用\n\n- **进行计算**：像数学中的运算符号一样，用于计算数值\n- **比较大小**：比较两个值的大小关系\n- **逻辑判断**：进行"与"、"或"、"非"等逻辑运算\n- **赋值操作**：给变量赋值或修改变量的值\n\n## 🔢 算术运算符 - 数学计算小助手\n\n算术运算符就像你数学课上学的运算符号，用于进行数学计算：\n\n### 1️⃣ 基本算术运算符\n\n| 运算符 | 名称 | 作用 | 示例 | 结果 |\n| :---: | :--- | :--- | :--- | :--- |\n| `+` | 加号 | 加法 | `3 + 5` | `8` |\n| `-` | 减号 | 减法 | `10 - 3` | `7` |\n| `*` | 乘号 | 乘法 | `4 * 6` | `24` |\n| `/` | 除号 | 除法 | `15 / 3` | `5` |\n| `%` | 取模 | 求余数 | `17 % 5` | `2` |\n\n### 2️⃣ 自增自减运算符\n\n| 运算符 | 名称 | 作用 | 示例 | 结果 |\n| :---: | :--- | :--- | :--- | :--- |\n| `++` | 自增 | 变量值加1 | `i++` | 先使用i，再加1 |\n| `--` | 自减 | 变量值减1 | `i--` | 先使用i，再减1 |\n| `++i` | 前自增 | 变量值加1 | `++i` | 先加1，再使用i |\n| `--i` | 前自减 | 变量值减1 | `--i` | 先减1，再使用i |\n\n**生活中的例子**：\n- 你有5个苹果，妈妈又给了你3个，现在有几个？→ `5 + 3`\n- 你有10元钱，买了一个3元的冰淇淋，还剩多少钱？→ `10 - 3`\n- 你每天存4元钱，存6天，一共存了多少钱？→ `4 * 6`\n- 15个糖果分给3个小朋友，每个小朋友分几个？→ `15 / 3`\n- 17个同学站队，每队5人，剩下几人？→ `17 % 5`\n\n## 🔄 赋值运算符 - 变量的小助手\n\n赋值运算符用于给变量赋值，最基本的就是等号(`=`)。\n\n### 基本赋值运算符\n\n| 运算符 | 名称 | 作用 | 示例 | 等价于 |\n| :---: | :--- | :--- | :--- | :--- |\n| `=` | 赋值 | 将右边的值赋给左边 | `a = 5` | - |\n| `+=` | 加赋值 | 先加后赋值 | `a += 3` | `a = a + 3` |\n| `-=` | 减赋值 | 先减后赋值 | `a -= 2` | `a = a - 2` |\n| `*=` | 乘赋值 | 先乘后赋值 | `a *= 4` | `a = a * 4` |\n| `/=` | 除赋值 | 先除后赋值 | `a /= 2` | `a = a / 2` |\n| `%=` | 取模赋值 | 先取模后赋值 | `a %= 3` | `a = a % 3` |\n\n**生活中的例子**：\n- 妈妈给了你5元零花钱：`money = 5`\n- 你又得到了3元压岁钱：`money += 3`\n- 你花了2元买零食：`money -= 2`\n\n## 📏 关系运算符 - 比较大小的小裁判\n\n关系运算符用于比较两个值的大小关系，结果是布尔值（`true`或`false`）。\n\n### 关系运算符列表\n\n| 运算符 | 名称 | 作用 | 示例 | 结果 |\n| :---: | :--- | :--- | :--- | :--- |\n| `==` | 等于 | 判断两边是否相等 | `5 == 5` | `true` |\n| `!=` | 不等于 | 判断两边是否不相等 | `5 != 3` | `true` |\n| `>` | 大于 | 判断左边是否大于右边 | `5 > 3` | `true` |\n| `<` | 小于 | 判断左边是否小于右边 | `3 < 5` | `true` |\n| `>=` | 大于等于 | 判断左边是否大于等于右边 | `5 >= 5` | `true` |\n| `<=` | 小于等于 | 判断左边是否小于等于右边 | `3 <= 5` | `true` |\n\n**生活中的例子**：\n- 你今年10岁，哥哥今年12岁，你是否比哥哥小？→ `10 < 12` → `true`\n- 你有5个苹果，弟弟有5个苹果，你们的苹果数量是否相等？→ `5 == 5` → `true`\n- 你的考试分数是85分，是否及格（60分以上）？→ `85 >= 60` → `true`\n\n## ⚖️ 逻辑运算符 - 逻辑判断的小专家\n\n逻辑运算符用于连接多个条件，进行逻辑判断，结果也是布尔值。\n\n### 逻辑运算符列表\n\n| 运算符 | 名称 | 作用 | 示例 | 结果 |\n| :---: | :--- | :--- | :--- | :--- |\n| `&&` | 逻辑与 | 两个条件都为真时，结果才为真 | `true && true` | `true` |\n| `||` | 逻辑或 | 两个条件中只要有一个为真，结果就为真 | `true || false` | `true` |\n| `!` | 逻辑非 | 取反，真变假，假变真 | `!true` | `false` |\n\n**生活中的例子**：\n- 你想出去玩，需要满足两个条件：作业写完了，天气好。→ `(作业写完了) && (天气好)`\n- 你可以选择两种交通方式去上学：坐公交车或者步行。→ `(坐公交车) || (步行)`\n- 妈妈说："如果你不写完作业，就不能看电视。" → `!(写完作业) → 不能看电视`\n\n## 📝 表达式 - 运算符的组合\n\n**表达式**就是用运算符把变量、常量连接起来的式子，就像数学中的算式一样。\n\n### 表达式的类型\n\n1. **算术表达式**：用算术运算符连接的表达式，结果是数值\n   - 示例：`3 + 5 * 2` → 结果是13\n\n2. **关系表达式**：用关系运算符连接的表达式，结果是布尔值\n   - 示例：`age >= 18` → 结果是true或false\n\n3. **逻辑表达式**：用逻辑运算符连接的表达式，结果是布尔值\n   - 示例：`(age >= 18) && (hasID == true)` → 结果是true或false\n\n4. **赋值表达式**：用赋值运算符连接的表达式，结果是赋值后的值\n   - 示例：`a = 3 + 5` → 结果是8，同时a的值变为8\n\n### 运算符的优先级\n\n就像数学中的运算顺序一样，C++中的运算符也有优先级：\n\n1. **括号**：`()` → 最高优先级，先计算括号里的内容\n2. **自增自减**：`++`、`--` → 其次\n3. **算术运算符**：`*`、`/`、`%` 高于 `+`、`-`\n4. **关系运算符**：`>`、`<`、`>=`、`<=` 高于 `==`、`!=`\n5. **逻辑运算符**：`!` 高于 `&&` 高于 `||`\n6. **赋值运算符**：`=`、`+=`、`-=` 等 → 最低优先级\n\n**生活中的例子**：\n- 数学中：先乘除后加减，有括号先算括号里的\n- C++中：同样的道理，`3 + 5 * 2` 先算 `5 * 2`，再算 `3 + 10`，结果是13\n\n## 💡 表达式的计算\n\n### 算术表达式的计算\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 10, b = 3;\n    \n    cout << "a + b = " << a + b << endl;      // 13\n    cout << "a - b = " << a - b << endl;      // 7\n    cout << "a * b = " << a * b << endl;      // 30\n    cout << "a / b = " << a / b << endl;      // 3（整数除法）\n    cout << "a % b = " << a % b << endl;      // 1\n    \n    double c = 10.0, d = 3.0;\n    cout << "c / d = " << c / d << endl;      // 3.33333（浮点数除法）\n    \n    return 0;\n}\n```\n\n### 关系表达式和逻辑表达式的计算\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int age = 10;\n    bool hasHomework = true;\n    bool isWeekend = false;\n    \n    // 关系表达式\n    bool isChild = (age < 18);\n    cout << "是否是儿童：" << isChild << endl;      // 1（true）\n    \n    // 逻辑表达式\n    bool canPlay = (!hasHomework) && (isWeekend || (age < 12));\n    cout << "是否可以玩：" << canPlay << endl;       // 1（true）\n    \n    return 0;\n}\n```\n\n### 赋值表达式的计算\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 10;\n    \n    cout << "a = " << a << endl;        // 10\n    \n    a += 5;                             // 等价于 a = a + 5\n    cout << "a += 5 后：" << a << endl;  // 15\n    \n    a *= 2;                             // 等价于 a = a * 2\n    cout << "a *= 2 后：" << a << endl;  // 30\n    \n    a /= 3;                             // 等价于 a = a / 3\n    cout << "a /= 3 后：" << a << endl;  // 10\n    \n    return 0;\n}\n```\n\n## 🔄 自增自减运算符的使用\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 5;\n    int b, c;\n    \n    // 后自增：先使用a的值，再增加1\n    b = a++;\n    cout << "b = a++ 后：" << endl;\n    cout << "b = " << b << endl;  // 5\n    cout << "a = " << a << endl;  // 6\n    \n    // 前自增：先增加1，再使用a的值\n    c = ++a;\n    cout << "c = ++a 后：" << endl;\n    cout << "c = " << c << endl;  // 7\n    cout << "a = " << a << endl;  // 7\n    \n    return 0;\n}\n```\n\n## 🎯 表达式的应用\n\n### 计算圆的面积\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    double radius = 5.0;\n    double pi = 3.14159;\n    double area;\n    \n    area = pi * radius * radius;\n    \n    cout << "圆的半径：" << radius << endl;\n    cout << "圆的面积：" << area << endl;\n    \n    return 0;\n}\n```\n\n### 计算 BMI 指数\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    double weight, height, bmi;\n    \n    cout << "请输入体重（公斤）：" ;\n    cin >> weight;\n    \n    cout << "请输入身高（米）：" ;\n    cin >> height;\n    \n    bmi = weight / (height * height);\n    \n    cout << "你的BMI指数：" << bmi << endl;\n    \n    if (bmi < 18.5) {\n        cout << "体重偏轻" << endl;\n    } else if (bmi < 24) {\n        cout << "体重正常" << endl;\n    } else {\n        cout << "体重偏重" << endl;\n    }\n    \n    return 0;\n}\n```\n\n## 📚 运算符和表达式的总结\n\n- **运算符**：用于进行各种操作的符号，包括算术、赋值、关系、逻辑等\n- **表达式**：用运算符连接变量和常量的式子，有不同的类型\n- **优先级**：运算符的计算顺序，括号优先级最高\n- **结合性**：当多个同优先级的运算符出现时，计算的方向\n\n运算符就像编程中的魔法棒，让你的程序能够进行各种计算和判断，是编程的基础之一！\n	120	[{"url": "https://www.runoob.com/cplusplus/cpp-operators.html", "title": "C++ 运算符详解"}, {"url": "https://www.runoob.com/cplusplus/cpp-expressions.html", "title": "C++ 表达式"}, {"url": "https://www.runoob.com/cplusplus/cpp-precedence.html", "title": "C++ 运算符优先级"}]	{注意整数除法和浮点数除法的区别：10/3=3（整数），10.0/3=3.333...（浮点数）,取模运算符%只能用于整数，不能用于浮点数,自增自减运算符有前自增和后自增之分，执行顺序不同,关系运算符中的等于号是==，而不是=（赋值运算符）,逻辑运算符&&和||有短路求值的特性：如果&&左边为false，右边不会计算；如果||左边为true，右边不会计算,使用括号可以改变运算符的优先级，使表达式更清晰,复合赋值运算符（如+=、-=）比普通赋值运算符更简洁高效,"运算符优先级：括号 > 自增自减 > 算术 > 关系 > 逻辑 > 赋值",表达式的计算结果类型取决于运算符和操作数的类型,在复杂表达式中，使用括号可以提高代码的可读性}	https://www.bilibili.com/video/BV1et411b73Z
ac136adb-9302-4c20-b143-bde1a4fb5644	输入输出	基础输入输出，含格式控制	📝	from-green-400 to-green-600	3	0	t	1-03	CSP_J	1	5	2026-01-30 16:29:52.702	2026-02-01 12:20:56.251	[{"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    cout << \\"Hello, World!\\" << endl;\\n    cout << \\"你好，世界！\\" << endl;\\n    return 0;\\n}", "title": "基本输出示例", "language": "cpp", "explanation": "展示了C++中最基本的输出语句，使用cout输出文本并换行。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int age = 10;\\n    double height = 1.45;\\n    \\n    cout << \\"我的年龄是：\\" << age << \\"岁\\" << endl;\\n    cout << \\"我的身高是：\\" << height << \\"米\\" << endl;\\n    return 0;\\n}", "title": "输出变量示例", "language": "cpp", "explanation": "展示了如何在输出中包含变量的值，使用<<运算符连接文本和变量。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int age;\\n    \\n    cout << \\"请输入你的年龄：\\" ;\\n    cin >> age;\\n    \\n    cout << \\"你今年\\" << age << \\"岁\\" << endl;\\n    return 0;\\n}", "title": "基本输入示例", "language": "cpp", "explanation": "展示了如何使用cin从用户输入中获取整数并存储到变量中。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int a, b;\\n    \\n    cout << \\"请输入两个整数，用空格分隔：\\" ;\\n    cin >> a >> b;\\n    \\n    cout << \\"你输入的两个数是：\\" << a << \\"和\\" << b << endl;\\n    cout << \\"它们的和是：\\" << a + b << endl;\\n    return 0;\\n}", "title": "输入多个变量示例", "language": "cpp", "explanation": "展示了如何一次输入多个变量，使用空格或回车分隔输入值。"}, {"code": "#include <iostream>\\n#include <iomanip>\\nusing namespace std;\\n\\nint main() {\\n    double pi = 3.1415926535;\\n    double price = 12.5;\\n    \\n    cout << \\"默认输出：\\" << pi << endl;\\n    cout << \\"保留2位小数：\\" << fixed << setprecision(2) << pi << endl;\\n    cout << \\"价格：\\" << fixed << setprecision(2) << price << \\"元\\" << endl;\\n    \\n    return 0;\\n}", "title": "格式化输出示例", "language": "cpp", "explanation": "展示了如何使用iomanip头文件中的函数控制输出格式，如小数位数。"}, {"code": "#include <iostream>\\n#include <string>\\nusing namespace std;\\n\\nint main() {\\n    string name;\\n    \\n    cout << \\"请输入你的姓名：\\" ;\\n    cin.ignore(); // 忽略之前输入的换行符\\n    getline(cin, name);\\n    \\n    cout << \\"你好，\\" << name << \\"！\\" << endl;\\n    return 0;\\n}", "title": "使用getline输入字符串", "language": "cpp", "explanation": "展示了如何使用getline输入包含空格的完整字符串。"}, {"code": "#include <iostream>\\n#include <fstream>\\nusing namespace std;\\n\\nint main() {\\n    ofstream outFile; // 输出文件流\\n    outFile.open(\\"data.txt\\"); // 打开文件\\n    \\n    if (outFile.is_open()) {\\n        outFile << \\"Hello, File!\\" << endl;\\n        outFile << \\"这是写入文件的第二行。\\" << endl;\\n        outFile.close(); // 关闭文件\\n        cout << \\"文件写入成功！\\" << endl;\\n    } else {\\n        cout << \\"无法打开文件！\\" << endl;\\n    }\\n    \\n    return 0;\\n}", "title": "文件写入示例", "language": "cpp", "explanation": "展示了如何创建并写入文件，使用ofstream类进行文件输出操作。"}, {"code": "#include <iostream>\\n#include <fstream>\\n#include <string>\\nusing namespace std;\\n\\nint main() {\\n    ifstream inFile; // 输入文件流\\n    string line;\\n    \\n    inFile.open(\\"data.txt\\"); // 打开文件\\n    \\n    if (inFile.is_open()) {\\n        cout << \\"文件内容：\\" << endl;\\n        while (getline(inFile, line)) {\\n            cout << line << endl;\\n        }\\n        inFile.close(); // 关闭文件\\n    } else {\\n        cout << \\"无法打开文件！\\" << endl;\\n    }\\n    \\n    return 0;\\n}", "title": "文件读取示例", "language": "cpp", "explanation": "展示了如何打开并读取文件内容，使用ifstream类和getline函数逐行读取。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    double num1, num2;\\n    char op;\\n    \\n    cout << \\"请输入第一个数：\\" ;\\n    cin >> num1;\\n    \\n    cout << \\"请输入运算符(+, -, *, /)：\\" ;\\n    cin >> op;\\n    \\n    cout << \\"请输入第二个数：\\" ;\\n    cin >> num2;\\n    \\n    switch (op) {\\n        case '+' :\\n            cout << num1 << \\" + \\" << num2 << \\" = \\" << num1 + num2 << endl;\\n            break;\\n        case '-' :\\n            cout << num1 << \\" - \\" << num2 << \\" = \\" << num1 - num2 << endl;\\n            break;\\n        case '*' :\\n            cout << num1 << \\" * \\" << num2 << \\" = \\" << num1 * num2 << endl;\\n            break;\\n        case '/' :\\n            if (num2 != 0) {\\n                cout << num1 << \\" / \\" << num2 << \\" = \\" << num1 / num2 << endl;\\n            } else {\\n                cout << \\"错误：除数不能为0！\\" << endl;\\n            }\\n            break;\\n        default :\\n            cout << \\"错误：无效的运算符！\\" << endl;\\n            break;\\n    }\\n    \\n    return 0;\\n}", "title": "简单计算器示例", "language": "cpp", "explanation": "展示了如何结合输入输出和分支结构创建一个简单的计算器程序。"}]	{忘记包含必要的头文件：使用cout和cin需要包含<iostream>，使用文件操作需要包含<fstream>,"忘记使用using namespace std;，导致需要写成std::cout和std::cin",输入字符串时，cin遇到空格就停止读取，导致只能读取到第一个单词,使用getline前没有使用cin.ignore()，导致读取到空字符串,文件操作时忘记关闭文件，可能导致数据丢失或文件损坏,文件路径错误，导致无法找到或创建文件,格式化输出时忘记使用fixed，导致setprecision设置的是有效数字而不是小数位数,混合使用cin和getline时，没有正确处理换行符,"输出布尔值时，直接输出会显示1或0，而不是\\"是\\"或\\"否\\"",输入操作时，用户输入的数据类型与变量类型不匹配，导致输入失败}	# 输入输出\n\n## 📚 什么是输入输出？\n\n想象一下，你和朋友在聊天：你说的话是**输出**，你听到的话是**输入**。在编程中，输入输出也是这样的过程！\n\n- **输入（Input）**：程序从用户或其他来源获取信息的过程\n- **输出（Output）**：程序向用户或其他目标发送信息的过程\n\n就像我们日常交流一样，程序也需要与外界进行信息交换，输入输出就是程序与外界交流的桥梁。\n\n## 🖥️ C++中的输出 - 让程序说话\n\n在C++中，我们使用`cout`来让程序输出信息，就像让程序说话一样。\n\n### 1️⃣ 基本输出\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    cout << "你好，世界！" << endl;\n    return 0;\n}\n```\n\n### 2️⃣ 输出变量\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int age = 10;\n    double height = 1.45;\n    \n    cout << "我的年龄是：" << age << "岁" << endl;\n    cout << "我的身高是：" << height << "米" << endl;\n    return 0;\n}\n```\n\n### 3️⃣ 连续输出\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 5, b = 3;\n    \n    cout << "a = " << a << ", b = " << b << endl;\n    cout << "a + b = " << a + b << endl;\n    cout << "a * b = " << a * b << endl;\n    return 0;\n}\n```\n\n## 🎯 C++中的输入 - 让程序听你说话\n\n在C++中，我们使用`cin`来让程序接收用户的输入，就像让程序听你说话一样。\n\n### 1️⃣ 基本输入\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int age;\n    \n    cout << "请输入你的年龄：" ;\n    cin >> age;\n    \n    cout << "你今年" << age << "岁" << endl;\n    return 0;\n}\n```\n\n### 2️⃣ 输入多个变量\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    \n    cout << "请输入两个整数，用空格分隔：" ;\n    cin >> a >> b;\n    \n    cout << "你输入的两个数是：" << a << "和" << b << endl;\n    cout << "它们的和是：" << a + b << endl;\n    return 0;\n}\n```\n\n### 3️⃣ 输入不同类型的变量\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int age;\n    double height;\n    char grade;\n    \n    cout << "请输入年龄：" ;\n    cin >> age;\n    \n    cout << "请输入身高（米）：" ;\n    cin >> height;\n    \n    cout << "请输入成绩等级（A/B/C）：" ;\n    cin >> grade;\n    \n    cout << "年龄：" << age << "岁" << endl;\n    cout << "身高：" << height << "米" << endl;\n    cout << "成绩等级：" << grade << endl;\n    return 0;\n}\n```\n\n## 🎨 格式化输出 - 让输出更漂亮\n\n有时候，我们希望输出的内容更加整齐、美观，这时候就需要使用格式化输出。\n\n### 1️⃣ 控制小数位数\n\n```cpp\n#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double pi = 3.1415926535;\n    double price = 12.5;\n    \n    cout << "默认输出：" << pi << endl;\n    cout << "保留2位小数：" << fixed << setprecision(2) << pi << endl;\n    cout << "价格：" << fixed << setprecision(2) << price << "元" << endl;\n    \n    return 0;\n}\n```\n\n### 2️⃣ 设置输出宽度\n\n```cpp\n#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    cout << setw(10) << "姓名" << setw(5) << "年龄" << setw(10) << "成绩" << endl;\n    cout << setw(10) << "小明" << setw(5) << 10 << setw(10) << 95 << endl;\n    cout << setw(10) << "小红" << setw(5) << 9 << setw(10) << 98 << endl;\n    \n    return 0;\n}\n```\n\n## 📝 输入字符串\n\n当我们需要输入包含空格的字符串时，`cin`就不够用了，这时候我们需要使用`getline`函数。\n\n### 1️⃣ 使用getline输入字符串\n\n```cpp\n#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    \n    cout << "请输入你的姓名：" ;\n    cin.ignore(); // 忽略之前输入的换行符\n    getline(cin, name);\n    \n    cout << "你好，" << name << "！" << endl;\n    return 0;\n}\n```\n\n### 2️⃣ 混合使用cin和getline\n\n```cpp\n#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    int age;\n    string name;\n    \n    cout << "请输入你的年龄：" ;\n    cin >> age;\n    cin.ignore(); // 忽略输入年龄后的换行符\n    \n    cout << "请输入你的姓名：" ;\n    getline(cin, name);\n    \n    cout << "你好，" << name << "，你今年" << age << "岁了！" << endl;\n    return 0;\n}\n```\n\n## 📁 文件输入输出 - 程序的持久化存储\n\n除了与用户交互，程序还可以与文件进行输入输出操作，这样数据就可以持久保存了。\n\n### 1️⃣ 文件写入\n\n```cpp\n#include <iostream>\n#include <fstream>\nusing namespace std;\n\nint main() {\n    ofstream outFile; // 输出文件流\n    outFile.open("data.txt"); // 打开文件\n    \n    if (outFile.is_open()) {\n        outFile << "Hello, File!" << endl;\n        outFile << "这是写入文件的第二行。" << endl;\n        outFile.close(); // 关闭文件\n        cout << "文件写入成功！" << endl;\n    } else {\n        cout << "无法打开文件！" << endl;\n    }\n    \n    return 0;\n}\n```\n\n### 2️⃣ 文件读取\n\n```cpp\n#include <iostream>\n#include <fstream>\n#include <string>\nusing namespace std;\n\nint main() {\n    ifstream inFile; // 输入文件流\n    string line;\n    \n    inFile.open("data.txt"); // 打开文件\n    \n    if (inFile.is_open()) {\n        cout << "文件内容：" << endl;\n        while (getline(inFile, line)) {\n            cout << line << endl;\n        }\n        inFile.close(); // 关闭文件\n    } else {\n        cout << "无法打开文件！" << endl;\n    }\n    \n    return 0;\n}\n```\n\n## 🎯 输入输出的应用示例\n\n### 1️⃣ 简单计算器\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    double num1, num2;\n    char op;\n    \n    cout << "请输入第一个数：" ;\n    cin >> num1;\n    \n    cout << "请输入运算符(+, -, *, /)：" ;\n    cin >> op;\n    \n    cout << "请输入第二个数：" ;\n    cin >> num2;\n    \n    switch (op) {\n        case '+' :\n            cout << num1 << " + " << num2 << " = " << num1 + num2 << endl;\n            break;\n        case '-' :\n            cout << num1 << " - " << num2 << " = " << num1 - num2 << endl;\n            break;\n        case '*' :\n            cout << num1 << " * " << num2 << " = " << num1 * num2 << endl;\n            break;\n        case '/' :\n            if (num2 != 0) {\n                cout << num1 << " / " << num2 << " = " << num1 / num2 << endl;\n            } else {\n                cout << "错误：除数不能为0！" << endl;\n            }\n            break;\n        default :\n            cout << "错误：无效的运算符！" << endl;\n            break;\n    }\n    \n    return 0;\n}\n```\n\n### 2️⃣ 学生信息管理\n\n```cpp\n#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    int age;\n    double score;\n    \n    cout << "===== 学生信息录入 =====" << endl;\n    cout << "请输入姓名：" ;\n    cin.ignore(); // 忽略之前的换行符\n    getline(cin, name);\n    \n    cout << "请输入年龄：" ;\n    cin >> age;\n    \n    cout << "请输入成绩：" ;\n    cin >> score;\n    \n    cout << "===== 学生信息 =====" << endl;\n    cout << "姓名：" << name << endl;\n    cout << "年龄：" << age << "岁" << endl;\n    cout << "成绩：" << score << "分" << endl;\n    \n    return 0;\n}\n```\n\n## 📚 输入输出的总结\n\n- **cout**：用于输出信息，使用<<运算符连接数据\n- **cin**：用于输入信息，使用>>运算符接收数据\n- **getline**：用于输入包含空格的字符串\n- **格式化输出**：使用iomanip头文件中的函数控制输出格式\n- **文件操作**：使用fstream头文件中的类进行文件输入输出\n\n输入输出是程序与外界交流的桥梁，掌握好输入输出的方法，是编写实用程序的基础！\n	120	[{"url": "https://www.runoob.com/cplusplus/cpp-input-output.html", "title": "C++ 输入输出详解"}, {"url": "https://www.runoob.com/cplusplus/cpp-manipulators.html", "title": "C++ 格式化输出"}, {"url": "https://www.runoob.com/cplusplus/cpp-files-streams.html", "title": "C++ 文件操作"}]	{"输出时，多个数据之间使用<<运算符连接，如cout << \\"a=\\" << a << \\"，b=\\" << b;",输入时，cin会自动跳过空格、制表符和换行符，直接读取有效数据,输入字符串时，如果字符串包含空格，应该使用getline而不是cin,使用getline前，需要用cin.ignore()忽略之前输入的换行符,格式化输出时，需要包含<iomanip>头文件,"fixed和setprecision一起使用可以控制小数位数，如cout << fixed << setprecision(2) << pi;","setw函数可以设置输出宽度，如cout << setw(10) << \\"姓名\\" << setw(5) << \\"年龄\\";",文件操作时，记得在操作完成后关闭文件，使用close()函数,打开文件时，最好检查文件是否成功打开，使用is_open()函数,二进制文件操作时，需要使用ios::binary模式打开文件}	https://www.bilibili.com/video/BV1et411b73Z
46c3a7e1-ad27-4acb-9420-b32fba742bfb	分支结构	含条件表达式、多分支逻辑	📝	from-green-400 to-green-600	4	0	t	1-04	CSP_J	1	5	2026-01-30 16:29:52.705	2026-02-01 12:20:58.601	[{"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int score = 85;\\n    \\n    if (score >= 60) {\\n        cout << \\"恭喜你，及格了！\\" << endl;\\n    }\\n    \\n    cout << \\"考试结束，继续努力！\\" << endl;\\n    return 0;\\n}", "title": "基本if语句示例", "language": "cpp", "explanation": "展示了最基本的if语句，当条件成立时执行一段代码，否则跳过这段代码。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int score = 85;\\n    \\n    if (score >= 60) {\\n        cout << \\"恭喜你，及格了！\\" << endl;\\n    } else {\\n        cout << \\"很遗憾，不及格。\\" << endl;\\n    }\\n    \\n    return 0;\\n}", "title": "if-else语句示例", "language": "cpp", "explanation": "展示了if-else语句，根据条件成立与否执行不同的代码块，实现二选一的决策。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int score = 85;\\n    \\n    if (score >= 90) {\\n        cout << \\"优秀！\\" << endl;\\n    } else if (score >= 80) {\\n        cout << \\"良好！\\" << endl;\\n    } else if (score >= 60) {\\n        cout << \\"及格！\\" << endl;\\n    } else {\\n        cout << \\"不及格。\\" << endl;\\n    }\\n    \\n    return 0;\\n}", "title": "if-else if-else语句示例", "language": "cpp", "explanation": "展示了if-else if-else语句，实现多选一的决策结构，根据不同的条件范围执行不同的代码块。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int day = 3;\\n    \\n    switch (day) {\\n        case 1:\\n            cout << \\"星期一\\" << endl;\\n            break;\\n        case 2:\\n            cout << \\"星期二\\" << endl;\\n            break;\\n        case 3:\\n            cout << \\"星期三\\" << endl;\\n            break;\\n        case 4:\\n            cout << \\"星期四\\" << endl;\\n            break;\\n        case 5:\\n            cout << \\"星期五\\" << endl;\\n            break;\\n        case 6:\\n        case 7:\\n            cout << \\"周末\\" << endl;\\n            break;\\n        default:\\n            cout << \\"无效的星期\\" << endl;\\n            break;\\n    }\\n    \\n    return 0;\\n}", "title": "switch语句示例", "language": "cpp", "explanation": "展示了switch语句，根据变量的不同值执行不同的代码块，注意每个case后面需要加break语句。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int age;\\n    bool isStudent;\\n    \\n    cout << \\"请输入年龄：\\" ;\\n    cin >> age;\\n    \\n    cout << \\"是否是学生？(1=是, 0=否)：\\" ;\\n    cin >> isStudent;\\n    \\n    if (age < 18) {\\n        cout << \\"你是未成年人\\" << endl;\\n        if (isStudent) {\\n            cout << \\"作为学生，你应该努力学习！\\" << endl;\\n        } else {\\n            cout << \\"你应该听父母的话！\\" << endl;\\n        }\\n    } else {\\n        cout << \\"你是成年人\\" << endl;\\n        if (isStudent) {\\n            cout << \\"作为大学生，你应该独立思考！\\" << endl;\\n        } else {\\n            cout << \\"作为社会人，你应该努力工作！\\" << endl;\\n        }\\n    }\\n    \\n    return 0;\\n}", "title": "嵌套if语句示例", "language": "cpp", "explanation": "展示了嵌套if语句，在一个if语句内部再使用另一个if语句，实现多重决策。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int score = 85;\\n    string result;\\n    \\n    result = (score >= 60) ? \\"及格\\" : \\"不及格\\";\\n    cout << \\"考试结果：\\" << result << endl;\\n    \\n    // 直接输出\\n    cout << \\"是否及格：\\" << ((score >= 60) ? \\"是\\" : \\"否\\") << endl;\\n    \\n    return 0;\\n}", "title": "条件表达式示例", "language": "cpp", "explanation": "展示了条件表达式，它是一种简洁的if-else语句形式，语法为：条件 ? 表达式1 : 表达式2。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int age;\\n    bool hasID;\\n    \\n    cout << \\"请输入年龄：\\" ;\\n    cin >> age;\\n    \\n    cout << \\"是否有身份证？(1=是, 0=否)：\\" ;\\n    cin >> hasID;\\n    \\n    if (age >= 18 && hasID) {\\n        cout << \\"你可以参加投票！\\" << endl;\\n    } else {\\n        cout << \\"你暂时不能参加投票。\\" << endl;\\n    }\\n    \\n    return 0;\\n}", "title": "逻辑运算符在分支中的应用", "language": "cpp", "explanation": "展示了如何使用逻辑与运算符&&组合多个条件，只有当所有条件都成立时，整个条件才成立。"}, {"code": "#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    int score;\\n    \\n    cout << \\"请输入考试分数：\\" ;\\n    cin >> score;\\n    \\n    if (score >= 90) {\\n        cout << \\"等级：优秀\\" << endl;\\n        cout << \\"评语：你真是太棒了！\\" << endl;\\n    } else if (score >= 80) {\\n        cout << \\"等级：良好\\" << endl;\\n        cout << \\"评语：继续努力，你会更优秀！\\" << endl;\\n    } else if (score >= 70) {\\n        cout << \\"等级：中等\\" << endl;\\n        cout << \\"评语：再加把劲，争取更好的成绩！\\" << endl;\\n    } else if (score >= 60) {\\n        cout << \\"等级：及格\\" << endl;\\n        cout << \\"评语：勉强通过，需要更加努力！\\" << endl;\\n    } else {\\n        cout << \\"等级：不及格\\" << endl;\\n        cout << \\"评语：请认真反思，好好复习！\\" << endl;\\n    }\\n    \\n    return 0;\\n}", "title": "成绩等级评定示例", "language": "cpp", "explanation": "展示了如何使用if-else if-else语句实现一个成绩等级评定程序，根据不同的分数范围给出不同的等级和评语。"}]	{"忘记在if语句的条件表达式外面加括号：if score >= 60（错误）→ if (score >= 60)（正确）","混淆赋值运算符=和等于运算符==：if (score = 60)（错误）→ if (score == 60)（正确）","在if或else语句后面直接加分号，导致代码块不执行：if (score >= 60); { ... }（错误）→ if (score >= 60) { ... }（正确）",switch语句中忘记加break，导致执行完一个case后继续执行下一个case,嵌套if语句时，else与错误的if配对，导致逻辑错误,"在if-else if-else语句中，条件顺序错误，导致某些条件永远不会被检查","使用switch语句时，case标签不是常量表达式：int x=1; case x:（错误）→ case 1:（正确）",逻辑运算符使用错误：使用单个&或|而不是&&或||（单个的是位运算符）,"条件表达式语法错误：score >= 60 ? \\"及格\\" : \\"不及格\\"（缺少括号）→ (score >= 60) ? \\"及格\\" : \\"不及格\\"（正确）",嵌套分支结构太深，导致代码可读性差，难以维护}	# 分支结构\n\n## 📚 什么是分支结构？\n\n想象一下，你每天早上起床后要做的决定：如果天气好，就去跑步；如果天气不好，就留在家里看书。这就是生活中的**分支决策**！\n\n在编程中，分支结构就是让程序根据不同的条件做出不同选择的结构，就像我们日常生活中的决策过程一样。\n\n分支结构让程序变得更加智能，能够根据不同的情况执行不同的代码。\n\n## 🔀 if语句 - 基本的分支选择\n\n`if`语句是最基本的分支结构，它的作用是：如果某个条件成立，就执行一段代码；否则，就跳过这段代码。\n\n### 1️⃣ 基本if语句\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 85;\n    \n    if (score >= 60) {\n        cout << "恭喜你，及格了！" << endl;\n    }\n    \n    cout << "考试结束，继续努力！" << endl;\n    return 0;\n}\n```\n\n### 2️⃣ if-else语句 - 二选一的决策\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 85;\n    \n    if (score >= 60) {\n        cout << "恭喜你，及格了！" << endl;\n    } else {\n        cout << "很遗憾，不及格。" << endl;\n    }\n    \n    return 0;\n}\n```\n\n### 3️⃣ if-else if-else语句 - 多选一的决策\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 85;\n    \n    if (score >= 90) {\n        cout << "优秀！" << endl;\n    } else if (score >= 80) {\n        cout << "良好！" << endl;\n    } else if (score >= 60) {\n        cout << "及格！" << endl;\n    } else {\n        cout << "不及格。" << endl;\n    }\n    \n    return 0;\n}\n```\n\n## 🎯 条件表达式 - if语句的简化形式\n\n条件表达式是一种简洁的if-else语句，它的语法是：\n\n```cpp\n条件 ? 表达式1 : 表达式2\n```\n\n如果条件成立，就执行表达式1并返回结果；否则，执行表达式2并返回结果。\n\n### 条件表达式的使用\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 85;\n    string result;\n    \n    result = (score >= 60) ? "及格" : "不及格";\n    cout << "考试结果：" << result << endl;\n    \n    // 直接输出\n    cout << "是否及格：" << ((score >= 60) ? "是" : "否") << endl;\n    \n    return 0;\n}\n```\n\n## 🔄 switch语句 - 多值选择的捷径\n\n当我们需要根据一个变量的不同值执行不同的代码时，`switch`语句比`if-else if-else`语句更加简洁清晰。\n\n### switch语句的基本结构\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int day = 3;\n    \n    switch (day) {\n        case 1:\n            cout << "星期一" << endl;\n            break;\n        case 2:\n            cout << "星期二" << endl;\n            break;\n        case 3:\n            cout << "星期三" << endl;\n            break;\n        case 4:\n            cout << "星期四" << endl;\n            break;\n        case 5:\n            cout << "星期五" << endl;\n            break;\n        case 6:\n        case 7:\n            cout << "周末" << endl;\n            break;\n        default:\n            cout << "无效的星期" << endl;\n            break;\n    }\n    \n    return 0;\n}\n```\n\n### switch语句的注意事项\n\n1. **case标签**：每个case后面跟的是常量表达式，不能是变量\n2. **break语句**：每个case结束后需要加break，否则会继续执行下一个case\n3. **default分支**：当所有case都不匹配时，执行default分支\n4. **多个case共用代码**：可以多个case共用一段代码，如上面的周六周日\n\n## 📦 嵌套分支结构 - 决策中的决策\n\n嵌套分支结构是指在一个分支结构内部再使用另一个分支结构，就像我们生活中的多重决策一样。\n\n### 嵌套if语句的使用\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int age;\n    bool isStudent;\n    \n    cout << "请输入年龄：";\n    cin >> age;\n    \n    cout << "是否是学生？(1=是, 0=否)：";\n    cin >> isStudent;\n    \n    if (age < 18) {\n        cout << "你是未成年人" << endl;\n        if (isStudent) {\n            cout << "作为学生，你应该努力学习！" << endl;\n        } else {\n            cout << "你应该听父母的话！" << endl;\n        }\n    } else {\n        cout << "你是成年人" << endl;\n        if (isStudent) {\n            cout << "作为大学生，你应该独立思考！" << endl;\n        } else {\n            cout << "作为社会人，你应该努力工作！" << endl;\n        }\n    }\n    \n    return 0;\n}\n```\n\n## 🧠 逻辑运算符在分支结构中的应用\n\n在分支结构中，我们经常需要使用逻辑运算符来组合多个条件，使决策更加复杂和精确。\n\n### 逻辑与（&&）的使用\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int age;\n    bool hasID;\n    \n    cout << "请输入年龄：";\n    cin >> age;\n    \n    cout << "是否有身份证？(1=是, 0=否)：";\n    cin >> hasID;\n    \n    if (age >= 18 && hasID) {\n        cout << "你可以参加投票！" << endl;\n    } else {\n        cout << "你暂时不能参加投票。" << endl;\n    }\n    \n    return 0;\n}\n```\n\n### 逻辑或（||）的使用\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int score;\n    bool isBonus;\n    \n    cout << "请输入考试分数：";\n    cin >> score;\n    \n    cout << "是否有附加分？(1=是, 0=否)：";\n    cin >> isBonus;\n    \n    if (score >= 60 || isBonus) {\n        cout << "恭喜你，通过了考试！" << endl;\n    } else {\n        cout << "很遗憾，没有通过考试。" << endl;\n    }\n    \n    return 0;\n}\n```\n\n### 逻辑非（!）的使用\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    bool hasHomework;\n    \n    cout << "是否有作业？(1=有, 0=没有)：";\n    cin >> hasHomework;\n    \n    if (!hasHomework) {\n        cout << "太好了，可以去玩了！" << endl;\n    } else {\n        cout << "先完成作业再去玩。" << endl;\n    }\n    \n    return 0;\n}\n```\n\n## 🎯 分支结构的应用示例\n\n### 1️⃣ 成绩等级评定\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int score;\n    \n    cout << "请输入考试分数：";\n    cin >> score;\n    \n    if (score >= 90) {\n        cout << "等级：优秀" << endl;\n        cout << "评语：你真是太棒了！" << endl;\n    } else if (score >= 80) {\n        cout << "等级：良好" << endl;\n        cout << "评语：继续努力，你会更优秀！" << endl;\n    } else if (score >= 70) {\n        cout << "等级：中等" << endl;\n        cout << "评语：再加把劲，争取更好的成绩！" << endl;\n    } else if (score >= 60) {\n        cout << "等级：及格" << endl;\n        cout << "评语：勉强通过，需要更加努力！" << endl;\n    } else {\n        cout << "等级：不及格" << endl;\n        cout << "评语：请认真反思，好好复习！" << endl;\n    }\n    \n    return 0;\n}\n```\n\n### 2️⃣ 计算器程序\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    double num1, num2;\n    char op;\n    \n    cout << "请输入第一个数：";\n    cin >> num1;\n    \n    cout << "请输入运算符(+, -, *, /)：";\n    cin >> op;\n    \n    cout << "请输入第二个数：";\n    cin >> num2;\n    \n    if (op == '+') {\n        cout << num1 << " + " << num2 << " = " << num1 + num2 << endl;\n    } else if (op == '-') {\n        cout << num1 << " - " << num2 << " = " << num1 - num2 << endl;\n    } else if (op == '*') {\n        cout << num1 << " * " << num2 << " = " << num1 * num2 << endl;\n    } else if (op == '/') {\n        if (num2 != 0) {\n            cout << num1 << " / " << num2 << " = " << num1 / num2 << endl;\n        } else {\n            cout << "错误：除数不能为0！" << endl;\n        }\n    } else {\n        cout << "错误：无效的运算符！" << endl;\n    }\n    \n    return 0;\n}\n```\n\n### 3️⃣ 猜数字游戏\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int secretNumber = 42;\n    int guess;\n    \n    cout << "欢迎来到猜数字游戏！" << endl;\n    cout << "我想了一个1-100之间的数字，请你猜一猜：" << endl;\n    \n    cin >> guess;\n    \n    if (guess == secretNumber) {\n        cout << "恭喜你，猜对了！" << endl;\n    } else if (guess > secretNumber) {\n        cout << "你猜的数字太大了！" << endl;\n    } else {\n        cout << "你猜的数字太小了！" << endl;\n    }\n    \n    cout << "游戏结束，谢谢参与！" << endl;\n    return 0;\n}\n```\n\n### 4️⃣ 月份天数查询\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int month;\n    \n    cout << "请输入月份(1-12)：";\n    cin >> month;\n    \n    if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {\n        cout << month << "月有31天" << endl;\n    } else if (month == 4 || month == 6 || month == 9 || month == 11) {\n        cout << month << "月有30天" << endl;\n    } else if (month == 2) {\n        cout << "2月通常有28天，闰年有29天" << endl;\n    } else {\n        cout << "错误：无效的月份！" << endl;\n    }\n    \n    return 0;\n}\n```\n\n## 📚 分支结构的总结\n\n- **if语句**：最基本的分支结构，根据条件执行代码\n- **if-else语句**：二选一的决策结构\n- **if-else if-else语句**：多选一的决策结构\n- **switch语句**：根据变量值进行多分支选择\n- **嵌套分支**：在分支内部再使用分支结构\n- **条件表达式**：简洁的if-else语句形式\n- **逻辑运算符**：组合多个条件，使决策更复杂\n\n分支结构是程序设计中非常重要的一部分，它让程序能够根据不同的情况做出不同的反应，就像人类的思考和决策过程一样。掌握好分支结构，是成为一名优秀程序员的基础！\n	120	[{"url": "https://www.runoob.com/cplusplus/cpp-if-statement.html", "title": "C++ if语句详解"}, {"url": "https://www.runoob.com/cplusplus/cpp-switch-statement.html", "title": "C++ switch语句详解"}, {"url": "https://www.runoob.com/cplusplus/cpp-conditional-operator.html", "title": "C++ 条件运算符"}]	{"if语句的条件表达式要用括号括起来，如if (score >= 60) { ... }","if语句和else语句后面的代码块要用大括号{}括起来，即使只有一行代码",else语句总是与最近的未配对的if语句配对，注意代码的缩进，使结构更清晰,"在if-else if-else语句中，条件的顺序很重要，应该从最具体的条件开始检查",switch语句中的case标签必须是常量表达式，不能是变量,每个case语句结束后都应该加break语句，否则会继续执行下一个case,switch语句可以有一个default分支，当所有case都不匹配时执行,条件表达式是一种简洁的if-else语句形式，适合简单的二选一情况,使用逻辑运算符可以组合多个条件，使决策更加复杂和精确,嵌套分支结构不要嵌套太深，否则会降低代码的可读性，一般不超过3层}	https://www.bilibili.com/video/BV1et411b73Z
\.


--
-- Data for Name: SkillUnitPrerequisite; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."SkillUnitPrerequisite" (id, "unitId", "prerequisiteId") FROM stdin;
23b155c1-e3bf-495d-b9df-7c2729b4a4e3	048bdc8d-29b1-4e0b-9a35-abc489bbd539	06fd03e1-50ae-4d46-85f5-d2365a6cdf88
42fedb6e-2a79-4ee3-8462-fc9f3eedba12	5f29d989-d8a2-42cb-a4ea-ad1f777fa85b	a45fda86-07ad-4636-86e5-571c61d1c49f
1cb36cc9-ae87-4ebc-9a50-0be2e86797d3	2a224c59-ade2-4efa-8b98-bfa1bc347034	c0852243-0142-407b-a128-d666fe5ef76d
4d3f6e26-f732-4d3e-a4b2-51d29403feba	4aa0a985-1bfe-4470-9896-3807d10f8a32	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
a07c8450-c55c-41e7-aef0-ff76997de59e	4aa0a985-1bfe-4470-9896-3807d10f8a32	d237e481-b06b-468d-a70a-653a4230e765
c53ce9ec-b3df-4194-b519-3dba81260650	c7525e6f-1e8e-4a01-92d8-bbb160be222f	8a271029-3500-4753-aac1-c341003bef3c
31db5b55-7dc3-480e-815c-25a54f65b2d9	c7525e6f-1e8e-4a01-92d8-bbb160be222f	f55b1082-d016-44fd-a6e4-e064cf63121d
bb4d984f-1674-4c27-889a-2ac5e4a67d96	3e9ea945-cc9e-46a3-9e64-ef8b1ea2e95b	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
133b6a84-7c7b-430a-8653-6c33d8553e27	8f79bf52-5317-4d16-be78-777e1fd6bc6e	3e9ea945-cc9e-46a3-9e64-ef8b1ea2e95b
261c1c14-ae85-445c-88e7-aa6b2b031f2c	de1a0c21-4839-4f16-a6a9-b4f0f952ec9d	3e9ea945-cc9e-46a3-9e64-ef8b1ea2e95b
10bbc56f-8653-40bd-9d93-ce53a8daa08e	81c32093-9fe9-4d95-97ac-1237c9f359c4	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
084fd419-7024-4e09-b086-a6e2e98c24ef	81c32093-9fe9-4d95-97ac-1237c9f359c4	c48a3092-2787-40dc-b2d1-a0ed191cdf91
480662f4-3141-4e09-ab0a-65e799549e29	5012cfff-ad4f-4357-a07f-f5b172a25b42	81c32093-9fe9-4d95-97ac-1237c9f359c4
7719f036-aa3c-470b-ab66-e52e69c3281e	2c8c1630-3f38-430b-8e02-0c8e4bef1110	81c32093-9fe9-4d95-97ac-1237c9f359c4
9c40b12a-0a25-4c49-8ce0-11c5e9f84b90	8cec9228-3775-488a-a5e8-b29f647fc0c5	81c32093-9fe9-4d95-97ac-1237c9f359c4
682473fd-9d53-4943-8da9-7c8fd81050b9	27af42c1-7355-4719-bbc4-ec0e86658d7f	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
30cbbe02-5433-4ab8-b05a-e75dfe7d167b	27af42c1-7355-4719-bbc4-ec0e86658d7f	af10e683-9f20-4eec-b10b-beb731158aa1
8efbfdc5-861f-4179-bb0b-60fd3d87a12f	aa012a89-c3e5-4d06-8acd-150575e3f43e	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
642208e8-bef4-4888-afe0-713b28b5eb78	97077ea8-8ea4-4fbe-9a11-7f6665e71a6f	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
f5accf30-7147-4ec2-8dde-82e647255009	b1c2ad77-e1d9-446e-a565-003d884ed78a	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
7061be05-60bb-4abb-80eb-2cd833197e7f	b1c2ad77-e1d9-446e-a565-003d884ed78a	af10e683-9f20-4eec-b10b-beb731158aa1
1249ef27-3b3c-4150-8036-1134ea8c390f	b1c2ad77-e1d9-446e-a565-003d884ed78a	5f29d989-d8a2-42cb-a4ea-ad1f777fa85b
62577fff-38d4-4388-99cb-a746eaa3f9f1	ca1a2e0d-b1c1-4043-9e31-9ce313e243b5	81c32093-9fe9-4d95-97ac-1237c9f359c4
17e2518e-e3be-44f5-a3cc-c3e5ff309a17	ca1a2e0d-b1c1-4043-9e31-9ce313e243b5	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
d11a1f1e-bcf7-48d5-a40a-a07fa4136844	5e1b616b-9c14-464e-b790-b417093a3222	ca1a2e0d-b1c1-4043-9e31-9ce313e243b5
7fa49d27-6577-4061-87e4-314c82243d2e	1fd05430-c2b9-4e6f-8e35-adb952a73521	06fd03e1-50ae-4d46-85f5-d2365a6cdf88
0ae3f575-2465-4cd4-b574-c9b49b725ba0	1fd05430-c2b9-4e6f-8e35-adb952a73521	8cec9228-3775-488a-a5e8-b29f647fc0c5
11a974cc-17e8-4e92-bd65-87001afd585a	068607de-be75-4fd1-96da-ad752e614dd8	8a271029-3500-4753-aac1-c341003bef3c
c27b24fc-a170-4ba0-a18f-4cd29b737cf6	ba156bb7-2910-4f54-bd22-ce07179c0114	81c32093-9fe9-4d95-97ac-1237c9f359c4
a5809dcc-f7cd-4509-86ad-2d8af8d66af1	73fdd7fd-ac1f-47a5-8072-6a3f719f624a	81c32093-9fe9-4d95-97ac-1237c9f359c4
1db4d5cc-33e3-433b-ab17-f7de5dd2c1b8	65e60013-2f3b-4e16-b69d-aae17e1bf300	06fd03e1-50ae-4d46-85f5-d2365a6cdf88
cb2e0e83-6c9f-4351-89b5-f43de2275644	63d313ed-4a81-4d25-afa2-2970d1bce1ef	c7ab6263-a31e-4b9d-99ba-79ce802a2343
0d45e5a1-537e-48bc-b7bb-114cdbbd3b32	63d313ed-4a81-4d25-afa2-2970d1bce1ef	068607de-be75-4fd1-96da-ad752e614dd8
486204c5-3c34-41ca-9e82-5cfd66baa8b9	625d8b46-83a1-4cb3-95a1-9b10c3e6fb37	af10e683-9f20-4eec-b10b-beb731158aa1
d1eac4fc-e7ed-4867-977d-4f3f2b3fb0ed	77a882f6-76d8-4c3f-ab90-595fe898fa0f	81c32093-9fe9-4d95-97ac-1237c9f359c4
c20436e8-19fc-4fe1-acbc-9bae8dfe51b8	d087e8e4-0fb1-4dd0-b309-5d79cfe83bca	81c32093-9fe9-4d95-97ac-1237c9f359c4
33ff69c6-3cd8-49eb-86c1-09d61fcbeae6	d087e8e4-0fb1-4dd0-b309-5d79cfe83bca	27af42c1-7355-4719-bbc4-ec0e86658d7f
a86e8a1a-a839-43ce-b989-124a99b22a8e	71f7c1d5-7c85-4e07-9488-50544fa391fa	aa012a89-c3e5-4d06-8acd-150575e3f43e
9e51b699-082e-4705-a0a9-be0c0c7b70aa	71f7c1d5-7c85-4e07-9488-50544fa391fa	ca1a2e0d-b1c1-4043-9e31-9ce313e243b5
354e1e78-6096-42b5-b453-ba5c42e1bd31	c5ab5667-ab05-4484-a718-5030535f2b64	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
719f05f1-ccfd-48ac-9a4b-ed4f70f87ef0	eb5b289a-0704-429c-8b05-134faa545698	4aa0a985-1bfe-4470-9896-3807d10f8a32
f3431a2a-beef-46fa-8ab6-9685bbeb367e	eb5b289a-0704-429c-8b05-134faa545698	8cec9228-3775-488a-a5e8-b29f647fc0c5
f09943a7-57db-4150-ac88-63b218eade4e	f4dd3700-adc5-4ebb-9c42-3bbd07fc3b1a	68e1485b-12a2-4a5b-a222-10303068f950
730ee1b2-baed-41cd-be01-f99ca49c8e43	d89822a4-866b-4892-b375-91803027bb66	68e1485b-12a2-4a5b-a222-10303068f950
4727a033-f902-4e8a-ae59-e66e99072585	acb63f0e-6faa-429e-ad1d-3c9b81ccff1f	f4dd3700-adc5-4ebb-9c42-3bbd07fc3b1a
7aad3a9d-6313-4cd7-8395-ffa3ad68369b	57e11ea6-0deb-4beb-ac1d-d614a894768f	68e1485b-12a2-4a5b-a222-10303068f950
4bf9d87c-7c23-4589-996f-b72116ee3da7	f27c8b5a-8e1c-4f2a-ac78-e79d1a800730	8a271029-3500-4753-aac1-c341003bef3c
a619e4b5-4391-4891-9003-058e47b63622	020ff657-e54d-4d6c-b536-24af9e92d1cb	f27c8b5a-8e1c-4f2a-ac78-e79d1a800730
a8f9d417-f308-40da-8d32-271b19ad170b	020ff657-e54d-4d6c-b536-24af9e92d1cb	c48a3092-2787-40dc-b2d1-a0ed191cdf91
e5c6ba6a-5e04-4583-b2cc-3d085b8b81ab	215b6796-0bec-4b70-bcb0-9fda6e24aa38	020ff657-e54d-4d6c-b536-24af9e92d1cb
a7eea161-9bba-4095-a86e-d255a6b7b836	49228e4f-3698-46d2-b624-fdfcd2e21cf6	f27c8b5a-8e1c-4f2a-ac78-e79d1a800730
893bc283-2bf6-49d3-a540-c4c274f1580a	b4b413c3-fd5a-46b9-9feb-807a8cdd1f2e	c48a3092-2787-40dc-b2d1-a0ed191cdf91
30693b42-8425-4ff9-a2db-02d6290b6f39	ce260160-76c4-4d00-a48a-15e81a26ba57	c0852243-0142-407b-a128-d666fe5ef76d
2d8bad5e-1f93-4ac1-9b0c-3a923be093e0	38ff12ab-63ec-4262-bd33-829e9ef0a791	b4b413c3-fd5a-46b9-9feb-807a8cdd1f2e
de071083-01bc-408b-80ab-2d55c89440ec	58ad41d0-8692-4799-9e44-caa399ad2934	c48a3092-2787-40dc-b2d1-a0ed191cdf91
00e64b87-33e1-468b-bd9c-3b12ac1e048d	c6586a3a-4484-424d-b0f3-bc3fe4029645	68e1485b-12a2-4a5b-a222-10303068f950
d96b92fa-16f6-4be6-93ff-0d0c1aae1a35	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37	57e11ea6-0deb-4beb-ac1d-d614a894768f
9b818636-0444-450b-a034-da4c368f2aa7	595c4060-418d-45e6-8d99-11990e83fc32	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37
53b11eab-3012-4060-bb68-c42c9b5df910	a8e77b4b-774d-48d3-a252-90fe263e26aa	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37
cee62dbc-2fd7-47a5-97c8-bdc6fc68305d	5d5422e6-440c-47e2-8c77-8f7f71bd65cb	acb63f0e-6faa-429e-ad1d-3c9b81ccff1f
4a39fea3-126e-4aea-9fa8-98dbb0f9bbb7	f55b1082-d016-44fd-a6e4-e064cf63121d	c48a3092-2787-40dc-b2d1-a0ed191cdf91
bac1fa6e-7d42-455d-95ea-fb250fe258ef	d2c17bd1-fdf9-4455-8f2d-bed901819bca	b4b413c3-fd5a-46b9-9feb-807a8cdd1f2e
0e3884c2-8cce-4552-934c-68ddea05b225	5d96d5a8-306d-45f5-8b7c-e55efbae077a	b4b413c3-fd5a-46b9-9feb-807a8cdd1f2e
23c17ecc-b732-44b9-b569-8f7b87420d8e	5d96d5a8-306d-45f5-8b7c-e55efbae077a	38ff12ab-63ec-4262-bd33-829e9ef0a791
2812e9f5-0da0-4e2f-9680-ae4ed7d57e48	bea227c0-a6da-4dd9-a261-d49ffc4ec022	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37
c1cd6293-c730-45a6-a98f-ded86f7c3c2e	bea227c0-a6da-4dd9-a261-d49ffc4ec022	ba94af1a-f949-4f75-9be3-edf65f3de716
ea1cdc17-e2c9-4bdb-9517-22e45aef192e	67aa1221-00da-4157-8775-4821bb390197	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37
6877b99f-b717-4fdd-8584-dcbea09dfd5c	95e27c67-5e16-4500-a8af-c1b5e31f7488	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37
788b2ccd-509d-479f-885c-c58d4d5a16d5	95e27c67-5e16-4500-a8af-c1b5e31f7488	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
6903f551-dd21-4a51-b133-c91d52d820d2	bfcdae1d-5ab5-4340-8617-c94b64efcb9d	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37
66dee332-24bf-475c-8fc2-9c47ee812d69	bded16e6-9f82-4c5d-bd69-06c4de95700b	bea227c0-a6da-4dd9-a261-d49ffc4ec022
b9959de3-b521-4b2f-bc30-cdf223483f89	82ca4227-de4c-4172-beb5-9613fca1322b	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37
61d76828-d86a-4029-b74d-538205e51b61	5074d38c-288b-4962-9384-36030c481392	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37
3e9404c3-3bcb-47f3-a9f1-374cdc8ad1ce	5074d38c-288b-4962-9384-36030c481392	2a224c59-ade2-4efa-8b98-bfa1bc347034
47f1a661-6d7c-4d2d-8dd3-7a835d46b9d3	a4f5277b-9f26-4857-9d95-7b8d098fffb7	a8e77b4b-774d-48d3-a252-90fe263e26aa
81de4ce3-d4f6-4b41-bda3-3dae93379ea8	1f9b017a-2717-4034-b811-2171978317e6	58ad41d0-8692-4799-9e44-caa399ad2934
b681f717-14f9-4747-a872-eb9a110cadb0	1f9b017a-2717-4034-b811-2171978317e6	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
5be2acc4-eb46-4e28-80b3-9e903e5fa9cc	2f32150b-a330-4c93-8067-756890108a76	1f9b017a-2717-4034-b811-2171978317e6
563b8d3a-2a26-447a-9c27-cf06328c8c95	571a3faf-0224-4c44-b6d3-536e835f0f59	58ad41d0-8692-4799-9e44-caa399ad2934
2666d5a0-84fd-43ea-b70d-4c32d33cc538	5b80f3e0-7b30-4ab6-abb0-5a8c600774b4	c6586a3a-4484-424d-b0f3-bc3fe4029645
052df3b1-4230-47d2-9cad-0d78a107ffeb	59ecbadf-a4cf-4b91-8753-2d69a774093b	068607de-be75-4fd1-96da-ad752e614dd8
54329a4e-04ce-4d8e-99b4-0522c2e8bcb3	bbb75142-e03c-4b25-a594-caa8e80f1cb8	59ecbadf-a4cf-4b91-8753-2d69a774093b
8a49ed1d-e8b0-48cf-bf57-2e8a8cbbb8d3	717e8a65-4299-4e5d-a2c5-fdced9fe3637	59ecbadf-a4cf-4b91-8753-2d69a774093b
a9ef5c17-f7d7-4996-96ec-f8574c85681c	717e8a65-4299-4e5d-a2c5-fdced9fe3637	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
51457a12-d1b0-4021-bde8-0f36f1ea2ff6	7458cd4c-ac53-4c37-8f51-fa075031e088	59ecbadf-a4cf-4b91-8753-2d69a774093b
ad3bf115-8fe5-48ad-833e-bba444b9edef	bfd85697-1e30-48a9-a041-6ff9cdf5dce7	b4b413c3-fd5a-46b9-9feb-807a8cdd1f2e
ba60a362-bcfc-40b3-be71-8b9cc3c624f5	ce4c0ea7-4a61-42f9-ac79-ab3f142f6b5e	d2c17bd1-fdf9-4455-8f2d-bed901819bca
b8c17e10-87ad-441b-b179-65da891fa1fe	c52ef5aa-2316-46a3-9892-6feb5775736a	81c32093-9fe9-4d95-97ac-1237c9f359c4
e053d111-abfe-42ee-bc7a-02707856417f	3bbebebb-83a9-4702-8e80-23469aeee7fb	06fd03e1-50ae-4d46-85f5-d2365a6cdf88
0093bc35-4589-45ca-919a-9b745c99ba80	7a344f40-da95-4faf-86ae-8d59ec119581	3bbebebb-83a9-4702-8e80-23469aeee7fb
6735c9b0-0c1e-4b01-97c1-25ed0d17ea07	7a344f40-da95-4faf-86ae-8d59ec119581	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
7d31cdad-e60b-4e0f-9e0b-668852267a12	18a87c61-7251-4db2-abff-dd54f39154aa	f4dd3700-adc5-4ebb-9c42-3bbd07fc3b1a
9611676f-4c73-466e-9fc9-4dba3c7d7569	f3f7ab14-7af0-4d36-9e2b-a45cebecef3f	18a87c61-7251-4db2-abff-dd54f39154aa
517a2890-63ec-47dc-985c-618f29ac1c85	591be1ff-7e5a-4238-b0a0-80c74944ab71	18a87c61-7251-4db2-abff-dd54f39154aa
3e0a6f46-9894-4e74-b197-b6e95ceae7ae	81136c7a-c3dc-4e91-9b98-9f158a8b821b	c6586a3a-4484-424d-b0f3-bc3fe4029645
43f99988-d054-4c4a-8718-71e03e1f035e	ecf61093-3d5c-4e33-bc2e-87157eb1799d	f55b1082-d016-44fd-a6e4-e064cf63121d
5d3c000f-6570-4209-8182-c1d16807ac46	6d0fefe6-adf2-4223-97e1-920c92300fc3	59ecbadf-a4cf-4b91-8753-2d69a774093b
e7750449-c458-4f24-a301-55e81849bcae	be4011cf-a634-45fa-adb9-dc61f333d6af	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37
fd2e851f-2783-4203-8826-069046bcf379	5a2fa7ee-89ba-4acc-b25e-df2f3be178fb	18a87c61-7251-4db2-abff-dd54f39154aa
089d6f60-c06a-4499-8805-bab872684f3f	cfea52c0-525a-4b83-b6d7-338c4c34c831	3da91943-dffe-49e9-b5dd-d5657c0a8196
44288b26-5abf-4cdd-8bca-3d5fb8977f8b	ad4560d6-7389-4698-84aa-27062544abca	68e1485b-12a2-4a5b-a222-10303068f950
73d72935-a79c-4444-bde0-f864d571ac91	fa948162-50fc-4390-a6ef-fd51629d5b79	68e1485b-12a2-4a5b-a222-10303068f950
e02e0667-8fea-4576-bbba-c6ba503ff458	be168a7c-0aa5-4d1d-a371-7490e24d41b6	68e1485b-12a2-4a5b-a222-10303068f950
ee7f8c31-6edb-43d7-b393-1ef5f698d479	3d1da173-5964-475b-a359-c39383f44437	fa948162-50fc-4390-a6ef-fd51629d5b79
a9641bc8-b537-43ec-bd02-70bc05ef8824	c8e027bb-7a9d-42c7-9c18-8b3a3622da81	c48a3092-2787-40dc-b2d1-a0ed191cdf91
1a194c73-5597-4a33-8238-8f3266468da0	a38e22a1-4413-4806-96c0-a2e0bc8907f7	ad4560d6-7389-4698-84aa-27062544abca
05589c59-b6d2-4d5b-9751-a75854d3408d	a8fd1183-59d5-4263-a164-28332e7190f1	3d1da173-5964-475b-a359-c39383f44437
8f492b74-7e8a-44d2-889e-fa8c327298b7	6e5c962c-0429-4564-b987-4d31e04374a4	fa948162-50fc-4390-a6ef-fd51629d5b79
5824b605-eb37-41bb-b824-465c85eb796f	0ee04dee-a689-41d4-9555-276de14a9a17	6e5c962c-0429-4564-b987-4d31e04374a4
f74c1a6b-a0ff-4db7-a3cc-3d0eb0998d02	0446e38b-1680-4bb0-9fcf-77ffe2af0574	c8e027bb-7a9d-42c7-9c18-8b3a3622da81
60801276-bada-4480-9d5a-b7affe5e4fed	0446e38b-1680-4bb0-9fcf-77ffe2af0574	a38e22a1-4413-4806-96c0-a2e0bc8907f7
5f45327d-7471-4b0a-8201-849ae3a54414	17dfb436-8ece-4f7c-8e84-a5d629290e1a	0446e38b-1680-4bb0-9fcf-77ffe2af0574
4059c25d-c7bf-4bf7-bd58-66b235705335	805ab3c0-6e73-46c5-aa83-172ffa622015	a38e22a1-4413-4806-96c0-a2e0bc8907f7
29b6ec1c-513a-4b5d-a614-6eb51bffc321	a6a35e19-2503-43fd-b395-7f7a58177deb	805ab3c0-6e73-46c5-aa83-172ffa622015
33ace065-e515-4e0f-9dc4-f9d1a7b14ddf	9543d4b6-70f6-4e47-a827-1064a669ebfb	0446e38b-1680-4bb0-9fcf-77ffe2af0574
f9168780-55e7-4c55-817b-2ec83ed3e51d	44ef4523-d0ae-450b-83bb-0491833c81a0	9543d4b6-70f6-4e47-a827-1064a669ebfb
31017910-c0b7-4ea4-89ba-6c16a9172249	44ef4523-d0ae-450b-83bb-0491833c81a0	a6a35e19-2503-43fd-b395-7f7a58177deb
d3c04f68-26f9-47ec-9b4f-f1352316f2d5	bdd897ae-f4df-495b-9f8b-efaee66ba3fd	a8fd1183-59d5-4263-a164-28332e7190f1
e8256f8a-b6fa-481b-9fc7-9dee690eb913	51512984-11b6-4e5f-9e85-538bfa1c43d0	bdd897ae-f4df-495b-9f8b-efaee66ba3fd
837cd4ac-50c1-482c-80b7-a165903a499a	a14bb2d5-709a-48ec-a15d-530a73f52b8d	51512984-11b6-4e5f-9e85-538bfa1c43d0
b3f90044-16c6-4661-996a-a8c7f8bf660d	b6b6782c-f79c-40a5-94e8-52dc81a7e35c	bdd897ae-f4df-495b-9f8b-efaee66ba3fd
53d2c4c7-17ab-43f0-bf34-7bf5e7d1b457	842d22e0-a037-4584-88cd-c16094bbd8ae	c8e027bb-7a9d-42c7-9c18-8b3a3622da81
49fa7838-3e7d-4e76-93ee-94ca6f925e46	dd6262d4-d765-4097-a92a-3a9046351afb	8a271029-3500-4753-aac1-c341003bef3c
2e9bf0e1-ec6d-4254-b095-3babd75efe07	c03173a7-ec14-4a64-9ab7-eae01a939bac	c8e027bb-7a9d-42c7-9c18-8b3a3622da81
f923ace9-7717-4392-a402-55b0c51945e1	06fd9e46-be8e-4c06-9405-e7d6f8247d30	c8e027bb-7a9d-42c7-9c18-8b3a3622da81
40889788-1933-469e-8230-c952ab805063	efc82de4-4868-4f40-b32c-15a88c5f0c44	ba94af1a-f949-4f75-9be3-edf65f3de716
5ec138f8-aa2d-4487-b9a9-7c25239a0f2d	769c7a22-1103-4ad1-80ea-8b40da836e63	06fd9e46-be8e-4c06-9405-e7d6f8247d30
fd1e510c-0341-4415-b319-831136404638	30f987e2-0408-49f4-b988-7dae6a57e020	0446e38b-1680-4bb0-9fcf-77ffe2af0574
a31e42ab-4f56-4962-9e07-8d654d40087d	045e0163-4f2e-4d77-a5cd-b18a3560ef3d	a8fd1183-59d5-4263-a164-28332e7190f1
d2dd2c1e-3c31-46fe-af40-15962c9de9c2	16ae4ae7-680c-4875-bfbe-059db58af922	dd6262d4-d765-4097-a92a-3a9046351afb
ca661297-434c-46b6-8166-f5bf6f0c786c	caffa6ee-b331-447a-a854-eb5953c6fd42	a14bb2d5-709a-48ec-a15d-530a73f52b8d
79211d1c-b355-4bfb-bf47-e04ef8d55fac	a85a4fbb-fb1e-4527-882e-77b407b9d55f	c8e027bb-7a9d-42c7-9c18-8b3a3622da81
984229af-1dad-4c77-bd9d-43fa753b8254	bc749420-e4bb-4d64-b897-422b8e9a4346	a85a4fbb-fb1e-4527-882e-77b407b9d55f
707c9f35-301a-4905-a17d-d6a924eed8a3	61f5b2fc-6a42-4c05-9050-e5caaf5859e2	bc749420-e4bb-4d64-b897-422b8e9a4346
64535e03-837b-44a4-ab30-4bf988f4ce59	b34d421f-6b77-402f-ab43-7ff5761f309a	61f5b2fc-6a42-4c05-9050-e5caaf5859e2
0e0d8fd5-a550-4270-b467-9acc1fd781df	07cf0a5f-4b9b-4fa8-818b-310a098fee3c	61f5b2fc-6a42-4c05-9050-e5caaf5859e2
8896f3c6-1c4f-4bc0-8dd2-7ef78d8af8a3	e58b6b14-b058-4d93-9178-36da8329f190	a85a4fbb-fb1e-4527-882e-77b407b9d55f
1ef7f5a3-66a9-48a1-8bf1-309cff1299fc	170da289-839c-4fd2-9955-598a7b81aae5	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37
b740613b-d9c5-49f4-856b-21778dee32f2	8e756a96-d255-44f5-af16-0175f510c0ef	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37
3d62042c-da97-4401-bd1b-dfd08e63a691	810a7b88-4dca-4c9c-9b8d-eb3dfdb93556	38ff12ab-63ec-4262-bd33-829e9ef0a791
b5706bb1-2930-413b-a733-aee6028fa735	1fcf308a-cf90-4126-bb1d-0a6ead8e1498	170da289-839c-4fd2-9955-598a7b81aae5
756f5b0e-218f-4f9e-bb54-7fdd83ff76ae	8ee7529c-c0bd-4bff-abd1-36f9ed7f17a1	1fcf308a-cf90-4126-bb1d-0a6ead8e1498
439923dc-2cfd-4691-9e68-9f7e6f48f8e8	17070098-ff0b-4a01-a5d7-fff75f209d3a	c8e027bb-7a9d-42c7-9c18-8b3a3622da81
43bcf268-071b-4eaa-a0ed-7b5d94598edf	9b9b8a4c-71c3-4c16-9814-ee60b1640a5d	170da289-839c-4fd2-9955-598a7b81aae5
79165af9-5360-475f-b34e-11de2302b04e	c126d734-219f-4e96-b6c0-7f9f937a1256	f4dd3700-adc5-4ebb-9c42-3bbd07fc3b1a
a270f036-92af-4801-8354-d99a3c88d60d	cc2329aa-0e41-4468-9524-250ca67c2762	8a271029-3500-4753-aac1-c341003bef3c
3c922c84-0f19-45a1-bbef-8b3e0d0e798e	b0ee516b-0cba-4475-b2f0-9045f69d1ec4	8a271029-3500-4753-aac1-c341003bef3c
82bf4723-feaf-4da0-a07c-7a5243c12f14	b0ee516b-0cba-4475-b2f0-9045f69d1ec4	c7ab6263-a31e-4b9d-99ba-79ce802a2343
70a7ebb4-0d3a-4484-a021-1cd35d27e242	597a3fc4-2c62-43b2-baaa-e3a986edbd56	b4b413c3-fd5a-46b9-9feb-807a8cdd1f2e
a1c0558a-cb56-4a31-968e-de689b377271	597a3fc4-2c62-43b2-baaa-e3a986edbd56	b0ee516b-0cba-4475-b2f0-9045f69d1ec4
04b44376-0e63-410a-9bce-0122fcfc89fc	0ef00d12-4d7d-422b-ad77-ba6dd9bb87a5	ce260160-76c4-4d00-a48a-15e81a26ba57
0ef4c8c8-f881-458e-9310-13d28920ae57	0ef00d12-4d7d-422b-ad77-ba6dd9bb87a5	b0ee516b-0cba-4475-b2f0-9045f69d1ec4
f94e3733-51ae-4512-948e-b5f4dbb9e929	a99d428b-21d5-40f4-9621-0e5c49848376	cc2329aa-0e41-4468-9524-250ca67c2762
86a6a380-7c2a-4d77-94b1-ce8f35e98440	a99d428b-21d5-40f4-9621-0e5c49848376	5c0cd9f9-e0e7-4d48-bf94-b00b24a42a37
4ba7aa4f-1f2b-4fd6-8329-203565969134	551b8c50-6dc5-4d0c-b95f-027eed46ddca	b0ee516b-0cba-4475-b2f0-9045f69d1ec4
852f27d6-06de-4ef6-9d29-d821a98381d2	551b8c50-6dc5-4d0c-b95f-027eed46ddca	af10e683-9f20-4eec-b10b-beb731158aa1
81603199-2d65-464a-8bf8-b08f7b2e705d	2787122f-1f3e-497f-b49b-ee8dc70fc439	b0ee516b-0cba-4475-b2f0-9045f69d1ec4
52bdca6d-75eb-49bc-a208-5d8abaa29f02	2787122f-1f3e-497f-b49b-ee8dc70fc439	c0852243-0142-407b-a128-d666fe5ef76d
304f4c05-6d72-450f-b6eb-13b274e84f50	a8f77db7-5f4d-4daf-8cf5-77bb00351275	b0ee516b-0cba-4475-b2f0-9045f69d1ec4
4ba04ed0-6466-4fb2-bd53-3c8e3e12c6e8	a81f60eb-04bc-465f-a6df-2d603e45ff16	551b8c50-6dc5-4d0c-b95f-027eed46ddca
a5014882-2dbb-4c60-a482-7a9a6f71d557	a81f60eb-04bc-465f-a6df-2d603e45ff16	2787122f-1f3e-497f-b49b-ee8dc70fc439
4320e119-0630-4c6a-bfa3-15e5f67da52b	fca57ccd-14b6-418f-b9d0-b62eea4a0a6a	06fd03e1-50ae-4d46-85f5-d2365a6cdf88
5aa35de2-9ae2-4b35-9cc9-19f44301db64	fca57ccd-14b6-418f-b9d0-b62eea4a0a6a	acb63f0e-6faa-429e-ad1d-3c9b81ccff1f
e710bd51-b67d-4f95-bf58-d3c3f0945c57	f1086a2c-cd16-4614-ab3b-3f343592bbbc	af10e683-9f20-4eec-b10b-beb731158aa1
4c18cd78-b322-4fd3-b444-19a7dc39416b	f1086a2c-cd16-4614-ab3b-3f343592bbbc	b0ee516b-0cba-4475-b2f0-9045f69d1ec4
af52eaad-161a-4cba-ba79-b6a30d84fd47	74742585-4fdd-457c-9b0b-c5c9ea41ad76	b0ee516b-0cba-4475-b2f0-9045f69d1ec4
124bdbb6-078e-4552-922b-5e2ed34f6ae0	74742585-4fdd-457c-9b0b-c5c9ea41ad76	c0852243-0142-407b-a128-d666fe5ef76d
d8e2de27-39f3-4123-a4fb-03ee54892fed	7244bd0c-ff95-439f-ab25-4f218f502f2d	b4b413c3-fd5a-46b9-9feb-807a8cdd1f2e
7fa69081-fdad-48e7-9454-95af69b10f45	7244bd0c-ff95-439f-ab25-4f218f502f2d	b0ee516b-0cba-4475-b2f0-9045f69d1ec4
f12f353a-fc05-4500-96fe-2aca652f4611	6ced40b3-51b7-496d-8040-132e299fd59b	b4b413c3-fd5a-46b9-9feb-807a8cdd1f2e
3d1ef438-166a-4222-8e62-d08a2cb73500	6ced40b3-51b7-496d-8040-132e299fd59b	b0ee516b-0cba-4475-b2f0-9045f69d1ec4
e089c6ec-5ec4-4db7-b1d5-5615c32c436d	f522a7ab-939a-49ec-8e89-b8ae6e834c35	2787122f-1f3e-497f-b49b-ee8dc70fc439
b86ba1c6-1b1a-4fab-b1ee-043361915e6c	20880c5e-8a82-42f4-ba33-251617e72a20	f55b1082-d016-44fd-a6e4-e064cf63121d
7d0bf978-a91e-4ca6-a645-364e57d853c4	20880c5e-8a82-42f4-ba33-251617e72a20	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
04f8a2db-1ce9-4049-a0ba-b7ccdce33be0	aebdee76-3a76-4b33-8866-87def5351e77	ca1a2e0d-b1c1-4043-9e31-9ce313e243b5
3928b7c3-a510-4a97-8cd2-25e34a6148a2	9d7578ff-1b16-4ad3-afb6-746557bfb8df	0ef00d12-4d7d-422b-ad77-ba6dd9bb87a5
0667b83f-dbc4-4f9f-b85d-7271727f100c	ee972a3b-eeca-45a7-abca-5b367b65580f	9d7578ff-1b16-4ad3-afb6-746557bfb8df
b34f0cf5-9aaa-42fb-b3b5-d0bd94e9b176	f33943a0-885c-4d06-92dc-94d078eee315	ee972a3b-eeca-45a7-abca-5b367b65580f
7b17caf3-5042-45da-b2a3-e9f6b6a333ec	054c96a7-0db2-4232-a9f5-de96d46ec984	ee972a3b-eeca-45a7-abca-5b367b65580f
b10e2934-82a8-48ce-8a8b-30691b61ba0c	054c96a7-0db2-4232-a9f5-de96d46ec984	2787122f-1f3e-497f-b49b-ee8dc70fc439
457476ae-bd7f-4be6-8c20-3ccc4ba37af2	f60984a8-f1bc-4e23-b19c-ad1033d6eb75	ee972a3b-eeca-45a7-abca-5b367b65580f
da17c253-c833-422f-827b-13c116cbe935	3f193912-741a-455d-a382-f12e7b8c6fbc	7244bd0c-ff95-439f-ab25-4f218f502f2d
6dd1dba4-27f5-4780-927e-f3f5bf826df6	ddf8d759-cc27-44c9-9ebc-37b49c86301c	7244bd0c-ff95-439f-ab25-4f218f502f2d
f0890e9c-cfaf-4f1a-8f8a-5ac23db1254a	2df026fb-c43a-4050-ae76-570f1f776873	6ced40b3-51b7-496d-8040-132e299fd59b
73c7d0ba-6041-4e70-9fa4-e479df2ffe22	80dd40cb-f82b-4795-9340-6fcfdf89352e	6ced40b3-51b7-496d-8040-132e299fd59b
b247c468-b7fb-4757-99c4-669d54193928	afb340f4-cddd-4fd3-80f2-67a843c55bad	597a3fc4-2c62-43b2-baaa-e3a986edbd56
d9ce4500-f2f6-4b70-a503-93ac8b3475f9	afb340f4-cddd-4fd3-80f2-67a843c55bad	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
d88500fb-627e-4041-b744-e3ca6aaeb177	6bdb44f5-3fad-4d01-8b8e-598d6062a3f5	597a3fc4-2c62-43b2-baaa-e3a986edbd56
262ecd9e-ac95-41d4-b91a-61c1b49ea4d1	9161de90-1b87-43a8-8a04-75f215a1f7c3	597a3fc4-2c62-43b2-baaa-e3a986edbd56
934fa7bd-ae10-4024-b05f-63cf39d2e6c8	a9302edf-c148-4aff-83bb-17c43f89da5b	6bdb44f5-3fad-4d01-8b8e-598d6062a3f5
cca4129e-5fa3-434e-b28c-2edda4e057eb	e361d00e-6c7b-4fe1-932e-a07a11470939	597a3fc4-2c62-43b2-baaa-e3a986edbd56
98e801e7-4c27-4eb7-a193-569f3c0ead9f	82443a49-63fc-4f44-8bc7-b135eaca17e8	bea227c0-a6da-4dd9-a261-d49ffc4ec022
9803c155-89d9-468c-9785-be9a4e94f402	3a48f71d-48ee-469f-9bab-3cb94d64620d	6ced40b3-51b7-496d-8040-132e299fd59b
58126ee9-dfd1-40e3-89e3-bdea8e2f4ec6	46a45347-be5d-4883-973b-34a26f44d674	afb340f4-cddd-4fd3-80f2-67a843c55bad
e4fb2281-a807-4425-9eed-0a7728d88c2e	f2e93b90-ad02-4370-9a5b-1a77c2cfdeef	6ced40b3-51b7-496d-8040-132e299fd59b
ef71fb1e-7089-4ee5-888a-f8493c789f0a	76c4329a-151a-4f96-bce1-cb566573f59c	b0ee516b-0cba-4475-b2f0-9045f69d1ec4
e511aff3-5162-4ec5-8b1a-1c124d2b2dab	586eeeda-b6bd-4c45-9801-fac087810ea5	d237e481-b06b-468d-a70a-653a4230e765
6bc059e2-c48c-4807-bb08-a6bb13f9c301	b036e41e-e4ce-4799-898d-9e17bf8b0eb1	d237e481-b06b-468d-a70a-653a4230e765
3e534fd5-1c89-4343-aa22-8943873b8d8b	26575fb5-08d4-44e6-aab7-a86c38342c53	586eeeda-b6bd-4c45-9801-fac087810ea5
983f124f-61ca-404b-9b29-bd1a7bb2cf0a	bf8dd7d5-d77e-4fef-9e80-60f0ef91f8a9	26575fb5-08d4-44e6-aab7-a86c38342c53
def78425-aa72-4d34-92ef-95188896eb44	cbe4abed-bdd9-4c92-bc1c-6db9b2de077d	d237e481-b06b-468d-a70a-653a4230e765
236e3b21-314f-4644-94dc-832a6b72eec8	cbe4abed-bdd9-4c92-bc1c-6db9b2de077d	624d5ac9-a2bc-4ba1-a6ad-a68bee09fe52
6e624dfc-5758-4c40-89df-4adb93098e38	43784e74-df63-4bd3-b555-3fb8d900cd58	4aa0a985-1bfe-4470-9896-3807d10f8a32
4b62e81b-6e81-4c08-8158-fc5e067293c1	43784e74-df63-4bd3-b555-3fb8d900cd58	26575fb5-08d4-44e6-aab7-a86c38342c53
56f1703a-c5d5-438a-9f72-05f63e421aa1	f4f5dd57-8cf2-48e0-a50c-7260465c05b2	43784e74-df63-4bd3-b555-3fb8d900cd58
c26f7cf1-34d4-420e-ab3e-42dbd37b2726	ee88b900-df76-4387-968f-35f7e5c67540	d237e481-b06b-468d-a70a-653a4230e765
aac40c12-22a3-4542-8240-d9ce4ea3de80	b6af7b67-c0bd-4505-aa0c-3190e52bc74a	020ff657-e54d-4d6c-b536-24af9e92d1cb
b3d20a1c-eaa4-4250-9395-ff8304cb2cde	b6af7b67-c0bd-4505-aa0c-3190e52bc74a	d237e481-b06b-468d-a70a-653a4230e765
fd5ede86-9bd1-4b4f-819b-ae61112e45ba	57797f6a-9ff5-40e0-aef9-4fdb760947c5	b6af7b67-c0bd-4505-aa0c-3190e52bc74a
d7bb9dd9-3ffd-4511-a7a0-a0d605052a6f	6fd01578-33bb-40af-b195-d4e236e848a2	4aa0a985-1bfe-4470-9896-3807d10f8a32
0ffbaf94-f48f-450f-aaa8-e10b8da6c590	21ac0db1-1599-4a74-9c11-ccab5e762dc4	6fd01578-33bb-40af-b195-d4e236e848a2
31abf7c6-efac-42c8-88dd-834906e21cc4	f4ac4c74-390c-4b05-a080-8146771733f7	26575fb5-08d4-44e6-aab7-a86c38342c53
78c63ee6-3414-4d8e-89d8-8a26145feb8a	83a26811-ccc6-40be-8902-f128229ee956	26575fb5-08d4-44e6-aab7-a86c38342c53
45990f03-3971-4d18-9048-ce9968082656	7b22c201-d331-444b-9b5e-138244770876	6fd01578-33bb-40af-b195-d4e236e848a2
f5475eda-b303-467e-b5f5-abde5e95fe69	79398a6a-4150-48a0-a20b-6c2b16366b94	6fd01578-33bb-40af-b195-d4e236e848a2
405eb8a9-e391-495e-b133-483b89777c3e	73ccff28-5a8c-46b1-9862-58e949f4e4af	d237e481-b06b-468d-a70a-653a4230e765
c896c769-4421-47b1-89d1-3d6148f244b7	a5a1f31d-ac98-439f-ab87-5cefa161351c	6442e653-0432-4c43-9b84-9d01e0f75ea9
de373d21-e4b7-4f56-8f06-3ef3f90997fb	061fc565-fe2e-4e4b-89a4-01c0dd995944	a5a1f31d-ac98-439f-ab87-5cefa161351c
c9ac44e4-3cb8-4e6f-a5c9-3dda33ac9a6d	6a71b067-d484-4d52-a924-cfbfa7894d6b	a5a1f31d-ac98-439f-ab87-5cefa161351c
d84008af-fa36-4dc6-92c7-03a5fd444157	6045975a-8b04-4045-b821-50f662db8426	a5a1f31d-ac98-439f-ab87-5cefa161351c
b5eb9ed2-46c3-40ca-930d-6f00edc079dc	790c93ad-5916-47c3-b802-7c14229aab23	a5a1f31d-ac98-439f-ab87-5cefa161351c
0a4c03c8-eab1-4b69-b0ee-8623cc90c611	790c93ad-5916-47c3-b802-7c14229aab23	f27c8b5a-8e1c-4f2a-ac78-e79d1a800730
cf1e864b-dc5a-41a8-9478-1cd350efe793	a736f850-3391-494f-81d5-a3faa97419d5	790c93ad-5916-47c3-b802-7c14229aab23
6c5de0e2-0d67-4a2a-a4c9-92192dfb7da6	a736f850-3391-494f-81d5-a3faa97419d5	5f29d989-d8a2-42cb-a4ea-ad1f777fa85b
c962baa7-bb47-47b3-a57a-b31696ce023f	badaab5e-ed61-4305-8297-d3f9fb048449	790c93ad-5916-47c3-b802-7c14229aab23
7b8d6f83-92b0-4de6-8b12-fc5cba6b39f8	b2ef2d61-0e76-4877-935b-5bd307399256	790c93ad-5916-47c3-b802-7c14229aab23
4c644afc-da74-4436-b18c-90c6df98ef64	a4933cba-1494-4e78-8d83-51763d182ebb	58ad41d0-8692-4799-9e44-caa399ad2934
b0c176d7-88f1-4456-b365-2cb787f3b4b5	a4933cba-1494-4e78-8d83-51763d182ebb	061fc565-fe2e-4e4b-89a4-01c0dd995944
8719bb90-9f58-42a4-be4e-28e4905463e2	0d77aa2f-2af6-48cf-b4a6-499e79cd4473	a5a1f31d-ac98-439f-ab87-5cefa161351c
ba7e8f0d-d092-4cfd-97dd-5561c599263a	c033880b-22ba-401c-ba38-efc32aa74491	a5a1f31d-ac98-439f-ab87-5cefa161351c
5091bef1-b1ae-478d-99d1-dd43ff990f97	260e3f52-d38f-4bf5-ac7d-b47b726a7f23	6a71b067-d484-4d52-a924-cfbfa7894d6b
9eae70df-f4a4-489a-b004-a3f1c1912436	86c23e82-7202-4740-990c-936986e671f0	6a71b067-d484-4d52-a924-cfbfa7894d6b
2bd71f9d-5ef4-4730-bc09-c2270657fa7e	3f99f958-0878-49d2-b7e4-29047884cfc3	86c23e82-7202-4740-990c-936986e671f0
a937b3a5-173a-4041-b19d-d3ac0d8b6114	ab2cf0dd-a8f2-4f1f-bb6a-71f5be6596eb	a5a1f31d-ac98-439f-ab87-5cefa161351c
e2a86b89-b38b-41c1-b674-c1657ac7c509	309e2c18-44e8-4dc4-b242-53e57a7df9b3	790c93ad-5916-47c3-b802-7c14229aab23
fbdfe000-3295-46ff-bf44-f487a43192cd	309e2c18-44e8-4dc4-b242-53e57a7df9b3	ab2cf0dd-a8f2-4f1f-bb6a-71f5be6596eb
9a2f953f-2300-4e53-984e-66a3d9c9c08c	b56b03c8-9a54-4f9c-8560-3211efca5693	6a71b067-d484-4d52-a924-cfbfa7894d6b
2d1d349d-8411-4785-b9b9-0449a098bbea	628a680f-d8da-4d26-a21f-d2b64d828721	c033880b-22ba-401c-ba38-efc32aa74491
c67c7862-5fe1-44e6-a0d7-7e61637b5b42	61796ad5-4ffa-4efa-b47d-1dda37b1585f	061fc565-fe2e-4e4b-89a4-01c0dd995944
3ebbc6e1-1754-44ed-b7e3-3122ec54d1f3	a96a9ec9-ed66-48eb-8f9b-dac2656350af	571a3faf-0224-4c44-b6d3-536e835f0f59
09a2fccd-b5fb-40da-aee6-e5a6a5db4948	a96a9ec9-ed66-48eb-8f9b-dac2656350af	a5a1f31d-ac98-439f-ab87-5cefa161351c
b6414515-3e46-4b41-a898-6931f0a14d84	26eff53e-cbe6-4320-93fd-4385b53d9973	790c93ad-5916-47c3-b802-7c14229aab23
6f8ae043-333e-4d4c-9d74-d3d52da70e00	fd1fe096-e8f1-4a16-b9ee-f0c2b0c6867b	b4b413c3-fd5a-46b9-9feb-807a8cdd1f2e
2878aa6e-8d30-47d6-82d6-f6b9f1348b32	44c0c9f4-5000-4bc8-ab84-f642223a02d5	fd1fe096-e8f1-4a16-b9ee-f0c2b0c6867b
2903aa53-f660-4e5a-8e34-9d3d359c3467	44c0c9f4-5000-4bc8-ab84-f642223a02d5	ba94af1a-f949-4f75-9be3-edf65f3de716
996238fa-83cd-4c61-8582-9cf1a84c4446	865aa4d9-4b87-468b-9638-6dcb98a1883e	44c0c9f4-5000-4bc8-ab84-f642223a02d5
eaa6c8e7-2168-441a-94ad-bd8cd5a1faf1	73a9d33d-0562-4eb5-8764-c4c349e36dc4	fd1fe096-e8f1-4a16-b9ee-f0c2b0c6867b
b5350371-9827-41ac-b2aa-468b02cdc407	1eb8cb9e-f807-4369-930a-0f4e1104f6db	44c0c9f4-5000-4bc8-ab84-f642223a02d5
d337ed1a-582d-41e2-b54f-7645817e9c2e	d3188ade-a47e-4db5-8229-dce9f983c59d	44c0c9f4-5000-4bc8-ab84-f642223a02d5
e3113612-005e-497c-b344-8a2fff7c9cb5	a4b74658-c5cc-4dcb-8b18-75aff72809c0	b4b413c3-fd5a-46b9-9feb-807a8cdd1f2e
6ed27f1f-10ac-4bb6-b30b-7a3d5ed60a14	a4b74658-c5cc-4dcb-8b18-75aff72809c0	5d96d5a8-306d-45f5-8b7c-e55efbae077a
6f11590c-11bd-4975-9498-d90d43735cc7	3da91943-dffe-49e9-b5dd-d5657c0a8196	8a37c02b-e3ad-4de5-8329-5a22f4ec3b64
125ffcaa-7e5c-4223-a8c3-f0cbf7cfbc06	ac136adb-9302-4c20-b143-bde1a4fb5644	8a37c02b-e3ad-4de5-8329-5a22f4ec3b64
a6881e73-0c34-420d-b312-d59123ed6059	46c3a7e1-ad27-4acb-9420-b32fba742bfb	3da91943-dffe-49e9-b5dd-d5657c0a8196
0635b5fe-80ef-45ff-8bff-64900d7c8cc9	68e1485b-12a2-4a5b-a222-10303068f950	46c3a7e1-ad27-4acb-9420-b32fba742bfb
c2e6a2f1-7ccb-42c2-84a9-5a6237b28711	8a271029-3500-4753-aac1-c341003bef3c	68e1485b-12a2-4a5b-a222-10303068f950
50be4e93-87b3-463a-b0a8-bb49b0c6e484	d237e481-b06b-468d-a70a-653a4230e765	8a271029-3500-4753-aac1-c341003bef3c
9c53ddb3-40c6-4585-b40e-66e603cbb5a5	76794f94-a309-4391-8dc2-859457d224af	68e1485b-12a2-4a5b-a222-10303068f950
eb42e1ac-aaef-4c85-b80b-d485304a22f0	c48a3092-2787-40dc-b2d1-a0ed191cdf91	76794f94-a309-4391-8dc2-859457d224af
080417af-39b0-41ec-b29e-42429815c16f	6442e653-0432-4c43-9b84-9d01e0f75ea9	8a271029-3500-4753-aac1-c341003bef3c
8c350c79-47d2-4b52-b455-fe8495432b98	6442e653-0432-4c43-9b84-9d01e0f75ea9	76794f94-a309-4391-8dc2-859457d224af
3bd8bdac-c9e1-44a8-9c3d-803aeacc93e0	42b3943e-4c43-4397-a673-07ce0dce925c	ac136adb-9302-4c20-b143-bde1a4fb5644
c7c20acf-5f89-4aab-906c-554bb2c6a274	c5c4d326-4899-4008-bb18-fdc366121570	8a271029-3500-4753-aac1-c341003bef3c
be007e1c-555d-43d9-bdeb-099ab4172ae5	c5c4d326-4899-4008-bb18-fdc366121570	76794f94-a309-4391-8dc2-859457d224af
570672f7-7772-47a1-a948-2dbcc6f4d4da	e00aa8a6-9755-46ec-aac6-1a589150d9e9	8a271029-3500-4753-aac1-c341003bef3c
6ea0fc04-3c0d-48e8-b5b9-ed9b4a6bd5db	e00aa8a6-9755-46ec-aac6-1a589150d9e9	c5c4d326-4899-4008-bb18-fdc366121570
21b8eaf4-ec58-4c96-927f-2b1f4857f685	0d47246e-6c5b-44da-8d0c-51fd376c5595	e00aa8a6-9755-46ec-aac6-1a589150d9e9
3380b89c-f484-4981-b115-245ba6c081ac	d28310b9-7551-4a4b-b41d-22ad981df234	0d47246e-6c5b-44da-8d0c-51fd376c5595
223de3d6-1390-474a-bdb7-7b7397adae97	ba94af1a-f949-4f75-9be3-edf65f3de716	3da91943-dffe-49e9-b5dd-d5657c0a8196
17e2d16d-19cd-450a-84f6-faeadbc1004e	5ea37a34-465d-4760-9b34-e5483e1d3495	ac136adb-9302-4c20-b143-bde1a4fb5644
b283327e-ce65-4a2b-9af7-a203a6187922	f30747a3-0fe8-428c-874e-f3e0e627e4b2	76794f94-a309-4391-8dc2-859457d224af
78c09b0f-fb5b-4f1b-ac67-e0e371dd47af	f30747a3-0fe8-428c-874e-f3e0e627e4b2	6442e653-0432-4c43-9b84-9d01e0f75ea9
b42d7ebc-6b6d-47fa-9380-77c0ef43337d	ee0d9bf3-0c9a-44a8-aad5-0dd3fcc1517b	8a271029-3500-4753-aac1-c341003bef3c
88ac0c1d-ead6-4c9b-ba15-88d3cdc4c8c6	0403803d-8bdc-4fee-9acb-e4ca69f807e2	8a271029-3500-4753-aac1-c341003bef3c
6cf93174-5b9e-4083-9fdf-8863bd2a834a	c7ab6263-a31e-4b9d-99ba-79ce802a2343	8a271029-3500-4753-aac1-c341003bef3c
1b96e27b-260e-4e8b-9853-92552aa9d0d1	624d5ac9-a2bc-4ba1-a6ad-a68bee09fe52	8a271029-3500-4753-aac1-c341003bef3c
c63fe0e2-9db5-4ee5-a5e6-e6ac6b76b5bd	a45fda86-07ad-4636-86e5-571c61d1c49f	0d47246e-6c5b-44da-8d0c-51fd376c5595
a155cf25-d8cf-447d-9da0-c3710f47ead0	a45fda86-07ad-4636-86e5-571c61d1c49f	ee0d9bf3-0c9a-44a8-aad5-0dd3fcc1517b
96e8fe15-a2cc-46d1-a60e-36f2f38006c5	c0852243-0142-407b-a128-d666fe5ef76d	0d47246e-6c5b-44da-8d0c-51fd376c5595
37386342-20bf-4fef-a0c6-8dbf83a7ae44	c0852243-0142-407b-a128-d666fe5ef76d	0403803d-8bdc-4fee-9acb-e4ca69f807e2
b1b0fd85-b3ea-4be6-b2ab-04e89a371551	66ebeb2f-20ac-49e0-bba1-c06ce55896dd	c48a3092-2787-40dc-b2d1-a0ed191cdf91
7835727a-b837-42cf-b610-e5152f134330	66ebeb2f-20ac-49e0-bba1-c06ce55896dd	6442e653-0432-4c43-9b84-9d01e0f75ea9
507cad7c-4b51-4f05-aac9-e0d06ad31941	af10e683-9f20-4eec-b10b-beb731158aa1	66ebeb2f-20ac-49e0-bba1-c06ce55896dd
77d40387-b606-47c6-ae94-83cbe942116d	06fd03e1-50ae-4d46-85f5-d2365a6cdf88	8a271029-3500-4753-aac1-c341003bef3c
31bfca33-1f84-4bdd-bccc-66ba6fe99107	06fd03e1-50ae-4d46-85f5-d2365a6cdf88	c48a3092-2787-40dc-b2d1-a0ed191cdf91
\.


--
-- Data for Name: StudentHomework; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."StudentHomework" (id, "studentId", "homeworkId", status, "submittedAt", score, feedback) FROM stdin;
\.


--
-- Data for Name: Submission; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."Submission" (id, "userId", "exerciseId", code, status, output, "errorMsg", "executionTime", "createdAt") FROM stdin;
\.


--
-- Data for Name: SystemConfig; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."SystemConfig" (id, key, value, "updatedAt") FROM stdin;
\.


--
-- Data for Name: TestCase; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."TestCase" (id, "exerciseId", input, output, "isHidden", "orderIndex", "timeLimit", "memoryLimit", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."User" (id, username, email, password, name, avatar, role, level, xp, "totalXp", streak, "lastStudyDate", "streakProtectedAt", hearts, "maxHearts", "heartsUpdatedAt", gems, "inviteCode", "classId", "tokenVersion", "createdAt", "updatedAt", "emailVerified") FROM stdin;
1f1e830b-e709-4358-9ce0-f9453298f2ce	teacher@noiquest.com	teacher@noiquest.com	$2a$12$ZtAba/CGAyRp6VHsfHBUSeataG6VHbWnz5VEG2lfo8cUQ6.Rh9Agm	张老师	👨‍🏫	TEACHER	1	0	0	0	\N	\N	5	5	2026-01-30 16:29:54.366	0	\N	\N	0	2026-01-30 16:29:54.366	2026-01-30 16:29:54.366	f
8738a703-3540-4842-911e-acaa73a0af9b	student@noiquest.com	student@noiquest.com	$2a$12$ZtAba/CGAyRp6VHsfHBUSeataG6VHbWnz5VEG2lfo8cUQ6.Rh9Agm	小明	🦊	STUDENT	1	280	280	0	\N	\N	3	5	2026-01-31 04:52:11.978	100	\N	\N	12	2026-01-30 16:29:54.37	2026-02-01 12:46:22.449	f
974d5607-f00a-478f-a37b-3e31c6f68f08	admin@noiquest.com	admin@noiquest.com	$2a$12$ZtAba/CGAyRp6VHsfHBUSeataG6VHbWnz5VEG2lfo8cUQ6.Rh9Agm	系统管理员	👑	ADMIN	99	99999	99999	0	\N	\N	5	5	2026-01-30 16:29:54.373	9999	\N	\N	6	2026-01-30 16:29:54.373	2026-02-01 13:14:54.779	f
e00cfaae-5a52-4c55-9807-1e206d0f157e	moranda6	moranda6@icloud.com	$2a$12$4oGkbq76Lafv/pIPTCC4ue.El5U9urJCjyS8bO8e4PVMMkhJQI5eK	mud	🦊	STUDENT	1	322	322	0	\N	\N	3	5	2026-01-31 05:20:56.68	0	C139E01C	\N	1	2026-01-31 05:07:19	2026-01-31 05:22:24.169	f
\.


--
-- Data for Name: UserAchievement; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."UserAchievement" (id, "userId", "achievementId", "unlockedAt", progress, notified) FROM stdin;
\.


--
-- Data for Name: UserCourseProgress; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."UserCourseProgress" (id, "userId", "courseId", unlocked, completed, "sessionsCompleted", "crownLevel", "totalXpEarned", "startedAt", "completedAt", "createdAt", "updatedAt") FROM stdin;
f23ed667-2b14-4e2c-8a71-59ff944592ea	e00cfaae-5a52-4c55-9807-1e206d0f157e	85a77e95-71c9-4019-856e-36d4361475b6	t	f	2	0	0	\N	\N	2026-01-31 05:10:22.947	2026-02-01 07:57:53.867
07d7c3a4-39ae-463b-8294-89b37ab56755	8738a703-3540-4842-911e-acaa73a0af9b	85a77e95-71c9-4019-856e-36d4361475b6	t	f	2	0	0	\N	\N	2026-01-31 04:37:30.313	2026-02-01 12:45:29.52
\.


--
-- Data for Name: UserDailyQuest; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."UserDailyQuest" (id, "userId", "templateId", "currentValue", "targetValue", completed, claimed, "xpReward", "gemsReward", date, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserDailySettings; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."UserDailySettings" (id, "userId", "dailyGoal", "reminderEnabled", "reminderTime", "createdAt", "updatedAt") FROM stdin;
8cdff1f3-e5fc-4694-8b35-1c0568d2158e	8738a703-3540-4842-911e-acaa73a0af9b	REGULAR	t	\N	2026-01-30 16:30:27.298	2026-01-30 16:30:27.298
fe18e49d-e3fd-4a79-bba8-5ffcd9805ab9	e00cfaae-5a52-4c55-9807-1e206d0f157e	REGULAR	t	\N	2026-01-31 05:07:19.953	2026-01-31 05:07:19.953
\.


--
-- Data for Name: UserFile; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."UserFile" (id, "userId", name, content, "createdAt", "updatedAt") FROM stdin;
98127b3b-20ac-4e19-8bbf-5ba61f64de3f	974d5607-f00a-478f-a37b-3e31c6f68f08	main.cpp	#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n	2026-01-30 16:43:08.76	2026-02-01 13:15:25.035
06017964-55bc-4f84-9f30-ef31cba4638d	8738a703-3540-4842-911e-acaa73a0af9b	main.cpp		2026-01-30 16:32:50.353	2026-01-31 04:37:07.643
a8527583-7bb0-49df-a31f-a83cb6bb1837	e00cfaae-5a52-4c55-9807-1e206d0f157e	main.cpp	#include <iostream>\nusing namespace std;\n\nint main() {\n    int a;\n    cin >> a;\n    if (a % 400 == 0){\n        cout << "闰年";\n    }else{\n        if (a % 4 == 0){\n            cout << "闰年";\n        }else{\n            cout << "不是闰年";\n        }\n    }\n    return 0;\n}\n	2026-01-31 05:07:49.773	2026-02-01 08:09:51.884
\.


--
-- Data for Name: UserLeague; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."UserLeague" (id, "userId", league, "weeklyXp", "weeklyRank", "promotedAt", "demotedAt", "createdAt", "updatedAt") FROM stdin;
fd94d6b9-08b5-4982-9985-c3a474871e2f	8738a703-3540-4842-911e-acaa73a0af9b	BRONZE	0	\N	\N	\N	2026-01-31 04:37:16.362	2026-01-31 04:37:16.362
e0464a19-5ae9-44de-a243-7c8d2b02a920	e00cfaae-5a52-4c55-9807-1e206d0f157e	BRONZE	0	\N	\N	\N	2026-01-31 05:08:24.777	2026-01-31 05:08:24.777
\.


--
-- Data for Name: UserSessionProgress; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."UserSessionProgress" (id, "userId", "sessionId", completed, mistakes, "perfectRun", "completedCount", "xpEarned", "lastCompletedAt", "createdAt", "updatedAt") FROM stdin;
9c29343d-5960-4b3a-ade0-d94613c27985	8738a703-3540-4842-911e-acaa73a0af9b	ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	t	1	f	1	0	2026-01-31 04:49:32.591	2026-01-31 04:37:30.308	2026-01-31 04:49:32.592
75a520a9-0c6d-4def-b4ed-1f3c58d692be	8738a703-3540-4842-911e-acaa73a0af9b	e5d1c27f-474b-4085-846e-7f438fad7d3d	t	1	f	1	0	2026-01-31 04:55:41.16	2026-01-31 04:49:48.638	2026-01-31 04:55:41.161
72c3fcbd-7b13-4b9a-b28a-95529b0b1775	e00cfaae-5a52-4c55-9807-1e206d0f157e	ea42b99b-5ecf-4d7d-bc8b-d0e3b860d2dc	t	0	t	1	0	2026-01-31 05:12:18.599	2026-01-31 05:10:22.941	2026-01-31 05:12:18.6
2b7ba787-e052-4c66-beda-059046152670	e00cfaae-5a52-4c55-9807-1e206d0f157e	e5d1c27f-474b-4085-846e-7f438fad7d3d	t	0	t	1	0	2026-01-31 05:17:04.946	2026-01-31 05:14:48.75	2026-01-31 05:17:04.947
327e4659-f2f6-41db-a92b-b07e423f02c0	e00cfaae-5a52-4c55-9807-1e206d0f157e	747327b0-56fe-4814-bc53-48d97d4f9ab6	f	0	f	0	0	\N	2026-01-31 05:17:15.605	2026-02-01 07:57:53.862
e5ce233c-819f-4cf2-885f-b1df56fbff78	8738a703-3540-4842-911e-acaa73a0af9b	747327b0-56fe-4814-bc53-48d97d4f9ab6	f	0	f	0	0	\N	2026-02-01 12:45:29.515	2026-02-01 12:45:29.515
\.


--
-- Data for Name: UserTierProgress; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."UserTierProgress" (id, "userId", tier, unlocked, "unitsCompleted", "totalUnits", "completionRate", "unlockedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserUnitProgress; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."UserUnitProgress" (id, "userId", "unitId", unlocked, completed, "crownLevel", "perfectCount", "createdAt", "updatedAt") FROM stdin;
ce75dc6b-78d8-4101-a1b4-27700d06f5d3	e00cfaae-5a52-4c55-9807-1e206d0f157e	8a37c02b-e3ad-4de5-8329-5a22f4ec3b64	t	f	0	0	2026-01-31 05:10:22.951	2026-02-01 07:57:53.87
e9ca7b1f-cabb-4ed8-a00d-d3babeda8029	8738a703-3540-4842-911e-acaa73a0af9b	8a37c02b-e3ad-4de5-8329-5a22f4ec3b64	t	f	0	0	2026-01-31 04:37:30.317	2026-02-01 12:45:29.523
\.


--
-- Data for Name: VerificationCode; Type: TABLE DATA; Schema: public; Owner: noiquest
--

COPY public."VerificationCode" (id, email, code, "expiresAt", used, "createdAt") FROM stdin;
7cfc8520-a37b-477d-ba74-d346f93da968	18724005390@qq.com	496182	2026-01-31 04:35:05.465	f	2026-01-31 04:30:05.468
66e4f186-bb10-43c2-b7f0-03f2ddab4884	moranda6@icloud.com	551384	2026-01-31 04:36:06.169	f	2026-01-31 04:31:06.17
0617fb93-f45b-43c4-9a8d-7341aa72001c	moranda6@icloud.com	998642	2026-01-31 05:10:32.584	t	2026-01-31 05:05:32.586
d2333138-44fe-4014-b86f-736f08d03bab	1539349804@qq.com	562427	2026-01-31 11:34:52.3	f	2026-01-31 11:29:52.301
\.


--
-- Name: AIUsageRecord AIUsageRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."AIUsageRecord"
    ADD CONSTRAINT "AIUsageRecord_pkey" PRIMARY KEY (id);


--
-- Name: Achievement Achievement_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."Achievement"
    ADD CONSTRAINT "Achievement_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: Class Class_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."Class"
    ADD CONSTRAINT "Class_pkey" PRIMARY KEY (id);


--
-- Name: ContentVersion ContentVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ContentVersion"
    ADD CONSTRAINT "ContentVersion_pkey" PRIMARY KEY (id);


--
-- Name: CoursePrerequisite CoursePrerequisite_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."CoursePrerequisite"
    ADD CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY (id);


--
-- Name: CourseSession CourseSession_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."CourseSession"
    ADD CONSTRAINT "CourseSession_pkey" PRIMARY KEY (id);


--
-- Name: CourseUnit CourseUnit_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."CourseUnit"
    ADD CONSTRAINT "CourseUnit_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: DailyLearningStats DailyLearningStats_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."DailyLearningStats"
    ADD CONSTRAINT "DailyLearningStats_pkey" PRIMARY KEY (id);


--
-- Name: DailyQuestTemplate DailyQuestTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."DailyQuestTemplate"
    ADD CONSTRAINT "DailyQuestTemplate_pkey" PRIMARY KEY (id);


--
-- Name: DailyXpRecord DailyXpRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."DailyXpRecord"
    ADD CONSTRAINT "DailyXpRecord_pkey" PRIMARY KEY (id);


--
-- Name: ExerciseKnowledgePoint ExerciseKnowledgePoint_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ExerciseKnowledgePoint"
    ADD CONSTRAINT "ExerciseKnowledgePoint_pkey" PRIMARY KEY (id);


--
-- Name: ExerciseProgress ExerciseProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ExerciseProgress"
    ADD CONSTRAINT "ExerciseProgress_pkey" PRIMARY KEY (id);


--
-- Name: ExerciseStatistics ExerciseStatistics_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ExerciseStatistics"
    ADD CONSTRAINT "ExerciseStatistics_pkey" PRIMARY KEY (id);


--
-- Name: Exercise Exercise_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."Exercise"
    ADD CONSTRAINT "Exercise_pkey" PRIMARY KEY (id);


--
-- Name: HomeworkExercise HomeworkExercise_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."HomeworkExercise"
    ADD CONSTRAINT "HomeworkExercise_pkey" PRIMARY KEY (id);


--
-- Name: Homework Homework_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."Homework"
    ADD CONSTRAINT "Homework_pkey" PRIMARY KEY (id);


--
-- Name: InviteCode InviteCode_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."InviteCode"
    ADD CONSTRAINT "InviteCode_pkey" PRIMARY KEY (id);


--
-- Name: KnowledgeMastery KnowledgeMastery_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."KnowledgeMastery"
    ADD CONSTRAINT "KnowledgeMastery_pkey" PRIMARY KEY (id);


--
-- Name: KnowledgePoint KnowledgePoint_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."KnowledgePoint"
    ADD CONSTRAINT "KnowledgePoint_pkey" PRIMARY KEY (id);


--
-- Name: LeaderboardEntry LeaderboardEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."LeaderboardEntry"
    ADD CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY (id);


--
-- Name: LearningSession LearningSession_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."LearningSession"
    ADD CONSTRAINT "LearningSession_pkey" PRIMARY KEY (id);


--
-- Name: MistakeRecord MistakeRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."MistakeRecord"
    ADD CONSTRAINT "MistakeRecord_pkey" PRIMARY KEY (id);


--
-- Name: Module Module_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."Module"
    ADD CONSTRAINT "Module_pkey" PRIMARY KEY (id);


--
-- Name: RedeemCode RedeemCode_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."RedeemCode"
    ADD CONSTRAINT "RedeemCode_pkey" PRIMARY KEY (id);


--
-- Name: RedeemRecord RedeemRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."RedeemRecord"
    ADD CONSTRAINT "RedeemRecord_pkey" PRIMARY KEY (id);


--
-- Name: ReviewReminder ReviewReminder_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ReviewReminder"
    ADD CONSTRAINT "ReviewReminder_pkey" PRIMARY KEY (id);


--
-- Name: SessionExercise SessionExercise_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."SessionExercise"
    ADD CONSTRAINT "SessionExercise_pkey" PRIMARY KEY (id);


--
-- Name: SkillUnitPrerequisite SkillUnitPrerequisite_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."SkillUnitPrerequisite"
    ADD CONSTRAINT "SkillUnitPrerequisite_pkey" PRIMARY KEY (id);


--
-- Name: SkillUnit SkillUnit_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."SkillUnit"
    ADD CONSTRAINT "SkillUnit_pkey" PRIMARY KEY (id);


--
-- Name: StudentHomework StudentHomework_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."StudentHomework"
    ADD CONSTRAINT "StudentHomework_pkey" PRIMARY KEY (id);


--
-- Name: Submission Submission_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_pkey" PRIMARY KEY (id);


--
-- Name: SystemConfig SystemConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."SystemConfig"
    ADD CONSTRAINT "SystemConfig_pkey" PRIMARY KEY (id);


--
-- Name: TestCase TestCase_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."TestCase"
    ADD CONSTRAINT "TestCase_pkey" PRIMARY KEY (id);


--
-- Name: UserAchievement UserAchievement_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_pkey" PRIMARY KEY (id);


--
-- Name: UserCourseProgress UserCourseProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserCourseProgress"
    ADD CONSTRAINT "UserCourseProgress_pkey" PRIMARY KEY (id);


--
-- Name: UserDailyQuest UserDailyQuest_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserDailyQuest"
    ADD CONSTRAINT "UserDailyQuest_pkey" PRIMARY KEY (id);


--
-- Name: UserDailySettings UserDailySettings_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserDailySettings"
    ADD CONSTRAINT "UserDailySettings_pkey" PRIMARY KEY (id);


--
-- Name: UserFile UserFile_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserFile"
    ADD CONSTRAINT "UserFile_pkey" PRIMARY KEY (id);


--
-- Name: UserLeague UserLeague_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserLeague"
    ADD CONSTRAINT "UserLeague_pkey" PRIMARY KEY (id);


--
-- Name: UserSessionProgress UserSessionProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserSessionProgress"
    ADD CONSTRAINT "UserSessionProgress_pkey" PRIMARY KEY (id);


--
-- Name: UserTierProgress UserTierProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserTierProgress"
    ADD CONSTRAINT "UserTierProgress_pkey" PRIMARY KEY (id);


--
-- Name: UserUnitProgress UserUnitProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserUnitProgress"
    ADD CONSTRAINT "UserUnitProgress_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VerificationCode VerificationCode_pkey; Type: CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."VerificationCode"
    ADD CONSTRAINT "VerificationCode_pkey" PRIMARY KEY (id);


--
-- Name: AIUsageRecord_date_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "AIUsageRecord_date_idx" ON public."AIUsageRecord" USING btree (date);


--
-- Name: AIUsageRecord_userId_date_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "AIUsageRecord_userId_date_key" ON public."AIUsageRecord" USING btree ("userId", date);


--
-- Name: AIUsageRecord_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "AIUsageRecord_userId_idx" ON public."AIUsageRecord" USING btree ("userId");


--
-- Name: Achievement_category_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Achievement_category_idx" ON public."Achievement" USING btree (category);


--
-- Name: Achievement_key_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "Achievement_key_key" ON public."Achievement" USING btree (key);


--
-- Name: Achievement_rarity_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Achievement_rarity_idx" ON public."Achievement" USING btree (rarity);


--
-- Name: ChatMessage_createdAt_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "ChatMessage_createdAt_idx" ON public."ChatMessage" USING btree ("createdAt");


--
-- Name: ChatMessage_sessionId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "ChatMessage_sessionId_idx" ON public."ChatMessage" USING btree ("sessionId");


--
-- Name: ChatMessage_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "ChatMessage_userId_idx" ON public."ChatMessage" USING btree ("userId");


--
-- Name: Class_teacherId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Class_teacherId_idx" ON public."Class" USING btree ("teacherId");


--
-- Name: ContentVersion_createdAt_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "ContentVersion_createdAt_idx" ON public."ContentVersion" USING btree ("createdAt");


--
-- Name: ContentVersion_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "ContentVersion_entityType_entityId_idx" ON public."ContentVersion" USING btree ("entityType", "entityId");


--
-- Name: CoursePrerequisite_courseId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "CoursePrerequisite_courseId_idx" ON public."CoursePrerequisite" USING btree ("courseId");


--
-- Name: CoursePrerequisite_courseId_prerequisiteId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "CoursePrerequisite_courseId_prerequisiteId_key" ON public."CoursePrerequisite" USING btree ("courseId", "prerequisiteId");


--
-- Name: CoursePrerequisite_prerequisiteId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "CoursePrerequisite_prerequisiteId_idx" ON public."CoursePrerequisite" USING btree ("prerequisiteId");


--
-- Name: CourseSession_courseId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "CourseSession_courseId_idx" ON public."CourseSession" USING btree ("courseId");


--
-- Name: CourseSession_isPublished_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "CourseSession_isPublished_idx" ON public."CourseSession" USING btree ("isPublished");


--
-- Name: CourseSession_orderIndex_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "CourseSession_orderIndex_idx" ON public."CourseSession" USING btree ("orderIndex");


--
-- Name: CourseUnit_courseId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "CourseUnit_courseId_idx" ON public."CourseUnit" USING btree ("courseId");


--
-- Name: CourseUnit_courseId_unitId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "CourseUnit_courseId_unitId_key" ON public."CourseUnit" USING btree ("courseId", "unitId");


--
-- Name: CourseUnit_unitId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "CourseUnit_unitId_idx" ON public."CourseUnit" USING btree ("unitId");


--
-- Name: Course_code_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "Course_code_key" ON public."Course" USING btree (code);


--
-- Name: Course_isPublished_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Course_isPublished_idx" ON public."Course" USING btree ("isPublished");


--
-- Name: Course_moduleId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Course_moduleId_idx" ON public."Course" USING btree ("moduleId");


--
-- Name: Course_orderIndex_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Course_orderIndex_idx" ON public."Course" USING btree ("orderIndex");


--
-- Name: Course_tier_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Course_tier_idx" ON public."Course" USING btree (tier);


--
-- Name: DailyLearningStats_date_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "DailyLearningStats_date_idx" ON public."DailyLearningStats" USING btree (date);


--
-- Name: DailyLearningStats_userId_date_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "DailyLearningStats_userId_date_key" ON public."DailyLearningStats" USING btree ("userId", date);


--
-- Name: DailyXpRecord_date_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "DailyXpRecord_date_idx" ON public."DailyXpRecord" USING btree (date);


--
-- Name: DailyXpRecord_userId_date_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "DailyXpRecord_userId_date_key" ON public."DailyXpRecord" USING btree ("userId", date);


--
-- Name: DailyXpRecord_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "DailyXpRecord_userId_idx" ON public."DailyXpRecord" USING btree ("userId");


--
-- Name: ExerciseKnowledgePoint_exerciseId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "ExerciseKnowledgePoint_exerciseId_idx" ON public."ExerciseKnowledgePoint" USING btree ("exerciseId");


--
-- Name: ExerciseKnowledgePoint_exerciseId_knowledgePointId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "ExerciseKnowledgePoint_exerciseId_knowledgePointId_key" ON public."ExerciseKnowledgePoint" USING btree ("exerciseId", "knowledgePointId");


--
-- Name: ExerciseKnowledgePoint_knowledgePointId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "ExerciseKnowledgePoint_knowledgePointId_idx" ON public."ExerciseKnowledgePoint" USING btree ("knowledgePointId");


--
-- Name: ExerciseProgress_exerciseId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "ExerciseProgress_exerciseId_idx" ON public."ExerciseProgress" USING btree ("exerciseId");


--
-- Name: ExerciseProgress_userId_exerciseId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "ExerciseProgress_userId_exerciseId_key" ON public."ExerciseProgress" USING btree ("userId", "exerciseId");


--
-- Name: ExerciseProgress_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "ExerciseProgress_userId_idx" ON public."ExerciseProgress" USING btree ("userId");


--
-- Name: ExerciseStatistics_exerciseId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "ExerciseStatistics_exerciseId_key" ON public."ExerciseStatistics" USING btree ("exerciseId");


--
-- Name: Exercise_category_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Exercise_category_idx" ON public."Exercise" USING btree (category);


--
-- Name: Exercise_difficulty_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Exercise_difficulty_idx" ON public."Exercise" USING btree (difficulty);


--
-- Name: Exercise_isPublished_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Exercise_isPublished_idx" ON public."Exercise" USING btree ("isPublished");


--
-- Name: Exercise_source_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Exercise_source_idx" ON public."Exercise" USING btree (source);


--
-- Name: Exercise_type_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Exercise_type_idx" ON public."Exercise" USING btree (type);


--
-- Name: HomeworkExercise_homeworkId_exerciseId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "HomeworkExercise_homeworkId_exerciseId_key" ON public."HomeworkExercise" USING btree ("homeworkId", "exerciseId");


--
-- Name: Homework_classId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Homework_classId_idx" ON public."Homework" USING btree ("classId");


--
-- Name: Homework_teacherId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Homework_teacherId_idx" ON public."Homework" USING btree ("teacherId");


--
-- Name: InviteCode_code_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "InviteCode_code_idx" ON public."InviteCode" USING btree (code);


--
-- Name: InviteCode_code_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "InviteCode_code_key" ON public."InviteCode" USING btree (code);


--
-- Name: InviteCode_createdBy_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "InviteCode_createdBy_idx" ON public."InviteCode" USING btree ("createdBy");


--
-- Name: InviteCode_type_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "InviteCode_type_idx" ON public."InviteCode" USING btree (type);


--
-- Name: KnowledgeMastery_nextReviewAt_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "KnowledgeMastery_nextReviewAt_idx" ON public."KnowledgeMastery" USING btree ("nextReviewAt");


--
-- Name: KnowledgeMastery_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "KnowledgeMastery_userId_idx" ON public."KnowledgeMastery" USING btree ("userId");


--
-- Name: KnowledgeMastery_userId_knowledgeKey_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "KnowledgeMastery_userId_knowledgeKey_key" ON public."KnowledgeMastery" USING btree ("userId", "knowledgeKey");


--
-- Name: KnowledgePoint_category_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "KnowledgePoint_category_idx" ON public."KnowledgePoint" USING btree (category);


--
-- Name: KnowledgePoint_name_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "KnowledgePoint_name_key" ON public."KnowledgePoint" USING btree (name);


--
-- Name: LeaderboardEntry_period_periodKey_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "LeaderboardEntry_period_periodKey_idx" ON public."LeaderboardEntry" USING btree (period, "periodKey");


--
-- Name: LeaderboardEntry_userId_period_periodKey_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "LeaderboardEntry_userId_period_periodKey_key" ON public."LeaderboardEntry" USING btree ("userId", period, "periodKey");


--
-- Name: LeaderboardEntry_xp_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "LeaderboardEntry_xp_idx" ON public."LeaderboardEntry" USING btree (xp DESC);


--
-- Name: LearningSession_sessionType_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "LearningSession_sessionType_idx" ON public."LearningSession" USING btree ("sessionType");


--
-- Name: LearningSession_userId_startedAt_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "LearningSession_userId_startedAt_idx" ON public."LearningSession" USING btree ("userId", "startedAt");


--
-- Name: MistakeRecord_source_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "MistakeRecord_source_idx" ON public."MistakeRecord" USING btree (source);


--
-- Name: MistakeRecord_userId_exerciseId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "MistakeRecord_userId_exerciseId_key" ON public."MistakeRecord" USING btree ("userId", "exerciseId");


--
-- Name: MistakeRecord_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "MistakeRecord_userId_idx" ON public."MistakeRecord" USING btree ("userId");


--
-- Name: MistakeRecord_userId_sessionId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "MistakeRecord_userId_sessionId_idx" ON public."MistakeRecord" USING btree ("userId", "sessionId");


--
-- Name: MistakeRecord_userId_status_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "MistakeRecord_userId_status_idx" ON public."MistakeRecord" USING btree ("userId", status);


--
-- Name: RedeemCode_code_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "RedeemCode_code_idx" ON public."RedeemCode" USING btree (code);


--
-- Name: RedeemCode_code_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "RedeemCode_code_key" ON public."RedeemCode" USING btree (code);


--
-- Name: RedeemCode_type_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "RedeemCode_type_idx" ON public."RedeemCode" USING btree (type);


--
-- Name: RedeemRecord_userId_codeId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "RedeemRecord_userId_codeId_key" ON public."RedeemRecord" USING btree ("userId", "codeId");


--
-- Name: RedeemRecord_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "RedeemRecord_userId_idx" ON public."RedeemRecord" USING btree ("userId");


--
-- Name: ReviewReminder_type_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "ReviewReminder_type_idx" ON public."ReviewReminder" USING btree (type);


--
-- Name: ReviewReminder_userId_read_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "ReviewReminder_userId_read_idx" ON public."ReviewReminder" USING btree ("userId", read);


--
-- Name: SessionExercise_exerciseId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "SessionExercise_exerciseId_idx" ON public."SessionExercise" USING btree ("exerciseId");


--
-- Name: SessionExercise_sessionId_exerciseId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "SessionExercise_sessionId_exerciseId_key" ON public."SessionExercise" USING btree ("sessionId", "exerciseId");


--
-- Name: SessionExercise_sessionId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "SessionExercise_sessionId_idx" ON public."SessionExercise" USING btree ("sessionId");


--
-- Name: SkillUnitPrerequisite_prerequisiteId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "SkillUnitPrerequisite_prerequisiteId_idx" ON public."SkillUnitPrerequisite" USING btree ("prerequisiteId");


--
-- Name: SkillUnitPrerequisite_unitId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "SkillUnitPrerequisite_unitId_idx" ON public."SkillUnitPrerequisite" USING btree ("unitId");


--
-- Name: SkillUnitPrerequisite_unitId_prerequisiteId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "SkillUnitPrerequisite_unitId_prerequisiteId_key" ON public."SkillUnitPrerequisite" USING btree ("unitId", "prerequisiteId");


--
-- Name: SkillUnit_code_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "SkillUnit_code_idx" ON public."SkillUnit" USING btree (code);


--
-- Name: SkillUnit_code_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "SkillUnit_code_key" ON public."SkillUnit" USING btree (code);


--
-- Name: SkillUnit_isPublished_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "SkillUnit_isPublished_idx" ON public."SkillUnit" USING btree ("isPublished");


--
-- Name: SkillUnit_moduleId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "SkillUnit_moduleId_idx" ON public."SkillUnit" USING btree ("moduleId");


--
-- Name: SkillUnit_orderIndex_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "SkillUnit_orderIndex_idx" ON public."SkillUnit" USING btree ("orderIndex");


--
-- Name: SkillUnit_tier_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "SkillUnit_tier_idx" ON public."SkillUnit" USING btree (tier);


--
-- Name: StudentHomework_homeworkId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "StudentHomework_homeworkId_idx" ON public."StudentHomework" USING btree ("homeworkId");


--
-- Name: StudentHomework_studentId_homeworkId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "StudentHomework_studentId_homeworkId_key" ON public."StudentHomework" USING btree ("studentId", "homeworkId");


--
-- Name: StudentHomework_studentId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "StudentHomework_studentId_idx" ON public."StudentHomework" USING btree ("studentId");


--
-- Name: Submission_createdAt_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Submission_createdAt_idx" ON public."Submission" USING btree ("createdAt");


--
-- Name: Submission_exerciseId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Submission_exerciseId_idx" ON public."Submission" USING btree ("exerciseId");


--
-- Name: Submission_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "Submission_userId_idx" ON public."Submission" USING btree ("userId");


--
-- Name: SystemConfig_key_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "SystemConfig_key_key" ON public."SystemConfig" USING btree (key);


--
-- Name: TestCase_exerciseId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "TestCase_exerciseId_idx" ON public."TestCase" USING btree ("exerciseId");


--
-- Name: TestCase_orderIndex_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "TestCase_orderIndex_idx" ON public."TestCase" USING btree ("orderIndex");


--
-- Name: UserAchievement_notified_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserAchievement_notified_idx" ON public."UserAchievement" USING btree (notified);


--
-- Name: UserAchievement_userId_achievementId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON public."UserAchievement" USING btree ("userId", "achievementId");


--
-- Name: UserAchievement_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserAchievement_userId_idx" ON public."UserAchievement" USING btree ("userId");


--
-- Name: UserCourseProgress_courseId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserCourseProgress_courseId_idx" ON public."UserCourseProgress" USING btree ("courseId");


--
-- Name: UserCourseProgress_userId_courseId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "UserCourseProgress_userId_courseId_key" ON public."UserCourseProgress" USING btree ("userId", "courseId");


--
-- Name: UserCourseProgress_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserCourseProgress_userId_idx" ON public."UserCourseProgress" USING btree ("userId");


--
-- Name: UserDailyQuest_date_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserDailyQuest_date_idx" ON public."UserDailyQuest" USING btree (date);


--
-- Name: UserDailyQuest_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserDailyQuest_userId_idx" ON public."UserDailyQuest" USING btree ("userId");


--
-- Name: UserDailyQuest_userId_templateId_date_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "UserDailyQuest_userId_templateId_date_key" ON public."UserDailyQuest" USING btree ("userId", "templateId", date);


--
-- Name: UserDailySettings_userId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "UserDailySettings_userId_key" ON public."UserDailySettings" USING btree ("userId");


--
-- Name: UserFile_updatedAt_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserFile_updatedAt_idx" ON public."UserFile" USING btree ("updatedAt");


--
-- Name: UserFile_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserFile_userId_idx" ON public."UserFile" USING btree ("userId");


--
-- Name: UserFile_userId_name_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "UserFile_userId_name_key" ON public."UserFile" USING btree ("userId", name);


--
-- Name: UserLeague_userId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "UserLeague_userId_key" ON public."UserLeague" USING btree ("userId");


--
-- Name: UserSessionProgress_sessionId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserSessionProgress_sessionId_idx" ON public."UserSessionProgress" USING btree ("sessionId");


--
-- Name: UserSessionProgress_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserSessionProgress_userId_idx" ON public."UserSessionProgress" USING btree ("userId");


--
-- Name: UserSessionProgress_userId_sessionId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "UserSessionProgress_userId_sessionId_key" ON public."UserSessionProgress" USING btree ("userId", "sessionId");


--
-- Name: UserTierProgress_tier_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserTierProgress_tier_idx" ON public."UserTierProgress" USING btree (tier);


--
-- Name: UserTierProgress_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserTierProgress_userId_idx" ON public."UserTierProgress" USING btree ("userId");


--
-- Name: UserTierProgress_userId_tier_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "UserTierProgress_userId_tier_key" ON public."UserTierProgress" USING btree ("userId", tier);


--
-- Name: UserUnitProgress_unitId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserUnitProgress_unitId_idx" ON public."UserUnitProgress" USING btree ("unitId");


--
-- Name: UserUnitProgress_userId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "UserUnitProgress_userId_idx" ON public."UserUnitProgress" USING btree ("userId");


--
-- Name: UserUnitProgress_userId_unitId_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "UserUnitProgress_userId_unitId_key" ON public."UserUnitProgress" USING btree ("userId", "unitId");


--
-- Name: User_classId_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "User_classId_idx" ON public."User" USING btree ("classId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_inviteCode_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "User_inviteCode_idx" ON public."User" USING btree ("inviteCode");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: User_username_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "User_username_idx" ON public."User" USING btree (username);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: VerificationCode_email_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "VerificationCode_email_idx" ON public."VerificationCode" USING btree (email);


--
-- Name: VerificationCode_expiresAt_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "VerificationCode_expiresAt_idx" ON public."VerificationCode" USING btree ("expiresAt");


--
-- Name: VerificationCode_used_idx; Type: INDEX; Schema: public; Owner: noiquest
--

CREATE INDEX "VerificationCode_used_idx" ON public."VerificationCode" USING btree (used);


--
-- Name: AIUsageRecord AIUsageRecord_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."AIUsageRecord"
    ADD CONSTRAINT "AIUsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessage ChatMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CoursePrerequisite CoursePrerequisite_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."CoursePrerequisite"
    ADD CONSTRAINT "CoursePrerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CoursePrerequisite CoursePrerequisite_prerequisiteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."CoursePrerequisite"
    ADD CONSTRAINT "CoursePrerequisite_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseSession CourseSession_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."CourseSession"
    ADD CONSTRAINT "CourseSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseUnit CourseUnit_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."CourseUnit"
    ADD CONSTRAINT "CourseUnit_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseUnit CourseUnit_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."CourseUnit"
    ADD CONSTRAINT "CourseUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."SkillUnit"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Course Course_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."Module"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DailyLearningStats DailyLearningStats_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."DailyLearningStats"
    ADD CONSTRAINT "DailyLearningStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DailyXpRecord DailyXpRecord_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."DailyXpRecord"
    ADD CONSTRAINT "DailyXpRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExerciseKnowledgePoint ExerciseKnowledgePoint_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ExerciseKnowledgePoint"
    ADD CONSTRAINT "ExerciseKnowledgePoint_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."Exercise"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExerciseKnowledgePoint ExerciseKnowledgePoint_knowledgePointId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ExerciseKnowledgePoint"
    ADD CONSTRAINT "ExerciseKnowledgePoint_knowledgePointId_fkey" FOREIGN KEY ("knowledgePointId") REFERENCES public."KnowledgePoint"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExerciseProgress ExerciseProgress_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ExerciseProgress"
    ADD CONSTRAINT "ExerciseProgress_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."Exercise"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExerciseProgress ExerciseProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ExerciseProgress"
    ADD CONSTRAINT "ExerciseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExerciseStatistics ExerciseStatistics_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ExerciseStatistics"
    ADD CONSTRAINT "ExerciseStatistics_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."Exercise"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: HomeworkExercise HomeworkExercise_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."HomeworkExercise"
    ADD CONSTRAINT "HomeworkExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."Exercise"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: HomeworkExercise HomeworkExercise_homeworkId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."HomeworkExercise"
    ADD CONSTRAINT "HomeworkExercise_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES public."Homework"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Homework Homework_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."Homework"
    ADD CONSTRAINT "Homework_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Homework Homework_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."Homework"
    ADD CONSTRAINT "Homework_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KnowledgeMastery KnowledgeMastery_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."KnowledgeMastery"
    ADD CONSTRAINT "KnowledgeMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LeaderboardEntry LeaderboardEntry_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."LeaderboardEntry"
    ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearningSession LearningSession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."LearningSession"
    ADD CONSTRAINT "LearningSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MistakeRecord MistakeRecord_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."MistakeRecord"
    ADD CONSTRAINT "MistakeRecord_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."Exercise"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MistakeRecord MistakeRecord_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."MistakeRecord"
    ADD CONSTRAINT "MistakeRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RedeemRecord RedeemRecord_codeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."RedeemRecord"
    ADD CONSTRAINT "RedeemRecord_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES public."RedeemCode"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RedeemRecord RedeemRecord_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."RedeemRecord"
    ADD CONSTRAINT "RedeemRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReviewReminder ReviewReminder_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."ReviewReminder"
    ADD CONSTRAINT "ReviewReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SessionExercise SessionExercise_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."SessionExercise"
    ADD CONSTRAINT "SessionExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."Exercise"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SessionExercise SessionExercise_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."SessionExercise"
    ADD CONSTRAINT "SessionExercise_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."CourseSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SkillUnitPrerequisite SkillUnitPrerequisite_prerequisiteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."SkillUnitPrerequisite"
    ADD CONSTRAINT "SkillUnitPrerequisite_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES public."SkillUnit"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SkillUnitPrerequisite SkillUnitPrerequisite_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."SkillUnitPrerequisite"
    ADD CONSTRAINT "SkillUnitPrerequisite_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."SkillUnit"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SkillUnit SkillUnit_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."SkillUnit"
    ADD CONSTRAINT "SkillUnit_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."Module"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StudentHomework StudentHomework_homeworkId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."StudentHomework"
    ADD CONSTRAINT "StudentHomework_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES public."Homework"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentHomework StudentHomework_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."StudentHomework"
    ADD CONSTRAINT "StudentHomework_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Submission Submission_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."Exercise"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Submission Submission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."Submission"
    ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TestCase TestCase_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."TestCase"
    ADD CONSTRAINT "TestCase_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."Exercise"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserAchievement UserAchievement_achievementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES public."Achievement"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserAchievement UserAchievement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserAchievement"
    ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCourseProgress UserCourseProgress_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserCourseProgress"
    ADD CONSTRAINT "UserCourseProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCourseProgress UserCourseProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserCourseProgress"
    ADD CONSTRAINT "UserCourseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserDailyQuest UserDailyQuest_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserDailyQuest"
    ADD CONSTRAINT "UserDailyQuest_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."DailyQuestTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserDailyQuest UserDailyQuest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserDailyQuest"
    ADD CONSTRAINT "UserDailyQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserDailySettings UserDailySettings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserDailySettings"
    ADD CONSTRAINT "UserDailySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserFile UserFile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserFile"
    ADD CONSTRAINT "UserFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserLeague UserLeague_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserLeague"
    ADD CONSTRAINT "UserLeague_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserSessionProgress UserSessionProgress_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserSessionProgress"
    ADD CONSTRAINT "UserSessionProgress_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."CourseSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserSessionProgress UserSessionProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserSessionProgress"
    ADD CONSTRAINT "UserSessionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserTierProgress UserTierProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserTierProgress"
    ADD CONSTRAINT "UserTierProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserUnitProgress UserUnitProgress_unitId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserUnitProgress"
    ADD CONSTRAINT "UserUnitProgress_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public."SkillUnit"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserUnitProgress UserUnitProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."UserUnitProgress"
    ADD CONSTRAINT "UserUnitProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: noiquest
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict dHg789YOh5hpdauZg4bYGXXouuMWwOb1cwZYLy7T3YB5Uk8vUw9c4oQ8Du231Pz

