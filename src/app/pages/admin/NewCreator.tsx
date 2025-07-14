"use client";

import { useState } from "react";
import { AdminLayout } from "@/app/layouts/AdminLayout";
import { createCreator } from "./functions";
import { AppContext } from "@/worker";

interface NewCreatorProps {
  ctx: AppContext;
}

export function NewCreator({ ctx }: NewCreatorProps) {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await createCreator({
        username,
        avatar: avatar || undefined
      });
      window.location.href = "/admin/creators";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create instructor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout ctx={ctx}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-gray-900">
                  Add New Instructor
                </h2>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                <a
                  href="/admin/creators"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                  Avatar URL
                </label>
                <input
                  type="url"
                  id="avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Instructor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 