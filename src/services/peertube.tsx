import axios from "axios";
import { Video } from "../models";
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
  private instances = [
    "https://peertube.cpy.re"
  ];
  async searchVideo(query: string): Promise<Video[]> {
    let result: Video[] = [];
    const path = `/api/v1/search/videos?search=${query}`;
    for (const instance of this.instances) {
      const url = `${instance}${path}`
      const search = await axios.get<PeertubeVideoSearch>(url);
      console.log(search);
      const results: Video[] = search.data.data.map(d => ({
        title: d.name,
        thumbnail: `${d.thumbnailPath}`,
        duration: d.duration,
        createdDate: d.createdAt,
        description: d.description,
        apiId: d.uuid,
        url: instance,
        from: "peertube"
      }));
      result = result.concat(results);
    }
    console.log(result);
    return result;
  }

  async getVideoUrl(video: Video): Promise<string> {
    const path = `/api/v1/videos/${video.apiId}`
    const url = `${video.url}${path}`;
    const response = await axios.get<PeertubeVideoResult>(url);
    console.log(response);
    return response.data.files.reverse()[0].fileUrl;
  }
}

export default PeerTubeService;