import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { AppProvider } from './contexts/AppContext';
import Navbar from './components/Navbar';
import PatientForm from './pages/PatientForm';
import RecordingPage from './pages/RecordingPage';
import ImageSelection from './pages/ImageSelection';
import ReportGeneration from './pages/ReportGeneration';

function App() {
  return (
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
  );
}

export default App;