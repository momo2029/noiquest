/**
 * 增量更新 seed 脚本
 * 用于生产环境，保留用户数据，只更新内容数据
 * 用法: npx ts-node prisma/seed-incremental.ts
 */

import { PrismaClient, Tier, SkillUnit, Course, Exercise } from '@prisma/client';
import { modules, allKnowledgePoints } from './data';
import { module1Courses } from './data/courses-module1';
import { exercisesM1L01 } from './data/exercises-M1-L01';
import { exercisesM1L02 } from './data/exercises-M1-L02';
import { exercisesM1L03 } from './data/exercises-M1-L03';
import { exercisesM1L04 } from './data/exercises-M1-L04';
import { exercisesM1L05 } from './data/exercises-M1-L05';
import { exercisesM1L06 } from './data/exercises-M1-L06';
import { exercisesM1L07 } from './data/exercises-M1-L07';
import { exercisesM1L08 } from './data/exercises-M1-L08';
import { exercisesM1L09 } from './data/exercises-M1-L09';
import { exercisesM1L10 } from './data/exercises-M1-L10';
import { exercisesM1L11 } from './data/exercises-M1-L11';
import { exercisesM1L12 } from './data/exercises-M1-L12';
import { exercisesM1L13 } from './data/exercises-M1-L13';
import { exercisesM1L14 } from './data/exercises-M1-L14';
import { exercisesM1L15 } from './data/exercises-M1-L15';
import learningContent_1_01 from './data/learning-content-1-01.json';
import learningContent_1_02 from './data/learning-content-1-02.json';
import learningContent_1_03 from './data/learning-content-1-03.json';
import learningContent_1_04 from './data/learning-content-1-04.json';

const prisma = new PrismaClient();

// 辅助函数：移除字符串中的 null 字符
const sanitizeString = (str: string | undefined): string => {
  return str ? str.replace(/\u0000/g, '') : '';
};

const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  } else if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
};

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

async function seedIncremental() {
  console.log('========== 增量更新开始 ==========');
  console.log('注意：此脚本会保留用户数据，只更新内容数据\n');

  // 1. 更新模块（upsert）
  console.log('1. 更新模块...');
  for (const mod of modules) {
    await prisma.module.upsert({
      where: { id: mod.id },
      update: {
        name: mod.name,
        icon: mod.icon,
        color: mod.color,
        orderIndex: mod.orderIndex,
      },
      create: {
        id: mod.id,
        name: mod.name,
        icon: mod.icon,
        color: mod.color,
        orderIndex: mod.orderIndex,
      },
    });
    console.log(`   ✓ 模块: ${mod.icon} ${mod.name}`);
  }

  // 2. 更新知识点（upsert by code）
  console.log('\n2. 更新知识点...');
  const codeToIdMap = new Map<string, string>();
  let createdUnits = 0;
  let updatedUnits = 0;

  for (let i = 0; i < allKnowledgePoints.length; i++) {
    const kp = allKnowledgePoints[i];

    // 先查找是否存在
    const existing = await prisma.skillUnit.findFirst({
      where: { code: kp.code },
    });

    const unitData = {
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
    };

    let unit: SkillUnit;
    if (existing) {
      // 更新现有知识点（保留学习内容字段，只更新基础信息）
      unit = await prisma.skillUnit.update({
        where: { id: existing.id },
        data: {
          title: unitData.title,
          description: unitData.description,
          tier: unitData.tier,
          moduleId: unitData.moduleId,
          coreLevel: unitData.coreLevel,
          icon: unitData.icon,
          color: unitData.color,
          orderIndex: unitData.orderIndex,
        },
      });
      updatedUnits++;
    } else {
      // 创建新知识点
      unit = await prisma.skillUnit.create({
        data: unitData,
      });
      createdUnits++;
    }

    codeToIdMap.set(kp.code, unit.id);

    if ((i + 1) % 50 === 0) {
      console.log(`   处理进度: ${i + 1}/${allKnowledgePoints.length}`);
    }
  }
  console.log(`   ✓ 新建 ${createdUnits} 个，更新 ${updatedUnits} 个知识点`);

  // 2.5 更新知识点学习内容
  console.log('\n2.5 更新知识点学习内容...');
  const learningContents = [
    { code: '1-01', content: learningContent_1_01 },
    { code: '1-02', content: learningContent_1_02 },
    { code: '1-03', content: learningContent_1_03 },
    { code: '1-04', content: learningContent_1_04 },
  ];

  for (const lc of learningContents) {
    const unitId = codeToIdMap.get(lc.code);
    if (unitId) {
      await prisma.skillUnit.update({
        where: { id: unitId },
        data: {
          content: lc.content.content,
          codeExamples: lc.content.codeExamples,
          videoUrl: lc.content.videoUrl,
          references: lc.content.references,
          tips: lc.content.tips,
          commonMistakes: lc.content.commonMistakes,
          estimatedTime: lc.content.estimatedTime,
        },
      });
      console.log(`   ✓ 更新知识点 ${lc.code} 的学习内容`);
    }
  }

  // 3. 更新依赖关系
  console.log('\n3. 更新依赖关系...');
  // 先删除所有旧的依赖关系
  await prisma.skillUnitPrerequisite.deleteMany();

  let depCount = 0;
  for (const kp of allKnowledgePoints) {
    const unitId = codeToIdMap.get(kp.code);
    if (!unitId) continue;

    for (const prereqCode of kp.prerequisites) {
      const prereqId = codeToIdMap.get(prereqCode);
      if (!prereqId) {
        console.warn(`   ⚠ 找不到前置知识点 ${prereqCode}`);
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
  console.log(`   ✓ 创建 ${depCount} 条依赖关系`);

  // 4. 更新课程（upsert by code）
  console.log('\n4. 更新课程...');
  const courseCodeToIdMap = new Map<string, string>();
  let createdCourses = 0;
  let updatedCourses = 0;

  for (const courseData of module1Courses) {
    const existing = await prisma.course.findFirst({
      where: { code: courseData.code },
    });

    let course: Course;
    if (existing) {
      course = await prisma.course.update({
        where: { id: existing.id },
        data: {
          title: courseData.title,
          description: courseData.description,
          objectives: courseData.objectives,
          orderIndex: courseData.orderIndex,
          tier: courseData.tier as Tier,
          moduleId: courseData.moduleId,
          isPublished: true,
        },
      });
      updatedCourses++;
    } else {
      course = await prisma.course.create({
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
      createdCourses++;
    }
    courseCodeToIdMap.set(courseData.code, course.id);

    // 更新课程-知识点关联（先删后建）
    await prisma.courseUnit.deleteMany({
      where: { courseId: course.id },
    });
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

    // 更新课时（upsert by courseId + orderIndex）
    for (const sessionData of courseData.sessions) {
      const existingSession = await prisma.courseSession.findFirst({
        where: {
          courseId: course.id,
          orderIndex: sessionData.orderIndex,
        },
      });

      if (existingSession) {
        await prisma.courseSession.update({
          where: { id: existingSession.id },
          data: {
            title: sessionData.title,
            description: sessionData.description,
            xpReward: sessionData.xpReward,
            isPublished: true,
          },
        });
      } else {
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
    }

    console.log(`   ✓ 课程: ${courseData.code} ${courseData.title}`);
  }
  console.log(`   新建 ${createdCourses} 个，更新 ${updatedCourses} 个课程`);

  // 更新课程依赖关系
  console.log('\n4.5 更新课程依赖关系...');
  for (const courseData of module1Courses) {
    const courseId = courseCodeToIdMap.get(courseData.code);
    if (!courseId) continue;

    // 先删除旧的依赖
    await prisma.coursePrerequisite.deleteMany({
      where: { courseId },
    });

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
  console.log(`   ✓ 课程依赖关系已更新`);

  // 5. 更新练习题
  console.log('\n5. 更新练习题...');
  const allExercisesData = [
    exercisesM1L01,
    exercisesM1L02,
    exercisesM1L03,
    exercisesM1L04,
    exercisesM1L05,
    exercisesM1L06,
    exercisesM1L07,
    exercisesM1L08,
    exercisesM1L09,
    exercisesM1L10,
    exercisesM1L11,
    exercisesM1L12,
    exercisesM1L13,
    exercisesM1L14,
    exercisesM1L15,
  ];

  // 获取课程和课时映射
  const courseMap = new Map<string, string>();
  const courses = await prisma.course.findMany();
  courses.forEach(c => courseMap.set(c.code, c.id));

  const sessionMap = new Map<string, string>();
  const sessions = await prisma.courseSession.findMany();
  sessions.forEach(s => sessionMap.set(`${s.courseId}-${s.orderIndex}`, s.id));

  let createdExercises = 0;
  let updatedExercises = 0;

  for (const exerciseData of allExercisesData) {
    const courseId = courseMap.get(exerciseData.courseCode);
    if (!courseId) {
      console.warn(`   ⚠ 找不到课程 ${exerciseData.courseCode}`);
      continue;
    }

    for (const sessionData of exerciseData.sessions) {
      const sessionId = sessionMap.get(`${courseId}-${sessionData.sessionIndex + 1}`);
      if (!sessionId) {
        console.warn(`   ⚠ 找不到课程 ${exerciseData.courseCode} 的课时 ${sessionData.sessionIndex}`);
        continue;
      }

      for (let i = 0; i < sessionData.exercises.length; i++) {
        const ex = sessionData.exercises[i];

        const sanitizedQuestionData = sanitizeObject(ex.questionData);
        const sanitizedStarterCode = sanitizeString(
          ex.type === 'CODING' ? ((ex as any).starterCode || (ex.questionData as any)?.starterCode) : ''
        );
        const category = (exerciseData as any).knowledgePointCode ||
                        (exerciseData as any).knowledgePointCodes?.[0] || '';

        // 通过 title + sessionId 查找现有练习题
        const existingExercise = await prisma.exercise.findFirst({
          where: {
            title: sanitizeString(ex.title),
            sessionExercises: {
              some: { sessionId },
            },
          },
        });

        const exerciseDataToSave = {
          title: sanitizeString(ex.title),
          description: sanitizeString(ex.description),
          difficulty: ex.difficulty as any,
          category,
          xp: ex.xp,
          type: ex.type as any,
          questionData: sanitizedQuestionData as any,
          source: 'EXERCISE_LIBRARY' as const,
          orderIndex: i + 1,
          isPublished: true,
          starterCode: sanitizedStarterCode,
        };

        let exercise: Exercise;
        if (existingExercise) {
          exercise = await prisma.exercise.update({
            where: { id: existingExercise.id },
            data: exerciseDataToSave,
          });
          updatedExercises++;
        } else {
          exercise = await prisma.exercise.create({
            data: exerciseDataToSave,
          });
          createdExercises++;

          // 只有新建的练习题才需要关联到课时
          await prisma.sessionExercise.create({
            data: {
              sessionId,
              exerciseId: exercise.id,
              orderIndex: i + 1,
            },
          });
        }
      }
    }
    console.log(`   ✓ ${exerciseData.courseCode} 练习题已更新`);
  }
  console.log(`   新建 ${createdExercises} 道，更新 ${updatedExercises} 道练习题`);

  // 6. 更新每日任务模板
  console.log('\n6. 更新每日任务模板...');
  const dailyQuestTemplates = [
    {
      id: 'dq-complete-5',
      title: '完成5道练习题',
      description: '今天完成5道任意练习题',
      questType: 'complete_exercises',
      targetValue: 5,
      xpReward: 20,
      gemsReward: 1,
    },
    {
      id: 'dq-complete-10',
      title: '完成10道练习题',
      description: '今天完成10道任意练习题',
      questType: 'complete_exercises',
      targetValue: 10,
      xpReward: 40,
      gemsReward: 2,
    },
    {
      id: 'dq-complete-20',
      title: '完成20道练习题',
      description: '今天完成20道任意练习题',
      questType: 'complete_exercises',
      targetValue: 20,
      xpReward: 80,
      gemsReward: 5,
    },
    {
      id: 'dq-perfect-1',
      title: '完美完成1个课时',
      description: '在一个课时中全部答对',
      questType: 'perfect_lessons',
      targetValue: 1,
      xpReward: 30,
      gemsReward: 2,
    },
    {
      id: 'dq-perfect-3',
      title: '完美完成3个课时',
      description: '在3个课时中全部答对',
      questType: 'perfect_lessons',
      targetValue: 3,
      xpReward: 100,
      gemsReward: 5,
    },
    {
      id: 'dq-study-15',
      title: '学习15分钟',
      description: '今天累计学习15分钟',
      questType: 'study_minutes',
      targetValue: 15,
      xpReward: 15,
      gemsReward: 1,
    },
    {
      id: 'dq-study-30',
      title: '学习30分钟',
      description: '今天累计学习30分钟',
      questType: 'study_minutes',
      targetValue: 30,
      xpReward: 30,
      gemsReward: 2,
    },
    {
      id: 'dq-study-60',
      title: '学习60分钟',
      description: '今天累计学习60分钟',
      questType: 'study_minutes',
      targetValue: 60,
      xpReward: 60,
      gemsReward: 3,
    },
  ];

  let createdTemplates = 0;
  let updatedTemplates = 0;
  for (const template of dailyQuestTemplates) {
    const existing = await prisma.dailyQuestTemplate.findUnique({
      where: { id: template.id },
    });

    if (existing) {
      await prisma.dailyQuestTemplate.update({
        where: { id: template.id },
        data: {
          title: template.title,
          description: template.description,
          questType: template.questType,
          targetValue: template.targetValue,
          xpReward: template.xpReward,
          gemsReward: template.gemsReward,
          active: true,
        },
      });
      updatedTemplates++;
    } else {
      await prisma.dailyQuestTemplate.create({
        data: {
          id: template.id,
          title: template.title,
          description: template.description,
          questType: template.questType,
          targetValue: template.targetValue,
          xpReward: template.xpReward,
          gemsReward: template.gemsReward,
          active: true,
        },
      });
      createdTemplates++;
    }
  }
  console.log(`   ✓ 新建 ${createdTemplates} 个，更新 ${updatedTemplates} 个每日任务模板`);

  // 7. 统计信息
  console.log('\n========== 增量更新完成 ==========');

  const userCount = await prisma.user.count();
  const moduleCount = await prisma.module.count();
  const unitCount = await prisma.skillUnit.count();
  const courseCount = await prisma.course.count();
  const exerciseCount = await prisma.exercise.count();
  const templateCount = await prisma.dailyQuestTemplate.count();

  console.log(`\n数据统计:`);
  console.log(`  用户数量: ${userCount} (已保留)`);
  console.log(`  模块数量: ${moduleCount}`);
  console.log(`  知识点数量: ${unitCount}`);
  console.log(`  课程数量: ${courseCount}`);
  console.log(`  练习题数量: ${exerciseCount}`);
  console.log(`  每日任务模板: ${templateCount}`);
}

// 运行
seedIncremental()
  .catch((e) => {
    console.error('增量更新失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
