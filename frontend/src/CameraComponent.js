import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Camera } from 'react-native-vision-camera';

const CameraComponent = forwardRef(({ device }, ref) => {
  const cameraRef = useRef(null);

  // capturePhoto fonksiyonunu dışa aç
  useImperativeHandle(ref, () => ({
    capturePhoto: async () => {
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePhoto({
            qualityPrioritization: 'quality',
          });

          if (photo?.path || photo?.uri) {
            return photo;
          } else {
            console.warn("Fotoğraf URI boş geldi.");
            return null;
          }
        } catch (error) {
          console.error("Fotoğraf çekme hatası:", error);
          return null;
        }
      }
    },
  }));

  return (
    <Camera
      style={{ flex: 1 }}
      device={device}
      isActive={true}
      ref={cameraRef}
      photo={true}
    />
  );
});

export default CameraComponent;
