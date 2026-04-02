import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Histórico de Triagens</Text>
        <Text style={styles.subtitle}>Pacientes já atendidos ou liberados.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyText}>Nenhum histórico disponível ainda.</Text>
          <Text style={styles.emptySub}>Os pacientes finalizados aparecerão aqui.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 5 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: { alignItems: 'center', marginTop: -50 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginTop: 15 },
  emptySub: { fontSize: 14, color: '#9CA3AF', marginTop: 5, textAlign: 'center' },
});
