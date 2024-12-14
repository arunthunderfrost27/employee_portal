import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import EmployeeList from './employee-list';
import HomePage from './home';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/employee_list" element={<EmployeeList />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;