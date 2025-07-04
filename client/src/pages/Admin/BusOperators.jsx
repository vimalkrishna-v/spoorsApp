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
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from '../../components/Navbar';

const emptyOperator = {
  _id: '',
  name: '',
  address: '',
  contactPerson: '',
  phone: '',
  email: '',
  latitude: '',
  longitude: '',
  bdExecutive: '', // will store BD _id
};

const BusOperators = () => {
  const [operators, setOperators] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedOperator, setSelectedOperator] = useState(emptyOperator);
  const [operatorToDelete, setOperatorToDelete] = useState(null);
  const [bdExecutives, setBdExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOperators();
    fetchBDs();
    // eslint-disable-next-line
  }, []);

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/operators', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOperators(data.data || []);
      } else {
        setOperators([]);
      }
    } catch {
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBDs = async () => {
    try {
      const res = await fetch('/api/users/bd', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBdExecutives(data.data || []);
    } catch {
      setBdExecutives([]);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedOperator({ ...emptyOperator });
    setModalOpen(true);
  };

  const handleOpenEditModal = (operator) => {
    setModalMode('edit');
    setSelectedOperator({
      ...operator,
      latitude: operator.coordinates?.lat || '',
      longitude: operator.coordinates?.lng || '',
      bdExecutive: operator.assignedTo?._id || '',
    });
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

  const handleAddOperator = async () => {
    setSaving(true);
    const payload = {
      name: selectedOperator.name,
      address: selectedOperator.address,
      contactPerson: selectedOperator.contactPerson,
      phone: selectedOperator.phone,
      email: selectedOperator.email,
      coordinates: {
        lat: parseFloat(selectedOperator.latitude),
        lng: parseFloat(selectedOperator.longitude)
      },
      assignedTo: selectedOperator.bdExecutive
    };
    try {
      const res = await fetch('/api/operators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setOperators([...operators, data.data]);
        handleCloseModal();
      } else {
        alert(data.message || 'Failed to add operator');
      }
    } catch (err) {
      alert('Failed to add operator');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOperator = async () => {
    setSaving(true);
    const payload = {
      name: selectedOperator.name,
      address: selectedOperator.address,
      contactPerson: selectedOperator.contactPerson,
      phone: selectedOperator.phone,
      email: selectedOperator.email,
      coordinates: {
        lat: parseFloat(selectedOperator.latitude),
        lng: parseFloat(selectedOperator.longitude)
      },
      assignedTo: selectedOperator.bdExecutive
    };
    try {
      const res = await fetch(`/api/operators/${selectedOperator._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setOperators(operators.map(op => op._id === data.data._id ? data.data : op));
        handleCloseModal();
      } else {
        alert(data.message || 'Failed to update operator');
      }
    } catch (err) {
      alert('Failed to update operator');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOperator = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/operators/${operatorToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOperators(operators.filter(op => op._id !== operatorToDelete._id));
        handleCloseDeleteModal();
      } else {
        alert(data.message || 'Failed to delete operator');
      }
    } catch (err) {
      alert('Failed to delete operator');
    } finally {
      setSaving(false);
    }
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
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Latitude</TableCell>
                  <TableCell>Longitude</TableCell>
                  <TableCell>BD Executive</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operators.map((op) => (
                  <TableRow key={op._id}>
                    <TableCell>{op.name}</TableCell>
                    <TableCell>{op.address}</TableCell>
                    <TableCell>{op.contactPerson}</TableCell>
                    <TableCell>{op.phone}</TableCell>
                    <TableCell>{op.email}</TableCell>
                    <TableCell>{op.coordinates?.lat}</TableCell>
                    <TableCell>{op.coordinates?.lng}</TableCell>
                    <TableCell>{op.assignedTo?.email}</TableCell>
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
        )}

        {/* Add/Edit Modal */}
        <Dialog open={modalOpen} onClose={handleCloseModal}>
          <DialogTitle>{modalMode === 'add' ? 'Add Operator' : 'Edit Operator'}</DialogTitle>
          <DialogContent>
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
              label="Address"
              name="address"
              value={selectedOperator.address}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Contact Person"
              name="contactPerson"
              value={selectedOperator.contactPerson}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Phone"
              name="phone"
              value={selectedOperator.phone}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Email"
              name="email"
              value={selectedOperator.email}
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
                  <MenuItem key={exec._id} value={exec._id}>{exec.email}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            {modalMode === 'add' ? (
              <Button onClick={handleAddOperator} variant="contained" disabled={saving}>Add Operator</Button>
            ) : (
              <Button onClick={handleUpdateOperator} variant="contained" disabled={saving}>Update</Button>
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
            <Button onClick={handleDeleteOperator} color="error" variant="contained" disabled={saving}>Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default BusOperators;
