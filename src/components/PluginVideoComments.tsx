import { List } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { usePlugins } from "../PluginsContext";
import Comment from "./Comment";

interface PluginVideoCommentsProps {
  pluginId: string;
  apiId: string;
}

const PluginVideoComments: React.FC<PluginVideoCommentsProps> = (props) => {
  const { apiId, pluginId } = props;
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);

  const onGetPluginVideoComments = async () => {
    if (plugin && (await plugin.hasDefined.onGetVideoComments())) {
      const comments = await plugin.remote.onGetVideoComments({ apiId: apiId });
      return comments.comments;
    }
    return [];
  };

  const query = useQuery([pluginId, apiId], onGetPluginVideoComments);
  const comments = query?.data?.map((c) => (
    <Comment key={c.apiId} comment={c} />
  ));
  return <List>{comments}</List>;
};

export default PluginVideoComments;
