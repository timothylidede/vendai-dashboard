import React from "react";
import CustomersTable from "../CustomersTable/CustomersTable";
import "./CustomersDash.css";
import CustomersRightSide from "../CustomersRightSide/CustomersRightSide";

const CustomersDash = () => {
  return (
    <div className="CustomersDash">
      <div className="customersMainContent">
        <h2>Customers</h2>
        <CustomersTable />
      </div>
      <div className="customersRightContent">
        <CustomersRightSide />
      </div>
    </div>

  );
};

export default CustomersDash;