import React from "react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Link } from "react-router-dom";

export interface DropdownItemProps {
  title: string;
  icon: JSX.Element;
  action?: () => void;
  url?: string;
  internalPath?: string;
}

const DropdownItem: React.FC<DropdownItemProps> = (props) => {
  const { title, icon, action, url, internalPath } = props;
  const InnerComponent = (props: { children: React.ReactNode }) => {
    if (internalPath) {
      return <Link to={internalPath}>{props.children}</Link>;
    }
    if (url) {
      return <a href={url} target="_blank" />;
    }
    return <>{props.children}</>;
  };

  return (
    <DropdownMenuItem onSelect={action}>
      <InnerComponent>
        {icon}
        <span>{title}</span>
      </InnerComponent>
    </DropdownMenuItem>
  );
};

export default DropdownItem;
