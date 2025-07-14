-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "instructorId" TEXT,
    CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lesson_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("createdAt", "description", "duration", "id", "instructorId", "moduleId", "order", "status", "title", "updatedAt") SELECT "createdAt", "description", "duration", "id", "instructorId", "moduleId", "order", "status", "title", "updatedAt" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE TABLE "new_LessonContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lessonId" TEXT NOT NULL,
    CONSTRAINT "LessonContent_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Module" ("courseId", "createdAt", "id", "order", "status", "title", "updatedAt") SELECT "courseId", "createdAt", "id", "order", "status", "title", "updatedAt" FROM "Module";
DROP TABLE "Module";
ALTER TABLE "new_Module" RENAME TO "Module";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
