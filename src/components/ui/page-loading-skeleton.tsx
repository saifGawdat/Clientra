function Bar({ className }: { className: string }) {
  return <div className={`rounded-md bg-surface-raised ${className}`} />;
}

export function DashboardPageSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-5 min-h-full animate-pulse">
      <Bar className="h-8 w-56" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Bar key={idx} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Bar className="h-64 w-full rounded-lg" />
        <Bar className="h-64 w-full rounded-lg" />
      </div>
      <Bar className="h-72 w-full rounded-lg" />
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full animate-pulse">
      <div className="flex items-center justify-between gap-3">
        <Bar className="h-8 w-44" />
        <Bar className="h-9 w-28" />
      </div>
      <div className="flex gap-2">
        <Bar className="h-9 w-64" />
        <Bar className="h-9 w-24" />
      </div>
      <Bar className="h-12 w-full rounded-lg" />
      {Array.from({ length: 7 }).map((_, idx) => (
        <Bar key={idx} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full animate-pulse">
      <Bar className="h-7 w-64" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Bar className="h-[420px] w-full rounded-lg xl:col-span-2" />
        <Bar className="h-[420px] w-full rounded-lg" />
      </div>
      <Bar className="h-64 w-full rounded-lg" />
    </div>
  );
}

export function PipelinePageSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full animate-pulse">
      <div className="flex items-center justify-between">
        <Bar className="h-8 w-44" />
        <Bar className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, col) => (
          <div key={col} className="space-y-3">
            <Bar className="h-7 w-32" />
            {Array.from({ length: 4 }).map((__, cardIdx) => (
              <Bar key={cardIdx} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-5 space-y-4 min-h-full animate-pulse">
      <Bar className="h-8 w-44" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Bar className="h-72 w-full rounded-lg" />
        <div className="xl:col-span-2 space-y-3">
          <Bar className="h-14 w-full rounded-lg" />
          <Bar className="h-14 w-full rounded-lg" />
          <Bar className="h-14 w-full rounded-lg" />
          <Bar className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 animate-pulse">
      <div className="hidden lg:block bg-surface" />
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4">
          <Bar className="h-8 w-40" />
          <Bar className="h-4 w-64" />
          <Bar className="h-10 w-full rounded-lg" />
          <Bar className="h-10 w-full rounded-lg" />
          <Bar className="h-10 w-full rounded-lg" />
          <Bar className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
