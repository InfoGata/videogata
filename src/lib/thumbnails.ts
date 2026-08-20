import { ImageInfo } from "@/plugintypes";

/**
 * Whether a video's source art is taller than it is wide, as Shorts and other
 * vertical formats are. Judged from the metadata rather than by waiting for the
 * image to load, so the card renders the right shape on first paint.
 *
 * The largest variant decides: a list can carry odd small entries, and every
 * real variant of the same thumbnail shares an aspect ratio anyway. Art that
 * declares no dimensions is assumed landscape, which is the common case and the
 * layout the grid is built around.
 */
export const isPortrait = (images?: ImageInfo[]): boolean => {
  const sized = (images ?? []).filter((i) => !!i.width && !!i.height);
  if (sized.length === 0) return false;
  const largest = sized.reduce((a, b) =>
    a.width! * a.height! >= b.width! * b.height! ? a : b
  );
  return largest.height! > largest.width!;
};
