import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from './db';
import { users, tenantMembers, tenants } from './db/schema';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      tenantId?: string;
      tenantSlug?: string;
    } & DefaultSession['user'];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) return null;
        if (!(await compare(password, user.passwordHash))) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.userId = user.id;
        // Look up the user's first tenant membership and pin it to the token.
        const rows = await db
          .select({ tenantId: tenantMembers.tenantId, slug: tenants.slug })
          .from(tenantMembers)
          .innerJoin(tenants, eq(tenants.id, tenantMembers.tenantId))
          .where(eq(tenantMembers.userId, user.id))
          .limit(1);
        if (rows[0]) {
          token.tenantId = rows[0].tenantId;
          token.tenantSlug = rows[0].slug;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        session.user.id = String(token.userId);
        if (token.tenantId) session.user.tenantId = String(token.tenantId);
        if (token.tenantSlug) session.user.tenantSlug = String(token.tenantSlug);
      }
      return session;
    },
  },
});
