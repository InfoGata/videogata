import React from "react";
import { Skeleton } from "./ui/skeleton";

const VideoCardSkeleton: React.FC = () => {
  return (
    <div>
      <div className="rounded-2xl bg-gray-200 w-full h-64 object-cover"></div>
      <div className="mt-3">
        <Skeleton className="h-6 flex-grow mt-1" />
        <Skeleton className="h-6 flex-grow mt-1" />
        <Skeleton className="h-6 flex-grow mt-1" />
      </div>
    </div>
  );
};

export default VideoCardSkeleton;
