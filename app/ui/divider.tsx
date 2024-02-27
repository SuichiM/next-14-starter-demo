import clsx from 'clsx';

export default function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={clsx('flex items-center justify-center', {
        'space-x-2': children,
      })}
    >
      <div className="h-0.5 w-20 bg-gray-300" />
      <p className="text-gray-400">{children}</p>
      <div className="h-0.5 w-20 bg-gray-300" />
    </div>
  );
}
