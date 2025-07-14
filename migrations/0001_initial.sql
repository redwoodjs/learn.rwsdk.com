-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Create initial User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_role_check" CHECK ("role" IN ('USER', 'CREATOR', 'ADMIN'))
);

-- Create Course table
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "Course_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- Create Module table
CREATE TABLE "Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "courseId" TEXT NOT NULL,
    CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Lesson table
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "moduleId" TEXT NOT NULL,
    CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create LessonContent table
CREATE TABLE "LessonContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lessonId" TEXT NOT NULL,
    CONSTRAINT "LessonContent_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "LessonContent_lessonId_key" ON "LessonContent"("lessonId");

-- Create Progress table
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Progress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Progress_userId_lessonId_key" ON "Progress"("userId", "lessonId");

-- Create User indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
