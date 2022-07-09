import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { Extension, Home } from "@mui/icons-material";

const Navigation: React.FC = () => {
  return (
    <List>
      <ListItem button={true} component={Link} to="/" key="Home">
        <ListItemIcon>
          <Tooltip title="Home" placement="right">
            <Home />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>Home</ListItemText>
      </ListItem>
      <ListItem button={true} component={Link} to="/plugins" key="Plugins">
        <ListItemIcon>
          <Tooltip title="Plugins" placement="right">
            <Extension />
          </Tooltip>
        </ListItemIcon>
        <ListItemText>Plugins</ListItemText>
      </ListItem>
    </List>
  );
};

export default React.memo(Navigation);
