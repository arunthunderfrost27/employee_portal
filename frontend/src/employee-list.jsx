import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeForm from './employee-form';
import { Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_BASE_URL = 'http://127.0.0.1:8000/employees';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_BASE_URL);
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.response?.data?.detail || 'Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        fetchEmployees();
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError(err.response?.data?.detail || 'Failed to delete employee');
      }
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedEmployee(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', padding: 2 }}>

      {employees.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50vh',
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            p: 4
          }}
        >
          <Typography variant="h6" gutterBottom>
            No Result Found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsDialogOpen(true)}
            sx={{ mt: 2 }}
          >
            Add Employee
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.age}</TableCell>
                  <TableCell>{employee.gender}</TableCell>
                  <TableCell>{employee.dob}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(employee)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(employee.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {isDialogOpen && (
        <EmployeeForm
          selectedEmployee={selectedEmployee}
          closeDialog={closeDialog}
          refreshEmployeeList={fetchEmployees}
        />
      )}
    </Box>
  );
};

export default EmployeeList;
