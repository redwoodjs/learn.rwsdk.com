"use server";

import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { sessions } from "../../../session/store";
import { CourseLevel } from "@/db";

interface LessonData {
  title: string;
  description: string;
  order: number;
  duration: number;
  status: string;
  videoUrl?: string;
  videoType?: 'UPLOADED' | 'YOUTUBE';
  instructorId?: string;
}

interface ModuleData {
  title: string;
  order: number;
  status: string;
  lessons: LessonData[];
}

interface CreateCourseData {
  title: string;
  description: string;
  overview: string;
  status: string;
  slug: string;
  modules: ModuleData[];
  creatorId: string;
  level?: CourseLevel;
  thumbnailUrl: string;
}

export async function getCoursesURLS() {
  const courses = await getCourses();
  return courses.map((course) => `
  <url>
    <loc>https://learn.rwsdk.com/courses/${course.id}</loc>
    <lastmod>${course.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>  
  </url>`);
}

export async function updateCreatorProfile(userId: string, data: { username?: string; name?: string; description?: string; avatar?: string }) {
  const { ctx } = requestInfo;
  if (ctx.user?.role !== 'ADMIN') {
    throw new Error("Only admins can update creator profiles");
  }

  return db.user.update({
    where: { id: userId },
    data: {
      username: data.username,
      name: data.name,
      description: data.description,
      avatar: data.avatar
    }
  });
}

export async function assignCreatorToCourse(courseId: string, creatorId: string) {
  const { ctx } = requestInfo;
  if (ctx.user?.role !== 'ADMIN') {
    throw new Error("Only admins can assign creators to courses");
  }

  return db.course.update({
    where: { id: courseId },
    data: {
      creatorId
    }
  });
}

export async function getCreator(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
      description: true
    }
  });
}

export async function getCreators() {
  const { ctx } = requestInfo;

  if (ctx.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  return db.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'CREATOR']
      }
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
      description: true
    }
  });
}

export async function getCourses() {
  try {
    const courses = await db.course.findMany({
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                duration: true
              }
            }
          }
        },
        progress: {
          select: {
            id: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            description: true
          }
        }
      }
    });
    return courses;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function editCourse(id: string, data: any) {
  const course = await db.course.update({
    where: { id },
    data,
  });
  return course;
}

export async function createCourse(data: CreateCourseData) {
  const { ctx } = requestInfo;

  if (!ctx.user?.id) {
    throw new Error("User must be authenticated to create a course");
  }

  // Create the course first
  const course = await db.course.create({
    data: {
      title: data.title,
      description: data.description,
      overview: data.overview,
      status: data.status,
      slug: data.slug,
      creatorId: data.creatorId || ctx.user.id,
      level: data.level,
      thumbnailUrl: data.thumbnailUrl
    },
  });

  // Create all modules and their lessons
  for (const moduleData of data.modules) {
    const module = await db.module.create({
      data: {
        title: moduleData.title,
        order: moduleData.order,
        status: moduleData.status,
        courseId: course.id,
      },
    });

    // Create lessons for this module
    if (moduleData.lessons.length > 0) {
      await Promise.all(
        moduleData.lessons.map((lessonData) =>
          db.lesson.create({
            data: {
              title: lessonData.title,
              description: lessonData.description,
              order: lessonData.order,
              duration: lessonData.duration,
              status: lessonData.status,
              content: lessonData.videoUrl ? {
                create: {
                  type: 'video',
                  content: lessonData.videoUrl,
                  videoType: lessonData.videoType || 'UPLOADED',
                }
              } : undefined,
              moduleId: module.id,
              instructorId: lessonData.instructorId,
            },
          })
        )
      );
    }
  }

  // Fetch the complete course with all relations
  return getCourse(course.id);
}

export async function updateCourse(id: string, data: CreateCourseData) {
  const { ctx } = requestInfo;

  if (!ctx.user?.id) {
    throw new Error("User must be authenticated to update a course");
  }

  // Update the course
  const course = await db.course.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      overview: data.overview,
      status: data.status,
      slug: data.slug,
      level: data.level,
      thumbnailUrl: data.thumbnailUrl
    },
  });

  // Get existing modules and lessons
  const existingModules = await db.module.findMany({
    where: { courseId: id },
    include: { lessons: true },
  });

  // Create a map of existing modules by their order
  const existingModulesMap = new Map(existingModules.map(m => [m.order, m]));

  // Process each module in the update data
  for (const moduleData of data.modules) {
    let module;

    // If module exists at this order, update it
    if (existingModulesMap.has(moduleData.order)) {
      const existingModule = existingModulesMap.get(moduleData.order)!;
      module = await db.module.update({
        where: { id: existingModule.id },
        data: {
          title: moduleData.title,
          status: moduleData.status,
        },
      });

      // Create a map of existing lessons by their order
      const existingLessonsMap = new Map(existingModule.lessons.map(l => [l.order, l]));

      // Process each lesson in the module
      for (const lessonData of moduleData.lessons) {
        if (existingLessonsMap.has(lessonData.order)) {
          // First get the existing lesson to check for video
          const existingLesson = existingLessonsMap.get(lessonData.order)!;
          const existingContent = await db.lessonContent.findFirst({
            where: { lessonId: existingLesson.id }
          });

          // Only delete and update content if a new video is provided
          if (lessonData.videoUrl) {
            await db.lessonContent.deleteMany({
              where: { lessonId: existingLesson.id }
            });
          }

          // Then update the lesson with new content if needed
          await db.lesson.update({
            where: { id: existingLesson.id },
            data: {
              title: lessonData.title,
              description: lessonData.description,
              duration: lessonData.duration,
              status: lessonData.status,
              content: lessonData.videoUrl ? {
                create: {
                  type: 'video',
                  content: lessonData.videoUrl,
                  videoType: lessonData.videoType || 'UPLOADED',
                }
              } : existingContent ? undefined : undefined, // Keep existing content if no new video
              moduleId: module.id,
              instructorId: lessonData.instructorId,
            },
          });
        } else {
          // Create new lesson
          await db.lesson.create({
            data: {
              title: lessonData.title,
              description: lessonData.description,
              order: lessonData.order,
              duration: lessonData.duration,
              status: lessonData.status,
              content: lessonData.videoUrl ? {
                create: {
                  type: 'video',
                  content: lessonData.videoUrl,
                  videoType: lessonData.videoType || 'UPLOADED',
                }
              } : undefined,
              moduleId: module.id,
              instructorId: lessonData.instructorId,
            },
          });
        }
      }

      // Delete lessons that are no longer present
      const currentLessonOrders = new Set(moduleData.lessons.map(l => l.order));
      const lessonsToDelete = existingModule.lessons.filter(l => !currentLessonOrders.has(l.order));

      if (lessonsToDelete.length > 0) {
        await db.lesson.deleteMany({
          where: {
            id: {
              in: lessonsToDelete.map(l => l.id)
            }
          }
        });
      }
    } else {
      // Create new module
      module = await db.module.create({
        data: {
          title: moduleData.title,
          order: moduleData.order,
          status: moduleData.status,
          courseId: course.id,
        },
      });

      // Create lessons for new module
      if (moduleData.lessons.length > 0) {
        await Promise.all(
          moduleData.lessons.map((lessonData) =>
            db.lesson.create({
              data: {
                title: lessonData.title,
                description: lessonData.description,
                order: lessonData.order,
                duration: lessonData.duration,
                status: lessonData.status,
                content: lessonData.videoUrl ? {
                  create: {
                    type: 'video',
                    content: lessonData.videoUrl,
                    videoType: lessonData.videoType || 'UPLOADED',
                  }
                } : undefined,
                moduleId: module!.id,
                instructorId: lessonData.instructorId,
              },
            })
          )
        );
      }
    }
  }

  // Delete modules that are no longer present
  const currentModuleOrders = new Set(data.modules.map(m => m.order));
  const modulesToDelete = existingModules.filter(m => !currentModuleOrders.has(m.order));

  if (modulesToDelete.length > 0) {
    // With Prisma's ON DELETE CASCADE the related lessons & content are automatically removed.
    await db.module.deleteMany({
      where: {
        id: {
          in: modulesToDelete.map(m => m.id)
        }
      }
    });
  }

  // Fetch the complete course with all relations
  return getCourse(course.id);
}

export async function getCourse(id: string) {
  const course = await db.course.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          avatar: true,
          description: true
        }
      },
      modules: {
        orderBy: {
          order: 'asc'
        },
        include: {
          lessons: {
            orderBy: {
              order: 'asc'
            },
            include: {
              content: {
                select: {
                  id: true,
                  type: true,
                  content: true,
                  videoType: true,
                  createdAt: true,
                  updatedAt: true,
                  lessonId: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Safely serialize the course data without using JSON.parse/stringify
  return {
    ...course,
    modules: course.modules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => ({
        ...lesson,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString(),
        content: lesson.content ? {
          ...lesson.content,
          createdAt: lesson.content.createdAt.toISOString(),
          updatedAt: lesson.content.updatedAt.toISOString(),
        } : null
      }))
    }))
  };
}

export async function updateUserProgress(courseId: string, lessonId: string) {
  const { ctx, headers } = requestInfo;

  if (ctx.user?.id) {
    // For authenticated users, save to database
    await db.progress.upsert({
      where: {
        userId_lessonId: {
          userId: ctx.user.id,
          lessonId: lessonId,
        }
      },
      create: {
        userId: ctx.user.id,
        courseId: courseId,
        lessonId: lessonId,
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
      },
      update: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
  } else if (ctx.session) {
    // For unauthenticated users, save to session
    // Initialize progress if it doesn't exist
    if (!ctx.session.progress) {
      ctx.session.progress = {};
    }

    // Initialize course progress if it doesn't exist
    if (!ctx.session.progress[courseId]) {
      ctx.session.progress[courseId] = lessonId;
    } else {
      // Update progress if the new lesson is further in the course
      const allLessons = await db.lesson.findMany({
        where: { module: { courseId } },
        orderBy: { order: 'asc' },
        select: { id: true }
      });

      const currentLessonIndex = allLessons.findIndex(l => l.id === ctx.session?.progress?.[courseId]);
      const newLessonIndex = allLessons.findIndex(l => l.id === lessonId);

      if (newLessonIndex > currentLessonIndex) {
        ctx.session.progress[courseId] = lessonId;
      }
    }

    // Save the updated session
    await sessions.save(headers, ctx.session);
  }
}

export async function getUserProgress(courseId: string, userId?: string) {
  if (userId) {
    // For authenticated users, get from database
    const progress = await db.progress.findMany({
      where: {
        courseId,
        userId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    });
    return progress[0]?.lessonId || null;
  } else {
    // For unauthenticated users, get from session
    const { ctx } = requestInfo;
    if (ctx.session?.progress?.[courseId]) {
      return ctx.session.progress[courseId];
    }
    return null;
  }
}

export async function getCompletedLessons(courseId: string, userId?: string) {
  if (userId) {
    // For authenticated users, get from database
    const completedLessons = await db.progress.findMany({
      where: {
        courseId,
        userId,
        status: 'completed'
      },
      select: {
        lessonId: true
      }
    });
    return completedLessons.map(progress => progress.lessonId);
  } else {
    // For unauthenticated users, get from session
    const { ctx } = requestInfo;
    if (ctx.session?.progress?.[courseId]) {
      return [ctx.session.progress[courseId]];
    }
    return [];
  }
}

export async function createCreator(data: { username: string; avatar?: string }) {
  const { ctx } = requestInfo;

  if (ctx.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  // Generate a temporary email and password
  const tempEmail = `${data.username.toLowerCase().replace(/\s+/g, '')}@temp.com`;
  const tempPassword = crypto.randomUUID();

  return db.user.create({
    data: {
      username: data.username,
      email: tempEmail,
      password: tempPassword, // This should be hashed in production
      avatar: data.avatar,
      role: 'CREATOR'
    }
  });
}

export async function getCourseWithProgress(courseId: string, userId?: string) {
  const { ctx } = requestInfo;

  // Get course data
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          avatar: true,
          description: true
        }
      },
      modules: {
        orderBy: {
          order: 'asc'
        },
        include: {
          lessons: {
            orderBy: {
              order: 'asc'
            },
            include: {
              content: {
                select: {
                  id: true,
                  type: true,
                  content: true,
                  videoType: true,
                  createdAt: true,
                  updatedAt: true,
                  lessonId: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) {
    throw new Error("Course not found");
  }

  let lastLessonId: string | null = null;
  let completedLessons: string[] = [];

  if (userId) {
    // For authenticated users, get progress from database
    const [progress, completed] = await Promise.all([
      db.progress.findMany({
        where: {
          courseId,
          userId,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }),
      db.progress.findMany({
        where: {
          courseId,
          userId,
          status: 'completed'
        },
        select: {
          lessonId: true
        }
      })
    ]);

    lastLessonId = progress[0]?.lessonId || null;
    completedLessons = completed.map(p => p.lessonId);
  } else {
    // For unauthenticated users, get from session
    if (ctx.session?.progress?.[courseId]) {
      lastLessonId = ctx.session.progress[courseId];
      completedLessons = [ctx.session.progress[courseId]];
    }
  }

  // Safely serialize the course data
  const serializedCourse = {
    ...course,
    modules: course.modules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => ({
        ...lesson,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString(),
        content: lesson.content ? {
          ...lesson.content,
          createdAt: lesson.content.createdAt.toISOString(),
          updatedAt: lesson.content.updatedAt.toISOString(),
        } : null
      }))
    }))
  };

  return {
    course: serializedCourse,
    lastLessonId,
    completedLessons
  };
}

export async function trackVideoStart(courseId: string, lessonId: string) {
  const { ctx, headers } = requestInfo;

  if (ctx.user?.id) {
    // For authenticated users, save to database
    await db.progress.upsert({
      where: {
        userId_lessonId: {
          userId: ctx.user.id,
          lessonId: lessonId,
        }
      },
      create: {
        userId: ctx.user.id,
        courseId: courseId,
        lessonId: lessonId,
        status: 'started',
        startedAt: new Date(),
      },
      update: {
        status: 'started',
        startedAt: new Date(),
      },
    });
  } else if (ctx.session) {
    // For unauthenticated users, save to session
    if (!ctx.session.progress) {
      ctx.session.progress = {};
    }
    if (!ctx.session.videoStarts) {
      ctx.session.videoStarts = {};
    }
    
    const key = `${courseId}-${lessonId}`;
    ctx.session.videoStarts[key] = new Date().toISOString();
    
    await sessions.save(headers, ctx.session);
  }
}

export async function trackVideoComplete(courseId: string, lessonId: string) {
  const { ctx, headers } = requestInfo;

  if (ctx.user?.id) {
    // For authenticated users, save to database
    await db.progress.upsert({
      where: {
        userId_lessonId: {
          userId: ctx.user.id,
          lessonId: lessonId,
        }
      },
      create: {
        userId: ctx.user.id,
        courseId: courseId,
        lessonId: lessonId,
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
      },
      update: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
  } else if (ctx.session) {
    // For unauthenticated users, save to session
    if (!ctx.session.progress) {
      ctx.session.progress = {};
    }
    if (!ctx.session.videoCompletions) {
      ctx.session.videoCompletions = {};
    }
    
    const key = `${courseId}-${lessonId}`;
    ctx.session.videoCompletions[key] = new Date().toISOString();
    
    await sessions.save(headers, ctx.session);
  }
}

export async function getVideoStats() {
  const { ctx } = requestInfo;

  if (ctx.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  // Get all courses with their lessons and progress data
  const courses = await db.course.findMany({
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              progress: {
                select: {
                  id: true,
                  status: true,
                  startedAt: true,
                  completedAt: true,
                }
              }
            }
          }
        }
      }
    }
  });

  const stats = courses.map(course => {
    const lessonStats = course.modules.flatMap(module => 
      module.lessons.map(lesson => {
        // Count starts: either from startedAt field or from completed records (legacy)
        const starts = lesson.progress.filter(p => 
          p.startedAt || p.status === 'completed' || p.status === 'started'
        ).length;
        
        // Count completions: either from completedAt field or from completed status (legacy)
        const completions = lesson.progress.filter(p => 
          p.completedAt || p.status === 'completed'
        ).length;
        
        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          starts,
          completions,
          completionRate: starts > 0 ? Math.round((completions / starts) * 100) : 0
        };
      })
    );

    const totalStarts = lessonStats.reduce((sum, lesson) => sum + lesson.starts, 0);
    const totalCompletions = lessonStats.reduce((sum, lesson) => sum + lesson.completions, 0);
    const overallCompletionRate = totalStarts > 0 ? Math.round((totalCompletions / totalStarts) * 100) : 0;

    return {
      courseId: course.id,
      courseTitle: course.title,
      totalStarts,
      totalCompletions,
      overallCompletionRate,
      lessonStats
    };
  });

  return stats;
}

export async function migrateProgressRecords() {
  const { ctx } = requestInfo;

  if (ctx.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  // Find all progress records that don't have startedAt or completedAt
  const progressRecords = await db.progress.findMany({
    where: {
      OR: [
        { startedAt: null },
        { completedAt: null }
      ]
    }
  });

  let migratedCount = 0;

  for (const record of progressRecords) {
    const updateData: any = {};
    
    // If no startedAt, set it to createdAt
    if (!record.startedAt) {
      updateData.startedAt = record.createdAt;
    }
    
    // If status is completed but no completedAt, set it to updatedAt or createdAt
    if (record.status === 'completed' && !record.completedAt) {
      updateData.completedAt = record.updatedAt || record.createdAt;
    }
    
    if (Object.keys(updateData).length > 0) {
      await db.progress.update({
        where: { id: record.id },
        data: updateData
      });
      migratedCount++;
    }
  }

  return { migratedCount, totalRecords: progressRecords.length };
}