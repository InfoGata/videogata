import axios from "axios";
import { Video } from "../plugintypes";
import { VideoService } from "./VideoService";

interface InvidiousVideoResult {
  title: string;
  videoId: string;
  lengthSeconds: number;
  videoThumbnails: Image[];
}
interface InvidiousVideoResponse {
  adaptiveFormats: IInvidiousFormat[];
}
interface IInvidiousFormat {
  itag: string;
  url: string;
}
interface Image {
  url: string;
  height: number;
  width: number;
}

const instance = "https://invidious.tube";
class InvidiousService implements VideoService {
  resultToVideo(results: InvidiousVideoResult[]): Video[] {
    return results.map((r) => ({
      apiId: r.videoId,
      duration: r.lengthSeconds,
      title: r.title,
      from: "youtube",
    }));
  }

  async searchVideo(query: string): Promise<Video[]> {
    const url = `${instance}/api/v1/search?q=${encodeURIComponent(query)}`;
    const results = await axios.get<InvidiousVideoResult[]>(url);
    return this.resultToVideo(results.data);
  }

  async getVideoUrl(video: Video) {
    const url = `${instance}/api/v1/videos/${video.apiId}`;
    const results = await axios.get<InvidiousVideoResponse>(url);
    const formats = results.data.adaptiveFormats;
    const audioFormat = formats.filter((f) => f.itag === "134")[0];
    return audioFormat.url;
  }
}

export default InvidiousService;
