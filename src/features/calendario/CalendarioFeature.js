import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Calendar from 'expo-calendar';
import FeatureActionButton from '../../acceso/AccesoAFeatures';

const DEFAULT_DURATION = 90 * 60 * 1000; // 1h30m

const formatDate = (value) => {
  try {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (error) {
    return '';
  }
};

export default function CalendarioFeature() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [calendarId, setCalendarId] = useState(null);
  const [title, setTitle] = useState('Tour guiado');
  const [location, setLocation] = useState('Centro histórico');
  const [start, setStart] = useState(() => new Date().toISOString().slice(0, 16).replace('T', ' '));
  const [events, setEvents] = useState([]);

  const requestPermissions = useCallback(async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      let remindersStatus = 'granted';
      if (Platform.OS === 'ios' && Calendar.requestRemindersPermissionsAsync) {
        const reminders = await Calendar.requestRemindersPermissionsAsync();
        remindersStatus = reminders.status;
      }
      const granted = status === 'granted' && remindersStatus === 'granted';
      setPermissionGranted(granted);
      if (!granted) {
        Alert.alert('Permiso denegado', 'Activa los permisos de calendario para crear eventos.');
      }
      return granted;
    } catch (error) {
      Alert.alert('Error', 'No pudimos solicitar los permisos de calendario.');
      return false;
    }
  }, []);

  const loadDefaultCalendar = useCallback(async () => {
    try {
      let defaultCalendar = null;
      if (Calendar.getDefaultCalendarAsync) {
        defaultCalendar = await Calendar.getDefaultCalendarAsync();
      }
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const fallback = calendars.find((item) => item.source?.isLocalAccount) || calendars[0];
      defaultCalendar = defaultCalendar || fallback;
      if (defaultCalendar) {
        setCalendarId(defaultCalendar.id);
      }
    } catch (error) {
      Alert.alert('Error', 'No pudimos obtener los calendarios disponibles.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      const granted = await requestPermissions();
      if (granted) {
        await loadDefaultCalendar();
      }
    })();
  }, [loadDefaultCalendar, requestPermissions]);

  const fetchUpcomingEvents = useCallback(async () => {
    if (!calendarId) return;
    try {
      const now = new Date();
      const inThirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const eventsResult = await Calendar.getEventsAsync([calendarId], now, inThirtyDays);
      setEvents(eventsResult);
    } catch (error) {
      Alert.alert('Error', 'No pudimos cargar los eventos programados.');
    }
  }, [calendarId]);

  useEffect(() => {
    if (calendarId) {
      fetchUpcomingEvents();
    }
  }, [calendarId, fetchUpcomingEvents]);

  const handleCreateEvent = useCallback(async () => {
    if (!permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    if (!calendarId) {
      Alert.alert('Calendario no disponible', 'No encontramos un calendario para crear el evento.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Título requerido', 'Ingresa un título para tu actividad.');
      return;
    }

    const normalizedInput = start.replace(' ', 'T');
    const startDate = new Date(normalizedInput);
    if (Number.isNaN(startDate.getTime())) {
      Alert.alert('Fecha inválida', 'Utiliza el formato YYYY-MM-DD HH:mm.');
      return;
    }
    const endDate = new Date(startDate.getTime() + DEFAULT_DURATION);

    try {
      await Calendar.createEventAsync(calendarId, {
        title: title.trim(),
        location: location.trim(),
        startDate,
        endDate,
        timeZone: undefined,
        notes: 'Evento creado desde Mappo Toolkit.',
      });

      Alert.alert('Evento creado', 'Tu actividad se agregó al calendario seleccionado.');
      await fetchUpcomingEvents();
    } catch (error) {
      Alert.alert('Error', 'No pudimos crear el evento. Verifica los permisos.');
    }
  }, [calendarId, fetchUpcomingEvents, location, permissionGranted, requestPermissions, start, title]);

  const helperText = useMemo(() => {
    if (!permissionGranted) {
      return 'Concede permisos para sincronizar tu agenda de viaje.';
    }
    if (!calendarId) {
      return 'Buscando calendarios disponibles…';
    }
    return 'Completa los campos para agendar visitas guiadas o recordatorios.';
  }, [calendarId, permissionGranted]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Agenda de viaje</Text>
      <Text style={styles.subtitle}>{helperText}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nuevo evento</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Nombre de la actividad"
          placeholderTextColor="#64748b"
        />
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Ubicación o punto de encuentro"
          placeholderTextColor="#64748b"
        />
        <TextInput
          style={styles.input}
          value={start}
          onChangeText={setStart}
          placeholder="Fecha y hora (YYYY-MM-DD HH:mm)"
          placeholderTextColor="#64748b"
        />
        <FeatureActionButton
          label="Agregar al calendario"
          onPress={handleCreateEvent}
          color="#22c55e"
          style={styles.cardButton}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próximos eventos</Text>
        {events.length === 0 ? (
          <Text style={styles.emptyMessage}>
            No encontramos actividades registradas en los próximos 30 días.
          </Text>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.event}>
              <Text style={styles.eventTitle}>{event.title || 'Actividad sin título'}</Text>
              <Text style={styles.eventMeta}>{formatDate(event.startDate)}</Text>
              {event.location ? <Text style={styles.eventMeta}>{event.location}</Text> : null}
            </View>
          ))
        )}
        {permissionGranted && (
          <FeatureActionButton
            label="Actualizar"
            onPress={fetchUpcomingEvents}
            color="#38bdf8"
            style={styles.cardButton}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 120,
    paddingTop: 4,
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
  input: {
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 16, default: 12 }),
    color: '#f8fafc',
    fontSize: 16,
    marginBottom: 12,
  },
  emptyMessage: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
  },
  event: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 12,
  },
  eventTitle: {
    color: '#f8fafc',
    fontWeight: '600',
    marginBottom: 4,
  },
  eventMeta: {
    color: '#94a3b8',
    fontSize: 13,
  },
  cardButton: {
    marginTop: 4,
  },
});
