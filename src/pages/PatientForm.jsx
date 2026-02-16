import React from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Grid,
  Alert,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext.jsx';
import { useForm, Controller } from 'react-hook-form';

const PatientForm = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [showAlert, setShowAlert] = React.useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      nationalCode: state.patient.nationalCode,
      firstName: state.patient.firstName,
      lastName: state.patient.lastName,
      age: state.patient.age,
      gender: state.patient.gender,
      practitioner: state.procedure.practitioner,
      date: state.procedure.date ? dayjs(state.procedure.date) : null,
    },
  });

  const onSubmit = (data) => {
    if (!data.nationalCode.trim()) {
      setShowAlert(true);
      return;
    }

    // Update patient and procedure data
    actions.updatePatient({
      nationalCode: data.nationalCode,
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      gender: data.gender,
    });

    actions.updateProcedure({
      practitioner: data.practitioner,
      date: data.date ? dayjs(data.date).format('YYYY-MM-DD') : '',
    });

    // Navigate to recording page
    navigate('/recording');
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Patient Information
        </Typography>

        {showAlert && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setShowAlert(false)}>
            Please enter patient ID.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Patient ID and Gender */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Controller
                name="nationalCode"
                control={control}
                rules={{ required: 'Patient ID is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Patient ID *"
                    error={!!errors.nationalCode}
                    helperText={errors.nationalCode?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Sex</FormLabel>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel value="Male" control={<Radio />} label="Male" />
                      <FormControlLabel value="Female" control={<Radio />} label="Female" />
                    </RadioGroup>
                  )}
                />
              </FormControl>
            </Grid>

            {/* Name fields */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} fullWidth label="Last Name" />
                    )}
                  />
                </Grid>
                <Grid size={6}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} fullWidth label="First Name" />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="age"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Age" type="number" />
                )}
              />
            </Grid>

            {/* Procedure Information */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>
                Procedure Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="practitioner"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Practitioner" />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Procedure Date"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>

            {/* Submit Button */}
            <Grid size={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  Start Procedure
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PatientForm;



