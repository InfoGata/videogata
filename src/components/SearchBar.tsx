import { Search } from "@mui/icons-material";
import { Autocomplete, InputAdornment, TextField } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import usePlugins from "../hooks/usePlugins";
import { debounce } from "@mui/material/utils";
import { filterAsync } from "../utils";
import { PluginFrameContainer } from "../PluginsContext";

const SearchBarComponent = styled(Autocomplete)(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "300px",
  "& .MuiOutlinedInput-root": {
    padding: theme.spacing(0, 0, 0, 0),
    paddingLeft: `1em`,
  },
}));

const SearchBar: React.FC = () => {
  const currentPluginId = useAppSelector(
    (state) => state.settings.currentPluginId
  );
  const { plugins } = usePlugins();
  const [search, setSearch] = React.useState("");
  const [currentSearch, setCurrentSearch] = React.useState("");
  const [options, setOptions] = React.useState<string[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchPlugin, setSearchPlugin] =
    React.useState<PluginFrameContainer>();

  const searchQuery = (searchTerm: string) => {
    navigate(`/search?q=${searchTerm}`);
  };

  const handleSubmit = (event: React.FormEvent<{}>) => {
    event.preventDefault();
    searchQuery(search);
  };

  React.useEffect(() => {
    const getSearchPlugin = async () => {
      const validPlugins = await filterAsync(plugins, (p) =>
        p.hasDefined.onGetSearchSuggestions()
      );
      const plugin = validPlugins.some((p) => p.id === currentPluginId)
        ? validPlugins.find((p) => p.id === currentPluginId)
        : validPlugins[0];
      setSearchPlugin(plugin);
    };
    getSearchPlugin();
  }, [currentPluginId, plugins]);

  const onGetSuggestions = React.useCallback(
    async (query: string) => {
      if (searchPlugin) {
        const suggestions = await searchPlugin.remote.onGetSearchSuggestions({
          query,
        });
        return suggestions;
      }
    },
    [searchPlugin]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getSuggestionDebounce = React.useMemo(
    () =>
      debounce(
        (
          request: string,
          callback: (suggestions: string[] | undefined) => void
        ) => {
          onGetSuggestions(request).then((data) => {
            callback(data);
          });
        },
        500
      ),
    [onGetSuggestions]
  );

  React.useEffect(() => {
    let active = true;
    if (search === "") {
      setOptions([]);
      return;
    }
    if (currentSearch === search) {
      return;
    }

    getSuggestionDebounce(search, (suggestions) => {
      if (active) {
        if (suggestions) {
          setOptions(suggestions);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [search, currentSearch, getSuggestionDebounce]);

  return (
    <form onSubmit={handleSubmit}>
      <SearchBarComponent
        freeSolo
        onInputChange={(_event, newInputValue) => {
          setSearch(newInputValue);
        }}
        onChange={(_event: any, newValue: unknown) => {
          if (typeof newValue === "string") {
            searchQuery(newValue);
            setCurrentSearch(newValue);
          }
        }}
        renderInput={(params) => {
          const { InputProps, ...rest } = params;
          return (
            <TextField
              placeholder={t("search")}
              {...rest}
              InputProps={{
                ...InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          );
        }}
        options={options}
        filterOptions={(x) => x}
      />
    </form>
  );
};
export default SearchBar;
