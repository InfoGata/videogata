import { Button, List } from "@mui/material";
import React from "react";
import { useInfiniteQuery } from "react-query";
import { PluginFrameContainer } from "../PluginsContext";
import { PageInfo, VideoComment } from "../plugintypes";
import Comment from "./Comment";

interface PluginCommentRepliesProps {
  plugin: PluginFrameContainer | undefined;
  comment: VideoComment;
}

const PluginCommentReplies: React.FC<PluginCommentRepliesProps> = (props) => {
  const { plugin, comment } = props;

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
        page: newPage,
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
      getNextPageParam: (lastPage) => lastPage?.page?.nextPage && lastPage.page,
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
      <List sx={{ pl: 5 }}>{comments}</List>
      {query.hasNextPage && (
        <Button onClick={onLoadMore} sx={{ pl: 7 }}>
          Load More Replies
        </Button>
      )}
    </>
  );
};

export default PluginCommentReplies;
