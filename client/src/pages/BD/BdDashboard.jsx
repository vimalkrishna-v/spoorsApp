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
  Divider,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const BdDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  // Sample assigned bus operators - in a real app, these would come from the backend
  const [assignedOperators, setAssignedOperators] = useState([
    { id: 1, name: 'City Bus Lines', address: '123 Main St, Downtown', lastVisit: '2025-06-15' },
    { id: 2, name: 'Metro Transit', address: '456 Park Ave, Uptown', lastVisit: '2025-06-20' },
    { id: 3, name: 'Express Shuttle', address: '789 Broadway, Midtown', lastVisit: null }
  ]);

  useEffect(() => {
    // Get the user's current location when the dashboard loads
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
          setLocationError('Unable to access your location. Please enable location services.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleCheckIn = (operatorId) => {
    if (!location) {
      setLocationError('Location data is required for check-in.');
      return;
    }

    // In a real app, you would send this data to your backend
    alert(`Check-in with Operator ID: ${operatorId}\nLocation: ${location.latitude}, ${location.longitude}`);

    // Update the last visit date for the operator (in a real app, this would happen after API confirmation)
    setAssignedOperators(prev =>
      prev.map(op => op.id === operatorId ? {...op, lastVisit: new Date().toISOString().split('T')[0]} : op)
    );
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            BD Executive Dashboard
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
                  <List>
                    {assignedOperators.map((operator, index) => (
                      <React.Fragment key={operator.id}>
                        {index > 0 && <Divider />}
                        <ListItem
                          secondaryAction={
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleCheckIn(operator.id)}
                            >
                              Check In
                            </Button>
                          }
                        >
                          <ListItemText
                            primary={operator.name}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {operator.address}
                                </Typography>
                                <br />
                                {operator.lastVisit ? `Last visit: ${operator.lastVisit}` : 'Never visited'}
                              </>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Recent Check-ins" />
                <CardContent>
                  <List>
                    {assignedOperators
                      .filter(op => op.lastVisit)
                      .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
                      .slice(0, 3)
                      .map((operator) => (
                        <ListItem key={operator.id}>
                          <ListItemText
                            primary={operator.name}
                            secondary={`Visited on: ${operator.lastVisit}`}
                          />
                        </ListItem>
                      ))}
                    {assignedOperators.filter(op => op.lastVisit).length === 0 && (
                      <Typography variant="body2">No recent check-ins</Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default BdDashboard;
