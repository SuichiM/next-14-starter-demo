'use server';

import NextAuth from 'next-auth';

import { authConfig } from './auth.config';

import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

import { getUser } from '@/app/services/auth';
import bcrypt from 'bcrypt';

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = CredentialsSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await getUser(email);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
});
