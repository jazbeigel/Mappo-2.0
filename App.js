import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ComunicacionesFeature from './src/features/comunicaciones/ComunicacionFeature';
import CamaraFeature from './src/features/camara/CamaraFeature';
import CalendarioFeature from './src/features/calendario/CalendarioFeature';
import ScanerFeature from './src/features/scanerQR/ScanerFeature';
import HomeFeature from './src/features/home/HomeFeature';

const palette = {
  background: '#0f172a',
  card: '#111827',
  accent: '#38bdf8',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5f5',
  border: '#1f2937',
};

const FEATURES = [
  {
    key: 'home',
    title: 'Inicio',
    component: HomeFeature,
    icon: Ionicons,
    iconName: 'home-outline',
  },
  {
    key: 'camara',
    title: 'Cámara',
    component: CamaraFeature,
    icon: Ionicons,
    iconName: 'camera-outline',
  },
  {
    key: 'scaner',
    title: 'QR',
    component: ScanerFeature,
    icon: MaterialCommunityIcons,
    iconName: 'qrcode-scan',
    highlight: true,
  },
  {
    key: 'calendario',
    title: 'Agenda',
    component: CalendarioFeature,
    icon: Ionicons,
    iconName: 'calendar-outline',
  },
  {
    key: 'comunicaciones',
    title: 'Contacto',
    component: ComunicacionesFeature,
    icon: Ionicons,
    iconName: 'chatbubble-ellipses-outline',
  },
];

export default function App() {
  const [activeFeatureKey, setActiveFeatureKey] = useState('home');
  const [photos, setPhotos] = useState([]);

  const ActiveFeature = useMemo(() => {
    const selected = FEATURES.find((feature) => feature.key === activeFeatureKey);
    return selected?.component ?? HomeFeature;
  }, [activeFeatureKey]);

  const featureProps = useMemo(() => {
    switch (activeFeatureKey) {
      case 'home':
        return { photos };
      case 'camara':
        return {
          onPhotoCaptured: (photo) => {
            setPhotos((prev) => [photo, ...prev]);
            setActiveFeatureKey('home');
          },
        };
      default:
        return {};
    }
  }, [activeFeatureKey, photos]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Mappo Toolkit</Text>
          <Text style={styles.subheading}>
            Explora las herramientas pensadas para acompañar tus experiencias de viaje.
          </Text>
        </View>

        <View style={styles.featureContainer}>
          <ActiveFeature {...featureProps} />
        </View>

        <View style={styles.bottomBar}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isActive = feature.key === activeFeatureKey;
            const iconColor = feature.highlight
              ? palette.background
              : isActive
                ? palette.accent
                : palette.textSecondary;
            const labelStyles = [styles.navLabel, isActive && styles.navLabelActive];
            if (feature.highlight) {
              labelStyles.push(styles.navLabelHighlight);
            }
            return (
              <TouchableOpacity
                key={feature.key}
                style={[styles.navItem, feature.highlight && styles.navHighlight, isActive && styles.navItemActive]}
                onPress={() => setActiveFeatureKey(feature.key)}
                activeOpacity={0.85}
              >
                <Icon
                  name={feature.iconName}
                  size={feature.highlight ? 28 : 24}
                  color={isActive && !feature.highlight ? palette.accent : iconColor}
                />
                <Text style={labelStyles}>{feature.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 16,
  },
  heading: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
    marginLeft: 100,
  },
  subheading: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
  featureContainer: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
  },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: '#020617',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navHighlight: {
    backgroundColor: palette.accent,
    borderRadius: 24,
    marginHorizontal: 12,
    paddingVertical: 8,
  },
  navItemActive: {
    transform: [{ translateY: -4 }],
  },
  navLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },
  navLabelActive: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  navLabelHighlight: {
    color: palette.background,
    fontWeight: '600',
  },
});
