import React from "react";
import Cards from "../Cards/Cards";
import Table from "../Table/Table";
import "./MainDash.css";
import RightSide from "../RightSide/RightSide";

const MainDash = () => {
  return (
    <div className="MainDash">
      <div className="mainContent">
        <h2>Dashboard</h2>
        <Cards />
        <Table />
      </div>
      <div className="rightContent">
        <RightSide />
      </div>
    </div>

  );
};

export default MainDash;
