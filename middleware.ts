import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "rawaes-elite-secret-key-12345",
});

export const config = {
  // Protect /admin and any sub-routes, excluding /admin/login
  matcher: ["/admin", "/admin/((?!login).*)"],
};

