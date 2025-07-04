import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Admin Dashboard
            </Typography>

            <Box>
              <Typography variant="subtitle1" sx={{ mr: 2, display: 'inline' }}>
                Welcome, {currentUser.name}
              </Typography>
              <Button variant="outlined" color="primary" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Manage BD Executives" />
                <CardContent>
                  <Typography variant="body1">
                    Create, update, and manage Business Development executive accounts.
                  </Typography>
                  <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    Manage Executives
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Bus Operators" />
                <CardContent>
                  <Typography variant="body1">
                    Add, edit, or remove bus operators from the system.
                  </Typography>
                  <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    Manage Operators
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Assignments" />
                <CardContent>
                  <Typography variant="body1">
                    Assign bus operators to BD executives.
                  </Typography>
                  <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    Manage Assignments
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Check-in Reports" />
                <CardContent>
                  <Typography variant="body1">
                    View reports of all check-ins by BD executives.
                  </Typography>
                  <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default AdminDashboard;
