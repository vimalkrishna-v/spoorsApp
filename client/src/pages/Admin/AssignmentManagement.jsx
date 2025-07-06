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
  CardHeader,
  Checkbox,
  ListItemText,
  OutlinedInput
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
      
      // Group operators by assigned user for easy display
      const assignmentMap = {};
      operatorsResponse.data.forEach(operator => {
        const userId = operator.assignedTo._id;
        if (!assignmentMap[userId]) {
          assignmentMap[userId] = {
            user: operator.assignedTo,
            operators: []
          };
        }
        assignmentMap[userId].operators.push(operator);
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
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton onClick={() => navigate('/admin/dashboard')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
              Assignment Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AssignmentIcon />}
              onClick={handleOpenDialog}
              sx={{ ml: 2 }}
            >
              Assign Operators
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

          {/* Current Assignments */}
          <Card>
            <CardHeader title="Current Operator Assignments" />
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {Object.keys(assignments).length === 0 ? (
                    <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
                      No assignments found
                    </Typography>
                  ) : (
                    Object.entries(assignments).map(([userId, assignment]) => (
                      <Card key={userId} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                        <CardHeader
                          title={`BD User: ${assignment.user.email}`}
                          subheader={`${assignment.operators.length} operators assigned`}
                          sx={{ bgcolor: '#f5f5f5' }}
                        />
                        <CardContent>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Operator Name</TableCell>
                                  <TableCell>Contact Person</TableCell>
                                  <TableCell>Phone</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Last Visit</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {assignment.operators.map((operator) => (
                                  <TableRow key={operator._id}>
                                    <TableCell>{operator.name}</TableCell>
                                    <TableCell>{operator.contactPerson}</TableCell>
                                    <TableCell>{operator.phone}</TableCell>
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
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Assignment Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>Assign Operators to BD User</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select BD User</InputLabel>
                  <Select
                    value={selectedBDUser}
                    onChange={(e) => setSelectedBDUser(e.target.value)}
                    label="Select BD User"
                  >
                    {bdUsers.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Operators</InputLabel>
                  <Select
                    multiple
                    value={selectedOperators}
                    onChange={handleOperatorSelectionChange}
                    input={<OutlinedInput label="Select Operators" />}
                    renderValue={(selected) => {
                      const selectedNames = operators
                        .filter(op => selected.includes(op._id))
                        .map(op => op.name);
                      return selectedNames.join(', ');
                    }}
                    MenuProps={MenuProps}
                  >
                    {getUnassignedOperators().map((operator) => (
                      <MenuItem key={operator._id} value={operator._id}>
                        <Checkbox checked={selectedOperators.indexOf(operator._id) > -1} />
                        <ListItemText 
                          primary={operator.name}
                          secondary={`Contact: ${operator.contactPerson} | Current: ${operator.assignedTo.email}`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedBDUser && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Note: Selected operators will be reassigned to the chosen BD user.
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained">
                Assign Operators
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </>
  );
};

export default AssignmentManagement;
