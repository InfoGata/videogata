import {
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { CheckedState } from "@radix-ui/react-checkbox";
import React from "react";
import { useTranslation } from "react-i18next";
import { Video } from "../plugintypes";
import PlaylistItem from "./PlaylistItem";
import Sortable from "./Sortable";
import SortableRow from "./SortableRow";
import { Checkbox } from "./ui/checkbox";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import { DropdownItemProps } from "./DropdownItem";

interface VideoListProps {
  videos: Video[];
  dragDisabled?: boolean;
  onDragOver?: (newVideoList: Video[]) => void;
  playlistId?: string;
  selected?: Set<string>;
  onSelect?: (e: React.MouseEvent, id: string, index: number) => void;
  onSelectAll?: (state: CheckedState) => void;
  isSelected?: (id: string) => boolean;
  onDelete?: (video: Video) => void;
  menuItems?: DropdownItemProps[];
  currentVideoId?: string;
}

const VideoList: React.FC<VideoListProps> = (props) => {
  const {
    videos,
    onDragOver,
    dragDisabled,
    playlistId,
    selected,
    onSelectAll,
    onSelect,
    isSelected,
    menuItems,
    currentVideoId,
  } = props;
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const { t } = useTranslation();

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
      <Table>
        <TableHeader>
          <TableRow>
            {selected && (
              <TableHead>
                <Checkbox
                  onCheckedChange={onSelectAll}
                  checked={
                    (selected.size > 0 && selected.size === videos.length) ||
                    (selected.size > 0 &&
                      selected.size < videos.length &&
                      "indeterminate")
                  }
                  aria-label="select all videos"
                />
              </TableHead>
            )}
            <TableHead>{t("title")}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t("duration")}
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video, i) => (
            <SortableRow
              id={video.id || ""}
              key={video.id || video.apiId}
              disabled={dragDisabled}
              currentItem={video.id === currentVideoId}
            >
              <PlaylistItem
                video={video}
                isSelected={isSelected}
                onSelectClick={onSelect}
                index={i}
                playlistId={playlistId}
                menuItems={menuItems}
              />
            </SortableRow>
          ))}
          <DragOverlay wrapperElement="tr">
            {activeId ? (
              <PlaylistItem
                key={activeId}
                video={videos.find((t) => t.id === activeId) || ({} as Video)}
              />
            ) : null}
          </DragOverlay>
        </TableBody>
      </Table>
    </Sortable>
  );
};

export default VideoList;
