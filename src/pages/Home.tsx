import React from "react";
import PluginCards from "../components/PluginCards/PluginCards";
import TopItemCards from "../components/TopItemCards";

const Home: React.FC = () => {
  return (
    <>
      <TopItemCards />
      <PluginCards />
    </>
  );
};

export default Home;
