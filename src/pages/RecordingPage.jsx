import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Alert,
  Badge,
  Card,
  CardContent,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CameraAlt as CameraIcon,
  NavigateNext as NextIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useScreenRecording } from '../hooks/useScreenRecording';

const RecordingPage = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [showFindingsDialog, setShowFindingsDialog] = useState(false);
  const [findings, setFindings] = useState(state.findings);

  const {
    isRecording,
    stream,
    snapshots,
    snapshotCount,
    error,
    videoRef,
    startRecording,
    stopRecording,
    takeSnapshot,
    saveVideo,
    saveSnapshot,
    cleanup,
  } = useScreenRecording();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && !isRecording) {
        takeSnapshot();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRecording, takeSnapshot]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const handleStopRecording = async () => {
    try {
      stopRecording();
      
      // Save video and snapshots
      if (state.settings.archivePath && state.patient.nationalCode) {
        const filePath = `${state.settings.archivePath}/${state.patient.nationalCode}`;
        
        // Save video
        const videoFileName = `Video.webm`;
        await saveVideo(`${filePath}/${videoFileName}`);
        
        // Save snapshots
        for (const snapshot of snapshots) {
          const imageFileName = `${snapshot.id}.jpeg`;
          await saveSnapshot(snapshot, `${filePath}/${imageFileName}`);
        }
      }
      
      setShowFindingsDialog(true);
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const handleFinishProcedure = () => {
    // Update findings in context
    actions.updateFindings(findings);
    
    // Navigate to image selection
    navigate('/image-selection');
  };

  const handleDeleteSnapshot = (snapshotId) => {
    // This would need to be implemented in the hook
    console.log('Delete snapshot:', snapshotId);
  };

  const handleFindingsChange = (field, value) => {
    setFindings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!state.patient.nationalCode) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          Please enter patient information first.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Recording Session
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Patient: {state.patient.firstName} {state.patient.lastName} ({state.patient.nationalCode})
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Video Preview */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, backgroundColor: '#000' }}>
              <Box sx={{ position: 'relative' }}>
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '400px',
                  }}
                  autoPlay
                  muted
                  playsInline
                />
                
                <Badge
                  badgeContent={snapshotCount}
                  color="secondary"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                  }}
                >
                  <Typography variant="h6" color="white">
                    Snapshots
                  </Typography>
                </Badge>
              </Box>
            </Paper>
          </Grid>

          {/* Controls */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                color={isRecording ? 'error' : 'primary'}
                size="large"
                startIcon={isRecording ? <StopIcon /> : <StartIcon />}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                fullWidth
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<CameraIcon />}
                onClick={takeSnapshot}
                disabled={!stream}
                fullWidth
              >
                Take Snapshot
              </Button>

              <Typography variant="caption" color="text.secondary">
                Press Enter to take a snapshot
              </Typography>
            </Box>
          </Grid>

          {/* Snapshots Preview */}
          {snapshots.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Captured Images ({snapshots.length})
              </Typography>
              <Grid container spacing={2}>
                {snapshots.map((snapshot) => (
                  <Grid item xs={6} sm={4} md={3} key={snapshot.id}>
                    <Card>
                      <Box sx={{ position: 'relative' }}>
                        <img
                          src={snapshot.dataURL}
                          alt={`Snapshot ${snapshot.id}`}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                          }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          }}
                          onClick={() => handleDeleteSnapshot(snapshot.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="caption">
                          Time: {snapshot.currentTime.toFixed(1)}s
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>

        {/* Floating Action Button for Next Step */}
        {!isRecording && snapshots.length > 0 && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
            onClick={() => setShowFindingsDialog(true)}
          >
            <NextIcon />
          </Fab>
        )}
      </Paper>

      {/* Findings Dialog */}
      <Dialog
        open={showFindingsDialog}
        onClose={() => setShowFindingsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Procedure Findings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {Object.entries(findings).map(([key, value]) => (
              <Grid item xs={12} key={key}>
                <TextField
                  fullWidth
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  value={value}
                  onChange={(e) => handleFindingsChange(key, e.target.value)}
                  multiline={key === 'comment'}
                  rows={key === 'comment' ? 3 : 1}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFindingsDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleFinishProcedure}
          >
            Continue to Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RecordingPage;




