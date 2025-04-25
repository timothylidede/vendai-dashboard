import React from "react";
import Cards from "../Cards/Cards";
import Table from "../Table/Table";
import "./OrdersDash.css";
import RightSide from "../RightSide/RightSide";

const OrdersDash = () => {
  return (
    <div className="OrdersDash">
      <div className="mainContent">
        <h2>Orders</h2>
        <Cards />
        <Table />
      </div>
    </div>

  );
};

export default OrdersDash;
