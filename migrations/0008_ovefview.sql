-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "overview" TEXT DEFAULT '',
    "level" TEXT DEFAULT 'BEGINNER',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "slug" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "Course_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("createdAt", "creatorId", "description", "id", "level", "overview", "slug", "status", "thumbnailUrl", "title", "updatedAt") SELECT "createdAt", "creatorId", "description", "id", "level", "overview", "slug", "status", "thumbnailUrl", "title", "updatedAt" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
