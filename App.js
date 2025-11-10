// App.js
// React Navigation con Bottom Tabs usando una tabBar personalizada
// que replica el estilo del "bottom bar" del documento inferior.
// Todo el resto (layout, header, tarjetas, etc.) mantiene el estilo del doc inferior.

import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// FEATURES (como en el doc inferior)
import ComunicacionesFeature from './src/features/comunicaciones/ComunicacionFeature';
import CamaraFeature from './src/features/camara/CamaraFeature';
import CalendarioFeature from './src/features/calendario/CalendarioFeature';
import ScanerFeature from './src/features/scanerQR/ScanerFeature';
import HomeFeature from './src/features/home/HomeFeature';

const Tab = createBottomTabNavigator();

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

// --- Layout general idéntico al doc inferior ---
function ScreenLayout({ children }) {
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

        <View style={styles.featureContainer}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

// --- TabBar custom que replica el "bottomBar" del doc inferior ---
function CustomTabBar({ state /*para ver en estrado esta*/, descriptors, navigation }) {
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {/* Contenedor flotante con la misma estética */}
      <View style={styles.bottomBar}>
        {state.routes.map((route, index) => { 
          //mapea y te dirije a la pagina que estas llamando
          const isFocused = state.index === index;
          const options = descriptors[route.key].options;

          // Mapeamos contra FEATURES por key (name = key)
          const feature = FEATURES.find((f) => f.key === route.name);
          const Icon = feature?.icon ?? Ionicons;
          const iconName = feature?.iconName ?? 'help-outline';

          const iconColor = feature?.highlight
            ? palette.background
            : isFocused
              ? palette.accent
              : palette.textSecondary;

          const labelStyles = [styles.navLabel, isFocused && styles.navLabelActive];
          if (feature?.highlight) labelStyles.push(styles.navLabelHighlight);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              activeOpacity={0.85}
              style={[
                styles.navItem,
                feature?.highlight && styles.navHighlight,
                isFocused && styles.navItemActive,
              ]}
            >
              <Icon
                name={iconName}
                size={feature?.highlight ? 28 : 24}
                color={isFocused && !feature?.highlight ? palette.accent : iconColor}
              />
              <Text style={labelStyles}>{options.title ?? feature?.title ?? route.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  // Estado compartido (como en el doc inferior)
  const [photos, setPhotos] = useState([]);

  // Para inyectar props a Home y Cámara (idéntico comportamiento del doc inferior)
  const HomeWithProps = useMemo(
    () => () =>
      (
        <ScreenLayout>
          <HomeFeature photos={photos} />
        </ScreenLayout>
      ),
    [photos]
  );

  const CamaraWithProps = useMemo(
    () => ({ navigation }) =>
      (
        <ScreenLayout>
          <CamaraFeature
            onPhotoCaptured={(photo) => {
              setPhotos((prev) => [photo, ...prev]);
              navigation.navigate('home'); // volver a Inicio al capturar (mismo flujo que el doc inferior)
            }}
          />
        </ScreenLayout>
      ),
    []
  );

  const Wrap = (Component) => () =>
    (
      <ScreenLayout>
        <Component />
      </ScreenLayout>
    );

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="home"
        screenOptions={{
          headerShown: false, // usamos nuestro header propio
          tabBarStyle: { height: 0 }, // ocultamos el tabBar nativo (lo reemplaza el CustomTabBar)
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="home" component={HomeWithProps} options={{ title: 'Inicio' }} />
        <Tab.Screen name="camara" component={CamaraWithProps} options={{ title: 'Cámara' }} />
        <Tab.Screen name="scaner" component={Wrap(ScanerFeature)} options={{ title: 'QR' }} />
        <Tab.Screen name="calendario" component={Wrap(CalendarioFeature)} options={{ title: 'Agenda' }} />
        <Tab.Screen name="comunicaciones" component={Wrap(ComunicacionesFeature)} options={{ title: 'Contacto' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // --- estilos del doc inferior ---
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

  // --- bottom bar (idéntico look & feel al doc inferior) ---
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: '#020617',          // heredado del archivo de arriba
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#1e293b',              // heredado del archivo de arriba
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
