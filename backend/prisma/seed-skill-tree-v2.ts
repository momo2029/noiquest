import { PrismaClient, Tier } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { modules, allKnowledgePoints } from './data';
import { module1Courses } from './data/courses-module1';

const prisma = new PrismaClient();

async function seedSkillTreeV2() {
  console.log('开始导入技能树 V2 数据...');
  console.log(`共 ${modules.length} 个模块，${allKnowledgePoints.length} 个知识点`);

  // 1. 清空旧数据（按依赖顺序删除）
  console.log('\n1. 清空旧数据...');

  // 先删除用户相关的所有数据
  await prisma.userDailyQuest.deleteMany();
  await prisma.dailyXpRecord.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.exerciseProgress.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.mistakeRecord.deleteMany();
  await prisma.knowledgeMastery.deleteMany();
  await prisma.userLessonProgress.deleteMany();
  await prisma.userUnitProgress.deleteMany();
  await prisma.userTierProgress.deleteMany();
  await prisma.userDailySettings.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.userLeague.deleteMany();
  await prisma.learningSession.deleteMany();
  await prisma.dailyLearningStats.deleteMany();
  await prisma.reviewReminder.deleteMany();
  await prisma.redeemRecord.deleteMany();
  await prisma.userFile.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.aIUsageRecord.deleteMany();
  console.log('   用户相关数据已清空');

  // 删除技能树相关数据
  await prisma.skillUnitPrerequisite.deleteMany();
  await prisma.exercise.updateMany({
    where: { source: 'SKILL_TREE' },
    data: { unitId: null, lessonId: null },
  });
  await prisma.lesson.deleteMany();
  await prisma.skillUnit.deleteMany();
  console.log('   技能树数据已清空');

  // 删除课程相关数据
  await prisma.userSessionProgress.deleteMany();
  await prisma.userCourseProgress.deleteMany();
  await prisma.sessionExercise.deleteMany();
  await prisma.courseSession.deleteMany();
  await prisma.coursePrerequisite.deleteMany();
  await prisma.courseUnit.deleteMany();
  await prisma.course.deleteMany();
  console.log('   课程数据已清空');

  // 删除模块
  await prisma.module.deleteMany();
  console.log('   模块数据已清空');

  // 删除用户（会级联删除剩余关联数据）
  await prisma.user.deleteMany();
  console.log('   用户数据已清空');

  // 2. 创建模块
  console.log('\n2. 创建模块...');
  for (const mod of modules) {
    await prisma.module.create({
      data: {
        id: mod.id,
        name: mod.name,
        icon: mod.icon,
        color: mod.color,
        orderIndex: mod.orderIndex,
      },
    });
    console.log(`   创建模块: ${mod.icon} ${mod.name}`);
  }

  // 3. 创建知识点（不含依赖关系）
  console.log('\n3. 创建知识点...');
  const codeToIdMap = new Map<string, string>();

  for (let i = 0; i < allKnowledgePoints.length; i++) {
    const kp = allKnowledgePoints[i];
    const unit = await prisma.skillUnit.create({
      data: {
        title: kp.title,
        description: kp.description,
        code: kp.code,
        tier: kp.tier as Tier,
        moduleId: kp.moduleId,
        coreLevel: kp.coreLevel,
        icon: modules.find(m => m.id === kp.moduleId)?.icon || '📚',
        color: `from-${getColorClass(kp.moduleId)}-400 to-${getColorClass(kp.moduleId)}-600`,
        orderIndex: i + 1,
        requiredXp: 0,
        isPublished: true,
      },
    });
    codeToIdMap.set(kp.code, unit.id);

    if ((i + 1) % 50 === 0) {
      console.log(`   已创建 ${i + 1}/${allKnowledgePoints.length} 个知识点`);
    }
  }
  console.log(`   共创建 ${allKnowledgePoints.length} 个知识点`);

  // 4. 创建依赖关系
  console.log('\n4. 创建依赖关系...');
  let depCount = 0;
  for (const kp of allKnowledgePoints) {
    const unitId = codeToIdMap.get(kp.code);
    if (!unitId) continue;

    for (const prereqCode of kp.prerequisites) {
      const prereqId = codeToIdMap.get(prereqCode);
      if (!prereqId) {
        console.warn(`   警告: 找不到前置知识点 ${prereqCode}`);
        continue;
      }

      await prisma.skillUnitPrerequisite.create({
        data: {
          unitId,
          prerequisiteId: prereqId,
        },
      });
      depCount++;
    }
  }
  console.log(`   共创建 ${depCount} 条依赖关系`);

  // 5. 为每个知识点创建一个默认课程（占位）
  console.log('\n5. 创建默认课程...');
  for (const kp of allKnowledgePoints) {
    const unitId = codeToIdMap.get(kp.code);
    if (!unitId) continue;

    await prisma.lesson.create({
      data: {
        title: `${kp.title} - 入门`,
        description: `学习 ${kp.title} 的基础知识`,
        unitId,
        orderIndex: 1,
        isPublished: true,
      },
    });
  }
  console.log(`   共创建 ${allKnowledgePoints.length} 个默认课程`);

  // 6. 创建模块1的课程体系
  console.log('\n6. 创建模块1课程体系...');
  const courseCodeToIdMap = new Map<string, string>();

  for (const courseData of module1Courses) {
    // 创建课程
    const course = await prisma.course.create({
      data: {
        code: courseData.code,
        title: courseData.title,
        description: courseData.description,
        objectives: courseData.objectives,
        orderIndex: courseData.orderIndex,
        tier: courseData.tier as Tier,
        moduleId: courseData.moduleId,
        isPublished: true,
      },
    });
    courseCodeToIdMap.set(courseData.code, course.id);

    // 关联知识点
    for (const unitCode of courseData.unitCodes) {
      const unitId = codeToIdMap.get(unitCode);
      if (unitId) {
        await prisma.courseUnit.create({
          data: {
            courseId: course.id,
            unitId,
          },
        });
      }
    }

    // 创建课时
    for (const sessionData of courseData.sessions) {
      await prisma.courseSession.create({
        data: {
          title: sessionData.title,
          description: sessionData.description,
          orderIndex: sessionData.orderIndex,
          courseId: course.id,
          xpReward: sessionData.xpReward,
          isPublished: true,
        },
      });
    }

    console.log(`   创建课程: ${courseData.code} ${courseData.title} (${courseData.sessions.length}课时)`);
  }

  // 创建课程依赖关系
  for (const courseData of module1Courses) {
    const courseId = courseCodeToIdMap.get(courseData.code);
    if (!courseId) continue;

    for (const prereqCode of courseData.prerequisiteCodes) {
      const prereqId = courseCodeToIdMap.get(prereqCode);
      if (prereqId) {
        await prisma.coursePrerequisite.create({
          data: {
            courseId,
            prerequisiteId: prereqId,
          },
        });
      }
    }
  }
  console.log(`   共创建 ${module1Courses.length} 个课程`);

  // 7. 创建测试用户
  console.log('\n6. 创建测试用户...');
  const hashedPassword = await bcrypt.hash('666999', 12);

  await prisma.user.create({
    data: {
      username: 'teacher@noiquest.com',
      email: 'teacher@noiquest.com',
      password: hashedPassword,
      name: '张老师',
      role: 'TEACHER',
      avatar: '👨‍🏫',
    },
  });

  await prisma.user.create({
    data: {
      username: 'student@noiquest.com',
      email: 'student@noiquest.com',
      password: hashedPassword,
      name: '小明',
      role: 'STUDENT',
      avatar: '🦊',
    },
  });

  await prisma.user.create({
    data: {
      username: 'admin@noiquest.com',
      email: 'admin@noiquest.com',
      password: hashedPassword,
      name: '系统管理员',
      role: 'ADMIN',
      avatar: '👑',
      level: 99,
      xp: 99999,
      totalXp: 99999,
      gems: 9999,
    },
  });
  console.log('   测试用户已创建');

  // 8. 统计信息
  console.log('\n========== 导入完成 ==========');
  console.log(`模块数量: ${modules.length}`);
  console.log(`知识点数量: ${allKnowledgePoints.length}`);
  console.log(`依赖关系: ${depCount}`);
  console.log(`课程数量: ${module1Courses.length}`);
  console.log(`课时数量: ${module1Courses.reduce((sum, c) => sum + c.sessions.length, 0)}`);
  console.log('\n按梯队分布:');
  const tierCounts = {
    CSP_J: allKnowledgePoints.filter(kp => kp.tier === 'CSP_J').length,
    CSP_S: allKnowledgePoints.filter(kp => kp.tier === 'CSP_S').length,
    PROVINCIAL: allKnowledgePoints.filter(kp => kp.tier === 'PROVINCIAL').length,
    IOI: allKnowledgePoints.filter(kp => kp.tier === 'IOI').length,
  };
  console.log(`  CSP-J 入门: ${tierCounts.CSP_J}`);
  console.log(`  CSP-S 进阶: ${tierCounts.CSP_S}`);
  console.log(`  省选/NOI: ${tierCounts.PROVINCIAL}`);
  console.log(`  IOI: ${tierCounts.IOI}`);
}

function getColorClass(moduleId: number): string {
  const colors: Record<number, string> = {
    1: 'green',
    2: 'blue',
    3: 'yellow',
    4: 'purple',
    5: 'red',
    6: 'cyan',
    7: 'orange',
  };
  return colors[moduleId] || 'blue';
}

// 运行
seedSkillTreeV2()
  .catch((e) => {
    console.error('导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
