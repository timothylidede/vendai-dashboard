import React from "react";
import Updates from "../Updates/Updates";
import "./RightSide.css";
import TopAgentsLeaderboard from "../TopAgentsLeaderboard/TopAgentsLeaderboard";

const RightSide = () => {
  return (
    <div className="RightSide">
      <div>
        <h3>Updates</h3>
        <Updates />
      </div>
      <div>
        <h3>Agents Leaderboard</h3>
        <TopAgentsLeaderboard />
      </div>
    </div>
  );
};

export default RightSide;
