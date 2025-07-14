import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix, index } from "rwsdk/router";
import { Home } from "@/app/pages/Home";
import { setCommonHeaders } from "@/app/headers";
import { Document } from "@/app/Document";
import { userRoutes } from "@/app/pages/user/routes";
import { sessions, setupSessionStore } from "./session/store";
import { Session } from "./session/durableObject";
import { type User, db, setupDb } from "@/db";
import { env } from "cloudflare:workers";
import { CoursePage } from "./app/pages/courses/CoursePage";
import { Admin } from "./app/pages/admin/Admin";
import { adminRoutes } from "./app/pages/admin/routes";
import LessonPage from "./app/pages/courses/LessonPage";
import sitemap from "./sitemap";
export { SessionDurableObject } from "./session/durableObject";

export type AppContext = {
  session: Session | null;
  user: User | null;
};

export default defineApp([
  setCommonHeaders(),
  async ({ ctx, request, headers }) => {
    try {
      // Set up database with timeout
      const dbPromise = setupDb(env);
      const dbTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database setup timeout')), 10000)
      );
      await Promise.race([dbPromise, dbTimeout]);
      
      setupSessionStore(env);

      try {
        ctx.session = await sessions.load(request);
      } catch (error) {
        if (error instanceof ErrorResponse && error.code === 401) {
          // Create a new session for unauthenticated users
          const newSession = {
            progress: {},
            userId: null,
            createdAt: Date.now(),
          };
          await sessions.save(headers, newSession);
          ctx.session = newSession;
        } else {
          throw error;
        }
      }

      if (ctx.session?.userId) {
        // Get user with timeout
        const userPromise = db.user.findUnique({
          where: {
            id: ctx.session.userId,
          },
        });
        const userTimeout = new Promise<User | null>((_, reject) => 
          setTimeout(() => reject(new Error('User fetch timeout')), 5000)
        );
        ctx.user = await Promise.race([userPromise, userTimeout]);
      }
    } catch (error) {
      console.error('Middleware error:', error);
      // Continue with empty context rather than failing completely
      ctx.session = null;
      ctx.user = null;
    }
  },
  render(Document, [
    index(Home),
    route("/courses/:id", CoursePage),
    route("/courses/:id/lessons", LessonPage),
    prefix("/admin", adminRoutes),
    route("/protected", [
      ({ ctx }) => {
        if (!ctx.user) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/user/login" },
          });
        }
      },
      Home,
    ]),
    prefix("/user", userRoutes),
  ]),
  route("/upload/", async ({ request }) => {
    try {
      // need to show status of upload
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const duration = formData.get("duration") as string;

      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Stream the file directly to R2
      // strip file name of any special characters
      const r2ObjectKey = `${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      await env.learn_video_content.put(r2ObjectKey, file.stream(), {
        httpMetadata: {
          contentType: file.type,
        },
      });

      // Return both the URL and duration if available
      const response: { url: string; duration?: number } = { url: r2ObjectKey };
      if (duration) {
        response.duration = parseInt(duration, 10);
      }

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return new Response(JSON.stringify({ error: "Upload failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
  route("/download/*", async ({ request, params }) => {
    try {
      const object = await env.learn_video_content.get(params.$0);
      if (object === null) {
        return new Response("Object Not Found", { status: 404 });
      }
      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType as string,
        },
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      return new Response("Error downloading file", { status: 500 });
    }
  }),
  route("/extract-duration/*", async ({ request, params }) => {
    const object = await env.learn_video_content.get(params.$0);
    if (object === null) {
      return new Response("Object Not Found", { status: 404 });
    }

    // For now, we'll return a response indicating that server-side duration extraction
    // requires additional processing. In a production environment, you might want to:
    // 1. Use a video processing service (like FFmpeg)
    // 2. Store duration metadata separately in the database
    // 3. Use Cloudflare's video processing capabilities
    
    return new Response(JSON.stringify({ 
      message: "Duration extraction requires client-side processing for existing videos",
      videoUrl: `/download/${params.$0}` 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),
  route("/debug", async () => {
    const r2Object = await env.learn_video_content.list();
    console.log(r2Object);
    return new Response(JSON.stringify(r2Object), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),
  route("/health", async () => {
    try {
      // Test database connection
      await db.$queryRaw`SELECT 1`;
      
      return new Response(JSON.stringify({ 
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error('Health check failed:', error);
      return new Response(JSON.stringify({ 
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }),
  route("/sitemap.xml", async () => {
    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }),
  route("/robots.txt", async () => {
    // This should also become an addon
    const robotsTxt = `User-agent: *
      Allow: /
      Disallow: /search
      Sitemap: https://rwsdk.com/sitemap.xml`;

    return new Response(robotsTxt, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }),
]);
