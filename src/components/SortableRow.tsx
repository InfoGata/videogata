import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow } from "@mui/material";

interface SortableItemProps {
  id: string;
  disabled?: boolean;
  onClick?: (...args: any) => void;
}
const SortableRow: React.FC<React.PropsWithChildren<SortableItemProps>> = (
  props
) => {
  const { id, onClick, disabled } = props;
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id || "", disabled: disabled });

  return (
    <TableRow
      hover={true}
      onClick={onClick}
      sx={{
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        transform: CSS.Translate.toString(transform),
        transition,
        touchAction: "none",
        opacity: isDragging ? 0.3 : 1,
      }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {props.children}
    </TableRow>
  );
};

export default SortableRow;
