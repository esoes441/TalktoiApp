/*import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import CameraComponent from './CameraComponent';
import VoiceInput from './VoiceInput';
import VoiceOutput from './VoiceOutput';

const App = () => {
  const cameraRef = useRef();
  const [device, setDevice] = useState(null);
  const [apiMessage, setApiMessage] = useState('');  // API mesajı

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
  }, []);

  const captureImage = async () => {
    if (cameraRef.current?.capturePhoto) {
      const photo = await cameraRef.current.capturePhoto();
      console.log(photo);

      return photo;
    }
    return null;
  };

  const sendToAPI = async (text, photo) => {
    console.log('Komut:', text);
    console.log('Fotoğraf:', photo);

    // Burada form verisi oluşturulabilir:
    const formData = new FormData();
    formData.append('command', text);
    formData.append('image', {
    uri: `file://${photo.path}`,
    type: 'image/jpeg',
    name: 'photo.jpg',
});

    try {
      const response = await fetch('https://bc13-78-165-161-85.ngrok-free.app/analyze', {
      method: 'POST',
      body: formData,
      headers: {
         'Content-Type': 'multipart/form-data',
      },
    });


      const result = await response.json();
      console.log('API yanıtı:', result);
      // API'den gelen mesajı sesli okuma
      setApiMessage(result.message);
 // API mesajını güncelle
    } catch (error) {
      console.error('API Hatası:', error);
    }
  };

  if (!device) return null;

  return (
    <View style={styles.container}>
      <CameraComponent ref={cameraRef} device={device} />
      <VoiceInput sendToAPI={sendToAPI} captureImage={captureImage} />
      <VoiceOutput message={apiMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
*/
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import CameraComponent from './CameraComponent';
import VoiceInput from './VoiceInput';
import VoiceOutput from './VoiceOutput';
import RNFS from 'react-native-fs';

const App = () => {
  const cameraRef = useRef();
  const [device, setDevice] = useState(null);
  const [apiMessage, setApiMessage] = useState('');  // API mesajı

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
/*
const sendToAPI = async (text, photo) => {
  console.log('Komut:', text);
  console.log('Fotoğraf:', photo);

const formData = new FormData();
formData.append("object_name", text); // Nesne adı (doğru)
formData.append("file", {              // Dosya (burada "image" değil "file" olmalı!)
  uri: photo.fileUri,
  type: "image/jpeg",
  name: "photo.jpg"
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
    setApiMessage(result.message);
  } catch (error) {
    console.error('API Hatası:', error);
  }
};
*/

const sendToAPI = async (text, photo) => {
  console.log('Komut:', text);
  console.log('Fotoğraf:', photo);

  const formData = new FormData();
  formData.append('object_name', text); // Nesne adı
  formData.append('file', {             // Burada "file" yazması ZORUNLU!
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
    console.error('API Hatası:', error);
  }
};
  if (!device) return null;

  return (
    <View style={styles.container}>
      <CameraComponent ref={cameraRef} device={device} />
      <VoiceInput sendToAPI={sendToAPI} captureImage={captureImage} />
      <VoiceOutput message={apiMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
