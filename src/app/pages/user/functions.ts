"use server";
import { sessions } from "@/session/store";
import { requestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { compare, hash } from "bcryptjs";

export async function register(username: string, email: string, password: string) {
  const { headers } = requestInfo;

  // Check if user already exists
  const existingUser = await db.user.findFirst({
    where: {
      OR: [
        { username },
        { email }
      ]
    }
  });

  if (existingUser) {
    return { success: false, error: "Username or email already exists" };
  }

  // Hash password
  const hashedPassword = await hash(password, 10);

  // Create user
  const user = await db.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  // Create session
  await sessions.save(headers, {
    userId: user.id,
  });

  return { success: true, user };
}

export async function login(identifier: string, password: string) {
  const { headers } = requestInfo;

  // Find user by username or email
  const user = await db.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier }
      ]
    }
  });

  if (!user) {
    return { success: false, error: "Invalid credentials" };
  }

  // Verify password
  const isValid = await compare(password, user.password);

  if (!isValid) {
    return { success: false, error: "Invalid credentials" };
  }

  // Create session
  await sessions.save(headers, {
    userId: user.id,
  });

  return { success: true, user };
}

export async function logout() {
  const { headers } = requestInfo;
  await sessions.save(headers, { userId: null });
  return { success: true };
}

export async function getCurrentUser() {
  const { request } = requestInfo;
  const session = await sessions.load(request);
  
  if (!session?.userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    }
  });

  return user;
}
