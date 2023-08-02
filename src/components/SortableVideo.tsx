import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHoriz } from "@mui/icons-material";
import { IconButton, ListItem, ListItemSecondaryAction } from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";

interface SortableVideoProps {
  id: string;
  disabled?: boolean;
  video: Video;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, video: Video) => void;
}
const SortableVideo: React.FC<React.PropsWithChildren<SortableVideoProps>> = (
  props
) => {
  const { id, disabled, video, openMenu } = props;
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id || "", disabled: disabled });

  const openVideoMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, video);
  };

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <ListItemSecondaryAction>
          <IconButton onClick={openVideoMenu} size="large">
            <MoreHoriz />
          </IconButton>
        </ListItemSecondaryAction>
      }
      sx={{
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        transform: CSS.Translate.toString(transform),
        transition,
        touchAction: "none",
        opacity: isDragging ? 0.3 : 1,
        cursor: "pointer",
      }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {props.children}
    </ListItem>
  );
};

export default SortableVideo;
