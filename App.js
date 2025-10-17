import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Calendar from 'expo-calendar';
import ComunicacionFeature from './src/features/comunicaciones/ComunicacionFeature';

const COLORS = {
  background: '#0b1220',
  card: '#11263b',
  accent: '#4fd1c5',
  accentDark: '#38a89d',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5f5',
};

const PHONE_NUMBER = '+5491122334455';
const WHATSAPP_NUMBER = '+5491122334455';

export default function App() {
  const [scannerPermission, setScannerPermission] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerResult, setScannerResult] = useState(null);

  const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  const [calendarPermissionGranted, setCalendarPermissionGranted] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState('Sin eventos creados todavía.');

  const ensureMediaPermission = useCallback(async () => {
    const currentStatus = await MediaLibrary.getPermissionsAsync();
    if (!currentStatus.granted) {
      const response = await MediaLibrary.requestPermissionsAsync();
      return response.granted;
    }
    return true;
  }, []);

  useEffect(() => {
    const checkPermissions = async () => {
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      if (cameraStatus.granted) {
        await ensureMediaPermission();
      }
      const calendarStatusResponse = await Calendar.getCalendarPermissionsAsync();
      if (calendarStatusResponse.granted) {
        setCalendarPermissionGranted(true);
      }
      const scannerStatus = await BarCodeScanner.getPermissionsAsync();
      setScannerPermission(scannerStatus.status === 'granted');
    };

    checkPermissions();
  }, [ensureMediaPermission]);

  const themedButton = useMemo(
    () => ({
      backgroundColor: COLORS.accent,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 12,
      marginVertical: 6,
      alignItems: 'center',
    }),
    []
  );

  const openLink = useCallback(async (url, fallbackMessage) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        throw new Error('not-supported');
      }
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Acción no disponible', fallbackMessage);
    }
  }, []);

  const handlePhoneCall = useCallback(() => {
    openLink(`tel:${PHONE_NUMBER}`, 'Tu dispositivo no soporta llamadas en este momento.');
  }, [openLink]);

  const handleSMS = useCallback(() => {
    const body = encodeURIComponent('Hola! Quisiera más información sobre experiencias en Mappo Turismo.');
    openLink(`sms:${PHONE_NUMBER}?body=${body}`, 'Tu dispositivo no soporta el envío de SMS.');
  }, [openLink]);

  const handleWhatsApp = useCallback(async () => {
    const message = encodeURIComponent('Hola! Estoy interesado/a en una aventura con Mappo Turismo.');
    const whatsappUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${message}`;
    const webFallback = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
        return;
      }
    } catch (error) {
      // Intentaremos con el fallback si no está disponible la app nativa.
    }

    openLink(webFallback, 'No pudimos abrir WhatsApp.');
  }, [openLink]);

  const requestScannerPermission = useCallback(async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setScannerPermission(status === 'granted');
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para escanear códigos.');
    }
  }, []);

  const handleBarCodeScanned = useCallback(({ type, data }) => {
    setScannerResult({ type, data });
    setScannerActive(false);
    Alert.alert('Código encontrado', data);
  }, []);

  const toggleScanner = useCallback(() => {
    if (scannerPermission) {
      setScannerResult(null);
      setScannerActive((previous) => !previous);
    } else {
      requestScannerPermission();
    }
  }, [scannerPermission, requestScannerPermission]);

  const requestCalendarPermission = useCallback(async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    const granted = status === 'granted';
    setCalendarPermissionGranted(granted);
    if (!granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso al calendario para crear eventos.');
    }
    return granted;
  }, []);

  const createCalendarEvent = useCallback(async () => {
    const hasPermission = calendarPermissionGranted || (await requestCalendarPermission());
    if (!hasPermission) {
      return;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find((cal) => cal.allowsModifications) || calendars[0];

    if (!defaultCalendar) {
      Alert.alert('Sin calendario disponible', 'No se encontró un calendario para guardar el evento.');
      return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    startDate.setHours(10, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(12, 0, 0);

    const eventDetails = {
      calendarId: defaultCalendar.id,
      title: 'Tour guiado por Mappo Turismo',
      location: 'Puerto Madero, Ciudad de Buenos Aires',
      startDate,
      endDate,
      timeZone: 'America/Argentina/Buenos_Aires',
      notes: 'Punto de encuentro en la terminal de embarque. Incluye visita gastronómica.',
    };

    try {
      const eventId = await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
      setCalendarStatus(`Evento agendado con éxito. ID: ${eventId}`);
      Alert.alert('Evento creado', 'Tu aventura quedó programada en el calendario.');
    } catch (error) {
      Alert.alert('No se pudo crear el evento', 'Revisa los permisos del calendario.');
    }
  }, [calendarPermissionGranted, requestCalendarPermission]);

  const takePicture = useCallback(async () => {
    const cameraAccess = cameraPermission?.granted || (await requestCameraPermission());
    if (!cameraAccess) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para capturar recuerdos.');
      return;
    }

    const mediaAccess = mediaPermission?.granted || (await requestMediaPermission());
    if (!mediaAccess) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la galería para guardar tus fotos.');
      return;
    }

    if (!cameraRef.current) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
      setPhotoUri(photo.uri);
      setIsSavingPhoto(true);
      await MediaLibrary.saveToLibraryAsync(photo.uri);
      setIsSavingPhoto(false);
      Alert.alert('Foto guardada', 'La imagen se guardó en tu galería para compartirla luego.');
    } catch (error) {
      setIsSavingPhoto(false);
      Alert.alert('No se pudo capturar la foto', 'Intenta nuevamente.');
    }
  }, [cameraPermission, mediaPermission, requestCameraPermission, requestMediaPermission]);

  const renderScanner = () => {
    if (!scannerActive) {
      return null;
    }

    return (
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.scannerOverlay}>
          <Text style={styles.scannerText}>Escanea códigos QR de actividades o boletos.</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Mappo Turismo</Text>
        <Text style={styles.subtitle}>
          Explora experiencias únicas, agenda tus viajes y guarda tus mejores recuerdos en un solo lugar.
        </Text>

        <FeatureCard title="Contactanos" description="Comunicate con nuestro equipo para planear tu próxima aventura.">
          <TouchableOpacity style={themedButton} onPress={handlePhoneCall}>
            <Text style={styles.buttonText}>Llamar a Mappo Turismo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={themedButton} onPress={handleSMS}>
            <Text style={styles.buttonText}>Enviar SMS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={themedButton} onPress={handleWhatsApp}>
            <Text style={styles.buttonText}>Mensaje por WhatsApp</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>Teléfono: {PHONE_NUMBER}</Text>
          <View style={styles.sectionDivider} />
          <ComunicacionFeature
            initialPhoneNumber={PHONE_NUMBER}
            defaultSmsMessage="Hola! Quisiera más información sobre experiencias en Mappo Turismo."
            theme={{
              textPrimary: COLORS.textPrimary,
              textSecondary: COLORS.textSecondary,
              inputBackground: 'rgba(15, 23, 42, 0.75)',
              inputBorder: '#1f2937',
              accent: COLORS.accent,
              accentSecondary: COLORS.accentDark,
            }}
          />
        </FeatureCard>

        <FeatureCard title="Escáner de códigos" description="Descubrí promociones, tickets y mapas ocultos escaneando códigos QR o de barras.">
          <TouchableOpacity
            style={[themedButton, !scannerPermission && styles.secondaryButton]}
            onPress={toggleScanner}
          >
            <Text style={styles.buttonText}>
              {scannerPermission ? (scannerActive ? 'Detener escaneo' : 'Iniciar escaneo') : 'Conceder permisos'}
            </Text>
          </TouchableOpacity>
          {scannerResult && (
            <View style={styles.scannerResult}>
              <Text style={styles.helperText}>Último resultado:</Text>
              <Text style={styles.resultText}>{scannerResult.data}</Text>
            </View>
          )}
          {renderScanner()}
        </FeatureCard>

        <FeatureCard title="Agenda viajera" description="Crea eventos en tu calendario para no perderte ninguna actividad.">
          <TouchableOpacity style={themedButton} onPress={createCalendarEvent}>
            <Text style={styles.buttonText}>Agregar tour al calendario</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>{calendarStatus}</Text>
        </FeatureCard>

        <FeatureCard title="Cámara viajera" description="Capturá y guarda cada momento de tu aventura en la galería.">
          <View style={styles.cameraPreview}>
            {cameraPermission?.granted ? (
              <>
                <Camera
                  ref={cameraRef}
                  style={StyleSheet.absoluteFillObject}
                  type={CameraType.back}
                  ratio="16:9"
                />
                <View style={styles.cameraOverlay}>
                  <Text style={styles.helperText}>Prepará tu mejor toma turística.</Text>
                </View>
              </>
            ) : (
              <View style={styles.permissionPlaceholder}>
                <Text style={styles.helperText}>Otorgá permisos de cámara para activar la vista previa.</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={themedButton} onPress={takePicture}>
            <Text style={styles.buttonText}>{isSavingPhoto ? 'Guardando...' : 'Capturar recuerdo'}</Text>
          </TouchableOpacity>
          {photoUri && (
            <View style={styles.photoPreview}>
              <Text style={styles.helperText}>Última foto guardada</Text>
              <Image source={{ uri: photoUri }} style={styles.photo} />
            </View>
          )}
        </FeatureCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureCard({ title, description, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  cardContent: {
    gap: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(203, 213, 225, 0.2)',
    marginVertical: 4,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: '600',
    fontSize: 15,
  },
  helperText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: COLORS.accentDark,
  },
  scannerContainer: {
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 12,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 18, 32, 0.35)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 16,
  },
  scannerText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  scannerResult: {
    backgroundColor: 'rgba(79, 209, 197, 0.2)',
    padding: 12,
    borderRadius: 12,
  },
  resultText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  cameraPreview: {
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  permissionPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(17, 38, 59, 0.8)',
  },
  photoPreview: {
    marginTop: 12,
    gap: 8,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
});
