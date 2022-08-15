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
import React from "react";
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videos = props.videos || [];
    const playlist: Playlist = {
      name,
      videos: videos,
    };
    dispatch(addPlaylist(playlist));
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
      <DialogTitle id="form-dialog-title">Add Playlist</DialogTitle>
      <DialogContent>
        <DialogContentText>Give it a name</DialogContentText>
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form={formId}>
          Add Playlist
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(AddPlaylistDialog);
