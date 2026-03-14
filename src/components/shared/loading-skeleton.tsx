export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
