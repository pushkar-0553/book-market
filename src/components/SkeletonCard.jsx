// SkeletonCard — light theme shimmer placeholder
export default function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" aria-hidden="true">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex gap-1.5">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-12 rounded-full" />
        </div>
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="flex gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton w-3 h-3 rounded-full" />
          ))}
        </div>
        <div className="flex justify-between items-center pt-1">
          <div className="skeleton h-7 w-16 rounded-lg" />
          <div className="skeleton h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
