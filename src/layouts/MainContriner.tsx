import React from "react";
import { Outlet } from "react-router-dom";
import MiniPlayer from "../components/MiniPlayer";

const MainContainer: React.FC = () => {
  return (
    <main className="flex-grow p-1 overflow-auto pt-20">
      <MiniPlayer />
      <Outlet />
    </main>
  );
};

export default MainContainer;
