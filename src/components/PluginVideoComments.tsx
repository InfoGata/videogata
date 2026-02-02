import React from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import usePlugins from "../hooks/usePlugins";
import { PageInfo } from "../plugintypes";
import Comment from "./Comment";
import { Button } from "./ui/button";

interface PluginVideoCommentsProps {
  pluginId: string;
  apiId: string;
}

const PluginVideoComments: React.FC<PluginVideoCommentsProps> = (props) => {
  const { apiId, pluginId } = props;
  const { plugins } = usePlugins();
  const { t } = useTranslation();
  const plugin = plugins.find((p) => p.id === pluginId);

  const onGetPluginVideoComments = async (lastPage?: PageInfo) => {
    if (plugin && (await plugin.hasDefined.onGetVideoComments())) {
      let newPage: PageInfo | undefined = undefined;
      if (lastPage) {
        newPage = {
          totalResults: lastPage.totalResults,
          resultsPerPage: lastPage.resultsPerPage,
          offset: lastPage.offset + lastPage.resultsPerPage,
          nextPage: lastPage.nextPage,
        };
      }
      const comments = await plugin.remote.onGetVideoComments({
        apiId: apiId,
        pageInfo: newPage,
      });
      return comments;
    }
    return { comments: [], pageInfo: undefined };
  };

  const query = useInfiniteQuery({
    queryKey: ["pluginvideocomments", pluginId, apiId],
    queryFn: ({ pageParam }) => onGetPluginVideoComments(pageParam),
    initialPageParam: undefined as PageInfo | undefined,
    getNextPageParam: (lastPage) =>
      lastPage?.pageInfo?.nextPage ? lastPage.pageInfo : undefined,
    enabled: !!plugin,
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
    <div>
      <div>{comments}</div>
      {query.hasNextPage && (
        <Button variant="ghost" onClick={onLoadMore}>
          {t("loadMore")}
        </Button>
      )}
    </div>
  );
};

export default PluginVideoComments;
