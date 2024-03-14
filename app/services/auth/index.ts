'use server';

import { signIn } from '@/app/utils/auth';
import { AuthError } from 'next-auth';

import prisma from '@/app/lib/db';

import type { User } from '@/app/lib/definitions';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    //TODO: verify this, what the kind of type I'm getting here and how check it properly
    // at the moment always return 'Invalid credentials.'
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    return 'Invalid credentials.';
    throw error;
  }
}

export async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        email,
      },
    });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new AuthError('Failed to fetch user.');
  }
}
