import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assessment,
  CheckCircle,
  ExitToApp,
  LocationOn,
  Warning,
  Person,
  DirectionsBus,
  Timeline,
  Visibility,
  FilterList,
  Refresh,
  Download,
  AccessTime
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import { adminCheckInApiService } from '../../services/adminApiService';

const AdminCheckInManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [checkIns, setCheckIns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    bdUserId: '',
    operatorId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const loadCheckIns = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminCheckInApiService.getAllCheckIns({
        ...filters,
        page,
        limit: 20
      });
      setCheckIns(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Error loading check-ins:', error);
      setError('Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await adminCheckInApiService.getAnalytics(30);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics');
    }
  }, []);

  useEffect(() => {
    loadCheckIns();
  }, [loadCheckIns]);

  useEffect(() => {
    if (tabValue === 1) {
      loadAnalytics();
    }
  }, [tabValue, loadAnalytics]);

  const handleViewDetails = async (checkIn) => {
    try {
      const response = await adminCheckInApiService.getCheckInDetails(checkIn._id);
      setSelectedCheckIn(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Error loading check-in details:', error);
      setError('Failed to load check-in details');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      bdUserId: '',
      operatorId: '',
      dateFrom: '',
      dateTo: ''
    });
    setPage(1);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status, checkoutReason) => {
    if (status === 'checked-in') return 'info';
    if (status === 'checked-out' && checkoutReason === 'manual') return 'success';
    if (status === 'auto-checkout') return 'warning';
    return 'default';
  };

  const getStatusLabel = (status, checkoutReason) => {
    if (status === 'checked-in') return 'Active';
    if (status === 'checked-out' && checkoutReason === 'manual') return 'Completed';
    if (status === 'auto-checkout' && checkoutReason === 'auto-location-violation') return 'Auto-Checkout (Violation)';
    if (status === 'auto-checkout' && checkoutReason === 'auto-timeout') return 'Auto-Checkout (Timeout)';
    return 'Unknown';
  };

  const AnalyticsCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <Card sx={{ width: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2, width: 32, height: 32, height: 32 }}>
            {React.cloneElement(icon, { fontSize: 'small' })}
          </Avatar>
          <Box>
            <Typography variant="h5" component="div">
              {value}
            </Typography>
            <Typography variant="subtitle1" color="text.primary">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Navbar />
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              Check-In Management
            </Typography>
            <Box>
              <Tooltip title="Refresh Data">
                <IconButton onClick={() => { loadCheckIns(); loadAnalytics(); }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Data">
                <IconButton>
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab label="Check-In Sessions" />
            <Tab label="Analytics" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Check-In Sessions Tab */}
          {tabValue === 0 && (
            <Box>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                    <Typography variant="h6">Filter Sessions</Typography>
                    <Box>
                      <Button
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
                  </Box>

                  {showFilters && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={2}>
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
                          <TableCell>BD User</TableCell>
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
          )}

          {/* Analytics Tab */}
          {tabValue === 1 && analytics && (
            <Box width="100%">
              <Box display="flex" width="100%" gap={3} mb={3}>
                <Box flex={1}>
                  <AnalyticsCard
                    title="Total Sessions"
                    value={analytics.bdPerformance?.length || 0}
                    subtitle="Last 30 days"
                    icon={<Assessment />}
                    color="primary"
                  />
                </Box>
                <Box flex={1}>
                  <AnalyticsCard
                    title="Completed Sessions"
                    value={analytics.bdPerformance?.reduce((sum, bd) => sum + bd.completedSessions, 0) || 0}
                    subtitle="Successfully completed"
                    icon={<CheckCircle />}
                    color="success"
                  />
                </Box>
                <Box flex={1}>
                  <AnalyticsCard
                    title="Auto-Checkouts"
                    value={analytics.bdPerformance?.reduce((sum, bd) => sum + bd.autoCheckouts, 0) || 0}
                    subtitle="Policy violations"
                    icon={<Warning />}
                    color="warning"
                  />
                </Box>
                <Box flex={1}>
                  <AnalyticsCard
                    title="Avg Duration"
                    value={`${Math.round(analytics.bdPerformance?.reduce((sum, bd) => sum + bd.averageDuration, 0) / analytics.bdPerformance?.length || 0)}m`}
                    subtitle="Per session"
                    icon={<AccessTime />}
                    color="info"
                  />
                </Box>
              </Box>

              {/* Next row: 2-in-a-row, full width */}
              <Box display="flex" width="100%" gap={3} mb={3}>
                <Box flex={2}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        BD User Performance
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>BD User</TableCell>
                              <TableCell align="right">Sessions</TableCell>
                              <TableCell align="right">Completed</TableCell>
                              <TableCell align="right">Violations</TableCell>
                              <TableCell align="right">Completion Rate</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analytics.bdPerformance?.slice(0, 10).map((bd) => (
                              <TableRow key={bd._id}>
                                <TableCell>{bd.email || 'N/A'}</TableCell>
                                <TableCell align="right">{bd.totalSessions || 0}</TableCell>
                                <TableCell align="right">{bd.completedSessions || 0}</TableCell>
                                <TableCell align="right">{bd.totalViolations || 0}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={`${Math.round(bd.completionRate || 0)}%`}
                                    color={(bd.completionRate || 0) >= 80 ? 'success' : (bd.completionRate || 0) >= 60 ? 'warning' : 'error'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Box>
                <Box flex={1}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Top Visited Operators
                      </Typography>
                      <List dense>
                        {analytics.operatorStats?.slice(0, 8).map((operator) => (
                          <ListItem key={operator._id} disablePadding>
                            <ListItemIcon>
                              <DirectionsBus color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={operator.name || 'Unknown Operator'}
                              secondary={`${operator.visitCount || 0} visits by ${operator.uniqueVisitors || 0} BD users`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
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
      </Container>
    </>
  );
};

export default AdminCheckInManagement;
