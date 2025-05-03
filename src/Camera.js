import React from 'react';
import { Camera } from 'react-native-vision-camera';
import { StyleSheet } from 'react-native';

const CameraComponent = ({ device }) => {
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
    />
  );
};

export default CameraComponent;
