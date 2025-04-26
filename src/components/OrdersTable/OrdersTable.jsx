import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./OrdersTable.css";

function createData(name, trackingId, date, status) {
  return { name, trackingId, date, status };
}

const rows = [
    createData("John Doe", "Marto S", "2 March 2022", "Approved"),
    createData("James Brown", "Pinky Blue", "2 March 2022", "Pending"),
    createData("Dexter Hughes", "Al Mohamed", "2 March 2022", "Approved"),
    createData("Van Damme", "Saint West", "2 March 2022", "Delivered"),
    createData("Sarah Connor", "T-800", "3 March 2022", "Pending"),
    createData("Tony Stark", "Pepper Potts", "4 March 2022", "Delivered"),
    createData("Bruce Wayne", "Selina Kyle", "5 March 2022", "Approved"),
    createData("Clark Kent", "Lois Lane", "6 March 2022", "Pending"),
    createData("Diana Prince", "Steve Trevor", "7 March 2022", "Delivered"),
    createData("Peter Parker", "MJ Watson", "8 March 2022", "Approved"),
    createData("Steve Rogers", "Bucky Barnes", "9 March 2022", "Pending"),
    createData("Natasha Romanoff", "Clint Barton", "10 March 2022", "Approved"),
    createData("Wanda Maximoff", "Vision", "11 March 2022", "Delivered"),
    createData("Stephen Strange", "Christine Palmer", "12 March 2022", "Pending"),
    createData("Scott Lang", "Hope Van Dyne", "13 March 2022", "Approved"),
    createData("Thor Odinson", "Jane Foster", "14 March 2022", "Delivered"),
    createData("Bruce Banner", "Betty Ross", "15 March 2022", "Pending"),
    createData("Sam Wilson", "Sarah Wilson", "16 March 2022", "Approved"),
    createData("Nick Fury", "Maria Hill", "17 March 2022", "Delivered"),
    createData("Carol Danvers", "Monica Rambeau", "18 March 2022", "Pending"),
  ];  

const makeStyle=(status)=>{
  if(status === 'Approved')
  {
    return {
      background: 'rgb(145 254 159 / 47%)',
      color: 'green',
    }
  }
  else if(status === 'Pending')
  {
    return{
      background: '#ffadad8f',
      color: 'red',
    }
  }
  else{
    return{
      background: '#59bfff',
      color: 'white',
    }
  }
}

export default function BasicTable() {
  return (
      <div className="Table">
        <TableContainer
          component={Paper}
          style={{ boxShadow: "0px 13px 20px 0px #80808029" }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell align="left">Agent</TableCell>
                <TableCell align="left">Date</TableCell>
                <TableCell align="left">Status</TableCell>
                <TableCell align="left"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody style={{ color: "white" }}>
              {rows.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="left">{row.trackingId}</TableCell>
                  <TableCell align="left">{row.date}</TableCell>
                  <TableCell align="left">
                    <span className="status" style={makeStyle(row.status)}>{row.status}</span>
                  </TableCell>
                  <TableCell align="left" className="Details">Details</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
  );
}
