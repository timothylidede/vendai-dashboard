import React from "react";
import AgentsTable from "../AgentsTable/AgentsTable";
import "./AgentsDash.css";
import AgentsRightSide from "../AgentsRightSide/AgentsRightSide";

const AgentsDash = () => {
  return (
    <div className="AgentsDash">
      <div className="agentsMainContent">
        <h2>Agents Leaderboard</h2>
        <AgentsTable />
      </div>
      <div className="agentsRightContent">
        <AgentsRightSide />
      </div>
    </div>

  );
};

export default AgentsDash;