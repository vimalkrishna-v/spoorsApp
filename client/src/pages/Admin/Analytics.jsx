import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Assessment,
  CheckCircle,
  Warning,
  AccessTime
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import { adminCheckInApiService } from '../../services/adminApiService';

const AnalyticsCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
  <Card sx={{ width: '100%', boxShadow: 3 }}>
    <CardContent>
      <Box display="flex" alignItems="center">
        <Avatar sx={{ bgcolor: `${color}.main`, mr: 2, width: 32, height: 32 }}>
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

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminCheckInApiService.getAnalytics(30);
      setAnalytics(response.data);
    } catch (error) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <>
      <Navbar />
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" mb={3} sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Analytics Dashboard
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Box textAlign="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            analytics && (
              <Box width="100%">
                {/* Summary Cards */}
                <Box display="flex" width="100%" gap={3} mb={4} flexWrap="wrap">
                  <Box flex={1} minWidth={220}>
                    <AnalyticsCard
                      title="Total Sessions"
                      value={analytics.bdPerformance?.length || 0}
                      subtitle="Last 30 days"
                      icon={<Assessment />}
                      color="primary"
                    />
                  </Box>
                  <Box flex={1} minWidth={220}>
                    <AnalyticsCard
                      title="Completed Sessions"
                      value={analytics.bdPerformance?.reduce((sum, bd) => sum + bd.completedSessions, 0) || 0}
                      subtitle="Successfully completed"
                      icon={<CheckCircle />}
                      color="success"
                    />
                  </Box>
                  <Box flex={1} minWidth={220}>
                    <AnalyticsCard
                      title="Auto-Checkouts"
                      value={analytics.bdPerformance?.reduce((sum, bd) => sum + bd.autoCheckouts, 0) || 0}
                      subtitle="Policy violations"
                      icon={<Warning />}
                      color="warning"
                    />
                  </Box>
                  <Box flex={1} minWidth={220}>
                    <AnalyticsCard
                      title="Avg Duration"
                      value={`${Math.round(analytics.bdPerformance?.reduce((sum, bd) => sum + bd.averageDuration, 0) / (analytics.bdPerformance?.length || 1))}m`}
                      subtitle="Per session"
                      icon={<AccessTime />}
                      color="info"
                    />
                  </Box>
                </Box>
                {/* BD User Performance Table */}
                <Card sx={{ boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                      Top 10 BD User Performance
                    </Typography>
                    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'grey.100' }}>
                            <TableCell sx={{ fontWeight: 600 }}>BD User</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Sessions</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Completed</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Violations</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Completion Rate</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analytics.bdPerformance?.slice(0, 10).map((bd) => (
                            <TableRow key={bd._id} hover>
                              <TableCell>{bd.email || 'N/A'}</TableCell>
                              <TableCell align="right">{bd.totalSessions || 0}</TableCell>
                              <TableCell align="right">{bd.completedSessions || 0}</TableCell>
                              <TableCell align="right">{bd.autoCheckouts || 0}</TableCell>
                              <TableCell align="right">
                                {bd.totalSessions ? `${Math.round((bd.completedSessions / bd.totalSessions) * 100)}%` : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>
            )
          )}
        </Box>
      </Container>
    </>
  );
};

export default Analytics;
