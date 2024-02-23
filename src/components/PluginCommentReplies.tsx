import React from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";
import { PluginFrameContainer } from "../PluginsContext";
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
    return;
  };

  const query = useInfiniteQuery(
    ["pluginvideocomments", plugin?.id, comment.apiId],
    ({ pageParam }) => onGetCommentReplies(pageParam),
    {
      getNextPageParam: (lastPage) =>
        lastPage?.pageInfo?.nextPage && lastPage.pageInfo,
    }
  );

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
