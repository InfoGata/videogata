import { Typography } from "@mui/material";
import DOMPurify from "dompurify";
import React from "react";

interface VideoDescrptionProps {
  description: string;
}

const VideoDescrption: React.FC<VideoDescrptionProps> = (props) => {
  const { description } = props;
  const urlRegex =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

  const descriptionWithLinks = description.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`
  );
  const sanitizer = DOMPurify.sanitize;
  return (
    <Typography
      sx={{ whiteSpace: "pre-line" }}
      component="div"
      variant="body1"
      dangerouslySetInnerHTML={{
        __html: sanitizer(descriptionWithLinks, { ADD_ATTR: ["target"] }),
      }}
    />
  );
};
export default React.memo(VideoDescrption);
