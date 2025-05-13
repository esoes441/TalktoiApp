import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, SafeAreaView } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import CameraComponent from './CameraComponent';
import VoiceInput from './VoiceInput';
import VoiceOutput from './VoiceOutput';
import RNFS from 'react-native-fs';
import Tts from 'react-native-tts';

const App = () => {
  const cameraRef = useRef();
  const [device, setDevice] = useState(null);
  const [apiMessage, setApiMessage] = useState('');

  useEffect(() => {
    const getPermissions = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
      }
      const devices = await Camera.getAvailableCameraDevices();
      const backCamera = devices.find((d) => d.position === 'back');
      setDevice(backCamera);
    };

    getPermissions();

    Tts.speak('Hoş geldiniz. Ekranın altındaki butona basarak çöp kutusu, yaya yolu, merdiven ve engelli yolunun nerede olduğunu sorabilirsiniz. Lütfen butona basarken telefonu sabit tutunuz.');
  }, []);

  const captureImage = async () => {
    if (cameraRef.current?.capturePhoto) {
      const photo = await cameraRef.current.capturePhoto();
      if (photo?.path) {
        const filePath = `file://${photo.path}`;
        console.log('Gerçek dosya yolu:', filePath);
        return {
          ...photo,
          fileUri: filePath,
        };
      }
    }
    return null;
  };

  const sendToAPI = async (text, photo) => {
    console.log('Komut:', text);
    console.log('Fotoğraf:', photo);

    const formData = new FormData();
    formData.append('object_name', text);
    formData.append('file', {
      uri: photo.fileUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    try {
      const response = await fetch('http://192.168.136.152:8000/analyze', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      console.log('API yanıtı:', result);
      setApiMessage(result.message || result.data?.object || 'Sonuç geldi');
    } catch (error) {
      Tts.speak('İşlem tamamlanamadı. Tekrar deneyiniz.');
    }
  };

  if (!device) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.title}>MyEyes</Text>
      </View>
      <View style={styles.cameraWrapper}>
        <CameraComponent ref={cameraRef} device={device} />
      </View>
      <VoiceInput sendToAPI={sendToAPI} captureImage={captureImage} />
      <VoiceOutput message={apiMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a5c', // Arka plan rengini siyah yaparak uygulamanın genel görünümünü iyileştiriyoruz
  },
  header: {
    backgroundColor: '#060640',  // Başlık çubuğunun rengi
    paddingTop: Platform.OS === 'ios' ? 40 : 20,  // iOS için güvenli alan ve Android için uyum
    paddingBottom: 6,  // Başlık kısmının yüksekliğini biraz artırmak
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,  // Android için başlık çubuğuna gölge efekti
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    bottom: 5,
  },
  cameraWrapper: {
  height: 480,
  marginHorizontal: 16,
  marginTop: 16,
  borderRadius: 16,
  overflow: 'hidden',
  backgroundColor: '#000', // Kamera yüklenene kadar siyah fon
  elevation: 10, // Android için gölge
  shadowColor: '#000', // iOS için gölge
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  borderWidth: 1,
  borderColor: '#fff', // İsteğe bağlı: beyaz kenarlık
  },
});

export default App;

