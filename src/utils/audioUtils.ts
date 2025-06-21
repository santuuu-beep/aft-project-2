// Audio utility functions for voice processing

export const checkMediaRecorderSupport = (): boolean => {
  return typeof MediaRecorder !== 'undefined' && 
         navigator.mediaDevices && 
         navigator.mediaDevices.getUserMedia;
};

export const getOptimalAudioConfig = () => {
  // Test supported mime types in order of preference for Google Speech API
  const preferredTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/mpeg'
  ];
  
  let selectedMimeType = 'audio/webm'; // fallback
  
  for (const type of preferredTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      selectedMimeType = type;
      break;
    }
  }
  
  // Map browser mime types to Google Speech API encoding formats
  if (selectedMimeType.includes('webm') && selectedMimeType.includes('opus')) {
    return {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      mimeType: selectedMimeType
    };
  } else if (selectedMimeType.includes('webm')) {
    // WebM without explicit opus codec - still likely opus
    return {
      encoding: 'WEBM_OPUS', 
      sampleRateHertz: 48000,
      mimeType: selectedMimeType
    };
  } else if (selectedMimeType.includes('ogg')) {
    return {
      encoding: 'OGG_OPUS',
      sampleRateHertz: 48000,
      mimeType: selectedMimeType
    };
  } else if (selectedMimeType.includes('mp4')) {
    // MP4 container typically uses AAC, but Google Speech API expects specific formats
    // Use LINEAR16 as a more compatible option
    return {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      mimeType: selectedMimeType
    };
  } else if (selectedMimeType.includes('mpeg')) {
    // MPEG audio - use MP3 encoding
    return {
      encoding: 'MP3',
      sampleRateHertz: 16000,
      mimeType: selectedMimeType
    };
  }
  
  // Default fallback - WEBM_OPUS is most widely supported
  return {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000,
    mimeType: 'audio/webm;codecs=opus'
  };
};

export const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const requestMicrophonePermission = async (): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 48000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    return stream;
  } catch (error) {
    if (error instanceof Error) {
      switch (error.name) {
        case 'NotAllowedError':
          throw new Error('Microphone permission denied');
        case 'NotFoundError':
          throw new Error('No microphone found');
        case 'NotReadableError':
          throw new Error('Microphone is being used by another application');
        case 'OverconstrainedError':
          throw new Error('Audio constraints cannot be satisfied');
        case 'SecurityError':
          throw new Error('Security error accessing microphone');
        default:
          throw new Error('Failed to access microphone');
      }
    }
    throw error;
  }
};

export const validateAudioBlob = (blob: Blob): boolean => {
  // Check if blob has content
  if (blob.size === 0) {
    return false;
  }
  
  // Check if blob type is supported
  const supportedTypes = [
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/mpeg'
  ];
  
  return supportedTypes.some(type => blob.type.includes(type));
};

export const getAudioDuration = (blob: Blob): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(blob);
    
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to get audio duration'));
    };
    
    audio.src = url;
  });
};