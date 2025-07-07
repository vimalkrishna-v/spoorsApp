import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Avatar,
  Chip,
  Pagination,
} from '@mui/material';
import {
  AccessTime,
  CheckCircle,
  DirectionsBus,
  ExitToApp,
  FilterList,
  Person,
  Timeline,
  Visibility,
  Warning,
  LocationOn,
} from '@mui/icons-material';
import { adminCheckInApiService } from '../../services/adminApiService';
import Navbar from '../../components/Navbar';

// Helper functions for formatting and status (since utils/formatters and utils/statusHelpers do not exist)
function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getStatusColor(status, checkoutReason) {
  if (status === 'checked-in') return 'info';
  if (status === 'checked-out' && checkoutReason === 'manual') return 'success';
  if (status === 'auto-checkout') return 'warning';
  return 'default';
}

function getStatusLabel(status, checkoutReason) {
  if (status === 'checked-in') return 'Active';
  if (status === 'checked-out' && checkoutReason === 'manual') return 'Completed';
  if (status === 'auto-checkout' && checkoutReason === 'auto-location-violation') return 'Auto-Checkout (Violation)';
  if (status === 'auto-checkout' && checkoutReason === 'auto-timeout') return 'Auto-Checkout (Timeout)';
  return 'Unknown';
}

const AdminCheckInManagement = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminCheckInApiService.getAllCheckIns({
        ...filters,
        page,
        limit: 20
      });
      setCheckIns(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const handleViewDetails = (checkIn) => {
    setSelectedCheckIn(checkIn);
    setShowDetails(true);
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Box my={4}>
          {/* Filters and Actions */}
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Check-In Management</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterList />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ mr: 1 }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <Button onClick={clearFilters} variant="outlined" size="small">
                  Clear All
                </Button>
              </Box>
              {showFilters && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={13}>
                    <TextField
                      select
                      fullWidth
                      label="Status"
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="checked-in">Active</MenuItem>
                      <MenuItem value="checked-out">Completed</MenuItem>
                      <MenuItem value="auto-checkout">Auto-Checkout</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="From Date"
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="To Date"
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Check-In Table */}
          <Box my={3}>
            {loading ? (
              <Box textAlign="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>BD Executive</TableCell>
                        <TableCell>Operator</TableCell>
                        <TableCell>Check-In Time</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {checkIns.map((checkIn) => (
                        <TableRow key={checkIn._id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}>
                                <Person />
                              </Avatar>
                              <Box>
                                <Typography variant="body2">
                                  {checkIn.userId?.email || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {checkIn.userId?.role || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {checkIn.operatorId?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {checkIn.operatorId?.address || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDateTime(checkIn.checkInTime)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatDuration(checkIn.totalDuration)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(checkIn.status, checkIn.checkoutReason)}
                              color={getStatusColor(checkIn.status, checkIn.checkoutReason)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewDetails(checkIn)}
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(event, value) => setPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Details Dialog */}
          <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              Check-In Session Details
            </DialogTitle>
            <DialogContent>
              {selectedCheckIn && (
                <Box>
                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">BD User</Typography>
                      <Typography variant="body1">{selectedCheckIn.userId?.email || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Operator</Typography>
                      <Typography variant="body1">{selectedCheckIn.operatorId?.name || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <List>
                    <ListItem disablePadding>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText
                        primary="Check-In Time"
                        secondary={formatDateTime(selectedCheckIn.checkInTime)}
                      />
                    </ListItem>

                    {selectedCheckIn.checkOutTime && (
                      <ListItem disablePadding>
                        <ListItemIcon><ExitToApp color="error" /></ListItemIcon>
                        <ListItemText
                          primary="Check-Out Time"
                          secondary={formatDateTime(selectedCheckIn.checkOutTime)}
                        />
                      </ListItem>
                    )}

                    <ListItem disablePadding>
                      <ListItemIcon><AccessTime /></ListItemIcon>
                      <ListItemText
                        primary="Duration"
                        secondary={formatDuration(selectedCheckIn.totalDuration)}
                      />
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemIcon><LocationOn /></ListItemIcon>
                      <ListItemText
                        primary="Check-In Distance"
                        secondary={`${selectedCheckIn.checkInLocation?.distanceFromOperator || 'N/A'}m from operator`}
                      />
                    </ListItem>

                    {selectedCheckIn.sessionStats && (
                      <>
                        <ListItem disablePadding>
                          <ListItemIcon><Timeline /></ListItemIcon>
                          <ListItemText
                            primary="Location Tracking"
                            secondary={`${selectedCheckIn.sessionStats?.totalLocationChecks || 0} checks (${selectedCheckIn.sessionStats?.complianceRate || 0}% compliant)`}
                          />
                        </ListItem>

                        {selectedCheckIn.sessionStats?.violatingLocationChecks > 0 && (
                          <ListItem disablePadding>
                            <ListItemIcon><Warning color="warning" /></ListItemIcon>
                            <ListItemText
                              primary="Policy Violations"
                              secondary={`${selectedCheckIn.sessionStats?.violatingLocationChecks || 0} location violations detected`}
                            />
                          </ListItem>
                        )}
                      </>
                    )}
                  </List>

                  {selectedCheckIn.notes && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>Session Notes:</Typography>
                      <Typography variant="body2" sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        {selectedCheckIn.notes}
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDetails(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </>
  );
};

export default AdminCheckInManagement;
