import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "rawaes-elite-secret-key-12345";

const OTP_MAX_ATTEMPTS = 5;

// Normalize Saudi/intl phone numbers to a canonical +XXXXXXXX form
export function normalizePhone(raw: string): string | null {
  let phone = raw.replace(/[\s\-()]/g, "");
  if (phone.startsWith("00")) phone = "+" + phone.slice(2);
  if (/^05\d{8}$/.test(phone)) phone = "+966" + phone.slice(1);
  if (/^5\d{8}$/.test(phone)) phone = "+966" + phone;
  if (/^966\d{9}$/.test(phone)) phone = "+" + phone;
  return /^\+\d{10,15}$/.test(phone) ? phone : null;
}

export function hashOtp(phone: string, code: string): string {
  return crypto
    .createHash("sha256")
    .update(`${phone}:${code}:${AUTH_SECRET}`)
    .digest("hex");
}

// Password hashing for admin accounts (scrypt, stored as "salt:hash")
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Admin Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username },
        });
        if (admin) {
          if (!verifyPassword(credentials.password, admin.passwordHash)) return null;
          return { id: admin.id, name: admin.name, role: "admin" } as any;
        }

        // Bootstrap fallback: env credentials work only until an admin is seeded
        const adminCount = await prisma.admin.count();
        if (adminCount === 0) {
          const adminUser = process.env.ADMIN_USER || "admin";
          const adminPass = process.env.ADMIN_PASS || "admin123";
          if (credentials.username === adminUser && credentials.password === adminPass) {
            return { id: "env-admin", name: "Administrator", role: "admin" } as any;
          }
        }
        return null;
      },
    }),
    CredentialsProvider({
      id: "client-otp",
      name: "Client OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) return null;

        const phone = normalizePhone(credentials.phone);
        if (!phone) return null;

        const otp = await prisma.otpCode.findFirst({
          where: { phone },
          orderBy: { createdAt: "desc" },
        });
        if (!otp) return null;

        if (otp.expiresAt < new Date() || otp.attempts >= OTP_MAX_ATTEMPTS) {
          await prisma.otpCode.deleteMany({ where: { phone } });
          return null;
        }

        if (otp.codeHash !== hashOtp(phone, credentials.code.trim())) {
          await prisma.otpCode.update({
            where: { id: otp.id },
            data: { attempts: { increment: 1 } },
          });
          return null;
        }

        // Code is valid — consume it
        await prisma.otpCode.deleteMany({ where: { phone } });

        return { id: phone, name: phone, phone, role: "client" } as any;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.phone = (user as any).phone ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub ?? null;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone ?? null;
      }
      return session;
    },
  },
  secret: AUTH_SECRET,
};
