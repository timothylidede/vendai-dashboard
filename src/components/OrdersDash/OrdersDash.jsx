import React from "react";
import OrdersCards from "../OrdersCards/OrdersCards";
import Table from "../Table/Table";
import "./OrdersDash.css";
import RightSide from "../RightSide/RightSide";

const OrdersDash = () => {
  return (
    <div className="OrdersDash">
      <div className="mainContent">
        <h2>Orders</h2>
        <OrdersCards />
        <Table />
      </div>
    </div>

  );
};

export default OrdersDash;