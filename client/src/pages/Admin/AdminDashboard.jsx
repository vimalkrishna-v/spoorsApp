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
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
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
                Welcome, {currentUser.email}
              </Typography>
              <Button variant="outlined" color="primary" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader 
                  title="Manage BD Users" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    Create, update, and manage Business Development user accounts.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate('/admin/bd-users')}
                    sx={{ mt: 'auto' }}
                  >
                    Manage BD Users
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader 
                  title="Bus Operators" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    Add, edit, or remove bus operators from the system.
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate('/admin/bus-operators')}
                    sx={{ mt: 'auto' }}
                  >
                    Manage Bus Operators
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader 
                  title="Operator Assignments" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    Assign bus operators to BD executives and manage assignments.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate('/admin/assignments')}
                    sx={{ mt: 'auto' }}
                  >
                    Manage Assignments
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader 
                  title="Reports & Analytics" 
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    View reports of all check-ins and system analytics.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    disabled
                    sx={{ mt: 'auto' }}
                  >
                    View Reports (Coming Soon)
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
