import { Link, Typography } from "@mui/material";
import Linkify from "linkify-react";
import React from "react";

interface VideoDescrptionProps {
  description: string;
}

const renderLink = ({
  attributes,
  content,
}: {
  attributes: any;
  content: any;
}) => {
  const { href, ...props } = attributes;
  return (
    <Link href={href} target="_blank" {...props}>
      {content}
    </Link>
  );
};

const VideoDescrption: React.FC<VideoDescrptionProps> = (props) => {
  const { description } = props;

  return (
    <Typography sx={{ whiteSpace: "pre-line" }} component="div" variant="body1">
      <Linkify options={{ render: renderLink }}>{description}</Linkify>
    </Typography>
  );
};
export default React.memo(VideoDescrption);
