import { SearchIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ChannelSearchInputProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

const ChannelSearchInput: React.FC<ChannelSearchInputProps> = (props) => {
  const { searchQuery, onSearch } = props;
  const { t } = useTranslation();
  const [value, setValue] = React.useState(searchQuery);

  React.useEffect(() => {
    setValue(searchQuery);
  }, [searchQuery]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={onSubmit} className="flex max-w-md gap-2 py-4">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t("searchChannel")}
        aria-label={t("searchChannel")}
      />
      <Button
        type="submit"
        size="icon"
        variant="secondary"
        aria-label={t("search")}
      >
        <SearchIcon />
      </Button>
    </form>
  );
};

export default ChannelSearchInput;
