import { useState, useRef, useCallback, useEffect } from 'react';

export const useScreenRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [error, setError] = useState(null);
  const [snapshotCount, setSnapshotCount] = useState(0);

  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const canvasIdRef = useRef(0);

  // Initialize camera stream
  const initializeStream = useCallback(async () => {
    try {
      setError(null);
      
      // Try to get the specific capture device (from original code)
      const devices = await navigator.mediaDevices.enumerateDevices();
      const captureCard = devices.filter(device => 
        device.kind === 'videoinput' && 
        device.label.match(/^FaceTime/) !== null
      );

      const constraints = {
        audio: false,
        video: {
          deviceId: captureCard.length > 0 ? captureCard[0].deviceId : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      return mediaStream;
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(`Failed to access camera: ${err.message}`);
      throw err;
    }
  }, []);

  // Attach stream to video element after state updates (avoids re-render interrupting play)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err) => console.error('Video play failed:', err));
    }
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  // Start recording
  const startRecording = useCallback(async () => {
    setError(null);
    setIsRecording(true); // Optimistic update so button flips immediately on first click
    try {
      const mediaStream = stream || await initializeStream();

      const options = {
        mimeType: 'video/webm; codecs="avc1.64001E"'
      };

      const recorder = new MediaRecorder(mediaStream, options);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        console.log('Recording stopped');
      };

      recorder.start();
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(`Failed to start recording: ${err.message}`);
      setIsRecording(false); // Revert on failure
    }
  }, [stream, initializeStream]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Take snapshot
  const takeSnapshot = useCallback(async () => {
    try {
      if (!videoRef.current || !stream) {
        throw new Error('No video stream available');
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const context = canvas.getContext('2d');

      // Draw video frame to canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const dataURL = canvas.toDataURL('image/jpeg', 1.0);
      const base64Data = dataURL.replace(/^data:image\/jpeg;base64,/, '');

      const snapshot = {
        id: canvasIdRef.current++,
        dataURL,
        base64Data,
        timestamp: Date.now(),
        currentTime: videoRef.current?.currentTime || 0,
      };

      setSnapshots(prev => [...prev, snapshot]);
      setSnapshotCount(prev => prev + 1);

      // Play camera shutter sound if available
      try {
        const { ipcRenderer } = window.require('electron');
        const userDataPath = await ipcRenderer.invoke('get-user-data-path');
        const soundPath = `${userDataPath}/camera-shutter-click-03.wav`;
        const audio = new Audio(soundPath);
        await audio.play();
      } catch (audioError) {
        console.warn('Could not play shutter sound:', audioError);
      }

      return snapshot;
    } catch (err) {
      console.error('Error taking snapshot:', err);
      setError(`Failed to take snapshot: ${err.message}`);
    }
  }, [stream]);

  // Save video file
  const saveVideo = useCallback(async (filePath) => {
    try {
      if (recordedChunks.length === 0) {
        throw new Error('No recorded data available');
      }

      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('save-video', { filePath, buffer });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      console.error('Error saving video:', err);
      setError(`Failed to save video: ${err.message}`);
      throw err;
    }
  }, [recordedChunks]);

  // Save snapshot image
  const saveSnapshot = useCallback(async (snapshot, filePath) => {
    try {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('save-image', { 
        filePath, 
        base64Data: snapshot.base64Data 
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      console.error('Error saving snapshot:', err);
      setError(`Failed to save snapshot: ${err.message}`);
      throw err;
    }
  }, []);

  // Cleanup - stops stream, clears video, resets state
  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
    setRecordedChunks([]);
    setSnapshots([]);
    setSnapshotCount(0);
    setError(null);
    canvasIdRef.current = 0;
  }, [stream]);

  // Cleanup only on unmount (not when stream/cleanup changes - that was resetting isRecording)
  const cleanupRef = useRef(cleanup);
  cleanupRef.current = cleanup;
  useEffect(() => {
    return () => {
      cleanupRef.current();
    };
  }, []);

  return {
    // State
    isRecording,
    stream,
    recordedChunks,
    snapshots,
    snapshotCount,
    error,
    
    // Refs
    videoRef,
    
    // Actions
    initializeStream,
    startRecording,
    stopRecording,
    takeSnapshot,
    saveVideo,
    saveSnapshot,
    cleanup,
  };
};



