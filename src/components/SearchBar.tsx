import { Clear, Search } from "@mui/icons-material";
import { IconButton, InputAdornment, InputBase } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const SearchBarComponent = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const SearchBar: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
  };
  const handleSubmit = (event: React.FormEvent<{}>) => {
    navigate(`/search?q=${search}`);
    event.preventDefault();
  };
  const onClearSearch = (_: React.ChangeEvent<{}>) => {
    setSearch("");
  };
  return (
    <form onSubmit={handleSubmit}>
      <SearchBarComponent>
        <SearchIconWrapper>
          <Search />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder={t("search")}
          inputProps={{ "aria-label": "search" }}
          onChange={onSearchChange}
          value={search}
          name="query"
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={onClearSearch} size="small">
                <Clear />
              </IconButton>
            </InputAdornment>
          }
        />
      </SearchBarComponent>
    </form>
  );
};
export default SearchBar;
