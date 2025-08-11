import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export default function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div 
      className={cn(
        "w-full h-[200px] bg-gray-100 rounded-lg",
        "animate-pulse",
        className
      )}
      role="status"
      aria-label="Loading..."
    >
      <div className="flex flex-col h-full p-4 gap-4">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="flex-1" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}