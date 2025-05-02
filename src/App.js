import React from 'react';
import { View, Text, SafeAreaView, StatusBar } from 'react-native';
import styles from './Style';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MyEyes</Text>
      </View>
      
      {/* Uygulamanızın geri kalan içeriğini buraya ekleyebilirsiniz */}
      <View style={styles.content}>
        <Text style={styles.contentText}>Uygulama İçeriği</Text>
      </View>
    </SafeAreaView>
  );
};

export default App;


