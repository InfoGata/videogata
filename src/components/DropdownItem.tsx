import React from "react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { ItemMenuType } from "@/types";
import { Link } from "@tanstack/react-router";

/**
 * An in-app destination as route + params rather than a built path, so the
 * plugin routes can render `pluginId` as the plugin's url alias.
 */
export interface InternalLink {
  to: "/s/$pluginId/channels/$apiId";
  params: { pluginId: string; apiId: string };
}

export interface DropdownItemProps {
  title: string;
  icon: React.ReactElement;
  action?: (item?: ItemMenuType) => void;
  item?: ItemMenuType;
  url?: string;
  internalLink?: InternalLink;
  setOpen?: (open: boolean) => void;
}

const DropdownItem: React.FC<DropdownItemProps> = (props) => {
  const { title, icon, action, url, internalLink, item, setOpen } = props;

  const onLinkClick = () => {
    if (setOpen) {
      setOpen(false);
    }
  };

  const InnerComponent = (props: { children: React.ReactNode }) => {
    if (internalLink) {
      return (
        <Link
          {...internalLink}
          className="flex items-center w-full"
          onClick={onLinkClick}
        >
          {props.children}
        </Link>
      );
    }
    if (url) {
      return (
        <a
          href={url}
          target="_blank"
          className="flex items-center w-full"
          rel="noreferrer"
        >
          {props.children}
        </a>
      );
    }
    return <>{props.children}</>;
  };

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (action) {
      action(item);
    }
  };

  return (
    <DropdownMenuItem onClick={onClick} className="cursor-pointer">
      <InnerComponent>
        {icon}
        <span>{title}</span>
      </InnerComponent>
    </DropdownMenuItem>
  );
};

export default DropdownItem;
