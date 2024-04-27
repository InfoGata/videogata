import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import PluginCards from "../components/PluginCards/PluginCards";
import TopItemCards from "../components/TopItemCards";

export const Index: React.FC = () => {
  return (
    <>
      <TopItemCards />
      <PluginCards />
    </>
  );
};

export const Route = createFileRoute("/")({
  component: Index,
});
