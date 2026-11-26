import { Video } from "@/plugintypes";
import { formatSeconds, getThumbnailImage } from "@infogata/utils";
import { channelThumbnailSize, playlistThumbnailSize } from "@/utils";
import { cn } from "@/lib/utils";
import { isPortrait } from "@/lib/thumbnails";
import React from "react";
import { useTranslation } from "react-i18next";
import TimeAgo from "timeago-react";
import DOMPurify from "dompurify";
import VideoMenu from "./VideoMenu";
import { Link } from "@tanstack/react-router";

interface Props {
  video: Video;
}

/** Not user-facing copy, so it lives here rather than in the locale files. */
const META_SEPARATOR = "\u00a0\u00b7\u00a0";


const HomeVideoCard: React.FC<Props> = (props) => {
  const { video } = props;
  const { t } = useTranslation();
  const image = getThumbnailImage(video.images, playlistThumbnailSize);
  const numberFormatter = Intl.NumberFormat("en", { notation: "compact" });
  const sanitizer = DOMPurify.sanitize;

  const portrait = isPortrait(video.images);

  const videoParams = {
    pluginId: video.pluginId || "",
    apiId: video.apiId || "",
  };

  const channelParams = {
    pluginId: video.pluginId || "",
    apiId: video.channelApiId || "",
  };

  // A stream has no page of its own: it plays through its channel's live page,
  // and its id goes stale the moment it ends.
  const watchLink = video.isLive
    ? ({ to: "/s/$pluginId/channels/$apiId/live", params: channelParams } as const)
    : ({ to: "/s/$pluginId/videos/$apiId", params: videoParams } as const);

  const channelImage = getThumbnailImage(
    video.channelImages,
    channelThumbnailSize
  );

  // Built as a list so the separators land between the parts that actually
  // exist, rather than leaving a stray bullet when views or date are missing.
  const meta: React.ReactNode[] = [];
  if (video.views) {
    const count = numberFormatter.format(video.views);
    meta.push(
      video.isLive
        ? t("numberOfViewers", { viewerCount: count })
        : t("numberOfViews", { viewCount: count })
    );
  }
  if (video.uploadDate) {
    meta.push(<TimeAgo datetime={video.uploadDate} />);
  }

  return (
    <div className="group flex flex-col">
      <Link
        {...watchLink}
        className="relative block overflow-hidden rounded-xl bg-muted focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {/*
          aspect-video keeps 16:9 art uncropped at every column count. Vertical
          art is letterboxed rather than cropped -- filling the slot with it
          throws away most of the frame and usually lands on someone's chin --
          over a blown-up blurred copy of itself, so the sides read as
          deliberate. Same url both times, so it costs one request.
        */}
        <div className="relative aspect-video w-full overflow-hidden">
          {image && portrait && (
            <img
              src={image}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 size-full scale-125 object-cover blur-xl"
            />
          )}
          {image && (
            <img
              src={image}
              alt=""
              loading="lazy"
              className={cn(
                "relative mx-auto transition-transform duration-200 group-hover:scale-105",
                portrait
                  ? "h-full w-auto max-w-full object-contain"
                  : "size-full object-cover"
              )}
            />
          )}
        </div>
        {video.isLive ? (
          <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-destructive px-1.5 py-0.5 text-xs font-semibold uppercase text-white">
            {t("live")}
          </span>
        ) : !!video.duration && (
          <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white tabular-nums">
            {formatSeconds(video.duration)}
          </span>
        )}
      </Link>
      <div className="mt-2.5 flex items-start gap-2.5">
        {/*
          The avatar slot is kept whenever the video names a channel, falling
          back to its initial, so cards stay aligned across a feed where only
          some entries ship an avatar.
        */}
        {video.channelName && (
          <Link
            to="/s/$pluginId/channels/$apiId"
            params={channelParams}
            className="mt-0.5 shrink-0"
            aria-label={video.channelName}
          >
            {channelImage ? (
              <img
                src={channelImage}
                alt=""
                loading="lazy"
                className="size-9 rounded-full bg-muted object-cover"
              />
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {video.channelName.trim().charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <Link {...watchLink} className="min-w-0"
            >
              <h3
                className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary"
                title={video.title}
                dangerouslySetInnerHTML={{ __html: sanitizer(video.title) }}
              />
            </Link>
            {/*
              Favorites and playlists keep a video to come back to, and a
              stream can't be come back to once it ends.
            */}
            {!video.isLive && <VideoMenu video={video} />}
          </div>
          {video.channelName && (
            <Link
              to="/s/$pluginId/channels/$apiId"
              params={channelParams}
              className="mt-1 block truncate text-xs text-muted-foreground hover:text-foreground"
            >
              {video.channelName}
            </Link>
          )}
          {meta.length > 0 && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {meta.map((part, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span aria-hidden>{META_SEPARATOR}</span>}
                  {part}
                </React.Fragment>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeVideoCard;
