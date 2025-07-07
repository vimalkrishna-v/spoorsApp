import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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

          {/* Use flexbox for equal-width cards, but arrange as 2, 2, 1 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.8, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'center' }}>
              {/* First row: 2 cards */}
              {[0, 1].map((idx) => (
                <Box key={idx} sx={{ flex: '0 1 572px', maxWidth: 572, minWidth: 400, display: 'flex' }}>
                  {(() => {
                    switch (idx) {
                      case 0:
                        return (
                          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', boxShadow: 3, borderRadius: 2 }}>
                            <CardHeader title="Manage BD Executives" titleTypographyProps={{ variant: 'h6' }} />
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" color="textSecondary" paragraph>
                                Create and manage Business Development Executives Accounts.
                              </Typography>
                              <Button variant="contained" color="primary" onClick={() => navigate('/admin/bd-users')} sx={{ mt: 'auto' }}>
                                Manage BD Executives
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      case 1:
                        return (
                          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', boxShadow: 3, borderRadius: 2 }}>
                            <CardHeader title="Bus Operators" titleTypographyProps={{ variant: 'h6' }} />
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" color="textSecondary" paragraph>
                                Add, edit, or remove bus operators from the system.
                              </Typography>
                              <Button variant="contained" color="secondary" onClick={() => navigate('/admin/bus-operators')} sx={{ mt: 'auto' }}>
                                Manage Bus Operators
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      default:
                        return null;
                    }
                  })()}
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'center' }}>
              {/* Second row: 2 cards */}
              {[2, 3].map((idx) => (
                <Box key={idx} sx={{ flex: '0 1 572px', maxWidth: 572, minWidth: 400, display: 'flex' }}>
                  {(() => {
                    switch (idx) {
                      case 2:
                        return (
                          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', boxShadow: 3, borderRadius: 2 }}>
                            <CardHeader title="Operator Assignments" titleTypographyProps={{ variant: 'h6' }} />
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" color="textSecondary" paragraph>
                                Assign bus operators to BD executives and manage assignments.
                              </Typography>
                              <Button variant="contained" color="primary" onClick={() => navigate('/admin/assignments')} sx={{ mt: 'auto' }}>
                                Manage Assignments
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      case 3:
                        return (
                          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', boxShadow: 3, borderRadius: 2 }}>
                            <CardHeader title="Check-In Management" titleTypographyProps={{ variant: 'h6' }} />
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" color="textSecondary" paragraph>
                                Monitor BD user check-ins, location tracking, and session analytics.
                              </Typography>
                              <Button variant="contained" color="primary" onClick={() => navigate('/admin/checkins')} sx={{ mt: 'auto' }}>
                                Manage Check-Ins
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      default:
                        return null;
                    }
                  })()}
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 16, width: '100%', justifyContent: 'flex-start' }}>
              {/* Third row: 1 card, left aligned */}
              <Box sx={{ flex: '0 1 548px', maxWidth: 572, minWidth: 400, display: 'flex' }}>
                <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', boxShadow: 3, borderRadius: 2 }}>
                  <CardHeader title="Reports & Analytics" titleTypographyProps={{ variant: 'h6' }} />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" color="textSecondary" paragraph>
                      View comprehensive reports and system analytics.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => navigate('/admin/analytics')} sx={{ mt: 'auto' }}>
                      View Reports & Analytics
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default AdminDashboard;
