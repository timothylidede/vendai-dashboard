import React from "react";
import AgentsUpdates from "../AgentsUpdates/AgentsUpdates";
import "./AgentsRightSide.css";

const RightSide = () => {
  return (
    <div className="RightSide">
      <div>
        <h3>Updates</h3>
        <AgentsUpdates/>
      </div>
    </div>
  );
};

export default RightSide;
