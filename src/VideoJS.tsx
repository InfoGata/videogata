import React from "react";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import "video.js/dist/video-js.css";
import { VideoSource } from "./plugintypes";

interface VideoJSProps {
  options: VideoJsPlayerOptions;
  videoSources: VideoSource[];
}

class VideoJS extends React.Component<VideoJSProps> {
  private videoNode: HTMLVideoElement | null = null;
  private player: VideoJsPlayer | null = null;

  componentDidMount() {
    if (this.videoNode) {
      this.player = videojs(this.videoNode, this.props.options, () => {
        videojs.log("onPlayerReady", this);
      });
    }
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  render() {
    return (
      <div data-vjs-player>
        <video ref={(node) => (this.videoNode = node)} className="video-js">
          {this.props.videoSources.map((v, i) => (
            <source src={v.source} type={v.type} key={i} />
          ))}
        </video>
      </div>
    );
  }
}

export default VideoJS;
