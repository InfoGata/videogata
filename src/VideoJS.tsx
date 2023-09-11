import React from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import "video.js/dist/video-js.css";
import "videojs-hotkeys";

interface VideoJSProps {
  options: VideoJsPlayerOptions;
  isMiniPlayer?: boolean;
}

const VideoJS: React.FC<VideoJSProps> = (props) => {
  const { isMiniPlayer, options } = props;
  const videoRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<VideoJsPlayer | null>(null);

  useDeepCompareEffect(() => {
    if (playerRef.current) {
      const player = playerRef.current;
      if (options.sources) {
        player.src(options.sources);
      }
    }
  }, [options.sources]);

  React.useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current?.appendChild(videoElement);

      playerRef.current = videojs(videoElement, options, () => {
        videojs.log("onPlayerReady");
      });
    }
  }, [options, videoRef]);

  React.useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div
        style={{
          width: "100%",
          height: isMiniPlayer ? "150px" : "75vh",
        }}
        ref={videoRef}
      />
    </div>
  );
};

export default VideoJS;
