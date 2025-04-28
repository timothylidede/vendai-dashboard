import React from "react";
import './TopAgentsLeaderboard.css';

const topAgents = [
  { name: "Peter Otieno", ordersClosed: 78, salesValue: 520000 },
  { name: "Jane Wambui", ordersClosed: 74, salesValue: 480000 },
  { name: "Kevin Muriithi", ordersClosed: 70, salesValue: 460000 },
];

const TopAgentsLeaderboard = () => {
  return (
    <div className="TopAgentsLeaderboard">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {topAgents.map((agent, index) => (
            <tr key={index}>
              <td>{agent.name}</td>
              <td>{agent.ordersClosed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopAgentsLeaderboard;
