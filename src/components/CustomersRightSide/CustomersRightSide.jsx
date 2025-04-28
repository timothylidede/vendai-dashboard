import React from "react";
import CustomersUpdates from "../CustomersUpdates/CustomersUpdates";
import "./CustomersRightSide.css";

const RightSide = () => {
  return (
    <div className="RightSide">
      <div>
        <h3>Customer Updates</h3>
        <CustomersUpdates/>
      </div>
    </div>
  );
};

export default RightSide;
