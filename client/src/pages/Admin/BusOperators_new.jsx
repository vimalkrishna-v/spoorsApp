import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
  Container,
  Card,
  CardContent,
  CardHeader,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { adminOperatorApiService, userApiService } from '../../services/adminApiService';

const BusOperators = () => {
  const navigate = useNavigate();
  const [operators, setOperators] = useState([]);
  const [bdUsers, setBdUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    coordinates: {
      lat: '',
      lng: ''
    },
    assignedTo: '',
    status: 'active'
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [operatorsResponse, usersResponse] = await Promise.all([
        adminOperatorApiService.getAllOperators(),
        userApiService.getAllBDUsers()
      ]);
      setOperators(operatorsResponse.data);
      setBdUsers(usersResponse.data);
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (operator = null) => {
    if (operator) {
      setEditingOperator(operator);
      setFormData({
        name: operator.name,
        address: operator.address,
        contactPerson: operator.contactPerson,
        phone: operator.phone,
        email: operator.email,
        coordinates: {
          lat: operator.coordinates.lat.toString(),
          lng: operator.coordinates.lng.toString()
        },
        assignedTo: operator.assignedTo._id,
        status: operator.status
      });
    } else {
      setEditingOperator(null);
      setFormData({
        name: '',
        address: '',
        contactPerson: '',
        phone: '',
        email: '',
        coordinates: {
          lat: '',
          lng: ''
        },
        assignedTo: '',
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOperator(null);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.address || !formData.contactPerson || 
          !formData.phone || !formData.email || !formData.coordinates.lat || 
          !formData.coordinates.lng || !formData.assignedTo) {
        setError('All fields are required');
        return;
      }

      const operatorData = {
        ...formData,
        coordinates: {
          lat: parseFloat(formData.coordinates.lat),
          lng: parseFloat(formData.coordinates.lng)
        }
      };

      if (editingOperator) {
        await adminOperatorApiService.updateOperator(editingOperator._id, operatorData);
        setSuccess('Operator updated successfully');
      } else {
        await adminOperatorApiService.createOperator(operatorData);
        setSuccess('Operator created successfully');
      }

      handleCloseDialog();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save operator');
      console.error('Error saving operator:', err);
    }
  };

  const handleDelete = async (operatorId) => {
    if (!window.confirm('Are you sure you want to delete this operator?')) {
      return;
    }

    try {
      await adminOperatorApiService.deleteOperator(operatorId);
      setSuccess('Operator deleted successfully');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete operator');
      console.error('Error deleting operator:', err);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton onClick={() => navigate('/admin/dashboard')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
              Bus Operators Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ ml: 2 }}
            >
              Add Operator
            </Button>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Operators Table */}
          <Card>
            <CardHeader title="Bus Operators" />
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Contact Person</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Assigned To</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Last Visit</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {operators.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            No operators found
                          </TableCell>
                        </TableRow>
                      ) : (
                        operators.map((operator) => (
                          <TableRow key={operator._id}>
                            <TableCell>{operator.name}</TableCell>
                            <TableCell>{operator.contactPerson}</TableCell>
                            <TableCell>{operator.phone}</TableCell>
                            <TableCell>{operator.email}</TableCell>
                            <TableCell>{operator.assignedTo?.email || 'Unassigned'}</TableCell>
                            <TableCell>
                              <Chip
                                label={operator.status}
                                color={getStatusColor(operator.status)}
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>
                              {operator.lastVisit ? formatDate(operator.lastVisit) : 'Never'}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                onClick={() => handleOpenDialog(operator)}
                                color="primary"
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDelete(operator._id)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Add/Edit Operator Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              {editingOperator ? 'Edit Operator' : 'Add New Operator'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Operator Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Contact Person"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    required
                  />
                </Box>
                
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  margin="normal"
                  multiline
                  rows={2}
                  required
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={formData.coordinates.lat}
                    onChange={(e) => handleInputChange('coordinates.lat', e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={formData.coordinates.lng}
                    onChange={(e) => handleInputChange('coordinates.lng', e.target.value)}
                    required
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Assigned BD User</InputLabel>
                    <Select
                      value={formData.assignedTo}
                      onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                      label="Assigned BD User"
                      required
                    >
                      {bdUsers.map((user) => (
                        <MenuItem key={user._id} value={user._id}>
                          {user.email}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained">
                {editingOperator ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </>
  );
};

export default BusOperators;
