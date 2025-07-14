-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
