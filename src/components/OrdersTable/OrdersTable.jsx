import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  InputAdornment,
  IconButton
} from "@mui/material";
import "./OrdersTable.css";

// Icons could be imported from @mui/icons-material in a real project
// Using simplified versions here
const SearchIcon = () => <span>🔍</span>;
const SortUpIcon = () => <span>▲</span>;
const SortDownIcon = () => <span>▼</span>;
const ClearIcon = () => <span>✖</span>;

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

const makeStyle = (status) => {
  if (status === 'Approved') {
    return {
      background: 'rgb(145 254 159 / 47%)',
      color: 'green',
    }
  }
  else if (status === 'Pending') {
    return {
      background: '#ffadad8f',
      color: 'red',
    }
  }
  else {
    return {
      background: '#59bfff',
      color: 'white',
    }
  }
}

export default function BasicTable() {
  const [filteredRows, setFilteredRows] = React.useState(rows);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [sortConfig, setSortConfig] = React.useState({
    key: null,
    direction: 'ascending'
  });

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction icon
  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === 'ascending') return <SortUpIcon />;
    return <SortDownIcon />;
  };

  // Apply filters and sorting
  React.useEffect(() => {
    let result = [...rows];
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(row => row.status === statusFilter);
    }
    
    // Apply search filter across all fields
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      result = result.filter(row => 
        row.name.toLowerCase().includes(lowercasedQuery) ||
        row.trackingId.toLowerCase().includes(lowercasedQuery) ||
        row.date.toLowerCase().includes(lowercasedQuery) ||
        row.status.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key].toLowerCase();
        const bValue = b[sortConfig.key].toLowerCase();
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredRows(result);
  }, [searchQuery, statusFilter, sortConfig]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSortConfig({ key: null, direction: 'ascending' });
  };

  return (
    <div className="Table">
      <Box className="filterContainer">
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="searchField"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <FormControl size="small" className="statusFilter">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
          </Select>
        </FormControl>
        {(searchQuery || statusFilter !== 'All' || sortConfig.key) && (
          <IconButton onClick={clearFilters} size="small" className="clearButton">
            Clear Filters
          </IconButton>
        )}
        <Box className="resultCount">
          Showing {filteredRows.length} of {rows.length} orders
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        style={{ boxShadow: "0px 13px 20px 0px #80808029" }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="orders table">
          <TableHead>
            <TableRow>
              <TableCell onClick={() => requestSort('name')} className="sortableHeader">
                Customer {getSortDirectionIcon('name')}
              </TableCell>
              <TableCell align="left" onClick={() => requestSort('trackingId')} className="sortableHeader">
                Agent {getSortDirectionIcon('trackingId')}
              </TableCell>
              <TableCell align="left" onClick={() => requestSort('date')} className="sortableHeader">
                Date {getSortDirectionIcon('date')}
              </TableCell>
              <TableCell align="left" onClick={() => requestSort('status')} className="sortableHeader">
                Status {getSortDirectionIcon('status')}
              </TableCell>
              <TableCell align="left"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody style={{ color: "white" }}>
            {filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <TableRow
                  key={row.name + row.trackingId}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="left">{row.trackingId}</TableCell>
                  <TableCell align="left">{row.date}</TableCell>
                  <TableCell align="left">
                    <span className="status" style={makeStyle(row.status)}>
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell align="left" className="Details">Details</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No matching records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}