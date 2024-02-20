import { Input } from "@/components/ui/input";
import React from "react";
import { useTranslation } from "react-i18next";
import { CiSearch } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

const SearchBar: React.FC = () => {
  // const currentPluginId = useAppSelector(
  //   (state) => state.settings.currentPluginId
  // );
  //const { plugins } = usePlugins();
  const [search, setSearch] = React.useState("");
  // const [currentSearch, setCurrentSearch] = React.useState("");
  // const [options, setOptions] = React.useState<string[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  // const [searchPlugin, setSearchPlugin] =
  //   React.useState<PluginFrameContainer>();

  const searchQuery = (searchTerm: string) => {
    navigate(`/search?q=${searchTerm}`);
  };

  const handleSubmit = (event: React.FormEvent<unknown>) => {
    event.preventDefault();
    searchQuery(search);
  };

  // React.useEffect(() => {
  //   const getSearchPlugin = async () => {
  //     const validPlugins = await filterAsync(plugins, (p) =>
  //       p.hasDefined.onGetSearchSuggestions()
  //     );
  //     const plugin = validPlugins.some((p) => p.id === currentPluginId)
  //       ? validPlugins.find((p) => p.id === currentPluginId)
  //       : validPlugins[0];
  //     setSearchPlugin(plugin);
  //   };
  //   getSearchPlugin();
  // }, [currentPluginId, plugins]);

  // const onGetSuggestions = React.useCallback(
  //   async (query: string) => {
  //     if (searchPlugin) {
  //       const suggestions = await searchPlugin.remote.onGetSearchSuggestions({
  //         query,
  //       });
  //       return suggestions;
  //     }
  //   },
  //   [searchPlugin]
  // );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const getSuggestionDebounce = React.useMemo(
  //   () =>
  //     debounce(
  //       (
  //         request: string,
  //         callback: (suggestions: string[] | undefined) => void
  //       ) => {
  //         onGetSuggestions(request).then((data) => {
  //           callback(data);
  //         });
  //       },
  //       500
  //     ),
  //   [onGetSuggestions]
  // );

  // React.useEffect(() => {
  //   let active = true;
  //   if (search === "") {
  //     setOptions([]);
  //     return;
  //   }
  //   if (currentSearch === search) {
  //     return;
  //   }

  //   getSuggestionDebounce(search, (suggestions) => {
  //     if (active) {
  //       if (suggestions) {
  //         setOptions(suggestions);
  //       }
  //     }
  //   });

  //   return () => {
  //     active = false;
  //   };
  // }, [search, currentSearch, getSuggestionDebounce]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value);
  };

  return (
    <form className="flex-1" onSubmit={handleSubmit}>
      <div className="flex bg-secondary p-[0.1rem] rounded-full items-center">
        <Input
          className="rounded-full rounded-r-none border-none"
          placeholder={t("search")}
          value={search}
          onChange={onInputChange}
        />
        <button type="submit" className="px-5">
          <CiSearch className="h-8 w-8 text-primary" />
        </button>
      </div>
      {/* <SearchBarComponent
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
      /> */}
    </form>
  );
};
export default SearchBar;
