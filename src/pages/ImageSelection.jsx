import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  CheckCircle as SelectedIcon,
  RadioButtonUnchecked as UnselectedIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const ImageSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, actions } = useApp();
  
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [reportTitle, setReportTitle] = useState(state.procedure.reportTitle);
  const [comment, setComment] = useState(state.findings.comment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load images from the recording session or USB
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        if (location.state?.fromUsb) {
          // Load images from USB path
          await loadImagesFromUSB(location.state.usbPath);
        } else {
          // Load images from recording session
          await loadImagesFromSession();
        }
      } catch (err) {
        setError(`Failed to load images: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [location.state]);

  const loadImagesFromUSB = async (usbPath) => {
    try {
      const { ipcRenderer } = window.require('electron');
      const fs = window.require('fs');
      
      // Read directory contents
      const files = await fs.promises.readdir(usbPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      );

      const imageData = imageFiles.map((file, index) => ({
        id: index,
        name: file,
        path: `${usbPath}/${file}`,
        src: `file://${usbPath}/${file}`,
        timestamp: Date.now() + index,
      }));

      setImages(imageData);
    } catch (err) {
      throw new Error(`Failed to read USB directory: ${err.message}`);
    }
  };

  const loadImagesFromSession = async () => {
    try {
      if (!state.recording.snapshots || state.recording.snapshots.length === 0) {
        throw new Error('No snapshots available from recording session');
      }

      const imageData = state.recording.snapshots.map(snapshot => ({
        id: snapshot.id,
        name: `snapshot_${snapshot.id}.jpeg`,
        path: snapshot.dataURL,
        src: snapshot.dataURL,
        timestamp: snapshot.timestamp,
        currentTime: snapshot.currentTime,
      }));

      setImages(imageData);
    } catch (err) {
      throw new Error(`Failed to load session images: ${err.message}`);
    }
  };

  const handleImageSelect = (imageId) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img.id)));
    }
  };

  const handleContinue = () => {
    // Update context with selected images and report data
    const selectedImageData = images.filter(img => selectedImages.has(img.id));
    
    actions.updateSettings({
      selectedImages: selectedImageData,
    });
    
    actions.updateProcedure({
      reportTitle,
    });
    
    actions.updateFindings({
      comment,
    });

    // Navigate to report generation
    navigate('/report');
  };

  const handleGoBack = () => {
    navigate('/recording');
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 2, textAlign: 'center' }}>
          <Typography>Loading images...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Image Selection
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportTitle}
                label="Report Type"
                onChange={(e) => setReportTitle(e.target.value)}
              >
                <MenuItem value="Colonoscopy Report">Colonoscopy Report</MenuItem>
                <MenuItem value="Endoscopy Report">Endoscopy Report</MenuItem>
                <MenuItem value="Rectosigmoidoscopy Report">Rectosigmoidoscopy Report</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Patient: {state.patient.firstName} {state.patient.lastName} ({state.patient.nationalCode})
        </Typography>

        {/* Selection Controls */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleSelectAll}
          >
            {selectedImages.size === images.length ? 'Deselect All' : 'Select All'}
          </Button>
          
          <Typography variant="body2" color="text.secondary">
            {selectedImages.size} of {images.length} images selected
          </Typography>
        </Box>

        {/* Images Grid */}
        <Grid container spacing={2}>
          {images.map((image) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
              <Card
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  border: selectedImages.has(image.id) ? 2 : 1,
                  borderColor: selectedImages.has(image.id) ? 'primary.main' : 'grey.300',
                }}
                onClick={() => handleImageSelect(image.id)}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.src}
                    alt={image.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '50%',
                    }}
                  >
                    {selectedImages.has(image.id) ? (
                      <SelectedIcon color="primary" />
                    ) : (
                      <UnselectedIcon color="disabled" />
                    )}
                  </Box>
                </Box>
                
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="caption" noWrap>
                    {image.name}
                  </Typography>
                  {image.currentTime && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Time: {image.currentTime.toFixed(1)}s
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {images.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No images available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please record a session or import images from USB
            </Typography>
          </Box>
        )}

        {/* Comment Section */}
        <Box sx={{ mt: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Procedure Comments"
            placeholder="Enter any procedure comments here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={handleGoBack}
          >
            Back to Recording
          </Button>
          
          <Button
            variant="contained"
            endIcon={<NextIcon />}
            onClick={handleContinue}
            disabled={selectedImages.size === 0}
          >
            Generate Report ({selectedImages.size} images)
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ImageSelection;




