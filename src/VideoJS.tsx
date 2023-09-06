import React from "react";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import "video.js/dist/video-js.css";
import { VideoSource } from "./plugintypes";

interface VideoJSProps {
  options: VideoJsPlayerOptions;
  videoSources: VideoSource[];
  isMiniPlayer?: boolean;
}

const VideoJS: React.FC<VideoJSProps> = (props) => {
  const { isMiniPlayer, videoSources, options } = props;
  const videoRef = React.useRef(null);
  const playerRef = React.useRef<VideoJsPlayer | null>(null);
  React.useEffect(() => {
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;
      playerRef.current = videojs(videoElement, options, () => {
        videojs.log("onPlayerReady");
      });
    }
  }, [options, videoRef]);

  React.useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div
      data-vjs-player
      style={{
        width: "100%",
        height: isMiniPlayer ? "150px" : "75vh",
      }}
    >
      <video ref={videoRef} className="video-js">
        {videoSources.map((v, i) => (
          <source src={v.source} type={v.type} key={i} />
        ))}
      </video>
    </div>
  );
};

export default VideoJS;
