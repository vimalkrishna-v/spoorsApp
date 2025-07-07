import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Paper,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { userApiService, adminOperatorApiService } from '../../services/adminApiService';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const AssignmentManagement = () => {
  const navigate = useNavigate();
  const [bdUsers, setBdUsers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBDUser, setSelectedBDUser] = useState('');
  const [selectedOperators, setSelectedOperators] = useState([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, operatorsResponse] = await Promise.all([
        userApiService.getAllBDUsers(),
        adminOperatorApiService.getAllOperators()
      ]);
      
      setBdUsers(usersResponse.data);
      setOperators(operatorsResponse.data);
      
      // Map each BD user to their assigned operators
      const assignmentMap = {};
      usersResponse.data.forEach(user => {
        assignmentMap[user._id] = [];
      });
      operatorsResponse.data.forEach(operator => {
        if (operator.assignedTo && assignmentMap[operator.assignedTo._id]) {
          assignmentMap[operator.assignedTo._id].push(operator);
        }
      });
      setAssignments(assignmentMap);
      
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setSelectedBDUser('');
    setSelectedOperators([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBDUser('');
    setSelectedOperators([]);
  };

  const handleOperatorSelectionChange = (event) => {
    const value = event.target.value;
    setSelectedOperators(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedBDUser || selectedOperators.length === 0) {
        setError('Please select a BD user and at least one operator');
        return;
      }

      await userApiService.assignOperatorsToBD(selectedBDUser, selectedOperators);
      setSuccess('Operators assigned successfully');
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign operators');
      console.error('Error assigning operators:', err);
    }
  };

  const getUnassignedOperators = () => {
    return operators.filter(operator => 
      !selectedBDUser || operator.assignedTo._id !== selectedBDUser
    );
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
      <Container maxWidth="lg">
        <Box my={4}>
          <Card>
            <Box display="flex" alignItems="center" justifyContent="space-between" px={3} pt={2}>
              <Box display="flex" alignItems="center" gap={1}>
{/*                 <AssignmentIcon color="primary" /> */}
                <Box>
                  <Typography variant="h6" component="div">
                    Operator Assignments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assign bus operators to BD Executives.
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenDialog(true)}
                startIcon={<AssignmentIcon />}
              >
                Assign Operators
              </Button>
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
                        <TableCell>BD Executive</TableCell>
                        <TableCell>Assigned Operators</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bdUsers.map((user, idx) => (
                        <TableRow key={user._id} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white' }}>
                          <TableCell sx={{ fontWeight: 500 }}>{user.email}</TableCell>
                          <TableCell>
                            {assignments[user._id]?.length ? (
                              <Box display="flex" flexWrap="wrap" gap={1}>
                                {assignments[user._id].map((op) => (
                                  <Chip key={op._id} label={op.name} color="primary" variant="outlined" />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">No operators assigned</Typography>
                            )}
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
        {/* Assignment Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Operators to BD Executive</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="bd-user-label">BD Executive</InputLabel>
              <Select
                labelId="bd-user-label"
                value={selectedBDUser}
                onChange={e => setSelectedBDUser(e.target.value)}
                input={<OutlinedInput label="BD Executive" />}
              >
                {bdUsers.map(user => (
                  <MenuItem key={user._id} value={user._id}>{user.email}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="operator-label">Operators</InputLabel>
              <Select
                labelId="operator-label"
                multiple
                value={selectedOperators}
                onChange={e => setSelectedOperators(e.target.value)}
                input={<OutlinedInput label="Operators" />}
                renderValue={selected =>
                  operators
                    .filter(op => selected.includes(op._id))
                    .map(op => op.name)
                    .join(', ')
                }
                MenuProps={MenuProps}
              >
                {operators.map(op => (
                  <MenuItem key={op._id} value={op._id}>
                    <Checkbox checked={selectedOperators.indexOf(op._id) > -1} />
                    <ListItemText primary={op.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
            <Button
              onClick={async () => {
                try {
                  if (!selectedBDUser || selectedOperators.length === 0) {
                    setError('Please select a BD user and at least one operator');
                    return;
                  }

                  await userApiService.assignOperatorsToBD(selectedBDUser, selectedOperators);
                  setSuccess('Operators assigned successfully');
                  setOpenDialog(false);
                  loadData();
                } catch (err) {
                  setError(err.response?.data?.message || 'Failed to assign operators');
                  console.error('Error assigning operators:', err);
                }
              }}
              variant="contained"
              color="primary"
              disabled={!selectedBDUser || selectedOperators.length === 0}
            >
              Assign
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AssignmentManagement;
