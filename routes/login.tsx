import { FreshContext, HandlerByMethod, PageProps, RouteHandler } from "fresh";
import { define } from "../utils.ts";

type Data = {
    title: "Login Page",
}

export const handler = define.handlers({
    GET(ctx: FreshContext) {
        return ctx.render(Login());
    },
    async POST(ctx: FreshContext) {
        const form = await ctx.req.formData();
        const email = form.get("email")?.toString();
        const password = form.get("password")?.toString();
        if (!email || !password) {
            return new Response("Email and password are required", {
                status: 400,
            });
        }
        // Here you would typically handle the login logic, e.g., checking credentials
        // For now, we return a placeholder response
        return new Response("Login endpoint not initialized", {
            status: 404,
        });
    },
});


export default function Login() {
  return (
    <main>
        <h1>Login Page</h1>
        <form method="POST">
            <label>
            Username:
            <input type="text" name="username" required />
            </label>
            <br />
            <label>
            Password:
            <input type="password" name="password" required />
            </label>
            <br />
            <button type="submit">Login</button>
        </form>                
    </main>
  );
}