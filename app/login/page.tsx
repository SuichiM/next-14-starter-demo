import AcmeLogo from '@/app/ui/acme-logo';
import Divider from '@/app/ui/divider';
import LoginForm from '@/app/ui/login-form';
import { GithubSignIn } from '@/app/ui/github-sign-in';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-md flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 grow text-white md:w-36">
            <AcmeLogo />
          </div>
        </div>
        <LoginForm />
        {/* or divider */}
        <Divider>or</Divider>
        {/* login with github */}
        <GithubSignIn />
      </div>
    </main>
  );
}
