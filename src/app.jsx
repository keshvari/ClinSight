import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AppProvider } from './contexts/AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import PatientForm from './pages/PatientForm.jsx';
import RecordingPage from './pages/RecordingPage.jsx';
import ImageSelection from './pages/ImageSelection.jsx';
import ReportGeneration from './pages/ReportGeneration.jsx';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
          <Routes>
            <Route path="/" element={<PatientForm />} />
            <Route path="/recording" element={<RecordingPage />} />
            <Route path="/image-selection" element={<ImageSelection />} />
            <Route path="/report" element={<ReportGeneration />} />
          </Routes>
        </Box>
      </Box>
    </AppProvider>
    </LocalizationProvider>
  );
}

export default App;