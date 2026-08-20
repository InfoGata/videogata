import React from "react";
import { Skeleton } from "./ui/skeleton";

/** Mirrors HomeVideoCard's shape so the grid doesn't reflow once videos land. */
const VideoCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <Skeleton className="mt-2.5 h-4 w-full" />
      <Skeleton className="mt-1.5 h-4 w-4/5" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
};

export default VideoCardSkeleton;
