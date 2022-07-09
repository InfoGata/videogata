import axios from "axios";
import { Video } from "../plugintypes";
import { VideoService } from "./VideoService";
interface PeertubeVideoSearch {
  total: number;
  data: PeertubeSearchVideoSearchData[];
}

interface PeertubeSearchVideoSearchData {
  id: number;
  uuid: string;
  createdAt: Date;
  description: string;
  name: string;
  duration: number;
  thumbnailPath: string;
}

interface PeertubeVideoResult {
  files: PeertubeVideoFile[];
}

interface PeertubeVideoFile {
  fileUrl: string;
}

class PeerTubeService implements VideoService {
  private instances = ["https://peertube.cpy.re"];
  async searchVideo(query: string): Promise<Video[]> {
    let result: Video[] = [];
    const path = `/api/v1/search/videos?search=${query}`;
    for (const instance of this.instances) {
      const url = `${instance}${path}`;
      const search = await axios.get<PeertubeVideoSearch>(url);
      const results: Video[] = search.data.data.map((d) => ({
        title: d.name,
        duration: d.duration,
        description: d.description,
        apiId: d.uuid,
        src: instance,
      }));
      result = result.concat(results);
    }
    return result;
  }

  async getVideoUrl(video: Video): Promise<string> {
    const path = `/api/v1/videos/${video.apiId}`;
    const url = `${video.source}${path}`;
    const response = await axios.get<PeertubeVideoResult>(url);
    return response.data.files.reverse()[0].fileUrl;
  }
}

export default PeerTubeService;
