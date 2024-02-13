import DropdownItem, { DropdownItemProps } from "@/components/DropdownItem";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/database";
import { ItemMenuType } from "@/types";
import { Link as LinkIcon } from "@mui/icons-material";
import Dexie from "dexie";
import { MoreHorizontal } from "lucide-react";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { FaRegStar, FaStar } from "react-icons/fa6";

interface Props {
  itemType: ItemMenuType;
  dropdownItems?: DropdownItemProps[];
  noFavorite?: boolean;
}

const getTable = (item: ItemMenuType): Dexie.Table => {
  switch (item.type) {
    case "video":
      return db.favoriteVideos;
    case "channel":
      return db.favoriteChannels;
    case "playlist":
      return db.favoritePlaylists;
  }
};

const VideoMenu: React.FC<Props> = (props) => {
  const { itemType, dropdownItems, noFavorite } = props;
  const { t } = useTranslation();
  const [isFavorited, setIsFavorited] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const onFavorite = async () => {
    const table = getTable(itemType);
    await table.add(itemType.item);
    enqueueSnackbar(t("addedToFavorites"));
  };

  const removeFavorite = async () => {
    if (itemType.item?.id) {
      const table = getTable(itemType);
      await table.delete(itemType.item.id);
      enqueueSnackbar(t("removedFromFavorites"));
    }
  };

  const onOpenChange = async (open: boolean) => {
    if (!noFavorite && open) {
      const table = getTable(itemType);
      if (itemType.item.pluginId && itemType.item.apiId) {
        const hasFavorite = await table.get({
          pluginId: itemType.item.pluginId,
          apiId: itemType.item.apiId,
        });
        setIsFavorited(!!hasFavorite);
      } else if (itemType.item.id) {
        const hasFavorite = await table.get(itemType.item.id);
        setIsFavorited(!!hasFavorite);
      } else {
        setIsFavorited(false);
      }
    }
  };

  const items: (DropdownItemProps | undefined)[] = [
    !noFavorite
      ? {
          title: isFavorited ? t("removeFromFavorites") : t("addToFavorites"),
          icon: isFavorited ? <FaRegStar /> : <FaStar />,
          action: isFavorited ? removeFavorite : onFavorite,
        }
      : undefined,
    itemType.item.originalUrl
      ? {
          title: t("originalUrl"),
          icon: <LinkIcon />,
          url: itemType.item.originalUrl,
        }
      : undefined,
    ...(dropdownItems || []),
  ];

  const definedItems = items.filter((i): i is DropdownItemProps => !!i);
  return (
    <>
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {definedItems.map((i) => (
            <DropdownItem key={i.title} {...i}></DropdownItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default VideoMenu;
