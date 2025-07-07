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
                    <InputLabel>Assigned BD Executive</InputLabel>
                    <Select
                      value={formData.assignedTo}
                      onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                      label="Assigned BD Executive"
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
];

const emptyOperator = {
  id: '',
  name: '',
  latitude: '',
  longitude: '',
  contact: '',
  bdExecutive: '',
};

const BusOperators = () => {
  const [operators, setOperators] = useState(initialOperators);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedOperator, setSelectedOperator] = useState(emptyOperator);
  const [operatorToDelete, setOperatorToDelete] = useState(null);
  const [bdExecutives, setBdExecutives] = useState([]);

  useEffect(() => {
    // Fetch BD Executives from backend
    fetch('/api/bd-executives')
      .then(res => res.json())
      .then(data => setBdExecutives(data))
      .catch(() => setBdExecutives([]));
  }, []);

  const generateOperatorId = () => {
    // Generate a unique ID in the format OPXXX (incremental based on current max)
    const maxId = operators.reduce((max, op) => {
      const num = parseInt(op.id.replace('OP', ''), 10);
      return num > max ? num : max;
    }, 0);
    const nextId = maxId + 1;
    return `OP${nextId.toString().padStart(3, '0')}`;
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedOperator({ ...emptyOperator, id: generateOperatorId() });
    setModalOpen(true);
  };

  const handleOpenEditModal = (operator) => {
    setModalMode('edit');
    setSelectedOperator(operator);
    setModalOpen(true);
  };

  const handleOpenDeleteModal = (operator) => {
    setOperatorToDelete(operator);
    setDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOperator(emptyOperator);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setOperatorToDelete(null);
  };

  const handleChange = (e) => {
    setSelectedOperator({ ...selectedOperator, [e.target.name]: e.target.value });
  };

  const handleAddOperator = () => {
    setOperators([...operators, selectedOperator]);
    handleCloseModal();
  };

  const handleUpdateOperator = () => {
    setOperators(operators.map(op => op.id === selectedOperator.id ? selectedOperator : op));
    handleCloseModal();
  };

  const handleDeleteOperator = () => {
    setOperators(operators.filter(op => op.id !== operatorToDelete.id));
    handleCloseDeleteModal();
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Bus Operators</Typography>
          <Button variant="contained" color="primary" onClick={handleOpenAddModal}>
            Add Operator
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Latitude</TableCell>
                <TableCell>Longitude</TableCell>
                <TableCell>Contact Number</TableCell>
                <TableCell>BD Executive</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {operators.map((op) => (
                <TableRow key={op.id}>
                  <TableCell>{op.id}</TableCell>
                  <TableCell>{op.name}</TableCell>
                  <TableCell>{op.latitude}</TableCell>
                  <TableCell>{op.longitude}</TableCell>
                  <TableCell>{op.contact}</TableCell>
                  <TableCell>{op.bdExecutive}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenEditModal(op)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDeleteModal(op)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Modal */}
        <Dialog open={modalOpen} onClose={handleCloseModal}>
          <DialogTitle>{modalMode === 'add' ? 'Add Operator' : 'Edit Operator'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="ID"
              name="id"
              value={selectedOperator.id}
              onChange={handleChange}
              fullWidth
              disabled
            />
            <TextField
              margin="dense"
              label="Name"
              name="name"
              value={selectedOperator.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Latitude"
              name="latitude"
              value={selectedOperator.latitude}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Longitude"
              name="longitude"
              value={selectedOperator.longitude}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Contact Number"
              name="contact"
              value={selectedOperator.contact}
              onChange={handleChange}
              fullWidth
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="bd-executive-label">BD Executive</InputLabel>
              <Select
                labelId="bd-executive-label"
                name="bdExecutive"
                value={selectedOperator.bdExecutive}
                label="BD Executive"
                onChange={handleChange}
              >
                {bdExecutives.map((exec) => (
                  <MenuItem key={exec.id} value={exec.name}>{exec.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            {modalMode === 'add' ? (
              <Button onClick={handleAddOperator} variant="contained">Add Operator</Button>
            ) : (
              <Button onClick={handleUpdateOperator} variant="contained">Update</Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModalOpen} onClose={handleCloseDeleteModal}>
          <DialogTitle>Delete Operator</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete operator <b>{operatorToDelete?.name}</b>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteModal}>Cancel</Button>
            <Button onClick={handleDeleteOperator} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default BusOperators;
