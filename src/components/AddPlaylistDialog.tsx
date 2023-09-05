import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { Playlist, Video } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { addPlaylist } from "../store/reducers/playlistReducer";

interface AddPlaylistDialogProps {
  open: boolean;
  videos?: Video[];
  handleClose: () => void;
}

const AddPlaylistDialog: React.FC<AddPlaylistDialogProps> = (props) => {
  const { open, handleClose } = props;
  const [name, setName] = React.useState("");
  const formId = nanoid();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videos = props.videos || [];
    const playlist: Playlist = {
      name,
      videos: videos,
    };
    dispatch(addPlaylist(playlist));
    enqueueSnackbar(t("playlistCreated"));

    handleClose();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">{t("addPlaylist")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("givePlaylistName")}</DialogContentText>
        <form id={formId} onSubmit={onSubmit}>
          <TextField
            autoFocus={true}
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth={true}
            value={name}
            onChange={onChange}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("cancel")}</Button>
        <Button type="submit" form={formId}>
          {t("addPlaylist")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(AddPlaylistDialog);
