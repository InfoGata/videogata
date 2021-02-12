import { List, ListItem, ListItemText } from '@material-ui/core';
import React from 'react';
import { Video } from './models';
import InvidiousService from './services/invidious';
import PeerTubeService from './services/peertube';
import { VideoService } from './services/VideoService';

const peertube = new PeerTubeService();
const youtube = new InvidiousService();

const getVideoService = (serviceName: string): VideoService | null => {
  switch (serviceName) {
    case "youtube":
      return youtube;
    case "peertube":
      return peertube;
  }
  return null;
};

const App: React.FC = () => {
  const [src, setSrc] = React.useState<string | undefined>("");
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [query, setQuery] = React.useState("");
  const [serviceName, setServiceName] = React.useState("");
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const onSearch = async () => {
    const service = getVideoService(serviceName);
    if (service) {
      const results = await service.searchVideo(query);
      setVideos(results);
    }
  };

  const searchItems = videos.map((v, i) => {
    const onSearchItemClick = async () => {
      const service = getVideoService(v.from);
      if (service) {
        const url = await service.getVideoUrl(v);
        setSrc(url);
        videoRef.current?.load();
      }
    };
    return <ListItem onClick={onSearchItemClick} key={i} button={true}>
      <ListItemText primary={v.title} />
    </ListItem>
  });

  const onQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const onServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setServiceName(event.target.value);
  };

  return (
    <div>
      <video ref={videoRef} width="320" height="240" controls src={src} />
      <input value={query} onChange={onQueryChange} />
      <select value={serviceName} onChange={onServiceChange}>
        <option value="">Select Service</option>
        <option value="youtube">Youtube</option>
        <option value="peertube">Peertube</option>
      </select>
      <button onClick={onSearch}>Search</button>
      <List>
        {searchItems}
      </List>
    </div>
  );
};

export default App;
