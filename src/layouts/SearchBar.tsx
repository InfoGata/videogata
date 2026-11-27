import React from "react";
import {
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "../components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { useAppSelector } from "@/store/hooks";
import usePlugins from "@/hooks/usePlugins";
import { PluginFrameContainer } from "@/contexts/PluginsContext";
import { filterAsync } from "@infogata/utils";
import { debounce } from "lodash";
import { useNavigate } from "@tanstack/react-router";

const SearchBar: React.FC = () => {
  const currentPluginId = useAppSelector(
    (state) => state.settings.currentPluginId
  );
  const { plugins } = usePlugins();
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [searchPlugin, setSearchPlugin] =
    React.useState<PluginFrameContainer>();
  const [options, setOptions] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState("");
  // cmdk highlights the first suggestion on its own, and Enter then picks it
  // instead of searching what was typed. Only let a suggestion be highlighted
  // once the user moves to one with the arrow keys or the pointer.
  const [activeOption, setActiveOption] = React.useState("");
  const hasNavigated = React.useRef(false);

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
    if (selected === search) {
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
  }, [search, selected, getSuggestionDebounce]);

  const onValueChange = (value: string) => {
    hasNavigated.current = false;
    setActiveOption("");
    setSearch(value);
  };

  const onActiveOptionChange = (value: string) => {
    if (hasNavigated.current) {
      setActiveOption(value);
    } else {
      // cmdk has already stored the value it picked, and only resyncs when the
      // controlled value changes, so alternate between two blank values (it
      // trims them) to clear the highlight.
      setActiveOption((prev) => (prev === "" ? " " : ""));
    }
  };

  const handleBlur = () => {
    setOpen(false);
  };

  const searchQuery = (query: string) => {
    navigate({ to: "/search", search: { q: query } });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) {
      setOpen(true);
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      hasNavigated.current = true;
    }

    // With a suggestion highlighted, cmdk's own Enter handling selects it.
    if (event.key === "Enter" && !activeOption.trim()) {
      event.preventDefault();
      searchQuery(search);
    }
  };

  const handleFocus = () => {
    setOpen(true);
  };

  const handleSelect = (option: string) => {
    setSelected(option);
    searchQuery(option);
    setSearch(option);
    setOpen(false);
  };

  return (
    <CommandPrimitive
      onKeyDown={handleKeyDown}
      className="rounded-full border flex-1"
      shouldFilter={false}
      value={activeOption}
      onValueChange={onActiveOptionChange}
    >
      <CommandInput
        placeholder="Search"
        onValueChange={onValueChange}
        value={search}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
      <div className="relative">
        {open && (
          <div className="absolute top-1 z-50 w-full rounded-xl bg-popover outline-none animate-in fade-in-0 zoom-in-95">
            <CommandList
              className="ring-1 ring-border rounded-lg"
              onPointerMoveCapture={() => {
                hasNavigated.current = true;
              }}
            >
              {options.length > 0 && (
                <CommandGroup>
                  {options.map((result) => (
                    <CommandItem
                      key={result}
                      value={result}
                      onSelect={handleSelect}
                      onMouseDown={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                      }}
                    >
                      {result}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </div>
        )}
      </div>
    </CommandPrimitive>
  );
};

export default SearchBar;
