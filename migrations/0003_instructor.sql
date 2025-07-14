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
    CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lesson_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("createdAt", "description", "duration", "id", "moduleId", "order", "status", "title", "updatedAt") SELECT "createdAt", "description", "duration", "id", "moduleId", "order", "status", "title", "updatedAt" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
