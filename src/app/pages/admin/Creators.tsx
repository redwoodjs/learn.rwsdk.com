"use client";

import { AdminLayout } from "@/app/layouts/AdminLayout";
import { getCreators } from "./functions";
import { AppContext } from "@/worker";
import { useEffect, useState } from "react";

interface Creator {
  id: string;
  name: string | null;
  avatar: string | null;
  role: string;
}

interface CreatorsProps {
  ctx: AppContext;
}

export function Creators({ ctx }: CreatorsProps) {
  const [creators, setCreators] = useState<Creator[]>([]);

  useEffect(() => {
    const fetchCreators = async () => {
      const data = await getCreators();
      setCreators(data);
    };
    fetchCreators();
  }, []);

  return (
    <AdminLayout ctx={ctx}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Manage Instructors
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <a
              href="/admin/creators/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add New Instructor
            </a>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {creators.map((creator) => (
              <li key={creator.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {creator.avatar ? (
                        <img
                          src={creator.avatar}
                          alt={creator.name?.toString() || ""}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            {creator.name?.charAt(0).toUpperCase() || ""}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          {creator.name || "Unnamed"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {creator.role}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <a
                        href={`/admin/creators/${creator.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Edit Profile
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
} 