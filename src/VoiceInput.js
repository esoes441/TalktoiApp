import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Vibration
} from 'react-native';
import Tts from 'react-native-tts';
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
          console.warn('Fotoğraf çekilemedi');
        }
      }
    };

    Voice.onSpeechError = (error) => {
      Tts.speak('Ses alınamadı. Lütfen tekrar deneyin.');
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

      Vibration.vibrate(100); // 100 ms titreşim
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
        <Text style={styles.buttonText}>
          {recording ? 'Dinleniyor...' : 'Bas ve Konuş'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.resultText}>{recognizedText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    paddingBottom: 10,
    backgroundColor: '#dbead5',
    marginTop: 16,
  },
button: {
  backgroundColor: '#6eaa5e', // koyu turuncu
  paddingVertical: 26,
  paddingHorizontal: 46,
  borderRadius: 15,
  marginTop: 20,
  width: '87%',
  alignItems: 'center',
  position: 'absolute',
  bottom: 60,
  elevation: 10, // Android gölge
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  borderWidth: 3,
  borderColor: '#469536', // Beyaz çerçeve
},
buttonActive: {
  backgroundColor: '#ff6600',
  borderColor: '#ffffff',
},
buttonText: {
  color: '#ffffff',
  fontSize: 22,
  fontWeight: '600',
  letterSpacing: 1,
},
  resultText: {
    marginTop: 20,
    fontSize: 16,
    color: '#469536',
    fontWeight: 'bold',
    bottom: 15,
  },
});

export default VoiceInput;
