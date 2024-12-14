import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, Alert } from '@mui/material';
import axios from 'axios';

const Base_url = 'http://127.0.0.1:8000/employees';

const EmployeeForm = ({ selectedEmployee, closeDialog, refreshEmployeeList }) => {
  const [formData, setFormData] = useState({ name: '', gender: '', age: '', dob: '', department: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (selectedEmployee) {
      const [day, month, year] = selectedEmployee.dob.split('-');
      setFormData({
        name: selectedEmployee.name,
        gender: selectedEmployee.gender,
        age: selectedEmployee.age.toString(),
        dob: `${year}-${month}-${day}`,
        department: selectedEmployee.department
      });
    }
  }, [selectedEmployee]);

  const formatDateForBackend = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'dob' && value) {
        const calculatedAge = calculateAge(value);
        return { ...newData, age: calculatedAge.toString() };
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const { name, age, dob, department, gender } = formData;
    if (!name || !age || !dob || !department || !gender) {
      setError('All fields are required.');
      return;
    }
    const calculatedAge = calculateAge(dob);
    if (parseInt(age) !== calculatedAge) {
      setError(`Age doesn't match with date of birth. Calculated age is ${calculatedAge}`);
      return;
    }
    if (parseInt(age) <= 18 || parseInt(age) > 60) {
      setError('Age must be between 18 and 60.');
      return;
    }

    try {
      const cleanedFormData = {
        name: name.trim(),
        age: parseInt(age),
        gender: gender.trim(),
        dob: formatDateForBackend(dob),
        department: department.trim(),
      };
      
      if (selectedEmployee) {
        await axios.put(`${Base_url}/${selectedEmployee.id}`, cleanedFormData);
        setSuccess('Employee updated successfully!');
      } else {
        await axios.post(Base_url, cleanedFormData);
        setSuccess('Employee added successfully!');
      }
      
      refreshEmployeeList();
      
      // First wait for 3 seconds to show the success message
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Then close the dialog
      closeDialog();
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save employee');
    }
  };

  return (
    <Dialog open={true} onClose={closeDialog} maxWidth="sm" fullWidth>
      <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>

      <DialogContent sx={{ mb: 4 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField 
            fullWidth 
            label="Name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            sx={{ mt: 2 }} 
          />
          
          <TextField 
            fullWidth 
            type="date" 
            label="Date of Birth" 
            name="dob" 
            value={formData.dob} 
            onChange={handleChange} 
            InputLabelProps={{ shrink: true }} 
            inputProps={{ max: new Date().toISOString().split('T')[0] }} 
            sx={{ mt: 2 }} 
          />
          
          <TextField 
            fullWidth 
            label="Age" 
            name="age" 
            value={formData.age} 
            onChange={handleChange} 
            disabled 
            sx={{ mt: 2 }} 
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Gender</InputLabel>
            <Select 
              name="gender" 
              value={formData.gender} 
              label="Gender" 
              onChange={handleChange}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField 
            fullWidth 
            label="Department" 
            name="department" 
            value={formData.department} 
            onChange={handleChange} 
            sx={{ mt: 2 }} 
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={closeDialog} 
              sx={{ mt: 2 }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
            >
              {selectedEmployee ? 'Update' : 'Add'} Employee
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeForm;