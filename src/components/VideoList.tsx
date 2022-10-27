import {
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Video } from "../plugintypes";
import PlaylistItem from "./PlaylistItem";
import Sortable from "./Sortable";
import SortableRow from "./SortableRow";

interface VideoListProps {
  videos: Video[];
  dragDisabled?: boolean;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, video: Video) => void;
  onDragOver?: (newVideoList: Video[]) => void;
  playlistId?: string;
  selected: Set<string>;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSelected: (id: string) => boolean;
}

const VideoList: React.FC<VideoListProps> = (props) => {
  const {
    videos,
    onDragOver,
    dragDisabled,
    openMenu,
    playlistId,
    selected,
    onSelectAll,
    onSelect,
    isSelected,
  } = props;
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const theme = useTheme();
  const showDuration = useMediaQuery(theme.breakpoints.up("sm"));
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
      <TableContainer component={Paper}>
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              <TableCell padding="none" width="4%">
                <Checkbox
                  color="primary"
                  indeterminate={
                    selected.size > 0 && selected.size < videos.length
                  }
                  checked={videos.length > 0 && selected.size === videos.length}
                  onChange={onSelectAll}
                  size="small"
                  inputProps={{
                    "aria-label": "select all tracks",
                  }}
                />
              </TableCell>
              <TableCell width="80%">{t("title")}</TableCell>
              {showDuration && <TableCell>{t("duration")}</TableCell>}
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {videos.map((video, i) => (
              <SortableRow
                id={video.id || ""}
                key={video.id || video.apiId}
                disabled={dragDisabled}
              >
                <PlaylistItem
                  showDuration={showDuration}
                  video={video}
                  openMenu={openMenu}
                  isSelected={isSelected}
                  onSelectClick={onSelect}
                  index={i}
                  playlistId={playlistId}
                />
              </SortableRow>
            ))}
            <DragOverlay wrapperElement="tr">
              {activeId ? (
                <PlaylistItem
                  showDuration={showDuration}
                  key={activeId}
                  video={videos.find((t) => t.id === activeId) || ({} as Video)}
                />
              ) : null}
            </DragOverlay>
          </TableBody>
        </Table>
      </TableContainer>
    </Sortable>
  );
};

export default VideoList;
