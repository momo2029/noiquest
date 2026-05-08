-- 添加匿名用户支持的数据库迁移
-- 执行时间: 2026-05-08

-- 1. 创建 AuthType 枚举
CREATE TYPE "AuthType" AS ENUM ('ANONYMOUS', 'EMAIL', 'OAUTH');

-- 2. 修改 User 表
ALTER TABLE "User"
  -- 将必填字段改为可选
  ALTER COLUMN "username" DROP NOT NULL,
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "password" DROP NOT NULL,
  ALTER COLUMN "name" DROP NOT NULL,

  -- 添加新字段
  ADD COLUMN "avatarUrl" TEXT,
  ADD COLUMN "authType" "AuthType" NOT NULL DEFAULT 'ANONYMOUS',
  ADD COLUMN "isActivated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "activationMethod" TEXT,
  ADD COLUMN "activatedAt" TIMESTAMP(3);

-- 3. 更新现有用户为已激活状态
UPDATE "User"
SET
  "authType" = 'EMAIL',
  "isActivated" = true,
  "activationMethod" = 'email',
  "activatedAt" = "createdAt"
WHERE "email" IS NOT NULL;

-- 4. 添加索引
CREATE INDEX "User_authType_idx" ON "User"("authType");
CREATE INDEX "User_isActivated_idx" ON "User"("isActivated");
CREATE INDEX "User_email_idx" ON "User"("email");

-- 完成
