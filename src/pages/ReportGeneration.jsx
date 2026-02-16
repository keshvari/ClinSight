import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  NavigateBefore as BackIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Description as ReportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { generateEndoscopyReport, savePDF } from '../utils/pdfGenerator';

const ReportGeneration = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Check if we have all required data
    if (!state.patient.nationalCode || !state.settings.selectedImages?.length) {
      setError('Missing required data for report generation');
    }
  }, [state]);

  const generateReport = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      const reportData = {
        patient: state.patient,
        procedure: state.procedure,
        findings: state.findings,
        selectedImages: state.settings.selectedImages || [],
        reportTitle: state.procedure.reportTitle,
      };

      const pdfDoc = await generateEndoscopyReport(reportData);
      setPdfGenerated(true);
      setSuccess(true);
      
      // Auto-save the report
      await saveReport(pdfDoc);
      
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError(`Failed to generate report: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const saveReport = async (pdfDoc) => {
    try {
      if (!state.settings.archivePath || !state.patient.nationalCode) {
        throw new Error('Archive path or patient ID not available');
      }

      const fileName = `${state.procedure.reportTitle.replace(/\s+/g, '_')}_${state.patient.nationalCode}_${Date.now()}.pdf`;
      const filePath = `${state.settings.archivePath}/${state.patient.nationalCode}/${fileName}`;
      
      await savePDF(pdfDoc, filePath);
      
      return filePath;
    } catch (err) {
      console.error('Failed to save report:', err);
      setError(`Failed to save report: ${err.message}`);
      throw err;
    }
  };

  const handleDownload = async () => {
    try {
      if (!pdfGenerated) {
        await generateReport();
        return;
      }

      const reportData = {
        patient: state.patient,
        procedure: state.procedure,
        findings: state.findings,
        selectedImages: state.settings.selectedImages || [],
        reportTitle: state.procedure.reportTitle,
      };

      const pdfDoc = await generateEndoscopyReport(reportData);
      await saveReport(pdfDoc);
      
    } catch (err) {
      console.error('Failed to download report:', err);
      setError(`Failed to download report: ${err.message}`);
    }
  };

  const handleNewProcedure = () => {
    actions.resetState();
    navigate('/');
  };

  const handleGoBack = () => {
    navigate('/image-selection');
  };

  if (!state.patient.nationalCode) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          No patient data available. Please start a new procedure.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Report Generation
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Patient: {state.patient.firstName} {state.patient.lastName} ({state.patient.nationalCode})
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} icon={<SuccessIcon />}>
            Report generated successfully!
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Report Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Report Summary
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <ReportIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Report Type" 
                      secondary={state.procedure.reportTitle} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Patient ID" 
                      secondary={state.patient.nationalCode} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Images Selected" 
                      secondary={state.settings.selectedImages?.length || 0} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Procedure Date" 
                      secondary={state.procedure.date} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Practitioner" 
                      secondary={state.procedure.practitioner} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Findings Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Findings
                </Typography>
                
                <List dense>
                  {Object.entries(state.findings)
                    .filter(([key, value]) => key !== 'comment' && value && value !== 'Was normal')
                    .slice(0, 5)
                    .map(([key, value]) => (
                      <ListItem key={key}>
                        <ListItemText 
                          primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                          secondary={value} 
                        />
                      </ListItem>
                    ))}
                </List>
                
                {Object.values(state.findings).filter(v => v && v !== 'Was normal').length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    All findings were normal
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              {generating ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography>Generating report...</Typography>
                </Box>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<BackIcon />}
                    onClick={handleGoBack}
                  >
                    Back to Images
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    disabled={!state.settings.selectedImages?.length}
                  >
                    {pdfGenerated ? 'Download Report' : 'Generate & Download'}
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleNewProcedure}
                  >
                    New Procedure
                  </Button>
                </>
              )}
            </Box>
          </Grid>

          {/* Selected Images Preview */}
          {state.settings.selectedImages?.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Selected Images ({state.settings.selectedImages.length})
              </Typography>
              
              <Grid container spacing={2}>
                {state.settings.selectedImages.slice(0, 6).map((image, index) => (
                  <Grid item xs={6} sm={4} md={2} key={image.id}>
                    <Card>
                      <Box
                        component="img"
                        src={image.src}
                        alt={image.name}
                        sx={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover',
                        }}
                      />
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="caption" noWrap>
                          Image {index + 1}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                
                {state.settings.selectedImages.length > 6 && (
                  <Grid item xs={6} sm={4} md={2}>
                    <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        +{state.settings.selectedImages.length - 6} more
                      </Typography>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Success Dialog */}
      <Dialog open={success} onClose={() => setSuccess(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SuccessIcon color="success" />
            Report Generated Successfully
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Your endoscopy report has been generated and saved to the archive directory.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccess(false)}>Close</Button>
          <Button variant="contained" onClick={handleNewProcedure}>
            Start New Procedure
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportGeneration;




