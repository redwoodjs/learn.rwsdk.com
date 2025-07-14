"use client";

import { useState, useTransition } from "react";
import { login, register } from "./functions";

type UserRole = "USER" | "CREATOR" | "ADMIN";

export function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLogin = async () => {
    startTransition(async () => {
      const result = await login(identifier, password);
      if (result.success && result.user) {
        // Redirect based on role
        if (result.user.role === "ADMIN" || result.user.role === "CREATOR") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        setResult(result.error || "Login failed");
      }
    });
  };

  const handleRegister = async () => {
    startTransition(async () => {
      const result = await register(identifier, identifier, password); // Using identifier as both username and email for now
      if (result.success && result.user) {
        // Redirect based on role
        if (result.user.role === "ADMIN" || result.user.role === "CREATOR") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        setResult(result.error || "Registration failed");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="identifier" className="sr-only">
                Username or Email
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username or Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isPending ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="button"
              onClick={handleRegister}
              disabled={isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isPending ? "Creating account..." : "Create account"}
            </button>
          </div>
          {result && (
            <div className="text-red-600 text-center text-sm">{result}</div>
          )}
        </form>
      </div>
    </div>
  );
}
