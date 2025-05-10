import React, { useEffect } from 'react';
import Tts from 'react-native-tts';

const VoiceOutput = ({ message }) => {
  useEffect(() => {
    if (message) {
      console.log("TTS Mesajı:", message);  // <-- debug için
      Tts.stop();
      Tts.speak(message);
    }
  }, [message]);

  return null;
};

export default VoiceOutput;
