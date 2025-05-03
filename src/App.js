import React from 'react';
import { Text, View, SafeAreaView, StyleSheet } from 'react-native';
import { useCameraDevice } from 'react-native-vision-camera';
import CameraComponent from './Camera'; // Kamera bileşenini import et

const App = () => {
  const device = useCameraDevice('back');
  
  if (device == null) return <Text>Yükleniyor...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.title}>My Eyes</Text>
      </View>

      {/* Canlı kamera akışı */}
      <View style={styles.cameraContainer}>
        <CameraComponent device={device} />
      </View>

      {/* Alt bileşen */}
      <View style={styles.bottomComponent}>
        <Text>Alt Bileşen</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 80,  // Başlık için sabit yükseklik
    paddingTop: 20,  // Başlık ve ekran arasındaki boşluğu ayarla
    backgroundColor: '#fff',  // Başlık arka planını beyaz yap
    alignItems: 'center',  // Başlığı ortala
    justifyContent: 'center',  // Başlığı dikeyde ortala
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',  // Başlığı kalın yap
    color: '#000',  // Başlık rengini siyah yap
  },
  cameraContainer: {
    flex: 5,  // Kameranın ekranın çoğunu kaplamasını sağla
  },
  bottomComponent: {
    flex: 2,  // Alt bileşene daha fazla yer ayırmak için flex
    padding: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
});

export default App;
