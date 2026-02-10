import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ImportExport as ImportIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSettings = async () => {
    try {
      actions.setLoading(true);
      const { ipcRenderer } = window.require('electron');
      const userDataPath = await ipcRenderer.invoke('get-user-data-path');
      const archivePath = await ipcRenderer.invoke('get-archive-path', userDataPath);
      
      if (archivePath) {
        actions.updateSettings({ archivePath });
      }
    } catch (error) {
      actions.setError('Failed to set archive path');
    } finally {
      actions.setLoading(false);
      handleMenuClose();
    }
  };

  const handleImportFromUSB = async () => {
    try {
      actions.setLoading(true);
      const { ipcRenderer, dialog } = window.require('electron');
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Import from USB'
      });
      
      if (!result.canceled) {
        // Navigate to image selection with USB data
        navigate('/image-selection', { 
          state: { 
            fromUsb: true, 
            usbPath: result.filePaths[0] 
          } 
        });
      }
    } catch (error) {
      actions.setError('Failed to import from USB');
    } finally {
      actions.setLoading(false);
      handleMenuClose();
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <FlagIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Endoscopy Report System
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<SettingsIcon />}
            onClick={handleSettings}
          >
            Settings
          </Button>
          
          <Button
            color="inherit"
            startIcon={<ImportIcon />}
            onClick={handleImportFromUSB}
          >
            Import from USB
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;



