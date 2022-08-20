import {
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { List, ListItem } from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
import Sortable from "./Sortable";
import SortableVideo from "./SortableVideo";
import VideoListItemButton from "./VideoListItemButton";

interface VideoListProps {
  videos: Video[];
  dragDisabled?: boolean;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, video: Video) => void;
  onDragOver?: (newVideoList: Video[]) => void;
  playlistId?: string;
}

const VideoList: React.FC<VideoListProps> = (props) => {
  const { videos, onDragOver, dragDisabled, openMenu, playlistId } = props;
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = videos.findIndex((item) => item.id === active.id);
      const newIndex = videos.findIndex((item) => item.id === over?.id);
      const newList = arrayMove(videos, oldIndex, newIndex);
      if (onDragOver) {
        onDragOver(newList);
      }
    }
    setActiveId(null);
  };

  return (
    <Sortable
      ids={videos.map((v) => v.id || "")}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <List>
        {videos.map((v) => (
          <SortableVideo
            disabled={dragDisabled}
            id={v.id || ""}
            key={v.id || v.apiId}
            video={v}
            openMenu={openMenu}
          >
            <VideoListItemButton
              video={v}
              openMenu={openMenu}
              playlistId={playlistId}
            />
          </SortableVideo>
        ))}
        <DragOverlay>
          {activeId ? (
            <ListItem>
              <VideoListItemButton
                video={videos.find((v) => v.id === activeId) || ({} as Video)}
                openMenu={openMenu}
                playlistId={playlistId}
              />
            </ListItem>
          ) : null}
        </DragOverlay>
      </List>
    </Sortable>
  );
};

export default VideoList;
