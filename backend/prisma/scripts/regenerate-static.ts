/**
 * 重新生成知识图谱静态文件
 * 用法: npx ts-node prisma/scripts/regenerate-static.ts
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 静态文件输出目录（前端 public 目录）
const STATIC_DIR = path.resolve(process.cwd(), '../frontend/public/data');

// 梯队配置
const TIER_CONFIG: Record<string, { name: string; color: string; order: number }> = {
  CSP_J: { name: '入门篇', color: '#22c55e', order: 1 },
  CSP_S: { name: '进阶篇', color: '#3b82f6', order: 2 },
  PROVINCIAL: { name: '省选/NOI', color: '#a855f7', order: 3 },
  IOI: { name: '大师篇', color: '#ef4444', order: 4 },
};

async function generateKnowledgeGraphStatic(): Promise<void> {
  console.log('[StaticGenerator] Starting knowledge graph static generation...');

  // 确保输出目录存在
  if (!existsSync(STATIC_DIR)) {
    await mkdir(STATIC_DIR, { recursive: true });
  }

  // 获取所有模块
  const modules = await prisma.module.findMany({
    orderBy: { orderIndex: 'asc' },
  });

  // 获取每个梯队的知识点数量
  const tierCounts = await prisma.skillUnit.groupBy({
    by: ['tier'],
    _count: { id: true },
    where: { isPublished: true },
  });

  // 构建梯队数据
  const tiers = Object.entries(TIER_CONFIG).map(([tierId, config]) => {
    const totalUnits = tierCounts.find(t => t.tier === tierId)?._count.id || 0;
    return {
      id: tierId,
      name: config.name,
      color: config.color,
      order: config.order,
      totalUnits,
    };
  });

  // 获取所有已发布的知识点
  const units = await prisma.skillUnit.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: 'asc' },
    include: {
      module: true,
      prerequisites: {
        include: {
          prerequisite: {
            select: { id: true, code: true, title: true },
          },
        },
      },
      dependentUnits: {
        include: {
          unit: {
            select: { id: true, code: true, title: true },
          },
        },
      },
      courses: {
        include: {
          course: {
            include: {
              sessions: {
                where: { isPublished: true },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  // 构建依赖关系
  const dependencies: { from: string; to: string }[] = [];

  // 构建知识点数据
  const skillTree = units.map(unit => {
    // 添加依赖关系
    unit.prerequisites.forEach(prereq => {
      if (prereq.prerequisite.code && unit.code) {
        dependencies.push({
          from: prereq.prerequisite.code,
          to: unit.code,
        });
      }
    });

    // 计算总课时数
    const totalSessions = unit.courses.reduce(
      (sum, cu) => sum + cu.course.sessions.length,
      0
    );

    return {
      id: unit.id,
      code: unit.code,
      title: unit.title,
      description: unit.description,
      icon: unit.icon,
      color: unit.color,
      tier: unit.tier,
      moduleId: unit.moduleId,
      moduleName: unit.module?.name,
      moduleIcon: unit.module?.icon,
      coreLevel: unit.coreLevel,
      orderIndex: unit.orderIndex,
      totalSessions,
      // 学习资料预览（不包含完整内容，只标记是否有内容）
      hasContent: !!(unit.content || (unit.tips && unit.tips.length > 0)),
      estimatedTime: unit.estimatedTime,
      prerequisites: unit.prerequisites.map(p => ({
        id: p.prerequisite.id,
        code: p.prerequisite.code,
        title: p.prerequisite.title,
      })),
      dependents: unit.dependentUnits.map(d => ({
        id: d.unit.id,
        code: d.unit.code,
        title: d.unit.title,
      })),
    };
  });

  // 按模块统计知识点数量
  const modulesWithCounts = modules.map(mod => {
    const unitsInModule = skillTree.filter(u => u.moduleId === mod.id);
    return {
      ...mod,
      totalUnits: unitsInModule.length,
    };
  });

  // 生成静态数据
  const staticData = {
    generatedAt: new Date().toISOString(),
    tiers,
    modules: modulesWithCounts,
    skillTree,
    dependencies,
  };

  // 写入文件
  const filePath = path.join(STATIC_DIR, 'knowledge-graph.json');
  await writeFile(filePath, JSON.stringify(staticData, null, 2), 'utf-8');

  console.log(`[StaticGenerator] Knowledge graph static file generated: ${filePath}`);
  console.log(`[StaticGenerator] Total units: ${skillTree.length}, dependencies: ${dependencies.length}`);

  // 统计有学习内容的知识点
  const unitsWithContent = skillTree.filter(u => u.hasContent);
  console.log(`[StaticGenerator] Units with learning content: ${unitsWithContent.length}`);
}

generateKnowledgeGraphStatic()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
