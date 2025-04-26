import React from "react";
import OrdersTable from "../OrdersTable/OrdersTable";
import "./OrdersDash.css";
import OrdersRightSide from "../OrdersRightSide/OrdersRightSide";

const OrdersDash = () => {
  return (
    <div className="OrdersDash">
      <div className="ordersMainContent">
        <h2>Orders</h2>
        <OrdersTable />
      </div>
      <div className="ordersRightContent">
        <OrdersRightSide />
      </div>
    </div>

  );
};

export default OrdersDash;