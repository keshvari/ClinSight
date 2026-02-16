import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

// Initial state
const initialState = {
  patient: {
    nationalCode: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: 'Male',
  },
  procedure: {
    date: new Date().toISOString().split('T')[0],
    practitioner: 'Dr.',
    reportTitle: 'Colonoscopy Report',
  },
  recording: {
    isRecording: false,
    stream: null,
    recordedChunks: [],
    snapshots: [],
    videoPath: null,
  },
  findings: {
    retroFlex: 'Was normal',
    rectum: 'Was normal',
    rectosigmoidJunction: 'Was normal',
    sigmoid: 'Was normal',
    descendingColon: 'Was normal',
    transverseColon: 'Was normal',
    hepaticFlexure: 'Was normal',
    ascendingColon: 'Was normal',
    cecum: 'Was normal',
    diagnosis: 'Was normal',
    comment: '',
  },
  settings: {
    userDataPath: '',
    archivePath: '',
    selectedImages: new Map(),
  },
  ui: {
    currentPage: 'patient-form',
    loading: false,
    error: null,
  },
};

// Action types
const ActionTypes = {
  UPDATE_PATIENT: 'UPDATE_PATIENT',
  UPDATE_PROCEDURE: 'UPDATE_PROCEDURE',
  UPDATE_RECORDING: 'UPDATE_RECORDING',
  UPDATE_FINDINGS: 'UPDATE_FINDINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_UI: 'UPDATE_UI',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET_STATE: 'RESET_STATE',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_PATIENT:
      return {
        ...state,
        patient: { ...state.patient, ...action.payload },
      };
    case ActionTypes.UPDATE_PROCEDURE:
      return {
        ...state,
        procedure: { ...state.procedure, ...action.payload },
      };
    case ActionTypes.UPDATE_RECORDING:
      return {
        ...state,
        recording: { ...state.recording, ...action.payload },
      };
    case ActionTypes.UPDATE_FINDINGS:
      return {
        ...state,
        findings: { ...state.findings, ...action.payload },
      };
    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case ActionTypes.UPDATE_UI:
      return {
        ...state,
        ui: { ...state.ui, ...action.payload },
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload },
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        ui: { ...state.ui, error: action.payload },
      };
    case ActionTypes.RESET_STATE:
      return initialState;
    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    updatePatient: (patientData) => 
      dispatch({ type: ActionTypes.UPDATE_PATIENT, payload: patientData }),
    
    updateProcedure: (procedureData) => 
      dispatch({ type: ActionTypes.UPDATE_PROCEDURE, payload: procedureData }),
    
    updateRecording: (recordingData) => 
      dispatch({ type: ActionTypes.UPDATE_RECORDING, payload: recordingData }),
    
    updateFindings: (findingsData) => 
      dispatch({ type: ActionTypes.UPDATE_FINDINGS, payload: findingsData }),
    
    updateSettings: (settingsData) => 
      dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settingsData }),
    
    updateUI: (uiData) => 
      dispatch({ type: ActionTypes.UPDATE_UI, payload: uiData }),
    
    setLoading: (loading) => 
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => 
      dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    
    resetState: () => 
      dispatch({ type: ActionTypes.RESET_STATE }),
  };

  const value = {
    state,
    actions,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;



