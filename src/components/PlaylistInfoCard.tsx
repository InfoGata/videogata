import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import DOMPurify from "dompurify";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ImageInfo } from "../plugintypes";
import PlaylistImage from "./PlaylistImage";

interface PlaylistInfoCardProps {
  name: string;
  subtitle?: string;
  subtitleLink?: string;
  images?: ImageInfo[];
  isLive?: boolean;
  pluginId?: string;
  channelApiId?: string;
}

const PlaylistInfoCard: React.FC<PlaylistInfoCardProps> = (props) => {
  const {
    name,
    subtitle,
    images,
    subtitleLink,
    pluginId,
    channelApiId,
    isLive,
  } = props;
  const { t } = useTranslation();
  const sanitizer = DOMPurify.sanitize;

  return (
    <Card sx={{ display: "flex" }}>
      <Box>
        <PlaylistImage images={images} />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: "1 0 auto" }}>
          <Typography
            component="div"
            variant="h5"
            dangerouslySetInnerHTML={{
              __html: sanitizer(name),
            }}
          />
          {isLive && (
            <Chip
              label={t("live")}
              color="error"
              component={Link}
              to={`/plugins/${pluginId}/channels/${channelApiId}/live`}
              clickable
            />
          )}
          {subtitle && (
            <Typography
              component={subtitleLink ? Link : "div"}
              to={subtitleLink}
              variant="subtitle1"
              color="text.secondary"
              dangerouslySetInnerHTML={{
                __html: sanitizer(subtitle || ""),
              }}
            />
          )}
        </CardContent>
      </Box>
    </Card>
  );
};

export default PlaylistInfoCard;
