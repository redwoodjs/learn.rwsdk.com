-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "slug" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "Course_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("createdAt", "creatorId", "description", "id", "slug", "status", "title", "updatedAt") SELECT "createdAt", "creatorId", "description", "id", "slug", "status", "title", "updatedAt" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE TABLE "new_Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "moduleId" TEXT NOT NULL,
    CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("createdAt", "description", "duration", "id", "moduleId", "order", "status", "title", "updatedAt") SELECT "createdAt", "description", "duration", "id", "moduleId", "order", "status", "title", "updatedAt" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE TABLE "new_LessonContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lessonId" TEXT NOT NULL,
    CONSTRAINT "LessonContent_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LessonContent" ("content", "createdAt", "id", "lessonId", "type", "updatedAt") SELECT "content", "createdAt", "id", "lessonId", "type", "updatedAt" FROM "LessonContent";
DROP TABLE "LessonContent";
ALTER TABLE "new_LessonContent" RENAME TO "LessonContent";
CREATE UNIQUE INDEX "LessonContent_lessonId_key" ON "LessonContent"("lessonId");
CREATE TABLE "new_Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "courseId" TEXT NOT NULL,
    CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Module" ("courseId", "createdAt", "id", "order", "status", "title", "updatedAt") SELECT "courseId", "createdAt", "id", "order", "status", "title", "updatedAt" FROM "Module";
DROP TABLE "Module";
ALTER TABLE "new_Module" RENAME TO "Module";
CREATE TABLE "new_Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Progress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Progress" ("courseId", "createdAt", "id", "lessonId", "status", "updatedAt", "userId") SELECT "courseId", "createdAt", "id", "lessonId", "status", "updatedAt", "userId" FROM "Progress";
DROP TABLE "Progress";
ALTER TABLE "new_Progress" RENAME TO "Progress";
CREATE UNIQUE INDEX "Progress_userId_lessonId_key" ON "Progress"("userId", "lessonId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
