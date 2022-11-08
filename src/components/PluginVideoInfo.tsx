import { Button, Divider, Grid, IconButton, Typography } from "@mui/material";
import React from "react";
import { Video } from "../plugintypes";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { MoreHoriz, ThumbDown, ThumbUp } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import useVideoMenu from "../hooks/useVideoMenu";

interface PluginVideoInfoProps {
  video: Video;
}

const PluginVideoInfo: React.FC<PluginVideoInfoProps> = (props) => {
  const { video } = props;
  const { t } = useTranslation();
  const channelUrl = `/plugins/${video.pluginId}/channels/${video.channelApiId}`;
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });
  const { openMenu } = useVideoMenu();
  const uploadDate =
    video.uploadDate &&
    new Date(video.uploadDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const sanitizer = DOMPurify.sanitize;

  const onMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, video);
  };

  return (
    <Grid>
      <Typography
        component="div"
        variant="h5"
        dangerouslySetInnerHTML={{
          __html: sanitizer(video.title),
        }}
      />
      <Grid container justifyContent="space-between">
        <Grid item>
          {video.views && (
            <Grid container>
              <Typography variant="body1">
                {t("numberOfViews", {
                  viewCount: numberFormatter.format(video.views),
                })}
              </Typography>
            </Grid>
          )}
          {uploadDate ? (
            <Grid container>
              <Typography variant="body1">{uploadDate}</Typography>
            </Grid>
          ) : null}
        </Grid>
        <Grid item>
          {video.likes ? (
            <Grid container>
              <ThumbUp />
              <Typography variant="body1">
                {numberFormatter.format(video.likes)}
              </Typography>
            </Grid>
          ) : null}
          {video.dislikes ? (
            <Grid container>
              <ThumbDown />
              <Typography variant="body1">
                {numberFormatter.format(video.dislikes)}
              </Typography>
            </Grid>
          ) : null}
          {video.originalUrl ? (
            <Grid container>
              <Button component="a" href={video.originalUrl} target="_blank">
                {t("linkToOriginal")}
              </Button>
            </Grid>
          ) : null}
        </Grid>
      </Grid>
      <Grid container>
        <IconButton onClick={onMenuClick}>
          <MoreHoriz />
        </IconButton>
      </Grid>
      {video.channelName ? (
        <Button component={Link} to={channelUrl} disabled={!video.channelApiId}>
          {video.channelName}
        </Button>
      ) : null}
      <Divider />
      {video.description ? (
        <Typography
          sx={{ whiteSpace: "pre-line" }}
          component="div"
          variant="body1"
          dangerouslySetInnerHTML={{
            __html: sanitizer(video.description),
          }}
        />
      ) : null}
      <Divider />
    </Grid>
  );
};

export default PluginVideoInfo;
