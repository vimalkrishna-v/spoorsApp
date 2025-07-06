import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Pagination,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  DirectionsBus,
  LocationOn,
  AccessTime,
  CheckCircle,
  ExitToApp,
  Visibility,
  Warning
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import { checkInApiService } from '../../services/checkInApiService';

const CheckInHistory = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadCheckInHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await checkInApiService.getCheckInHistory(page, 10);
      setCheckIns(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Error loading check-in history:', error);
      setError('Failed to load check-in history');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadCheckInHistory();
  }, [loadCheckInHistory]);

  const handleViewDetails = async (checkIn) => {
    setDetailsLoading(true);
    try {
      const response = await checkInApiService.getCheckInDetails(checkIn._id);
      setSelectedCheckIn(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Error loading check-in details:', error);
      setError('Failed to load check-in details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return 'Ongoing';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = Math.floor((end - start) / (1000 * 60)); // minutes
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
    if (status === 'auto-checkout' && checkoutReason === 'auto-location-violation') return 'Auto-Checkout (Left Area)';
    if (status === 'auto-checkout' && checkoutReason === 'auto-timeout') return 'Auto-Checkout (Timeout)';
    return 'Unknown';
  };

  if (loading && page === 1) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg">
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading check-in history...
            </Typography>
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          {/* Header */}
          <Typography variant="h4" component="h1" gutterBottom>
            Check-In History
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            View your past check-ins and operator visits
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Check-ins List */}
          <Grid container spacing={3}>
            {checkIns.map((checkIn) => (
              <Grid item xs={12} key={checkIn._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" flexGrow={1}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            mr: 2,
                            width: 48,
                            height: 48
                          }}
                        >
                          <DirectionsBus />
                        </Avatar>
                        
                        <Box flexGrow={1}>
                          <Typography variant="h6" component="h3">
                            {checkIn.operatorId.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {checkIn.operatorId.address}
                          </Typography>
                          
                          <Box display="flex" alignItems="center" gap={2} mt={1}>
                            <Chip
                              label={getStatusLabel(checkIn.status, checkIn.checkoutReason)}
                              color={getStatusColor(checkIn.status, checkIn.checkoutReason)}
                              size="small"
                            />
                            
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(checkIn.checkInTime)}
                            </Typography>
                            
                            <Typography variant="caption" color="text.secondary">
                              Duration: {formatDuration(checkIn.checkInTime, checkIn.checkOutTime)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetails(checkIn)}
                        disabled={detailsLoading}
                      >
                        Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {checkIns.length === 0 && !loading && (
            <Alert severity="info" sx={{ mt: 3 }}>
              No check-in history found. Start checking in to operators to see your history here.
            </Alert>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>

        {/* Details Dialog */}
        <Dialog 
          open={showDetails} 
          onClose={() => setShowDetails(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Check-In Details
          </DialogTitle>
          <DialogContent>
            {selectedCheckIn && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedCheckIn.operatorId.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedCheckIn.operatorId.address}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <List>
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Check-In Time"
                      secondary={formatDateTime(selectedCheckIn.checkInTime)}
                    />
                  </ListItem>

                  {selectedCheckIn.checkOutTime && (
                    <ListItem disablePadding>
                      <ListItemIcon>
                        <ExitToApp color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Check-Out Time"
                        secondary={formatDateTime(selectedCheckIn.checkOutTime)}
                      />
                    </ListItem>
                  )}

                  <ListItem disablePadding>
                    <ListItemIcon>
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Duration"
                      secondary={formatDuration(selectedCheckIn.checkInTime, selectedCheckIn.checkOutTime)}
                    />
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Check-In Distance"
                      secondary={`${selectedCheckIn.checkInLocation.distanceFromOperator}m from operator`}
                    />
                  </ListItem>

                  {selectedCheckIn.maxDistanceViolated && (
                    <ListItem disablePadding>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Maximum Distance Violated"
                        secondary={`${selectedCheckIn.maxDistanceViolated}m from operator`}
                      />
                    </ListItem>
                  )}

                  {selectedCheckIn.locationTracking && (
                    <ListItem disablePadding>
                      <ListItemIcon>
                        <LocationOn />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Location Updates"
                        secondary={`${selectedCheckIn.locationTracking.length} location checks during session`}
                      />
                    </ListItem>
                  )}
                </List>

                {selectedCheckIn.notes && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Session Notes:
                    </Typography>
                    <Typography variant="body2" sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      {selectedCheckIn.notes}
                    </Typography>
                  </>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary">
                  Status: {getStatusLabel(selectedCheckIn.status, selectedCheckIn.checkoutReason)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default CheckInHistory;
