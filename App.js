import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ComunicacionesFeature from './src/features/comunicaciones/ComunicacionFeature.js';
import CamaraFeature from './src/features/camara/CamaraFeature';
import CalendarioFeature from './src/features/calendario/CalendarioFeature';
import ScanerFeature from './src/features/scaner/ScanerFeature';

const palette = {
  background: '#0f172a',
  card: '#1e293b',
  accent: '#38bdf8',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5f5',
  border: '#334155',
};

const FEATURES = [
  {
    key: 'communications',
    title: 'Comunicaciones',
    description: 'Llamar, SMS y WhatsApp',
    component: ComunicacionesFeature,
  },
  {
    key: 'camera',
    title: 'Cámara',
    description: 'Acceso a la cámara del dispositivo',
    component: CamaraFeature,
  },
  {
    key: 'calendar',
    title: 'Calendario',
    description: 'Eventos y programación',
    component: CalendarioFeature,
  },
  {
    key: 'scaner',
    title: 'Scaner',
    description: 'Acceso a la camara para scaner de QRs',
    component: ScanerFeature,
  },
];

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
