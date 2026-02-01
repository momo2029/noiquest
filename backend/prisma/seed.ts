import { PrismaClient, Tier } from '@prisma/client';
import bcrypt from 'bcryptjs';
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

  // 删除练习题相关数据
  await prisma.testCase.deleteMany();
  await prisma.exerciseStatistics.deleteMany();
  await prisma.exerciseKnowledgePoint.deleteMany();
  await prisma.exercise.deleteMany();
  console.log('   练习题数据已清空');

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

  // 3.5 更新知识点学习内容
  console.log('\n3.5 更新知识点学习内容...');
  const unit_1_01 = codeToIdMap.get('1-01');
  if (unit_1_01) {
    await prisma.skillUnit.update({
      where: { id: unit_1_01 },
      data: {
        content: learningContent_1_01.content,
        codeExamples: learningContent_1_01.codeExamples,
        videoUrl: learningContent_1_01.videoUrl,
        references: learningContent_1_01.references,
        tips: learningContent_1_01.tips,
        commonMistakes: learningContent_1_01.commonMistakes,
        estimatedTime: learningContent_1_01.estimatedTime,
      },
    });
    console.log(`   已更新知识点 1-01 的学习内容`);
  }

  const unit_1_02 = codeToIdMap.get('1-02');
  if (unit_1_02) {
    await prisma.skillUnit.update({
      where: { id: unit_1_02 },
      data: {
        content: learningContent_1_02.content,
        codeExamples: learningContent_1_02.codeExamples,
        videoUrl: learningContent_1_02.videoUrl,
        references: learningContent_1_02.references,
        tips: learningContent_1_02.tips,
        commonMistakes: learningContent_1_02.commonMistakes,
        estimatedTime: learningContent_1_02.estimatedTime,
      },
    });
    console.log(`   已更新知识点 1-02 的学习内容`);
  }

  const unit_1_03 = codeToIdMap.get('1-03');
  if (unit_1_03) {
    await prisma.skillUnit.update({
      where: { id: unit_1_03 },
      data: {
        content: learningContent_1_03.content,
        codeExamples: learningContent_1_03.codeExamples,
        videoUrl: learningContent_1_03.videoUrl,
        references: learningContent_1_03.references,
        tips: learningContent_1_03.tips,
        commonMistakes: learningContent_1_03.commonMistakes,
        estimatedTime: learningContent_1_03.estimatedTime,
      },
    });
    console.log(`   已更新知识点 1-03 的学习内容`);
  }

  const unit_1_04 = codeToIdMap.get('1-04');
  if (unit_1_04) {
    await prisma.skillUnit.update({
      where: { id: unit_1_04 },
      data: {
        content: learningContent_1_04.content,
        codeExamples: learningContent_1_04.codeExamples,
        videoUrl: learningContent_1_04.videoUrl,
        references: learningContent_1_04.references,
        tips: learningContent_1_04.tips,
        commonMistakes: learningContent_1_04.commonMistakes,
        estimatedTime: learningContent_1_04.estimatedTime,
      },
    });
    console.log(`   已更新知识点 1-04 的学习内容`);
  }

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

  // 5. 创建模块1的课程体系
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

  // 6. 创建测试用户
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

  // 7. 导入练习题
  console.log('\n7. 导入练习题...');
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

  let exerciseCount = 0;
  let sessionExerciseCount = 0;

  for (const exerciseData of allExercisesData) {
    const courseId = courseMap.get(exerciseData.courseCode);
    if (!courseId) {
      console.warn(`   警告: 找不到课程 ${exerciseData.courseCode}`);
      continue;
    }

    for (const sessionData of exerciseData.sessions) {
      const sessionId = sessionMap.get(`${courseId}-${sessionData.sessionIndex + 1}`);
      if (!sessionId) {
        console.warn(`   警告: 找不到课程 ${exerciseData.courseCode} 的课时 ${sessionData.sessionIndex}`);
        continue;
      }

      for (let i = 0; i < sessionData.exercises.length; i++) {
        const ex = sessionData.exercises[i];
        
        // 移除字符串中的 null 字符（\u0000）
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
        
        const sanitizedQuestionData = sanitizeObject(ex.questionData);
        const sanitizedStarterCode = sanitizeString(ex.type === 'CODING' ? ((ex as any).starterCode || (ex.questionData as any)?.starterCode) : '');
        
        const exercise = await prisma.exercise.create({
          data: {
            title: sanitizeString(ex.title),
            description: sanitizeString(ex.description),
            difficulty: ex.difficulty as any,
            category: (exerciseData as any).knowledgePointCode || (exerciseData as any).knowledgePointCodes?.[0] || '',
            xp: ex.xp,
            type: ex.type as any,
            questionData: sanitizedQuestionData as any,
            source: 'EXERCISE_LIBRARY',
            orderIndex: i + 1,
            isPublished: true,
            starterCode: sanitizedStarterCode,
          },
        });
        exerciseCount++;

        // 关联到课时
        await prisma.sessionExercise.create({
          data: {
            sessionId,
            exerciseId: exercise.id,
            orderIndex: i + 1,
          },
        });
        sessionExerciseCount++;
      }
    }
    console.log(`   已导入 ${exerciseData.courseCode} 的练习题`);
  }

  console.log(`   共创建 ${exerciseCount} 道练习题`);
  console.log(`   共关联 ${sessionExerciseCount} 条课时-练习题关系`);

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
