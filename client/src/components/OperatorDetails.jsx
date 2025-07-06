import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Close,
  LocationOn,
  Phone,
  Email,
  DirectionsBus,
  Person,
  CheckCircle,
  Cancel,
  Navigation
} from '@mui/icons-material';

const OperatorDetails = ({ open, onClose, operator, subOperators }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  // Default coordinates - in real app, these would come from backend
  const getOperatorCoordinates = (operatorId) => {
    const coordinates = {
      1: { lat: 40.7128, lng: -74.0060 }, // New York City
      2: { lat: 40.7589, lng: -73.9851 }, // Times Square
      3: { lat: 40.6892, lng: -74.0445 }  // Statue of Liberty
    };
    return coordinates[operatorId] || { lat: 40.7128, lng: -74.0060 };
  };

  const getSubOperatorCoordinates = (subOperatorId) => {
    // Generate random coordinates around the main operator for demo
    const baseCoords = getOperatorCoordinates(operator?.id);
    return {
      lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
      lng: baseCoords.lng + (Math.random() - 0.5) * 0.02
    };
  };

  useEffect(() => {
    if (open && operator) {
      // For demo purposes, we'll use a simple map placeholder
      // In production, you would load Google Maps API here
      setMapLoaded(true);
    }
  }, [open, operator]);

  useEffect(() => {
    if (mapLoaded && operator) {
      initializeMap();
    }
  }, [mapLoaded, operator]);

  const initializeMap = () => {
    // Simple map placeholder for demo
    // In production, this would initialize Google Maps
    const mapContainer = document.getElementById('operator-map');
    if (!mapContainer) return;

    // Create a simple map representation
    const operatorCoords = getOperatorCoordinates(operator.id);
    
    // For demo purposes, we'll create a visual representation
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
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 10px;
        ">
          <h3 style="margin: 0 0 10px 0; color: #1976d2;">📍 ${operator.name}</h3>
          <p style="margin: 0; color: #666; font-size: 14px;">
            Location: ${operatorCoords.lat.toFixed(6)}, ${operatorCoords.lng.toFixed(6)}
          </p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
            ${operator.address}
          </p>
        </div>
        <div style="
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        ">
          ${subOperators && subOperators.map(subOp => `
            <div style="
              background: ${subOp.status === 'On Route' ? '#4caf50' : 
                          subOp.status === 'At Stop' ? '#ff9800' : '#f44336'};
              color: white;
              padding: 8px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            ">
              🚌 ${subOp.busNumber}
            </div>
          `).join('') || ''}
        </div>
        <p style="margin: 15px 0 0 0; color: #666; font-size: 11px;">
          🟢 Active | 🟡 At Stop | 🔴 Maintenance
        </p>
      </div>
    `;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on route':
        return 'success';
      case 'at stop':
        return 'warning';
      case 'maintenance':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOperatorStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  if (!operator) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        style: {
          minHeight: '80vh',
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
                
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between">
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {operator.totalBuses}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Buses
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary">
                      {operator.activeRoutes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Routes
                    </Typography>
                  </Box>
                </Box>
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
                  id="operator-map"
                  sx={{
                    height: 400,
                    width: '100%',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {!mapLoaded ? (
                    <Typography color="text.secondary">
                      Loading map...
                    </Typography>
                  ) : null}
                </Box>
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    📍 Blue: Main Operator | 🟢 Green: Active Bus | 🟡 Yellow: At Stop | 🔴 Red: Maintenance
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sub-operators (Buses) */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Buses Under This Operator ({subOperators?.length || 0})
                </Typography>
                <Grid container spacing={2}>
                  {subOperators && subOperators.length > 0 ? (
                    subOperators.map((subOp) => (
                      <Grid item xs={12} md={6} lg={4} key={subOp.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                              <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                                <DirectionsBus />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1">
                                  {subOp.busNumber}
                                </Typography>
                                <Chip 
                                  label={subOp.status} 
                                  color={getStatusColor(subOp.status)}
                                  size="small"
                                />
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              <strong>Route:</strong> {subOp.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              <strong>Driver:</strong> {subOp.driverName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              <strong>Location:</strong> {subOp.currentLocation}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              <strong>Passengers:</strong> {subOp.passengerCount}/{subOp.maxCapacity}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              <strong>Phone:</strong> {subOp.phone}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Last update: {new Date(subOp.lastUpdate).toLocaleString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography color="text.secondary" textAlign="center">
                        No buses found for this operator
                      </Typography>
                    </Grid>
                  )}
                </Grid>
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

export default OperatorDetails;
