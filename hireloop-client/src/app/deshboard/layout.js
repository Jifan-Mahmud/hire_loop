import React from "react";
import DeshboardSideBar from "@/components/DashboardSideBar/DashboardSideBar";

const layout = ({ children }) => {
  return (
    <div className="flex dark min-h-screen bg-black text-white mt-20">
      <DeshboardSideBar></DeshboardSideBar>
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
};

export default layout;
