import type { User } from 'next-auth';
import Image from 'next/image';

export default function UserWidget({ user }: { user: User }) {
  return (
    <div className="flex h-20 w-full items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
      {user.image && (
        <img
          src={user.image}
          alt="user avatar"
          className="h-10 w-10 rounded-full"
        />
      )}
      <div className="flex flex-col overflow-hidden">
        <div className="hidden md:block">{user?.name}</div>
        {/* max widh 30 rem or truncate */}
        <div className="hidden max-w-xs overflow-hidden text-ellipsis text-xs text-gray-700 md:block">
          {user?.email}
        </div>
      </div>
    </div>
  );
}
