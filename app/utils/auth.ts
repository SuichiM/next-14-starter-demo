// 'use server';

import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

import { authConfig } from './auth.config';

import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

import { getUser } from '@/app/services/auth';

// import bcrypt from 'bcrypt';

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = CredentialsSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await getUser(email);
          if (!user) return null;
          return user;
          //const passwordsMatch = await bcrypt.compare(password, user.password);

          //if (passwordsMatch) return user;
        }

        return null;
      },
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_CLIENT_ID as string,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET as string,
    }),
  ],
});
