import { MAX_SESSION_DURATION } from "rwsdk/auth";
import { DurableObject } from "cloudflare:workers";

export interface Session {
  userId?: string | null;
  challenge?: string | null;
  createdAt: number;
  progress?: {
    [courseId: string]: string;
  };
  videoStarts?: {
    [key: string]: string;
  };
  videoCompletions?: {
    [key: string]: string;
  };
}

export class SessionDurableObject extends DurableObject {
  private session: Session | undefined = undefined;
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.session = undefined;
  }

  async saveSession({
    userId = null,
    challenge = null,
    progress = {},
    videoStarts = {},
    videoCompletions = {},
  }: {
    userId?: string | null;
    challenge?: string | null;
    progress?: { [courseId: string]: string };
    videoStarts?: { [key: string]: string };
    videoCompletions?: { [key: string]: string };
  }): Promise<Session> {
    const session: Session = {
      userId,
      challenge,
      createdAt: Date.now(),
      progress,
      videoStarts,
      videoCompletions,
    };

    await this.ctx.storage.put<Session>("session", session);
    this.session = session;
    return session;
  }

  async getSession(): Promise<{ value: Session } | { error: string }> {
    if (this.session) {
      return { value: this.session };
    }

    const session = await this.ctx.storage.get<Session>("session");

    if (!session) {
      return {
        error: "Invalid session",
      };
    }

    if (session.createdAt + MAX_SESSION_DURATION < Date.now()) {
      await this.revokeSession();
      return {
        error: "Session expired",
      };
    }

    this.session = session;
    return { value: session };
  }

  async revokeSession() {
    await this.ctx.storage.delete("session");
    this.session = undefined;
  }
}
