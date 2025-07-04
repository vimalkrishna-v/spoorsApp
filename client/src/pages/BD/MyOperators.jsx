import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Alert,
  Chip,
  Avatar,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import { 
  DirectionsBus, 
  Person,
  LocationOn,
  Phone,
  Email,
  Close,
  CheckCircle,
  ExitToApp
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { 
  getOperatorStatusColor
} from '../../data/operatorData';
import operatorApiService from '../../services/operatorApiService';

const MyOperators = () => {
  const { currentUser } = useAuth();
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [showOperatorDetails, setShowOperatorDetails] = useState(false);
  const [assignedOperators, setAssignedOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState({});
  const [processingCheckIn, setProcessingCheckIn] = useState(null);

  // Load operators data on component mount
  // Load operators and check-in status on component mount
  useEffect(() => {
    const initializeData = async () => {
      await loadOperators();
      await loadCheckInStatus();
    };
    
    initializeData();
  }, []);

  const loadOperators = async () => {
    try {
      setLoading(true);
      const operators = await operatorApiService.getAssignedOperators();
      setAssignedOperators(operators);
    } catch (error) {
      console.error('Error loading operators:', error);
      setLocationError('Failed to load operators. Please check your authentication and try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCheckInStatus = async () => {
    try {
      const status = await operatorApiService.getCheckInStatus();
      setCheckInStatus(status);
    } catch (error) {
      console.error('Error loading check-in status:', error);
      // Don't show error to user for check-in status as it's not critical
    }
  };

  useEffect(() => {
    // Get the user's current location when the component loads
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Unable to access your location. Please enable location services for check-in functionality.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const isWithinRange = (operator) => {
    if (!location || !operator.coordinates) return false;
    
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      operator.coordinates.lat,
      operator.coordinates.lng
    );
    
    return distance <= 100; // 100 meters
  };

  const handleCheckIn = async (operatorId) => {
    if (!location) {
      setLocationError('Location data is required for check-in.');
      return;
    }

    const operator = assignedOperators.find(op => op._id === operatorId);
    if (!operator) {
      console.error('Operator not found');
      return;
    }

    if (!isWithinRange(operator)) {
      alert('You must be within 100 meters of the operator location to check in.');
      return;
    }

    try {
      setProcessingCheckIn(operatorId);
      const result = await operatorApiService.checkIn(operatorId, location);
      
      if (result.success) {
        // Update local check-in status
        setCheckInStatus(prev => ({
          ...prev,
          [operatorId]: {
            status: 'checked-in',
            checkInTime: result.data.checkInTime,
            operatorName: operator.name
          }
        }));
        
        // Update the last visit date for the operator
        setAssignedOperators(prev =>
          prev.map(op => 
            op._id === operatorId 
              ? { ...op, lastVisit: new Date().toISOString() } 
              : op
          )
        );
        
        alert('Check-in successful!');
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      alert(`Check-in failed: ${error.message}`);
    } finally {
      setProcessingCheckIn(null);
    }
  };

  const handleCheckOut = async (operatorId) => {
    try {
      setProcessingCheckIn(operatorId);
      const result = await operatorApiService.checkOut(operatorId, location, '');
      
      if (result.success) {
        // Update local check-in status
        setCheckInStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[operatorId]; // Remove from active check-ins
          return newStatus;
        });
        
        alert(`Check-out successful! Duration: ${result.data.duration} minutes`);
      }
    } catch (error) {
      console.error('Check-out failed:', error);
      alert(`Check-out failed: ${error.message}`);
    } finally {
      setProcessingCheckIn(null);
    }
  };

  const handleOperatorClick = (operator) => {
    setSelectedOperator(operator);
    setShowOperatorDetails(true);
  };

  const handleCloseOperatorDetails = () => {
    setShowOperatorDetails(false);
    setSelectedOperator(null);
  };

  const getCheckInButtonText = (operatorId) => {
    const status = checkInStatus[operatorId];
    if (status?.status === 'checked-in') return 'Check Out';
    return 'Check In';
  };

  const getCheckInButtonColor = (operatorId) => {
    const status = checkInStatus[operatorId];
    if (status?.status === 'checked-in') return 'secondary';
    return 'primary';
  };

  const isCheckedIn = (operatorId) => {
    return checkInStatus[operatorId]?.status === 'checked-in';
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Operators
          </Typography>

          {locationError && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {locationError}
            </Alert>
          )}

          {location && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Your current location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Your Assigned Bus Operators" />
                <CardContent>
                  {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {assignedOperators.map((operator) => (
                        <Grid item xs={12} sm={6} md={12} lg={6} key={operator._id}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              cursor: 'pointer',
                              position: 'relative',
                              '&:hover': { 
                                boxShadow: 3,
                                transform: 'translateY(-2px)',
                                transition: 'all 0.2s ease-in-out'
                              }
                            }}
                            onClick={() => handleOperatorClick(operator)}
                          >
                            {/* Distance indicator */}
                            {location && (
                              <Chip 
                                label={
                                  isWithinRange(operator) ? 
                                  '✓ Within Range' : 
                                  `${Math.round(calculateDistance(
                                    location.latitude,
                                    location.longitude,
                                    operator.coordinates.lat,
                                    operator.coordinates.lng
                                  ))}m away`
                                }
                                color={isWithinRange(operator) ? 'success' : 'default'}
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  zIndex: 1
                                }}
                              />
                            )}
                            
                            {/* Check-in status indicator */}
                            {isCheckedIn(operator._id) && (
                              <Chip 
                                label="Checked In"
                                color="success"
                                size="small"
                                icon={<CheckCircle />}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  left: 8,
                                  zIndex: 1
                                }}
                              />
                            )}

                            <CardContent>
                              <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                  <DirectionsBus />
                                </Avatar>
                                <Box flexGrow={1}>
                                  <Typography variant="h6">
                                    {operator.name}
                                  </Typography>
                                  <Chip 
                                    label={operator.status.toUpperCase()} 
                                    color={getOperatorStatusColor(operator.status)}
                                    size="small"
                                  />
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                <LocationOn fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {operator.address}
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                <Person fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {operator.contactPerson}
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                <Phone fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {operator.phone}
                              </Typography>
                              
                              <Typography variant="caption" color="text.secondary">
                                {operator.lastVisit 
                                  ? `Last visit: ${new Date(operator.lastVisit).toLocaleDateString()}` 
                                  : 'Never visited'
                                }
                              </Typography>
                            </CardContent>
                            <CardActions>
                              <Button
                                variant="contained"
                                color={getCheckInButtonColor(operator._id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isCheckedIn(operator._id)) {
                                    handleCheckOut(operator._id);
                                  } else {
                                    handleCheckIn(operator._id);
                                  }
                                }}
                                disabled={
                                  (!isWithinRange(operator) && !isCheckedIn(operator._id)) ||
                                  processingCheckIn === operator._id
                                }
                                startIcon={
                                  processingCheckIn === operator._id ? (
                                    <CircularProgress size={16} />
                                  ) : isCheckedIn(operator._id) ? (
                                    <ExitToApp />
                                  ) : (
                                    <CheckCircle />
                                  )
                                }
                                fullWidth
                              >
                                {processingCheckIn === operator._id ? 
                                  'Processing...' : 
                                  getCheckInButtonText(operator._id)
                                }
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Recent Check-ins" />
                <CardContent>
                  <List>
                    {Object.entries(checkInStatus)
                      .filter(([_, status]) => status.status === 'checked-in')
                      .sort(([_a, a], [_b, b]) => new Date(b.checkInTime) - new Date(a.checkInTime))
                      .slice(0, 5)
                      .map(([operatorId, status]) => {
                        const operator = assignedOperators.find(op => op._id === operatorId);
                        return (
                          <ListItem key={operatorId}>
                            <ListItemIcon>
                              <CheckCircle color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary={operator?.name || status.operatorName || 'Unknown Operator'}
                              secondary={`Checked in: ${new Date(status.checkInTime).toLocaleString()}`}
                            />
                          </ListItem>
                        );
                      })}
                    {Object.keys(checkInStatus).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No check-ins yet
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Operator Details Dialog */}
      <OperatorDetailsDialog 
        open={showOperatorDetails}
        onClose={handleCloseOperatorDetails}
        operator={selectedOperator}
        userLocation={location}
      />
    </>
  );
};

// Operator Details Dialog Component
const OperatorDetailsDialog = ({ open, onClose, operator, userLocation }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (open && operator) {
      setMapLoaded(true);
    }
  }, [open, operator]);

  useEffect(() => {
    if (mapLoaded && operator) {
      initializeMap();
    }
  }, [mapLoaded, operator]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const initializeMap = () => {
    const mapContainer = document.getElementById('operator-detail-map');
    if (!mapContainer) return;

    const operatorCoords = operator.coordinates;
    
    mapContainer.innerHTML = `
      <div style="
        position: relative;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 20px;
      ">
        <div style="
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-bottom: 15px;
          max-width: 300px;
        ">
          <h3 style="margin: 0 0 10px 0; color: #1976d2;">📍 ${operator.name}</h3>
          <p style="margin: 0; color: #666; font-size: 14px;">
            Location: ${operatorCoords.lat.toFixed(6)}, ${operatorCoords.lng.toFixed(6)}
          </p>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
            ${operator.address}
          </p>
          ${userLocation ? `
            <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 6px;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                📍 Your Location: ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}
              </p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                🧭 Distance: ${Math.round(calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  operatorCoords.lat,
                  operatorCoords.lng
                ))} meters
              </p>
            </div>
          ` : ''}
        </div>
        
        <div style="
          background: rgba(255,255,255,0.8);
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 12px;
          color: #666;
        ">
          🗺️ Interactive map view
        </div>
      </div>
    `;
  };

  if (!operator) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        style: {
          minHeight: '70vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              <DirectionsBus />
            </Avatar>
            <Box>
              <Typography variant="h6">{operator.name}</Typography>
              <Chip 
                label={operator.status.toUpperCase()} 
                color={getOperatorStatusColor(operator.status)}
                size="small"
              />
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Operator Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Operator Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Contact Person" 
                      secondary={operator.contactPerson} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Address" 
                      secondary={operator.address} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Phone" 
                      secondary={operator.phone} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email" 
                      secondary={operator.email} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Map */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Location Map
                </Typography>
                <Box
                  id="operator-detail-map"
                  sx={{
                    height: 300,
                    width: '100%',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {!mapLoaded && (
                    <Typography color="text.secondary">
                      Loading map...
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MyOperators;
