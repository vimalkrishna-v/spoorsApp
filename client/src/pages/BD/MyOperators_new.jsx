import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  Avatar,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  DirectionsBus, 
  LocationOn,
  Phone,
  Email,
  CheckCircle,
  ExitToApp,
  AccessTime,
  Person
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import operatorApiService from '../../services/operatorApiService';
import { checkInApiService, locationUtils } from '../../services/checkInApiService';

const MyOperators = () => {
  const [assignedOperators, setAssignedOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkOutNotes, setCheckOutNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [distanceToOperator, setDistanceToOperator] = useState(null);
  
  const locationCheckIntervalRef = useRef(null);

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const loadOperators = useCallback(async () => {
    try {
      setLoading(true);
      const response = await operatorApiService.getAssignedOperators();
      setAssignedOperators(response);
    } catch (error) {
      console.error('Error loading operators:', error);
      showSnackbar('Failed to load operators', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const loadActiveCheckIn = useCallback(async () => {
    try {
      const response = await checkInApiService.getActiveCheckIn();
      setActiveCheckIn(response.data);
    } catch (error) {
      console.error('Error loading active check-in:', error);
      // Don't show error for this as it's not critical
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await locationUtils.getCurrentPosition();
      setCurrentLocation(location);
      setLocationError('');
    } catch (error) {
      console.error('Location error:', error);
      setLocationError(error.message);
    }
  }, []);

  const stopLocationTracking = useCallback(() => {
    if (locationCheckIntervalRef.current) {
      clearInterval(locationCheckIntervalRef.current);
      locationCheckIntervalRef.current = null;
    }
  }, []);

  const startLocationTracking = useCallback(() => {
    if (!activeCheckIn || locationCheckIntervalRef.current) return;

    const interval = setInterval(async () => {
      try {
        const location = await locationUtils.getCurrentPosition();
        setCurrentLocation(location);
        
        // Send location update to server
        const response = await checkInApiService.updateLocation(activeCheckIn.checkInId, {
          latitude: location.latitude,
          longitude: location.longitude
        });

        // Check if auto-checked out
        if (response.autoCheckout) {
          setActiveCheckIn(null);
          stopLocationTracking();
          showSnackbar(response.message, 'warning');
        }
      } catch (error) {
        console.error('Location tracking error:', error);
        showSnackbar('Location tracking failed', 'warning');
      }
    }, 5 * 60 * 1000); // 5 minutes

    locationCheckIntervalRef.current = interval;
  }, [activeCheckIn, stopLocationTracking, showSnackbar]);

  // Load data on component mount
  useEffect(() => {
    loadOperators();
    loadActiveCheckIn();
    getCurrentLocation();
    
    return () => {
      // Cleanup location tracking on unmount
      stopLocationTracking();
    };
  }, [loadOperators, loadActiveCheckIn, getCurrentLocation, stopLocationTracking]);

  // Start periodic location tracking when checked in
  useEffect(() => {
    if (activeCheckIn && currentLocation) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
    
    return () => stopLocationTracking();
  }, [activeCheckIn, currentLocation, startLocationTracking, stopLocationTracking]);

  const calculateDistance = (operator) => {
    if (!currentLocation || !operator.coordinates) return null;
    
    return locationUtils.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      operator.coordinates.lat,
      operator.coordinates.lng
    );
  };

  const canCheckIn = (operator) => {
    if (!currentLocation) return false;
    const distance = calculateDistance(operator);
    return distance !== null && distance <= 400; // 400 meters
  };

  const handleCheckInClick = async (operator) => {
    if (activeCheckIn) {
      showSnackbar('You are already checked in to another operator', 'warning');
      return;
    }

    if (!currentLocation) {
      await getCurrentLocation();
      if (!currentLocation) {
        showSnackbar('Location access is required for check-in', 'error');
        return;
      }
    }

    setSelectedOperator(operator);
    
    try {
      const canCheck = await checkInApiService.canCheckIn(operator._id, {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      });

      if (canCheck.canCheckIn) {
        setDistanceToOperator(canCheck.distance);
        setShowCheckInDialog(true);
      } else {
        showSnackbar(
          `You must be within ${canCheck.allowedRadius}m of the operator. Current distance: ${canCheck.distance}m`,
          'error'
        );
      }
    } catch (error) {
      console.error('Check-in validation error:', error);
      showSnackbar('Failed to validate check-in location', 'error');
    }
  };

  const handleCheckIn = async () => {
    if (!selectedOperator || !currentLocation) return;

    setProcessing(true);
    try {
      const response = await checkInApiService.checkIn(selectedOperator._id, {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        notes: checkInNotes
      });

      setActiveCheckIn({
        checkInId: response.data.checkInId,
        operator: selectedOperator,
        checkInTime: response.data.checkInTime
      });

      showSnackbar('Successfully checked in!', 'success');
      setShowCheckInDialog(false);
      setCheckInNotes('');
      setSelectedOperator(null);
    } catch (error) {
      console.error('Check-in error:', error);
      showSnackbar(error.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOutClick = () => {
    if (!activeCheckIn) return;
    setShowCheckOutDialog(true);
  };

  const handleCheckOut = async () => {
    if (!activeCheckIn) return;

    setProcessing(true);
    try {
      await checkInApiService.checkOut(activeCheckIn.checkInId, {
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        notes: checkOutNotes
      });

      setActiveCheckIn(null);
      stopLocationTracking();
      showSnackbar('Successfully checked out!', 'success');
      setShowCheckOutDialog(false);
      setCheckOutNotes('');
    } catch (error) {
      console.error('Check-out error:', error);
      showSnackbar(error.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / (1000 * 60)); // minutes
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getOperatorStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg">
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading your operators...
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
            My Operators
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Manage your assigned bus operators and track your check-ins
          </Typography>

          {/* Active Check-in Status */}
          {activeCheckIn && (
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleCheckOutClick}
                  startIcon={<ExitToApp />}
                >
                  Check Out
                </Button>
              }
            >
              <Typography variant="subtitle1">
                Currently checked in to: {activeCheckIn.operator.name}
              </Typography>
              <Typography variant="body2">
                Since: {formatTime(activeCheckIn.checkInTime)} 
                ({formatDuration(activeCheckIn.checkInTime)})
              </Typography>
            </Alert>
          )}

          {/* Location Status */}
          {locationError && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {locationError}
            </Alert>
          )}

          {currentLocation && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Location services enabled. Accuracy: ±{Math.round(currentLocation.accuracy)}m
            </Alert>
          )}

          {/* Operators Grid */}
          <Grid container spacing={3}>
            {assignedOperators.map((operator) => {
              const distance = calculateDistance(operator);
              const canCheck = canCheckIn(operator);
              const isActiveOperator = activeCheckIn?.operator._id === operator._id;

              return (
                <Grid item xs={12} md={6} lg={4} key={operator._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" mb={2}>
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
                          <Typography variant="h6" component="h2">
                            {operator.name}
                          </Typography>
                          <Chip 
                            label={operator.status}
                            color={getOperatorStatusColor(operator.status)}
                            size="small"
                          />
                        </Box>
                      </Box>

                      <List dense>
                        <ListItem disablePadding>
                          <ListItemIcon>
                            <LocationOn color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={operator.address}
                            secondary={distance ? `${Math.round(distance)}m away` : 'Distance unknown'}
                          />
                        </ListItem>
                        
                        <ListItem disablePadding>
                          <ListItemIcon>
                            <Person color="action" />
                          </ListItemIcon>
                          <ListItemText primary={operator.contactPerson} />
                        </ListItem>
                        
                        <ListItem disablePadding>
                          <ListItemIcon>
                            <Phone color="action" />
                          </ListItemIcon>
                          <ListItemText primary={operator.phone} />
                        </ListItem>
                        
                        <ListItem disablePadding>
                          <ListItemIcon>
                            <Email color="action" />
                          </ListItemIcon>
                          <ListItemText primary={operator.email} />
                        </ListItem>

                        {operator.lastVisit && (
                          <ListItem disablePadding>
                            <ListItemIcon>
                              <AccessTime color="action" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Last Visit"
                              secondary={new Date(operator.lastVisit).toLocaleDateString()}
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>

                    <CardActions>
                      {isActiveOperator ? (
                        <Button
                          fullWidth
                          variant="contained"
                          color="error"
                          startIcon={<ExitToApp />}
                          onClick={handleCheckOutClick}
                        >
                          Check Out
                        </Button>
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          startIcon={<CheckCircle />}
                          onClick={() => handleCheckInClick(operator)}
                          disabled={!!activeCheckIn || !canCheck || !currentLocation}
                        >
                          {!currentLocation 
                            ? 'Getting Location...'
                            : !canCheck 
                              ? `Too Far (${distance ? Math.round(distance) : '?'}m)`
                              : 'Check In'
                          }
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {assignedOperators.length === 0 && (
            <Alert severity="info" sx={{ mt: 3 }}>
              No operators assigned to you yet. Please contact your administrator.
            </Alert>
          )}
        </Box>

        {/* Check-in Dialog */}
        <Dialog open={showCheckInDialog} onClose={() => setShowCheckInDialog(false)}>
          <DialogTitle>
            Check In to {selectedOperator?.name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              You are {distanceToOperator}m from the operator location.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes (optional)"
              value={checkInNotes}
              onChange={(e) => setCheckInNotes(e.target.value)}
              placeholder="Add any notes about your visit..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCheckInDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCheckIn}
              variant="contained"
              disabled={processing}
              startIcon={processing ? <CircularProgress size={16} /> : <CheckCircle />}
            >
              Check In
            </Button>
          </DialogActions>
        </Dialog>

        {/* Check-out Dialog */}
        <Dialog open={showCheckOutDialog} onClose={() => setShowCheckOutDialog(false)}>
          <DialogTitle>
            Check Out from {activeCheckIn?.operator.name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Session duration: {activeCheckIn ? formatDuration(activeCheckIn.checkInTime) : ''}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Session Notes (optional)"
              value={checkOutNotes}
              onChange={(e) => setCheckOutNotes(e.target.value)}
              placeholder="Add notes about your session with the operator..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCheckOutDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCheckOut}
              variant="contained"
              color="error"
              disabled={processing}
              startIcon={processing ? <CircularProgress size={16} /> : <ExitToApp />}
            >
              Check Out
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default MyOperators;
