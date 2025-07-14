export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  status: string;
  videoUrl?: string;
  videoType?: 'UPLOADED' | 'YOUTUBE';
  content?: any;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  status: string;
  lessons: Lesson[];
}

import { CourseLevel } from "@/db";

export interface Course {
  id: string | null;
  title: string;
  description: string;
  overview: string;
  status: string;
  slug: string;
  modules: Module[];
  creatorId?: string;
  level?: CourseLevel;
  thumbnailUrl: string;
} 