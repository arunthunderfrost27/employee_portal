import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, TableContainer, Table, TableHead, TableBody,
   TableRow, TableCell, Paper, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import EmployeeForm from './employee-form';

const API_BASE_URL = 'http://127.0.0.1:8000/employees';

const HomePage = () => {
    const [employees, setEmployees] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [error, setError] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) return dateString;
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        }
        return dateString;
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            setEmployees(response.data);
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError('Failed to fetch employees');
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDeleteEmployee = async (employeeId) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await axios.delete(`${API_BASE_URL}/${employeeId}`);
                fetchEmployees();
                setSelectedEmployee(null);
            } catch (err) {
                console.error('Error deleting employee:', err);
                setError('Failed to delete employee');
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Employee Database Portal
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setSelectedEmployee(null);
                        setIsDialogOpen(true);
                    }}
                >
                    Add Employee
                </Button>
            </Box>

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            {employees.length === 0 ? (
                <Typography sx={{ mb: 3 }}>No Result Found</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell align="center">Age</TableCell>
                                <TableCell align="center">Gender</TableCell>
                                <TableCell align="center">Date of Birth</TableCell>
                                <TableCell align="center">Department</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {employees.map((employee) => (
                                <TableRow
                                    key={employee.id}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>{employee.name}</TableCell>
                                    <TableCell align="center">{employee.age}</TableCell>
                                    <TableCell align="center">{employee.gender}</TableCell>
                                    <TableCell align="center">{formatDate(employee.dob)}</TableCell>
                                    <TableCell align="center">{employee.department}</TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={() => {
                                                setSelectedEmployee(employee);
                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteEmployee(employee.id)}
                                        >
                                            <Delete />
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
                    closeDialog={() => {
                        setIsDialogOpen(false);
                        setSelectedEmployee(null);
                    }}
                    refreshEmployeeList={fetchEmployees}
                />
            )}
        </Box>
    );
};

export default HomePage;
