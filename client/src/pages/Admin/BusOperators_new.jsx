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
        <Box my={4}>
          <Card>
            <CardHeader
              title={<Typography variant="h6">Bus Operators</Typography>}
              subheader={<Typography variant="body2">Manage all bus operators, assign BD Executives, and edit operator details.</Typography>}
                           action={
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{ minWidth: 160 }}
                >
                  Add Operator
                </Button>
              }
              sx={{ textAlign: 'left', pl: 3 }}
            />
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
                        <TableCell>Name</TableCell>
                        <TableCell>Address</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Coordinates</TableCell>
                        <TableCell>Assigned BD Executive</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {operators.map((op, idx) => (
                        <TableRow key={op._id} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                          <TableCell>{op.name}</TableCell>
                          <TableCell>{op.address}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{op.contactPerson}</Typography>
                            <Typography variant="caption" color="text.secondary">{op.phone}</Typography>
                            <Typography variant="caption" color="text.secondary">{op.email}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">Lat: {op.coordinates?.lat}</Typography>
                            <Typography variant="body2">Lng: {op.coordinates?.lng}</Typography>
                          </TableCell>
                          <TableCell>
                            {op.assignedTo ? (
                              <Chip label={op.assignedTo.email} color="primary" variant="outlined" />
                            ) : (
                              <Typography variant="body2" color="text.secondary">Unassigned</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip label={op.status.charAt(0).toUpperCase() + op.status.slice(1)} color={op.status === 'active' ? 'success' : 'default'} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton color="primary" onClick={() => handleOpenDialog(op)}><EditIcon /></IconButton>
                            <IconButton color="error" onClick={() => handleDelete(op._id)}><DeleteIcon /></IconButton>
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
        {/* Add/Edit Operator Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingOperator ? 'Edit Operator' : 'Add Operator'}</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} fullWidth required size="small" />
              <TextField label="Address" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} fullWidth required size="small" />
              <TextField label="Contact Person" value={formData.contactPerson} onChange={e => handleInputChange('contactPerson', e.target.value)} fullWidth required size="small" />
              <TextField label="Phone" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} fullWidth required size="small" />
              <TextField label="Email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} fullWidth required size="small" />
              <Box display="flex" gap={2}>
                <TextField label="Latitude" value={formData.coordinates.lat} onChange={e => handleInputChange('coordinates.lat', e.target.value)} required size="small" fullWidth />
                <TextField label="Longitude" value={formData.coordinates.lng} onChange={e => handleInputChange('coordinates.lng', e.target.value)} required size="small" fullWidth />
              </Box>
              <FormControl fullWidth required size="small">
                <InputLabel id="assignedTo-label">Assigned BD Executive</InputLabel>
                <Select
                  labelId="assignedTo-label"
                  value={formData.assignedTo}
                  label="Assigned BD Executive"
                  onChange={e => handleInputChange('assignedTo', e.target.value)}
                >
                  {bdUsers.map(user => (
                    <MenuItem key={user._id} value={user._id}>{user.email}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={formData.status}
                  label="Status"
                  onChange={e => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingOperator ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default BusOperators;
