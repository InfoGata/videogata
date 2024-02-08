import { MoreHoriz, OpenInNew } from "@mui/icons-material";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ImportDialog from "../components/ImportDialog";
import { Playlist, Video } from "../plugintypes";

const GlobalOptions: React.FC = () => {
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };
  const { t } = useTranslation();
  const openImportDialog = () => {
    setImportDialogOpen(true);
    closeMenu();
  };
  const closeImportDialog = () => {
    setImportDialogOpen(false);
  };

  const onImport = (item: Video[] | Playlist) => {
    if (Array.isArray(item) && item.length > 0) {
      const video = item[0];
      const url = `/plugins/${video.pluginId}/videos/${video.apiId}`;
      navigate(url);
    }
    closeMenu();
  };
  return (
    <>
      <IconButton onClick={openMenu}>
        <MoreHoriz />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={openImportDialog}>
          <ListItemIcon>
            <OpenInNew />
          </ListItemIcon>
          <ListItemText primary={t("openVideoUrl")} />
        </MenuItem>
      </Menu>
      <ImportDialog
        setOpen={setImportDialogOpen}
        title={t("openVideoUrl")}
        open={importDialogOpen}
        handleClose={closeImportDialog}
        parseType="video"
        onSuccess={onImport}
      />
    </>
  );
};
export default GlobalOptions;
