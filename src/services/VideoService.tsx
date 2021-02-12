import { Video } from "../models";

export interface VideoService {
  searchVideo: (query: string) => Promise<Video[]>;
  getVideoUrl: (video: Video) => Promise<string>;
}
