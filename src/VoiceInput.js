import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import Voice from '@react-native-voice/voice';

const VoiceInput = ({ sendToAPI, captureImage }) => {
  const [recording, setRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  useEffect(() => {
    Voice.onSpeechResults = async (result) => {
      if (result.value && result.value[0]) {
        const text = result.value[0];
        setRecognizedText(text);

        const photo = await captureImage();
        if (photo) {
          await sendToAPI(text, photo);
        } else {
          console.warn("Fotoğraf çekilemedi");
        }
      }
    };

    Voice.onSpeechError = (error) => {
      console.error('Voice Error:', error);
    };

    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners());
    };
  }, [sendToAPI, captureImage]);

  const startRecording = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Mikrofon izni verilmedi.');
          return;
        }
      }

      await Voice.start('tr-TR');
      setRecording(true);
    } catch (e) {
      console.error('Başlatılamadı:', e);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setRecording(false);
    } catch (e) {
      console.error('Durdurulamadı:', e);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, recording && styles.buttonActive]}
        onPressIn={startRecording}
        onPressOut={stopRecording}
      >
        <Text style={styles.buttonText}>{recording ? 'Dinleniyor...' : 'Bas ve Konuş'}</Text>
      </TouchableOpacity>
      <Text style={styles.resultText}>{recognizedText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonActive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  resultText: {
    marginTop: 20,
    fontSize: 16,
    color: '#000',
  },
});

export default VoiceInput;
