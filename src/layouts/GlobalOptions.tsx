import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpRightFromSquareIcon, MoreHorizontalIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ImportDialog from "../components/ImportDialog";
import { Playlist, Video } from "../plugintypes";

const GlobalOptions: React.FC = () => {
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const openImportDialog = () => {
    setImportDialogOpen(true);
  };

  const onImport = (item: Video[] | Playlist) => {
    if (Array.isArray(item) && item.length > 0) {
      const video = item[0];
      const url = `/plugins/${video.pluginId}/videos/${video.apiId}`;
      navigate(url);
    }
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={openImportDialog}
            className="cursor-pointer"
          >
            <ArrowUpRightFromSquareIcon />
            {t("openVideoUrl")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ImportDialog
        setOpen={setImportDialogOpen}
        title={t("openVideoUrl")}
        open={importDialogOpen}
        parseType="video"
        onSuccess={onImport}
      />
    </>
  );
};
export default GlobalOptions;
