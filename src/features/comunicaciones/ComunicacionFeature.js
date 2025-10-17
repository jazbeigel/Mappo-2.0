import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const sanitizePhoneNumber = (value) => value.replace(/[^0-9+#*]/g, '');

const defaultTheme = {
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5f5',
  inputBackground: 'rgba(15, 23, 42, 0.75)',
  inputBorder: '#1f2937',
  accent: '#4fd1c5',
  accentSecondary: '#38a89d',
};

export default function ComunicacionFeature({
  initialPhoneNumber = '',
  defaultSmsMessage = '',
  theme: themeOverrides = {},
}) {
  const theme = { ...defaultTheme, ...themeOverrides };
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [message, setMessage] = useState(defaultSmsMessage);

  const sanitizedNumber = useMemo(
    () => sanitizePhoneNumber(phoneNumber),
    [phoneNumber],
  );

  const trimmedMessage = useMemo(() => message.trim(), [message]);

  const handleCall = useCallback(async () => {
    if (!sanitizedNumber) {
      Alert.alert('Número requerido', 'Ingresá un número telefónico válido.');
      return;
    }

    const telUrl = `tel:${sanitizedNumber}`;

    try {
      if (Platform.OS === 'web') {
        window.location.href = telUrl;
        return;
      }

      const canOpen = await Linking.canOpenURL(telUrl);
      if (!canOpen) {
        Alert.alert('Acción no soportada', 'No es posible realizar llamadas desde este dispositivo.');
        return;
      }

      await Linking.openURL(telUrl);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al intentar iniciar la llamada.');
    }
  }, [sanitizedNumber]);

  const handleSms = useCallback(async () => {
    if (!sanitizedNumber) {
      Alert.alert('Número requerido', 'Ingresá un número telefónico válido.');
      return;
    }

    const encodedMessage = encodeURIComponent(trimmedMessage);
    const bodyParameter = trimmedMessage
      ? Platform.select({ ios: `&body=${encodedMessage}`, default: `?body=${encodedMessage}` })
      : '';

    const smsUrl = `sms:${sanitizedNumber}${bodyParameter}`;

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
  }, [sanitizedNumber, trimmedMessage]);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Contactá a tus anfitriones</Text>
      <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
        Personalizá el número y redactá un mensaje para tus consultas turísticas.
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.inputBorder,
            color: theme.textPrimary,
          },
        ]}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        placeholder="Número telefónico"
        placeholderTextColor={theme.textSecondary}
        maxLength={20}
      />

      <TextInput
        style={[
          styles.input,
          styles.messageInput,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.inputBorder,
            color: theme.textPrimary,
          },
        ]}
        value={message}
        onChangeText={setMessage}
        placeholder="Mensaje opcional para SMS"
        placeholderTextColor={theme.textSecondary}
        multiline
        numberOfLines={4}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accent }]}
          onPress={handleCall}
        >
          <Text style={[styles.buttonText, { color: '#0b1220' }]}>Llamar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accentSecondary }]}
          onPress={handleSms}
        >
          <Text style={[styles.buttonText, { color: '#0b1220' }]}>Enviar SMS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  messageInput: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
