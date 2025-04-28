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
  Box,
  InputAdornment,
  IconButton
} from "@mui/material";
import "./CustomersTable.css";

const SearchIcon = () => <span>🔍</span>;
const SortUpIcon = () => <span>▲</span>;
const SortDownIcon = () => <span>▼</span>;
const ClearIcon = () => <span>✖</span>;

// Creating sample customer data
function createData(name, location, totalOrders, totalSpent, lastOrderDate, loyaltyLevel) {
  return { name, location, totalOrders, totalSpent, lastOrderDate, loyaltyLevel };
}

// Example customers
const rows = [
  createData("Mary Wanjiku", "Eastleigh", 45, 125000, "2025-04-20", "Gold"),
  createData("Paul Odhiambo", "Kisumu", 30, 75000, "2025-04-18", "Silver"),
  createData("Ann Mwende", "Nakuru", 55, 140000, "2025-04-22", "Platinum"),
  createData("Brian Kiptoo", "Eldoret", 20, 50000, "2025-04-15", "Bronze"),
  createData("Lucy Kamau", "Westlands", 38, 98000, "2025-04-21", "Gold"),
  createData("John Otieno", "CBD", 60, 160000, "2025-04-23", "Platinum"),
  createData("Dorcas Mutua", "Machakos", 25, 63000, "2025-04-19", "Silver"),
];

export default function CustomersTable() {
  const [filteredRows, setFilteredRows] = React.useState(rows);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState({
    key: null,
    direction: 'ascending'
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <SortUpIcon /> : <SortDownIcon />;
  };

  React.useEffect(() => {
    let result = [...rows];

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      result = result.filter(row =>
        row.name.toLowerCase().includes(lowercasedQuery) ||
        row.location.toLowerCase().includes(lowercasedQuery)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
      });
    }

    setFilteredRows(result);
  }, [searchQuery, sortConfig]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortConfig({ key: null, direction: 'ascending' });
  };

  return (
    <div className="Table">
      <Box className="filterContainer">
        <TextField
          label="Search Customer or Location"
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
        {(searchQuery || sortConfig.key) && (
          <IconButton onClick={clearFilters} size="small" className="clearButton">
            Clear Filters
          </IconButton>
        )}
        <Box className="resultCount">
          Showing {filteredRows.length} of {rows.length} customers
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        style={{ boxShadow: "0px 13px 20px 0px #80808029" }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="customers table">
          <TableHead>
            <TableRow>
              <TableCell onClick={() => requestSort('name')} className="sortableHeader">
                Customer Name {getSortDirectionIcon('name')}
              </TableCell>
              <TableCell onClick={() => requestSort('location')} className="sortableHeader">
                Location {getSortDirectionIcon('location')}
              </TableCell>
              <TableCell onClick={() => requestSort('totalOrders')} className="sortableHeader">
                Total Orders {getSortDirectionIcon('totalOrders')}
              </TableCell>
              <TableCell onClick={() => requestSort('totalSpent')} className="sortableHeader">
                Total Spent (KES) {getSortDirectionIcon('totalSpent')}
              </TableCell>
              <TableCell onClick={() => requestSort('lastOrderDate')} className="sortableHeader">
                Last Order Date {getSortDirectionIcon('lastOrderDate')}
              </TableCell>
              <TableCell onClick={() => requestSort('loyaltyLevel')} className="sortableHeader">
                Loyalty Level {getSortDirectionIcon('loyaltyLevel')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <TableRow
                  key={row.name + row.location}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.totalOrders}</TableCell>
                  <TableCell>{row.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>{row.lastOrderDate}</TableCell>
                  <TableCell>{row.loyaltyLevel}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No matching customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
