'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

import { Button } from './button';
export function GithubSignIn() {
  return (
    <Button
      onClick={() =>
        signIn('github', {
          callbackUrl: `${window.location.origin}`,
        })
      }
      className="text-red w-72 self-center bg-black"
    >
      <span className="mx-auto flex items-center gap-2">
        Login with github
        <Image
          width={32}
          height={32}
          src="/github.svg"
          alt="coso"
          className=" rounded-full"
        />
      </span>
    </Button>
  );
}
