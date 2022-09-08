import { Box, Button, Grid } from "@mui/material";
import React from "react";
import { useInfiniteQuery } from "react-query";
import { usePlugins } from "../PluginsContext";
import { PageInfo } from "../plugintypes";
import Comment from "./Comment";

interface PluginVideoCommentsProps {
  pluginId: string;
  apiId: string;
}

const PluginVideoComments: React.FC<PluginVideoCommentsProps> = (props) => {
  const { apiId, pluginId } = props;
  const { plugins } = usePlugins();
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
        page: newPage,
      });
      return comments;
    }
    return;
  };

  const query = useInfiniteQuery(
    ["pluginvideocomments", pluginId, apiId],
    ({ pageParam }) => onGetPluginVideoComments(pageParam),
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
    <Grid>
      <Box>{comments}</Box>
      {query.hasNextPage && <Button onClick={onLoadMore}>Load More</Button>}
    </Grid>
  );
};

export default PluginVideoComments;
