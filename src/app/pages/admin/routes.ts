import { index, route } from "rwsdk/router";
import { Admin } from "./Admin";
import { NewCourse } from "./NewCourse";
import { EditCourse } from "./EditCourse";
import { EditCreator } from "./EditCreator";
import { Creators } from "./Creators";
import { NewCreator } from "./NewCreator";

// @ts-ignore
function isAuthenticated({ request, ctx }) {
  // Ensure that this user is authenticated
  if (ctx.user?.role !== "ADMIN") {
    return new Response(null, {
      status: 302,
      headers: { Location: "/user/login" },
    });
  }
}

export const adminRoutes = [
  index([isAuthenticated, Admin]),
  route("/courses/new", [isAuthenticated, NewCourse]),
  route("/courses/:id/edit", [isAuthenticated, EditCourse]),
  route("/creators", [isAuthenticated, Creators]),
  route("/creators/new", [isAuthenticated, NewCreator]),
  route("/creators/:id/edit", [isAuthenticated, EditCreator]),
];