import React from "react";
import { Video } from "../plugintypes";

const useSelected = (videos: Video[]) => {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const lastSelected = React.useRef<number | null>(null);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const index = Number(e.target.dataset.index);
    if (
      lastSelected.current !== null &&
      (e.nativeEvent as any).shiftKey &&
      e.target.checked
    ) {
      setSelected((prev) => {
        const next = new Set(prev);
        const start = Math.min(lastSelected.current || 0, index);
        const end = Math.max(lastSelected.current || 0, index) + 1;
        const ids = videos.slice(start, end).map((v) => v.id);
        ids?.forEach((id) => next.add(id || ""));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        e.target.checked ? next.add(id) : next.delete(id);
        return next;
      });
    }
    lastSelected.current = e.target.checked ? index : null;
  };

  const onSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(new Set(videos.map((v) => v.id || "")));
      return;
    }
    setSelected(new Set());
  };

  const isSelected = (id: string) => {
    return selected.has(id);
  };

  return { selected, setSelected, onSelect, onSelectAll, isSelected };
};

export default useSelected;
