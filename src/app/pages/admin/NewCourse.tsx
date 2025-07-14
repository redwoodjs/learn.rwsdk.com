"use client";
import { RequestInfo } from "rwsdk/worker";
import { CourseForm } from "./CourseForm";

export function NewCourse(props: RequestInfo) {
  return <CourseForm {...props} />;
} 