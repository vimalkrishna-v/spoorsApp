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
  List,
  ListItem,
  Container,
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from '../../components/Navbar';
import Chip from '@mui/material/Chip';
import { userApiService } from '../../services/adminApiService';
import AssignmentIcon from '@mui/icons-material/Assignment';

const BdExecutives = () => {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedExecutive, setSelectedExecutive] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    contact: '',
    assignedOperators: [],
    lastLogin: '',
    createdAt: '',
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [executiveToDelete, setExecutiveToDelete] = useState(null);

  useEffect(() => {
    loadExecutives();
  }, []);

  const loadExecutives = async () => {
    try {
      setLoading(true);
      const res = await userApiService.getAllBDUsers();
      // Map backend fields to frontend expected fields
      const bdUsers = (res.data || res).map((user, idx) => ({
        id: user._id,
        name: user.name || '',
        email: user.email,
        password: '', // never expose password
        contact: user.contact || '',
        assignedOperators: user.assignedOperators || [],
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        isActive: user.isActive,
      }));
      setExecutives(bdUsers);
      setError('');
    } catch (err) {
      setError('Failed to load BD Executives');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedExecutive({
      id: '',
      name: '',
      email: '',
      password: '',
      contact: '',
      assignedOperators: [],
      lastLogin: '',
      createdAt: '',
    });
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
    setSelectedExecutive({
      id: '',
      name: '',
      email: '',
      password: '',
      contact: '',
      assignedOperators: [],
      lastLogin: '',
      createdAt: '',
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setExecutiveToDelete(null);
  };

  const handleChange = (e) => {
    setSelectedExecutive({ ...selectedExecutive, [e.target.name]: e.target.value });
  };

  const handleAddExecutive = async () => {
    try {
      const res = await userApiService.createBDUser(selectedExecutive);
      setExecutives([...executives, { ...selectedExecutive, id: res.data._id }]);
      handleCloseModal();
    } catch (err) {
      setError('Failed to add BD Executive');
    }
  };

  const handleUpdateExecutive = async () => {
    try {
      await userApiService.updateBDUser(selectedExecutive.id, selectedExecutive);
      setExecutives(executives.map(ex => ex.id === selectedExecutive.id ? selectedExecutive : ex));
      handleCloseModal();
    } catch (err) {
      setError('Failed to update BD Executive');
    }
  };

  const handleDeleteExecutive = async () => {
    try {
      await userApiService.deleteBDUser(executiveToDelete.id);
      setExecutives(executives.filter(ex => ex.id !== executiveToDelete.id));
      handleCloseDeleteModal();
    } catch (err) {
      setError('Failed to delete BD Executive');
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg">
        <Box my={4}>
          <Card>
            <Box display="flex" alignItems="center" justifyContent="space-between" px={3} pt={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <AssignmentIcon color="primary" />
                <Box>
                  <Typography variant="h6" component="div">
                    BD Executives
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create, edit, and manage Business Development Executives.
                  </Typography>
                </Box>
              </Box>
              <Button variant="contained" color="primary" onClick={handleOpenAddModal}>
                Add BD Executive
              </Button>
            </Box>
            <CardContent>
              {loading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Password</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Assigned Operators</TableCell>
                        <TableCell>Last Login</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {executives.map((ex, idx) => (
                        <TableRow key={ex.id} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                          <TableCell sx={{ fontWeight: 500 }}>{ex.id}</TableCell>
                          <TableCell>{ex.name}</TableCell>
                          <TableCell>{ex.email}</TableCell>
                          <TableCell>{ex.password}</TableCell>
                          <TableCell>{ex.contact}</TableCell>
                          <TableCell>
                            {ex.assignedOperators.length ? (
                              <Box display="flex" flexWrap="wrap" gap={1}>
                                {ex.assignedOperators.map(opId => (
                                  <Chip key={opId} label={opId} color="primary" variant="outlined" size="small" />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">No operators assigned</Typography>
                            )}
                          </TableCell>
                          <TableCell>{new Date(ex.lastLogin).toLocaleString()}</TableCell>
                          <TableCell>{new Date(ex.createdAt).toLocaleString()}</TableCell>
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
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>

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
    </>
  );
};

export default BdExecutives;
