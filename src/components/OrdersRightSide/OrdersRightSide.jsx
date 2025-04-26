import React from "react";
import OrdersCards from "../OrdersCards/OrdersCards";
import "./OrdersRightSide.css";

const RightSide = () => {
  return (
    <div className="RightSide">
      <div>
        <h3>Stats</h3>
        <OrdersCards/>
      </div>
    </div>
  );
};

export default RightSide;
