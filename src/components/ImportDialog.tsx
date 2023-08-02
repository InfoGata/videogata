import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import { nanoid } from "nanoid";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { PluginFrameContainer } from "../PluginsContext";
import usePlugins from "../hooks/usePlugins";
import { ParseUrlType, Playlist, Video } from "../plugintypes";
import { filterAsync } from "../utils";

interface ImportDialogProps {
  open: boolean;
  handleClose: () => void;
  parseType: ParseUrlType;
  onSuccess: (item: Video[] | Playlist) => void;
}

const parseTypeToMethod = async (
  plugin: PluginFrameContainer,
  parseType: ParseUrlType
): Promise<boolean> => {
  switch (parseType) {
    case "playlist":
      return await plugin.hasDefined.onLookupPlaylistUrl();
    case "video":
      return await plugin.hasDefined.onLookupVideoUrls();
  }
};

const lookupUrl = async (
  plugin: PluginFrameContainer,
  parseType: ParseUrlType,
  url: string
) => {
  switch (parseType) {
    case "playlist":
      return await plugin.remote.onLookupPlaylistUrl(url);
    case "video":
      return await plugin.remote.onLookupVideoUrls([url]);
  }
};

const ImportDialog: React.FC<ImportDialogProps> = (props) => {
  const { open, handleClose, parseType, onSuccess } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { plugins } = usePlugins();
  const [url, setUrl] = React.useState("");
  const formId = nanoid();

  const [parserPlugins, setParserPlugins] = React.useState<
    PluginFrameContainer[]
  >([]);
  const { t } = useTranslation();

  React.useEffect(() => {
    const getParsers = async () => {
      const parserPlugins = await filterAsync(plugins, (p) =>
        p.hasDefined.onCanParseUrl()
      );
      const validPlugins = await filterAsync(parserPlugins, (p) =>
        parseTypeToMethod(p, parseType)
      );
      setParserPlugins(validPlugins);
    };
    getParsers();
  }, [plugins, parseType]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsers = await filterAsync(parserPlugins, (p) =>
      p.remote.onCanParseUrl(url, parseType)
    );
    const parser = parsers[0];
    if (parser) {
      const item = await lookupUrl(parser, parseType, url);
      console.log(item);
      onSuccess(item);
    } else {
      enqueueSnackbar(t("noImporters"), { variant: "error" });
    }
    handleClose();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">{t("import")}</DialogTitle>
      <DialogContent>
        <form id={formId} onSubmit={onSubmit}>
          <TextField
            autoFocus={true}
            margin="dense"
            id="name"
            label="Url"
            type="text"
            fullWidth={true}
            value={url}
            onChange={onChange}
          />
        </form>
        <Typography>{t("plugins")}:</Typography>
        {parserPlugins.length > 0 ? (
          <List>
            {parserPlugins.map((p) => (
              <ListItem key={p.id}>{p.name}</ListItem>
            ))}
          </List>
        ) : (
          <Typography>{t("noImporters")}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("cancel")}</Button>
        <Button
          disabled={parserPlugins.length === 0}
          type="submit"
          form={formId}
        >
          {t("import")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
