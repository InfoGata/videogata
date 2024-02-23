import React from "react";
import { Video } from "../plugintypes";
import RecommendedVideoCard from "./RecommendedVideoCard";

interface RecommendedVideosProps {
  videos: Video[];
  pluginId: string;
}

const RecommendedVideos: React.FC<RecommendedVideosProps> = (props) => {
  const { videos } = props;

  const recommendations = videos.map((v) => (
    <RecommendedVideoCard key={v.apiId} video={v} />
  ));

  return <div className="space-y-3">{recommendations}</div>;
};

export default RecommendedVideos;
