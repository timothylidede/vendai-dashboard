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
import "./AgentsTable.css";

const SearchIcon = () => <span>🔍</span>;
const SortUpIcon = () => <span>▲</span>;
const SortDownIcon = () => <span>▼</span>;
const ClearIcon = () => <span>✖</span>;

function createData(name, region, ordersClosed, salesValue, onTimeVisit, paymentCollection) {
  return { name, region, ordersClosed, salesValue, onTimeVisit, paymentCollection };
}

const rows = [
  createData("Peter Otieno", "Eastlands", 78, 520000, 92, 88),
  createData("Jane Wambui", "Westlands", 74, 480000, 89, 90),
  createData("Kevin Muriithi", "South B", 70, 460000, 94, 85),
  createData("Mercy Achieng", "CBD", 65, 430000, 91, 87),
  createData("Samuel Njenga", "Kasarani", 60, 400000, 88, 84),
  createData("John Kamau", "Thika Road", 58, 390000, 86, 83),
  createData("Linda Mwende", "Embakasi", 55, 370000, 92, 89),
  createData("Brian Otieno", "Gikambura", 50, 350000, 90, 85),
];

export default function BasicTable() {
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
        row.region.toLowerCase().includes(lowercasedQuery)
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
          label="Search Agent or Region"
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
          Showing {filteredRows.length} of {rows.length} agents
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        style={{ boxShadow: "0px 13px 20px 0px #80808029" }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="agent performance table">
          <TableHead>
            <TableRow>
              <TableCell onClick={() => requestSort('name')} className="sortableHeader">
                Agent Name {getSortDirectionIcon('name')}
              </TableCell>
              <TableCell onClick={() => requestSort('region')} className="sortableHeader">
                Region {getSortDirectionIcon('region')}
              </TableCell>
              <TableCell onClick={() => requestSort('ordersClosed')} className="sortableHeader">
                Orders Closed {getSortDirectionIcon('ordersClosed')}
              </TableCell>
              <TableCell onClick={() => requestSort('salesValue')} className="sortableHeader">
                Sales Value (KES) {getSortDirectionIcon('salesValue')}
              </TableCell>
              <TableCell onClick={() => requestSort('onTimeVisit')} className="sortableHeader">
                On-Time Visit % {getSortDirectionIcon('onTimeVisit')}
              </TableCell>
              <TableCell onClick={() => requestSort('paymentCollection')} className="sortableHeader">
                Payment Collection % {getSortDirectionIcon('paymentCollection')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <TableRow
                  key={row.name + row.region}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.region}</TableCell>
                  <TableCell>{row.ordersClosed}</TableCell>
                  <TableCell>{row.salesValue.toLocaleString()}</TableCell>
                  <TableCell>{row.onTimeVisit}%</TableCell>
                  <TableCell>{row.paymentCollection}%</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No matching agents found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
