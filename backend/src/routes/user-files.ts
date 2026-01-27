import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

const MAX_FILES_PER_USER = 50;

// 文件名验证（必须是 .cpp 文件）
const fileNameSchema = z.string()
  .min(1, '文件名不能为空')
  .max(100, '文件名过长')
  .regex(/^[a-zA-Z0-9_\-\u4e00-\u9fa5]+\.cpp$/, '文件名只能包含字母、数字、下划线、中划线和中文，且必须以 .cpp 结尾');

// 获取文件列表（只返回元信息）
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const files = await prisma.userFile.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ files });
  } catch (error) {
    next(error);
  }
});

// 获取单个文件内容
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const file = await prisma.userFile.findFirst({
      where: { id, userId },
    });

    if (!file) {
      throw new AppError('文件不存在', 404);
    }

    res.json({ file });
  } catch (error) {
    next(error);
  }
});

// 同步文件的验证 schema
const syncFileSchema = z.object({
  id: z.string().uuid().optional(), // 新文件没有 id
  name: fileNameSchema,
  content: z.string().max(1024 * 1024, '文件内容过大'), // 最大 1MB
  updatedAt: z.string().datetime().optional(),
});

const syncSchema = z.object({
  files: z.array(syncFileSchema).max(MAX_FILES_PER_USER, `最多只能保存 ${MAX_FILES_PER_USER} 个文件`),
  deletedIds: z.array(z.string().uuid()).optional(),
});

// 批量同步文件
router.post('/sync', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { files, deletedIds } = syncSchema.parse(req.body);

    // 检查文件数量限制
    const existingCount = await prisma.userFile.count({ where: { userId } });
    const newFilesCount = files.filter(f => !f.id).length;
    const deletedCount = deletedIds?.length || 0;

    if (existingCount + newFilesCount - deletedCount > MAX_FILES_PER_USER) {
      throw new AppError(`文件数量超过限制（最多 ${MAX_FILES_PER_USER} 个）`, 400);
    }

    // 使用事务处理同步
    const result = await prisma.$transaction(async (tx) => {
      // 删除文件
      if (deletedIds && deletedIds.length > 0) {
        await tx.userFile.deleteMany({
          where: {
            id: { in: deletedIds },
            userId,
          },
        });
      }

      // 更新或创建文件
      const syncedFiles = [];
      for (const file of files) {
        if (file.id) {
          // 更新现有文件
          const existing = await tx.userFile.findFirst({
            where: { id: file.id, userId },
          });

          if (existing) {
            const updated = await tx.userFile.update({
              where: { id: file.id },
              data: {
                name: file.name,
                content: file.content,
              },
            });
            syncedFiles.push(updated);
          }
        } else {
          // 创建新文件
          // 检查文件名是否已存在
          const existingByName = await tx.userFile.findFirst({
            where: { userId, name: file.name },
          });

          if (existingByName) {
            // 更新同名文件
            const updated = await tx.userFile.update({
              where: { id: existingByName.id },
              data: { content: file.content },
            });
            syncedFiles.push(updated);
          } else {
            // 创建新文件
            const created = await tx.userFile.create({
              data: {
                userId,
                name: file.name,
                content: file.content,
              },
            });
            syncedFiles.push(created);
          }
        }
      }

      return syncedFiles;
    });

    res.json({
      message: '同步成功',
      files: result.map(f => ({
        id: f.id,
        name: f.name,
        updatedAt: f.updatedAt,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError('数据格式错误: ' + error.errors.map(e => e.message).join(', '), 400));
    }
    next(error);
  }
});

// 删除文件
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const file = await prisma.userFile.findFirst({
      where: { id, userId },
    });

    if (!file) {
      throw new AppError('文件不存在', 404);
    }

    await prisma.userFile.delete({
      where: { id },
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

export { router as userFilesRouter };
