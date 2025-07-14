import { defineScript } from "rwsdk/worker";
import { db, setupDb } from "@/db";
import { env } from "cloudflare:workers";
import { hash } from "bcryptjs";

export default defineScript(async () => {
  await setupDb(env);

  await db.$executeRawUnsafe(`\
    DELETE FROM User;
    DELETE FROM sqlite_sequence;
  `);

  const hashedPassword = await hash("admin", 10);

  await db.user.create({
    data: {
      id: "1",
      email: "admin@example.com",
      username: "admin",
      role: "ADMIN",
      password: hashedPassword,
    },
  });

  console.log("🌱 Finished seeding");
});
