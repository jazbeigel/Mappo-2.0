// camaraFeature.js
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Camera as LegacyCamera, CameraView as NewCameraView, useCameraPermissions } from 'expo-camera';
import FeatureActionButton from '../../acceso/AccesoAFeatures';

export default function CamaraFeature({ onPhotoCaptured }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);

  // Elegimos el componente disponible según la versión instalada de expo-camera
  const CameraComponent = NewCameraView ?? LegacyCamera;

  const cameraRef = useRef(null);

  const ensurePermission = useCallback(async () => {
    if (permission?.granted) return true;
    const { granted } = await requestPermission();
    if (!granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para tomar fotografías.');
    }
    return granted;
  }, [permission?.granted, requestPermission]);

  const toggleCamera = useCallback(async () => {
    const hasPermission = await ensurePermission();
    if (!hasPermission) return;
    setIsCameraActive((prev) => !prev);
    setPreview(null);
  }, [ensurePermission]);

  const capture = useCallback(async () => {
    try {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync?.({ quality: 0.7 });
      if (!photo?.uri) {
        Alert.alert('Error', 'No se pudo capturar la foto. Inténtalo nuevamente.');
        return;
      }
      setPreview({ uri: photo.uri, timestamp: Date.now() });
      setIsCameraActive(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo capturar la foto. Inténtalo nuevamente.');
    }
  }, []);

  const savePhoto = useCallback(() => {
    if (!preview) return;
    const uniqueId =
      (globalThis.crypto?.randomUUID?.() ?? null) ||
      `${preview.timestamp}-${preview.uri}-${Math.random().toString(36).slice(2, 12)}`;
    onPhotoCaptured?.({ ...preview, id: uniqueId });
    Alert.alert('¡Foto guardada!', 'La encontrarás en la sección Inicio.');
    setPreview(null);
  }, [onPhotoCaptured, preview]);

  const subtitle = useMemo(() => {
    if (preview) return 'Revisa la captura y decide si deseas guardarla.';
    if (isCameraActive) return 'Encuadra tus recuerdos antes de capturarlos.';
    return 'Activa la cámara para guardar tus mejores momentos.';
  }, [isCameraActive, preview]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Cámara de recuerdos</Text>
        <Text style={styles.subtitle}>Preparando permisos…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Cámara de recuerdos</Text>
        <Text style={styles.subtitle}>
          Para capturar tus viajes, necesitamos acceso a la cámara del dispositivo.
        </Text>
        <FeatureActionButton
          label="Conceder permiso"
          onPress={ensurePermission}
          color="#38bdf8"
          style={styles.centerButton}
        />
      </View>
    );
  }

  // Si por alguna razón no existe ni NewCameraView ni LegacyCamera, mostramos aviso claro.
  if (!CameraComponent) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Cámara no disponible</Text>
        <Text style={styles.subtitle}>
          No se encontró un componente de cámara compatible. Verifica tu versión de Expo y el paquete
          <Text> expo-camera</Text>.
        </Text>
      </View>
    );
  }

  // Props distintos entre CameraView (nuevo) y Camera (viejo)
  const cameraProps =
    CameraComponent === NewCameraView
      ? { facing: 'back' } // CameraView
      : { type: LegacyCamera.Constants.Type.back }; // Camera (legacy)

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Cámara de recuerdos</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.cameraWrapper}>
        {preview ? (
          <Image source={{ uri: preview.uri }} style={styles.camera} />
        ) : isCameraActive ? (
          <CameraComponent ref={cameraRef} style={styles.camera} {...cameraProps} />
        ) : (
          <View style={[styles.camera, styles.placeholder]}>
            <Text style={styles.placeholderText}>Activa la cámara para comenzar</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {preview ? (
          <>
            <FeatureActionButton
              label="Descartar"
              onPress={() => setPreview(null)}
              color="#f87171"
              style={styles.actionButton}
            />
            <FeatureActionButton
              label="Guardar"
              onPress={savePhoto}
              color="#22c55e"
              style={styles.actionButton}
            />
          </>
        ) : (
          <>
            <FeatureActionButton
              label={isCameraActive ? 'Tomar foto' : 'Activar cámara'}
              onPress={isCameraActive ? capture : toggleCamera}
              color={isCameraActive ? '#38bdf8' : '#22c55e'}
              style={styles.actionButton}
            />
            {isCameraActive && (
              <FeatureActionButton
                label="Cerrar cámara"
                onPress={toggleCamera}
                color="#f97316"
                style={styles.actionButton}
              />
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centerButton: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  container: {
    paddingBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#cbd5f5',
    lineHeight: 20,
    marginBottom: 16,
  },
  cameraWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#0f172a',
    marginBottom: 16,
  },
  camera: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexBasis: '48%',
    marginBottom: 12,
  },
});
