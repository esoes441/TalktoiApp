import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Voice from '@react-native-voice/voice';
import axios from 'axios';

const Microphone = () => {
  const [recording, setRecording] = useState(false);

  const startRecording = async () => {
    setRecording(true);
    Voice.onSpeechResults = (event) => {
      const text = event.value[0];
      sendToFastAPI(text);
    };
    await Voice.start('tr-TR');
  };

  const stopRecording = async () => {
    setRecording(false);
    await Voice.stop();
  };

  const sendToFastAPI = async (text) => {
    try {
      await axios.post('http://<FASTAPI_SERVER_IP>:<PORT>/analyze', { text });
    } catch (err) {
      console.error('API gönderim hatası:', err);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPressIn={startRecording}
      onPressOut={stopRecording}
    >
      <Text style={styles.text}>
        {recording ? 'Dinleniyor...' : 'Mikrofon'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 30,
    marginTop: 10,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Microphone;
