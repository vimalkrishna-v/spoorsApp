import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Container,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Switch
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { userApiService } from '../../services/adminApiService';

const BDUsersManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    isActive: true
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApiService.getAllBDUsers();
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load BD Executives');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      isActive: true
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.email || (!editingUser && !formData.password)) {
        setError('Email and password are required');
        return;
      }

      const userData = { ...formData };
      if (editingUser && !formData.password) {
        delete userData.password; // Don't update password if not provided
      }

      if (editingUser) {
        await userApiService.updateBDUser(editingUser._id, userData);
        setSuccess('User updated successfully');
      } else {
        await userApiService.createBDUser(userData);
        setSuccess('User created successfully');
      }

      handleCloseDialog();
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
      console.error('Error saving user:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userApiService.deleteBDUser(userId);
      setSuccess('User deleted successfully');
      loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorData = err.response?.data;
      
      if (errorData?.assignedOperatorsCount > 0) {
        setError(`${errorData.message} (${errorData.assignedOperatorsCount} operators assigned)`);
      } else {
        setError(errorData?.message || 'Failed to delete user');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Box my={4}>
          <Card>
            <Box display="flex" flexDirection="column" px={3} pt={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" component="div">
                  BD Executives Management
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => { setEditingUser(null); setFormData({ email: '', password: '', isActive: true }); setOpenDialog(true); }}
                >
                  Add BD Executive
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Manage BD Executives and their details.
              </Typography>
            </Box>
            <CardContent>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Last Login</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user, idx) => (
                        <TableRow key={user._id} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                          <TableCell sx={{ fontWeight: 500 }}>{user.email}</TableCell>
                          <TableCell>
                            <Chip label={user.isActive ? 'Active' : 'Inactive'} color={user.isActive ? 'success' : 'default'} size="small" />
                          </TableCell>
                          <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : '-'}</TableCell>
                          <TableCell>{user.createdAt ? formatDate(user.createdAt) : '-'}</TableCell>
                          <TableCell>
                            <IconButton color="primary" onClick={() => { setEditingUser(user); setFormData({ email: user.email, password: '', isActive: user.isActive }); setOpenDialog(true); }}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDelete(user._id)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingUser ? 'Edit BD Executive' : 'Add BD Executive'}</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                fullWidth
                label="Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                disabled={!!editingUser}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? 'Leave blank to keep unchanged' : ''}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingUser ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default BDUsersManagement;
