"use client";

import { useState } from "react";
import { Module, Lesson } from "@/app/types/course";
import { LessonCard } from "./LessonCard";

interface ModuleCardProps {
  module: Module;
  index: number;
  onChange: (updatedModule: Module) => void;
  onDelete: () => void;
}

export function ModuleCard({ module, index, onChange, onDelete }: ModuleCardProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  const handleFieldChange = (field: keyof Module, value: string) => {
    onChange({ ...module, [field]: value });
  };

  const handleLessonChange = (lessonIndex: number, updatedLesson: Lesson) => {
    const updatedLessons = [...module.lessons];
    updatedLessons[lessonIndex] = updatedLesson;
    onChange({ ...module, lessons: updatedLessons });
  };

  const handleAddLesson = () => {
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      order: module.lessons.length,
      duration: 0,
      status: "draft",
    };
    onChange({ ...module, lessons: [...module.lessons, newLesson] });
  };

  const handleDeleteLesson = (lessonIndex: number) => {
    onChange({
      ...module,
      lessons: module.lessons.filter((_, idx) => idx !== lessonIndex),
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex items-center space-x-3 text-left flex-1"
        >
          <svg
            className={`h-5 w-5 text-gray-500 transform transition-transform ${expanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <h4 className="text-lg font-medium text-gray-900">Module {index + 1}</h4>
        </button>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleAddLesson}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Add Lesson
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
          >
            Delete Module
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-6 py-4 space-y-4">
          <input
            type="text"
            value={module.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2"
            placeholder="Module Title"
          />

          {/* Lessons */}
          {module.lessons.map((lesson, lessonIndex) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={lessonIndex}
              onChange={(updatedLesson: Lesson) => handleLessonChange(lessonIndex, updatedLesson)}
              onDelete={() => handleDeleteLesson(lessonIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 