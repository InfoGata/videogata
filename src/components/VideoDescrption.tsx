import { Link, Typography } from "@mui/material";
import DOMPurify from "dompurify";
import * as linkify from "linkifyjs";
import React from "react";
import parse, {
  domToReact,
  HTMLReactParserOptions,
  DOMNode,
} from "html-react-parser";
import linkifyHtml from "linkify-html";
import { Link as RouterLink } from "react-router-dom";

interface VideoDescrptionProps {
  description: string;
}

const timestampToSeconds = (str: string) => {
  const split = str.split(":");
  let seconds = 0;
  let minutes = 1;
  while (split.length > 0) {
    let num = split.pop();
    if (num) {
      seconds += minutes * parseInt(num, 10);
      minutes *= 60;
    }
  }
  return seconds;
};

// https://codesandbox.io/s/linkify-timestamp-h1owf9
linkify.registerPlugin("timeline", (plugin) => {
  const { scanner, parser } = plugin;
  const TimelineH = linkify.createTokenClass("timeline", {
    isLink: true,
    toHref() {
      return `?t=${timestampToSeconds(this.toString())}`;
    },
  });

  const TimelineM = linkify.createTokenClass("timeline", {
    isLink: true,
    toHref() {
      return `?t=${timestampToSeconds(this.toString())}`;
    },
  });

  const { COLON, NUM } = scanner.tokens;

  const START_STATE = parser.start;
  // @ts-ignore
  START_STATE.tt(NUM).tt(COLON).tt(NUM).tt(COLON).tt(NUM, TimelineH);
  // @ts-ignore
  START_STATE.tt(NUM).tt(COLON).tt(NUM, TimelineM);
});

const VideoDescrption: React.FC<VideoDescrptionProps> = (props) => {
  const { description } = props;
  const sanitizer = DOMPurify.sanitize;
  const linkedifiedDescription = linkifyHtml(description);
  const clean = sanitizer(linkedifiedDescription);

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (
        "name" in domNode &&
        "attribs" in domNode &&
        domNode.name == "a" &&
        domNode.attribs.href
      ) {
        const href = domNode.attribs.href;
        if (href.indexOf("?") === 0) {
          const urlSearchParams = new URLSearchParams(href);
          if (urlSearchParams.has("t")) {
            return (
              <Link component={RouterLink} to={{ search: href }}>
                {domToReact(domNode.children as DOMNode[])}
              </Link>
            );
          }
        }
        return (
          <Link href={domNode.attribs.href} target="_blank">
            {domToReact(domNode.children as DOMNode[])}
          </Link>
        );
      }
    },
  };

  return (
    <Typography sx={{ whiteSpace: "pre-line" }}>
      {parse(clean, options)}
    </Typography>
  );
};
export default React.memo(VideoDescrption);
