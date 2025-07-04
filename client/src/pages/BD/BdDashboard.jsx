import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Alert,
  Card,
  CardContent,
  Grid,
  Avatar
} from '@mui/material';
import { 
  Person,
  LocationOn
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const BdDashboard = () => {
  const { currentUser } = useAuth();
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

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

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          {/* Welcome Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main', 
                fontSize: '2rem',
                mx: 'auto',
                mb: 2
              }}
            >
              {currentUser?.name?.[0] || currentUser?.email?.[0] || 'U'}
            </Avatar>
            <Typography variant="h3" component="h1" gutterBottom>
              Hello, {currentUser?.name || currentUser?.email || 'User'}!
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Welcome to your BD Executive Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {formatDate()} • {formatTime()}
            </Typography>
          </Box>

          {/* Status Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Person sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6">
                        BD Executive
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Role: Business Development Executive
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6">
                        Location Status
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {location ? 
                          `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 
                          'Location not available'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Location Error Alert */}
          {locationError && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {locationError}
            </Alert>
          )}

          {/* Instructions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Start Guide
              </Typography>
              <Typography variant="body1" paragraph>
                • Click on <strong>"My Operators"</strong> in the navigation menu to view and manage your assigned bus operators
              </Typography>
              <Typography variant="body1" paragraph>
                • Use the <strong>"Check-in"</strong> feature to record your visits to operator locations
              </Typography>
              <Typography variant="body1" paragraph>
                • View your <strong>"History"</strong> to track your past activities and check-ins
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use the navigation menu above to access all available features.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  );
};

export default BdDashboard;
