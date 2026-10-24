import DropdownItem, { DropdownItemProps } from "@/components/DropdownItem";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { addFavorite, removeFavorite } from "@/sync/library";
import type { FavoriteType } from "@/sync/library-doc";
import { useIsFavorite } from "@/sync/useLibrary";
import { ItemMenuType } from "@/types";
import {
  ExternalLink,
  MoreHorizontal,
  StarIcon,
  StarOffIcon,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface Props {
  itemType: ItemMenuType;
  dropdownItems?: DropdownItemProps[];
  noFavorite?: boolean;
}

const favoriteTypes: Record<ItemMenuType["type"], FavoriteType> = {
  video: "videos",
  channel: "channels",
  playlist: "playlists",
};

const ItemMenu: React.FC<Props> = (props) => {
  const { itemType, dropdownItems, noFavorite } = props;
  const { t } = useTranslation();
  const [, setOpen] = React.useState(false);
  const favoriteType = favoriteTypes[itemType.type];
  const isFavorited = useIsFavorite(favoriteType, itemType.item);

  const onFavorite = async () => {
    await addFavorite(favoriteType, itemType.item);
    toast(t("addedToFavorites"));
  };

  const onRemoveFavorite = async () => {
    await removeFavorite(favoriteType, itemType.item);
    toast(t("removedFromFavorites"));
  };

  const items: (DropdownItemProps | undefined)[] = [
    !noFavorite
      ? {
          title: isFavorited ? t("removeFromFavorites") : t("addToFavorites"),
          icon: isFavorited ? <StarOffIcon /> : <StarIcon />,
          action: isFavorited ? onRemoveFavorite : onFavorite,
        }
      : undefined,
    itemType.item.originalUrl
      ? {
          title: t("originalUrl"),
          icon: <ExternalLink />,
          url: itemType.item.originalUrl,
        }
      : undefined,
    ...(dropdownItems || []),
  ];

  const definedItems = items.filter((i): i is DropdownItemProps => !!i);
  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {definedItems.map((i) => (
          <DropdownItem
            key={i.title}
            {...i}
            item={itemType}
            setOpen={setOpen}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ItemMenu;
