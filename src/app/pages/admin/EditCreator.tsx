"use client";

import { AdminLayout } from "@/app/layouts/AdminLayout";
import { useEffect, useState } from "react";
import { getCreator, updateCreatorProfile } from "./functions";
import { RequestInfo } from "rwsdk/worker";
import { AppContext } from "@/worker";
import { FileUpload } from "@/app/components/FileUpload";

interface Creator {
  id: string;
  name: string | null;
  description: string | null;
  avatar: string | null;
}

interface UploadResponse {
  url: string;
}

interface EditCreatorProps extends RequestInfo {
  params: {
    id: string;
  };
  ctx: AppContext;
}

export function EditCreator({ params, ctx }: EditCreatorProps) {
  const { id } = params;
  const [creator, setCreator] = useState<Creator | null>({
    id: "",
    name: null,
    description: null,
    avatar: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarUpload = (url: string) => {
    if (creator) {
      setCreator({
        ...creator,
        avatar: `/download/${url}`
      });
    }
  };

  const handleAvatarUploadError = (error: string) => {
    setError(error);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!ctx.user?.id) {
      setError("User not authenticated");
      return;
    }

    try {
      await updateCreatorProfile(ctx.user.id, {
        name: creator?.name || undefined,
        avatar: creator?.avatar || undefined,
        description: creator?.description || undefined
      });
      window.location.href = "/admin/creators";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchCreator = async () => {
      const creatorData = await getCreator(id);
      if (creatorData) {
        setCreator({
          id: creatorData.id,
          name: creatorData.name,
          description: creatorData.description,
          avatar: creatorData.avatar
        });
      }
    };
    fetchCreator();
  }, [id]);

  return (
    <AdminLayout ctx={ctx}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Edit Instructor Profile
            </h2>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200">
            <div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={creator?.name || ""}
                      onChange={(e) => creator && setCreator({ ...creator, name: e.target.value })}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={creator?.description || ""}
                      onChange={(e) => creator && setCreator({ ...creator, description: e.target.value })}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Avatar</label>
                  <div className="mt-1">
                    {creator?.avatar ? (
                      <div className="space-y-2">
                        <img 
                          src={creator.avatar} 
                          alt="Current avatar" 
                          className="w-32 h-32 rounded-full object-cover"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Current avatar: {creator.avatar.split('/').pop()}
                          </span>
                          <button
                            type="button"
                            onClick={() => creator && setCreator({ ...creator, avatar: null })}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove avatar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <FileUpload
                        onUploadComplete={handleAvatarUpload}
                        onUploadError={handleAvatarUploadError}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024} // 5MB for avatars
                        className="mt-1"
                      >
                        <div className="flex justify-center px-4 py-3 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors cursor-pointer">
                          <div className="text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p className="mt-1 text-sm text-gray-600">Upload avatar image</p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        </div>
                      </FileUpload>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <a
                href="/admin/creators"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </a>
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 