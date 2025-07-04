import React, { useState } from 'react';
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
  List,
  ListItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from '../../components/Navbar';

const initialExecutives = [
  {
    id: 'BD001',
    name: 'John Doe',
    email: 'john.doe@spoorsapp.com',
    password: 'bd1234',
    contact: '9876543210',
    assignedOperators: ['OP001', 'OP002'],
  },
  {
    id: 'BD002',
    name: 'Jane Smith',
    email: 'jane.smith@spoorsapp.com',
    password: 'bd5678',
    contact: '9123456780',
    assignedOperators: ['OP003'],
  },
  {
    id: 'BD003',
    name: 'Amit Kumar',
    email: 'amit.kumar@spoorsapp.com',
    password: 'bd9999',
    contact: '9988776655',
    assignedOperators: [],
  },
];

const emptyExecutive = {
  id: '',
  name: '',
  email: '',
  password: '',
  contact: '',
  assignedOperators: [],
};

const generateExecutiveId = (executives) => {
  const maxId = executives.reduce((max, ex) => {
    const num = parseInt(ex.id.replace('BD', ''), 10);
    return num > max ? num : max;
  }, 0);
  const nextId = maxId + 1;
  return `BD${nextId.toString().padStart(3, '0')}`;
};

const BdExecutives = () => {
  const [executives, setExecutives] = useState(initialExecutives);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedExecutive, setSelectedExecutive] = useState(emptyExecutive);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [executiveToDelete, setExecutiveToDelete] = useState(null);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedExecutive({ ...emptyExecutive, id: generateExecutiveId(executives) });
    setModalOpen(true);
  };

  const handleOpenEditModal = (executive) => {
    setModalMode('edit');
    setSelectedExecutive(executive);
    setModalOpen(true);
  };

  const handleOpenDeleteModal = (executive) => {
    setExecutiveToDelete(executive);
    setDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedExecutive(emptyExecutive);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setExecutiveToDelete(null);
  };

  const handleChange = (e) => {
    setSelectedExecutive({ ...selectedExecutive, [e.target.name]: e.target.value });
  };

  const handleAddExecutive = () => {
    setExecutives([...executives, selectedExecutive]);
    handleCloseModal();
  };

  const handleUpdateExecutive = () => {
    setExecutives(executives.map(ex => ex.id === selectedExecutive.id ? selectedExecutive : ex));
    handleCloseModal();
  };

  const handleDeleteExecutive = () => {
    setExecutives(executives.filter(ex => ex.id !== executiveToDelete.id));
    handleCloseDeleteModal();
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">BD Executives</Typography>
          <Button variant="contained" color="primary" onClick={handleOpenAddModal}>
            Add BD Executive
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Password</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Assigned Operators</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {executives.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell>{ex.id}</TableCell>
                  <TableCell>{ex.name}</TableCell>
                  <TableCell>{ex.email}</TableCell>
                  <TableCell>{ex.password}</TableCell>
                  <TableCell>{ex.contact}</TableCell>
                  <TableCell>
                    <List dense>
                      {ex.assignedOperators.length === 0 ? (
                        <ListItem>-</ListItem>
                      ) : (
                        ex.assignedOperators.map(opId => (
                          <ListItem key={opId}>{opId}</ListItem>
                        ))
                      )}
                    </List>
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenEditModal(ex)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDeleteModal(ex)}>
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
          <DialogTitle>{modalMode === 'add' ? 'Add BD Executive' : 'Edit BD Executive'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="ID"
              name="id"
              value={selectedExecutive.id}
              onChange={handleChange}
              fullWidth
              disabled
            />
            <TextField
              margin="dense"
              label="Name"
              name="name"
              value={selectedExecutive.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Email"
              name="email"
              value={selectedExecutive.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Password"
              name="password"
              value={selectedExecutive.password}
              onChange={handleChange}
              fullWidth
              type="password"
            />
            <TextField
              margin="dense"
              label="Contact"
              name="contact"
              value={selectedExecutive.contact}
              onChange={handleChange}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            {modalMode === 'add' ? (
              <Button onClick={handleAddExecutive} variant="contained">Add BD Executive</Button>
            ) : (
              <Button onClick={handleUpdateExecutive} variant="contained">Update</Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModalOpen} onClose={handleCloseDeleteModal}>
          <DialogTitle>Delete BD Executive</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete BD Executive <b>{executiveToDelete?.name}</b>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteModal}>Cancel</Button>
            <Button onClick={handleDeleteExecutive} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default BdExecutives;

