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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from '../../components/Navbar';

const initialOperators = [
  {
    id: 'OP001',
    name: 'ABC Travels',
    latitude: '12.9716',
    longitude: '77.5946',
    contact: '9876543210',
    bdExecutive: 'John Doe',
  },
  {
    id: 'OP002',
    name: 'XYZ Bus Lines',
    latitude: '13.0827',
    longitude: '80.2707',
    contact: '9123456780',
    bdExecutive: 'Jane Smith',
  },
  {
    id: 'OP003',
    name: 'Metro Travels',
    latitude: '17.3850',
    longitude: '78.4867',
    contact: '9988776655',
    bdExecutive: 'Emily Johnson',
  },
  {
    id: 'OP004',
    name: 'CityLink',
    latitude: '19.0760',
    longitude: '72.8777',
    contact: '9876501234',
    bdExecutive: 'Michael Brown',
  },
  {
    id: 'OP005',
    name: 'GreenLine',
    latitude: '22.5726',
    longitude: '88.3639',
    contact: '9001122334',
    bdExecutive: 'Jessica Davis',
  },
  {
    id: 'OP006',
    name: 'SuperFast',
    latitude: '23.0225',
    longitude: '72.5714',
    contact: '9090909090',
    bdExecutive: 'William Garcia',
  },
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
