import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const sanitizePhoneNumber = (value) => value.replace(/[^0-9+#*]/g, '');

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const numeroMandado = useMemo(
    () => sanitizePhoneNumber(phoneNumber),
    [phoneNumber],
  );

  const handleCall = useCallback(async () => {
    if (!numeroMandado) {
      Alert.alert('Número requerido', 'Ingresa un número telefónico válido.');
      return;
    }

    const telUrl = `tel:${numeroMandado}`;

    try {
      // adaptaciones para web
      if (Platform.OS === 'web') {
        window.location.href = telUrl;
        return;
      }

      const canOpen = await Linking.canOpenURL(telUrl);
      if (!canOpen) {
        Alert.alert('Acción no soportada', 'No es posible realizar llamadas desde este dispositivo.');
        return;
      }

      await Linking.openURL(telUrl); //aca es cuando aplico linking
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al intentar iniciar la llamada.');
    }
  }, [numeroMandado]);

  const handleSms = useCallback(async () => {
    if (!numeroMandado) {
      Alert.alert('Número requerido', 'Ingresa un número telefónico válido.');
      return;
    }

    const mensajeCortado = message.trim();
    const mensajeCodeado = encodeURIComponent(mensajeCortado);
    const paramentroDelBody = mensajeCortado
      ? Platform.select({ ios: `&body=${mensajeCodeado}`, default: `?body=${mensajeCodeado}` })
      : '';
    const smsUrl = `sms:${numeroMandado}${paramentroDelBody}`;

    try {
      if (Platform.OS === 'web') {
        window.location.href = smsUrl;
        return;
      }

      const canOpen = await Linking.canOpenURL(smsUrl);
      if (!canOpen) {
        Alert.alert('Acción no soportada', 'No es posible enviar SMS desde este dispositivo.');
        return;
      }

      await Linking.openURL(smsUrl);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al intentar preparar el mensaje.');
    }
  }, [message, numeroMandado]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Llamadas y mensajes</Text>
      <Text style={styles.subtitle}>
        Comunícate con guías turísticos, alojamientos y servicios directamente desde tu app.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contacto directo</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder="Número telefónico"
          placeholderTextColor="#64748b"
          maxLength={20}
        />

        <View style={styles.actions}>
          <Text style={styles.helper}>Puedes llamar o enviar un SMS al número ingresado.</Text>
          <View style={styles.buttonRow}>
            <Text style={[styles.actionButton, styles.callButton, styles.buttonSpacing]} onPress={handleCall}>
              Llamar
            </Text>
            <Text style={[styles.actionButton, styles.smsButton]} onPress={handleSms}>
              SMS
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mensaje personalizado</Text>
        <Text style={styles.helper}>Redacta un mensaje opcional que se enviará por SMS.</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Mensaje para tu contacto"
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={4}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5f5',
    lineHeight: 22,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  helper: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  input: {
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#f8fafc',
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  buttonSpacing: {
    marginRight: 12,
  },
  callButton: {
    backgroundColor: '#22c55e',
  },
  smsButton: {
    backgroundColor: '#38bdf8',
  },
});
