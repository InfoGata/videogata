import React from "react";
import { useTranslation } from "react-i18next";
import usePlugins from "../hooks/usePlugins";
import { Video } from "../plugintypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SelectVideoListPluginProps {
  videoList: Video[];
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const SelectVideoListPlugin: React.FC<SelectVideoListPluginProps> = (props) => {
  const { videoList, setSelected } = props;
  const { plugins } = usePlugins();
  const { t } = useTranslation();
  const pluginNameMap = new Map(plugins.map((p) => [p.id, p.name]));
  const pluginIds = Array.from(new Set(videoList.map((v) => v.pluginId)));
  const options = pluginIds.map((p) => [
    p,
    pluginNameMap.has(p) ? pluginNameMap.get(p) : p,
  ]);
  const optionsComponents = options.map((option) => (
    <SelectItem key={option[0]} value={option[0] || ""}>
      {option[1]}
    </SelectItem>
  ));
  const [pluginId, setPluginId] = React.useState<string>("");
  const onSelectPluginChange = (value: string) => {
    setPluginId(value);
    if (value !== "none") {
      const filterdList = videoList
        .filter((v) => v.pluginId === value)
        .map((v) => v.id) as string[];
      setSelected(new Set(filterdList));
    } else {
      setSelected(new Set());
    }
  };
  return (
    <>
      <Select onValueChange={onSelectPluginChange} value={pluginId}>
        <SelectTrigger>
          <SelectValue placeholder={t("selectPlugin")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={"none"}>{t("none")}</SelectItem>
          {optionsComponents}
        </SelectContent>
      </Select>
    </>
  );
};

export default SelectVideoListPlugin;
