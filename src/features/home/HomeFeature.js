// HomeFeature.js
// Galería + integración: muestra próximos 3 eventos del calendario (si vienen por props).

import React from 'react';
import { FlatList, StyleSheet, Text, View, Image } from 'react-native';

const formatDate = (value) => {
  try {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return '';
  }
};

const EmptyState = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>Tu galería está vacía</Text>
    <Text style={styles.emptySubtitle}>
      Toca el ícono de cámara para capturar tus primeras fotos del recorrido.
    </Text>
  </View>
);

export default function HomeFeature({ photos = [], upcomingEvents = [] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuerdos del viaje</Text>
      <Text style={styles.subtitle}>Guarda tus mejores momentos para revisitarlos cuando quieras.</Text>

      {/* Próximos eventos (integración con Calendario) */}
      {upcomingEvents.length > 0 && (
        <View style={styles.eventsCard}>
          <Text style={styles.eventsTitle}>Próximos eventos</Text>
          {upcomingEvents.map((ev, idx) => (
            <View key={`${ev.id ?? 'ev'}-${idx}`} style={styles.eventRow}>
              <Text style={styles.eventName}>{ev.title || 'Actividad sin título'}</Text>
              <Text style={styles.eventMeta}>{formatDate(ev.startDate)}</Text>
              {ev.location ? <Text style={styles.eventMeta}>{ev.location}</Text> : null}
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={photos}
        keyExtractor={(item, idx) => {
          const base = item?.id ?? item?.uri ?? `idx-${idx}`;
          const salt = item?.timestamp ?? idx;
          return `${base}-${salt}`;
        }}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={EmptyState}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.uri }} style={styles.image} />
            {item.timestamp && <Text style={styles.caption}>{formatDate(item.timestamp)}</Text>}
          </View>
        )}
        contentContainerStyle={styles.gallery}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 12 },
  title: { color: '#f8fafc', fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#cbd5f5', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  gallery: { paddingBottom: 120 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    width: '48%', backgroundColor: '#111827', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1f2937',
  },
  image: { width: '100%', aspectRatio: 3 / 4 },
  caption: { color: '#94a3b8', fontSize: 12, paddingHorizontal: 12, paddingVertical: 8 },

  // Eventos
  eventsCard: {
    backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f2937', marginBottom: 16,
  },
  eventsTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  eventRow: { marginBottom: 10 },
  eventName: { color: '#f8fafc', fontWeight: '600' },
  eventMeta: { color: '#94a3b8', fontSize: 12 },

  // Empty state
  emptyState: {
    backgroundColor: '#111827', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#1f2937',
    alignItems: 'center', justifyContent: 'center', marginTop: 32,
  },
  emptyTitle: { color: '#f8fafc', fontWeight: '600', fontSize: 18, marginBottom: 4 },
  emptySubtitle: { color: '#cbd5f5', textAlign: 'center', lineHeight: 20, fontSize: 14 },
});
