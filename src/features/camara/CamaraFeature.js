import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import FeatureActionButton from '../../acceso/AccesoAFeatures';

export default function CamaraFeature({ onPhotoCaptured }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const cameraRef = useRef(null);

  const ensurePermission = useCallback(async () => {
    if (permission?.granted) {
      return true;
    }

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
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setPreview({ uri: photo.uri, timestamp: Date.now() });
      setIsCameraActive(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo capturar la foto. Inténtalo nuevamente.');
    }
  }, []);

  const savePhoto = useCallback(() => {
    if (!preview) return;
    const uniqueId = `${preview.timestamp}-${Math.random().toString(36).slice(2, 8)}`;
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cámara de recuerdos</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.cameraWrapper}>
        {preview ? (
          <Image source={{ uri: preview.uri }} style={styles.camera} />
        ) : isCameraActive ? (
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
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
    </View>
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
    flex: 1,
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
