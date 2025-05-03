import React from 'react';
import { Text, SafeAreaView, View, StyleSheet } from 'react-native';
import { useCameraDevice, Camera } from 'react-native-vision-camera';


const App = () => {
  
    const device=useCameraDevice('back')
    if (device == null) return <Text />
    return (
    <SafeAreaView style={{flex:1}}>
        <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
    />
    </SafeAreaView>
  );
};


export default App;