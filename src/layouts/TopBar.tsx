import { Button, buttonVariants } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { FaGithub, FaHeart } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { toggleNavbar } from "../store/reducers/uiReducer";
import GlobalOptions from "./GlobalOptions";
import SearchBar from "./SearchBar";

const TopBar: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const onToggleNavbar = () => dispatch(toggleNavbar());

  return (
    <header className="fixed top-0 left-auto right-0 w-full shadow-lg z-40 bg-background border-b">
      <div className="flex items-center min-h-16 gap-3 lg:gap-16">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onToggleNavbar}>
            <MenuIcon />
          </Button>
          <h1 className="whitespace-nowrap hidden sm:block pr-2 text-xl font-semibold">
            <Link to="/">VideoGata</Link>
          </h1>
        </div>
        <SearchBar />
        <div className="hidden sm:flex">
          <GlobalOptions />
          <Link
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            to="/donate"
          >
            <FaHeart />
          </Link>
          <a
            href="https://github.com/InfoGata/videogata"
            target="_blank"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <FaGithub />
          </a>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
