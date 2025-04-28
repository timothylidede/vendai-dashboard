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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Fab,
  Tooltip,
  Snackbar,
  Alert
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Chart from "react-apexcharts";
import "./OrdersTable.css";

// Icons as simple components
const SearchIcon = () => <span>🔍</span>;
const SortUpIcon = () => <span>▲</span>;
const SortDownIcon = () => <span>▼</span>;
const ClearIcon = () => <span>✖</span>;
const EditIcon = () => <span>✏️</span>;
const DeleteIcon = () => <span>🗑️</span>;
const AddIcon = () => <span>➕</span>;
const CloseIcon = () => <span>✖</span>;
const ExpandIcon = () => <span>🔽</span>;
const CollapseIcon = () => <span>🔼</span>;

function createData(id, name, trackingId, date, status, amount, items, address, contact, notes) {
  return { 
    id, 
    name, 
    trackingId, 
    date, 
    status, 
    amount, 
    items,
    address,
    contact,
    notes,
    activityData: [
      { timestamp: new Date(Date.now() - 144000000).toISOString(), value: Math.floor(Math.random() * 50) },
      { timestamp: new Date(Date.now() - 108000000).toISOString(), value: Math.floor(Math.random() * 50) },
      { timestamp: new Date(Date.now() - 72000000).toISOString(), value: Math.floor(Math.random() * 50) },
      { timestamp: new Date(Date.now() - 36000000).toISOString(), value: Math.floor(Math.random() * 50) },
      { timestamp: new Date().toISOString(), value: Math.floor(Math.random() * 50) },
    ]
  };
}

const initialRows = [
  createData(1, "John Doe", "Marto S", "2 March 2022", "Approved", 1240.50, "Laptop, Mouse", "123 Main St, Anytown", "john@example.com", "Priority shipping"),
  createData(2, "James Brown", "Pinky Blue", "2 March 2022", "Pending", 890.00, "Monitor, Keyboard", "456 Oak St, Somewhere", "james@example.com", "Fragile items"),
  createData(3, "Dexter Hughes", "Al Mohamed", "2 March 2022", "Approved", 75.25, "Books", "789 Pine St, Nowhere", "dexter@example.com", "Leave at door"),
  createData(4, "Van Damme", "Saint West", "2 March 2022", "Delivered", 199.99, "Headphones", "101 Elm St, Anywhere", "van@example.com", "Gift wrapped"),
  createData(5, "Sarah Connor", "T-800", "3 March 2022", "Pending", 2500.00, "Gaming PC", "202 Maple St, Somewhere", "sarah@example.com", "Insurance required"),
  createData(6, "Tony Stark", "Pepper Potts", "4 March 2022", "Delivered", 15000.00, "Advanced Tech Package", "Stark Tower, New York", "tony@stark.com", "Handle with care"),
  createData(7, "Bruce Wayne", "Selina Kyle", "5 March 2022", "Approved", 8500.00, "Security System", "Wayne Manor, Gotham", "bruce@wayne.com", "Deliver after dark"),
  createData(8, "Clark Kent", "Lois Lane", "6 March 2022", "Pending", 120.00, "Notebooks, Pens", "Daily Planet, Metropolis", "clark@planet.com", "Standard delivery"),
  createData(9, "Diana Prince", "Steve Trevor", "7 March 2022", "Delivered", 450.00, "Artwork", "Embassy of Themyscira", "diana@embassy.com", "Handle with extreme care"),
  createData(10, "Peter Parker", "MJ Watson", "8 March 2022", "Approved", 89.99, "Camera Parts", "Apartment 4B, Queens", "peter@bugle.com", "Leave with neighbor if not home"),
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

const getCardColor = (status) => {
  if (status === 'Approved') {
    return {
      backGround: "linear-gradient(180deg, #3EB873 0%, #209653 100%)",
      boxShadow: "0px 10px 20px 0px #3EB87333",
    };
  }
  else if (status === 'Pending') {
    return {
      backGround: "linear-gradient(180deg, #FF919D 0%, #FC929D 100%)",
      boxShadow: "0px 10px 20px 0px #FDC0C7",
    };
  }
  else {
    return {
      backGround: "linear-gradient(180deg, #1C78EA 0%, #0957C3 100%)",
      boxShadow: "0px 10px 20px 0px #1C90EA33",
    };
  }
};

export default function OrdersTable() {
  const [rows, setRows] = React.useState(initialRows);
  const [filteredRows, setFilteredRows] = React.useState(initialRows);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [sortConfig, setSortConfig] = React.useState({
    key: null,
    direction: 'ascending'
  });
  const [expandedOrderId, setExpandedOrderId] = React.useState(null);
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = React.useState(false);
  const [isEditOrderDialogOpen, setIsEditOrderDialogOpen] = React.useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = React.useState(false);
  const [currentOrder, setCurrentOrder] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form field states
  const [formData, setFormData] = React.useState({
    name: '',
    trackingId: '',
    date: '',
    status: 'Pending',
    amount: '',
    items: '',
    address: '',
    contact: '',
    notes: '',
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
        row.status.toLowerCase().includes(lowercasedQuery) ||
        String(row.amount).toLowerCase().includes(lowercasedQuery) ||
        row.items.toLowerCase().includes(lowercasedQuery) ||
        row.address.toLowerCase().includes(lowercasedQuery) ||
        row.contact.toLowerCase().includes(lowercasedQuery) ||
        row.notes.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key].toString().toLowerCase();
        const bValue = b[sortConfig.key].toString().toLowerCase();
        
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
  }, [searchQuery, statusFilter, sortConfig, rows]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSortConfig({ key: null, direction: 'ascending' });
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add new order
  const handleAddOrder = () => {
    const newOrder = createData(
      rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1,
      formData.name,
      formData.trackingId,
      formData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      formData.status,
      parseFloat(formData.amount) || 0,
      formData.items,
      formData.address,
      formData.contact,
      formData.notes
    );
    
    setRows([...rows, newOrder]);
    setIsAddOrderDialogOpen(false);
    setFormData({
      name: '',
      trackingId: '',
      date: '',
      status: 'Pending',
      amount: '',
      items: '',
      address: '',
      contact: '',
      notes: '',
    });
    
    setSnackbar({
      open: true,
      message: 'Order added successfully',
      severity: 'success'
    });
  };

  // Edit existing order
  const handleEditOrder = () => {
    const updatedRows = rows.map(row => 
      row.id === currentOrder.id 
        ? {
            ...row,
            name: formData.name,
            trackingId: formData.trackingId,
            date: formData.date,
            status: formData.status,
            amount: parseFloat(formData.amount),
            items: formData.items,
            address: formData.address,
            contact: formData.contact,
            notes: formData.notes,
          }
        : row
    );
    
    setRows(updatedRows);
    setIsEditOrderDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Order updated successfully',
      severity: 'success'
    });
  };

  // Delete order
  const handleDeleteOrder = () => {
    const updatedRows = rows.filter(row => row.id !== currentOrder.id);
    setRows(updatedRows);
    setIsDeleteConfirmationOpen(false);
    setExpandedOrderId(null);
    
    setSnackbar({
      open: true,
      message: 'Order deleted successfully',
      severity: 'warning'
    });
  };

  // Handle opening the edit dialog
  const openEditDialog = (order) => {
    setCurrentOrder(order);
    setFormData({
      name: order.name,
      trackingId: order.trackingId,
      date: order.date,
      status: order.status,
      amount: order.amount,
      items: order.items,
      address: order.address,
      contact: order.contact,
      notes: order.notes,
    });
    setIsEditOrderDialogOpen(true);
  };

  // Handle opening the add dialog
  const openAddDialog = () => {
    setFormData({
      name: '',
      trackingId: '',
      date: '',
      status: 'Pending',
      amount: '',
      items: '',
      address: '',
      contact: '',
      notes: '',
    });
    setIsAddOrderDialogOpen(true);
  };

  // Handle opening the delete confirmation dialog
  const openDeleteConfirmation = (order) => {
    setCurrentOrder(order);
    setIsDeleteConfirmationOpen(true);
  };

  // Toggle expanded order details
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <div className="Table">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">Orders Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={openAddDialog}
        >
          Add New Order
        </Button>
      </Box>

      <Box className="filterContainer" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<ClearIcon />} 
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        )}
        <Box className="resultCount" sx={{ ml: 'auto', color: 'text.secondary' }}>
          Showing {filteredRows.length} of {rows.length} orders
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ boxShadow: "0px 13px 20px 0px #80808029", mb: 4 }}
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
              <TableCell align="left" onClick={() => requestSort('amount')} className="sortableHeader">
                Amount {getSortDirectionIcon('amount')}
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    sx={{ 
                      "&:last-child td, &:last-child th": { border: 0 },
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                      backgroundColor: expandedOrderId === row.id ? 'rgba(0,0,0,0.04)' : 'inherit',
                    }}
                    onClick={() => toggleOrderDetails(row.id)}
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
                    <TableCell align="left">${row.amount.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={(e) => { 
                              e.stopPropagation();
                              toggleOrderDetails(row.id);
                            }}
                          >
                            {expandedOrderId === row.id ? <CollapseIcon /> : <ExpandIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Order">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(row);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Order">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteConfirmation(row);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Order Details */}
                  <TableRow>
                    <TableCell 
                      style={{ paddingBottom: 0, paddingTop: 0 }} 
                      colSpan={6}
                    >
                      <Collapse in={expandedOrderId === row.id} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <OrderDetailsCard order={row} />
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No matching records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Order Dialog */}
      <Dialog 
        open={isAddOrderDialogOpen} 
        onClose={() => setIsAddOrderDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Order</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Customer Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Agent"
                name="trackingId"
                value={formData.trackingId}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleFormChange}
                >
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleFormChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Items"
                name="items"
                value={formData.items}
                onChange={handleFormChange}
                fullWidth
                placeholder="Comma separated items"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact"
                name="contact"
                value={formData.contact}
                onChange={handleFormChange}
                fullWidth
                placeholder="Email or Phone"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsAddOrderDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddOrder}
            color="primary"
            variant="contained"
            disabled={!formData.name || !formData.trackingId}
          >
            Add Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog 
        open={isEditOrderDialogOpen} 
        onClose={() => setIsEditOrderDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Order</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Customer Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Agent"
                name="trackingId"
                value={formData.trackingId}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleFormChange}
                >
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleFormChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Items"
                name="items"
                value={formData.items}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact"
                name="contact"
                value={formData.contact}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsEditOrderDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditOrder}
            color="primary"
            variant="contained"
            disabled={!formData.name || !formData.trackingId}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the order from {currentOrder?.name}?
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsDeleteConfirmationOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteOrder}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

// Order Details Card Component
function OrderDetailsCard({ order }) {
  const colorScheme = getCardColor(order.status);
  
  // Format dates for chart
  const chartData = {
    options: {
      chart: {
        type: "area",
        height: "auto",
        toolbar: {
          show: false
        }
      },
      dropShadow: {
        enabled: false,
      },
      fill: {
        colors: ["#fff"],
        type: "gradient",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        colors: ["white"],
      },
      tooltip: {
        x: {
          format: "dd MMM yy",
        },
      },
      grid: {
        show: true,
        strokeDashArray: 5,
        borderColor: "rgba(255, 255, 255, 0.1)"
      },
      xaxis: {
        type: "datetime",
        categories: order.activityData.map(item => item.timestamp),
        labels: {
          style: {
            colors: "#fff"
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: "#fff"
          }
        }
      }
    },
    series: [
      {
        name: "Order Activity",
        data: order.activityData.map(item => item.value)
      }
    ]
  };

  const progressValue = order.status === "Delivered" ? 100 : 
                        order.status === "Approved" ? 60 : 30;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          background: colorScheme.backGround,
          boxShadow: colorScheme.boxShadow,
          color: "white",
          overflow: "hidden"
        }}
      >
        <CardContent>
          <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={progressValue} 
                    size={80}
                    thickness={5}
                    sx={{
                      color: "rgba(255, 255, 255, 0.9)",
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                  <Box sx={{ ml: 3 }}>
                    <Typography variant="h4">
                      ${order.amount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Status: {order.status}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Customer:</strong> {order.name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Contact:</strong> {order.contact}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Address:</strong> {order.address}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Items:</strong> {order.items}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Notes:</strong> {order.notes || "No additional notes"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ height: "100%", p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Order Activity
                </Typography>
                <Box sx={{ height: 200, mt: 2 }}>
                  <Chart
                    options={chartData.options}
                    series={chartData.series}
                    type="area"
                    height="100%"
                  />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Timeline:
                  </Typography>
                  <Box sx={{ pl: 2, borderLeft: '2px solid rgba(255, 255, 255, 0.2)' }}>
                    <Box sx={{ mt: 2, position: 'relative' }}>
                      <Box sx={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        bgcolor: 'white', 
                        position: 'absolute', 
                        left: -6, 
                        top: 6 
                      }} />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        <strong>Order Created</strong> - {order.date}
                      </Typography>
                    </Box>
                    {order.status === "Approved" || order.status === "Delivered" ? (
                      <Box sx={{ mt: 2, position: 'relative' }}>
                        <Box sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          bgcolor: 'white', 
                          position: 'absolute', 
                          left: -6, 
                          top: 6 
                        }} />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          <strong>Order Approved</strong> - {
                            new Date(new Date(order.date).getTime() + 24*60*60*1000)
                              .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          }
                        </Typography>
                      </Box>
                    ) : null}
                    {order.status === "Delivered" ? (
                      <Box sx={{ mt: 2, position: 'relative' }}>
                        <Box sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          bgcolor: 'white', 
                          position: 'absolute', 
                          left: -6, 
                          top: 6 
                        }} />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          <strong>Order Delivered</strong> - {
                            new Date(new Date(order.date).getTime() + 3*24*60*60*1000)
                              .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          }
                        </Typography>
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
}
