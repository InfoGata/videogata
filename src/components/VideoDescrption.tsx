import DOMPurify from "dompurify";
import * as linkify from "linkifyjs";
import React from "react";
import parse, {
  domToReact,
  HTMLReactParserOptions,
  DOMNode,
} from "html-react-parser";
import linkifyHtml from "linkify-html";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface VideoDescrptionProps {
  description: string;
}

const timestampToSeconds = (str: string) => {
  const split = str.split(":");
  let seconds = 0;
  let minutes = 1;
  while (split.length > 0) {
    const num = split.pop();
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  START_STATE.tt(NUM).tt(COLON).tt(NUM).tt(COLON).tt(NUM, TimelineH);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
            const t = parseInt(urlSearchParams.get("t") || "0", 10);
            const time = isNaN(t) ? undefined : t;

            return (
              <Link
                className={cn(
                  buttonVariants({ variant: "link", size: "sm" }),
                  "h-6 p-0"
                )}
                search={{ time }}
              >
                {domToReact(domNode.children as DOMNode[])}
              </Link>
            );
          }
        }
        return (
          <a
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "h-6 p-0"
            )}
            href={domNode.attribs.href}
            target="_blank"
            rel="noreferrer"
          >
            {domToReact(domNode.children as DOMNode[])}
          </a>
        );
      }
    },
  };

  return <p className="whitespace-pre-line">{parse(clean, options)}</p>;
};
export default React.memo(VideoDescrption);
