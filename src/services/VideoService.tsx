import { Video } from "../plugintypes";

export interface VideoService {
  searchVideo: (query: string) => Promise<Video[]>;
  getVideoUrl: (video: Video) => Promise<string>;
}
