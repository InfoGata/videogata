import React from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PluginFrameContainer } from "../contexts/PluginsContext";
import { PageInfo, VideoComment } from "../plugintypes";
import Comment from "./Comment";
import { Button } from "./ui/button";

interface PluginCommentRepliesProps {
  plugin: PluginFrameContainer | undefined;
  comment: VideoComment;
}

const PluginCommentReplies: React.FC<PluginCommentRepliesProps> = (props) => {
  const { plugin, comment } = props;
  const { t } = useTranslation();

  const onGetCommentReplies = async (lastPage?: PageInfo) => {
    if (plugin && (await plugin.hasDefined.onGetCommentReplies())) {
      let newPage: PageInfo | undefined = {
        totalResults: 0,
        resultsPerPage: 0,
        offset: 0,
        nextPage: comment.replyPage,
      };
      if (lastPage) {
        newPage = {
          totalResults: lastPage.totalResults,
          resultsPerPage: lastPage.resultsPerPage,
          offset: lastPage.offset + lastPage.resultsPerPage,
          nextPage: lastPage.nextPage,
        };
      }
      const comments = await plugin.remote.onGetCommentReplies({
        commentApiId: comment.apiId,
        pageInfo: newPage,
        videoApiId: comment.videoCommentId,
      });
      return comments;
    }
    return { comments: [], pageInfo: undefined };
  };

  const query = useInfiniteQuery({
    queryKey: ["pluginvideocomments", plugin?.id, comment.apiId],
    queryFn: ({ pageParam }) => onGetCommentReplies(pageParam),
    initialPageParam: undefined as PageInfo | undefined,
    getNextPageParam: (lastPage) =>
      lastPage?.pageInfo?.nextPage ? lastPage.pageInfo : undefined,
  });

  const comments = query?.data?.pages?.map((p) =>
    p?.comments.map((c) => (
      <Comment key={c.apiId} comment={c} plugin={plugin} />
    ))
  );
  const onLoadMore = () => {
    query.fetchNextPage();
  };

  return (
    <>
      <div className="pl-5">{comments}</div>
      {query.hasNextPage && (
        <Button variant="ghost" className="pl-5" onClick={onLoadMore}>
          {t("loadMoreReplies")}
        </Button>
      )}
    </>
  );
};

export default PluginCommentReplies;
