import { route } from "rwsdk/router";
import { Login } from "./Login";
import RegisterPage from "./Register";
import { sessions } from "@/session/store";

export const userRoutes = [
  route("/login", [Login]),
  route("/register", [RegisterPage]),
  route("/logout", async function ({ request }) {
    const headers = new Headers();
    await sessions.remove(request, headers);
    headers.set("Location", "/");

    return new Response(null, {
      status: 302,
      headers,
    });
  }),
];
