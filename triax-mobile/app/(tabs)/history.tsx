import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, 
  FlatList, RefreshControl, Alert, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 

const API_HISTORICO_URL = 'http://172.20.10.5:3000/historico';

type PacienteHistorico = {
  id: number;
  nome: string;
  cpf: string;
  pa: string;
  temp: string;
  sat: string;
  cor: string;
  iaScore: number;
  createdAt: string; 
};

export default function HistoryScreen() {
  const router = useRouter(); 
  const [historico, setHistorico] = useState<PacienteHistorico[]>([]);
  const [busca, setBusca] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchHistorico();
  }, []);

  const fetchHistorico = async () => {
    try {
      const res = await axios.get(API_HISTORICO_URL);
      setHistorico(res.data);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      Alert.alert("Erro de Conexão", "Não foi possível carregar o histórico.");
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchHistorico();
    setIsRefreshing(false);
  };

  const formatarData = (dataIso: string) => {
    try {
      const data = new Date(dataIso);
      return `${data.toLocaleDateString('pt-BR')} às ${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
    } catch {
      return "Data indisponível";
    }
  };

  const historicoFiltrado = historico.filter(paciente => 
    paciente.nome.toLowerCase().includes(busca.toLowerCase()) || 
    (paciente.cpf && paciente.cpf.includes(busca))
  );

  const renderItem = ({ item }: { item: PacienteHistorico }) => (
    <TouchableOpacity 
      style={styles.patientCard} 
      activeOpacity={0.7}
      onPress={() => router.push(`/prontuario/${item.id}`)} 
    >
      <View style={[styles.colorIndicator, { backgroundColor: item.cor }]} />
      
      <View style={styles.patientInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.patientName}>{item.nome}</Text>
          <Text style={styles.dataAlta}>{formatarData(item.createdAt)}</Text>
        </View>
        
        <Text style={styles.patientCpf}>CPF: {item.cpf || 'Não informado'}</Text>
        
        <View style={styles.vitalsRow}>
          <Text style={styles.vitalTag}>PA: {item.pa}</Text>
          <Text style={styles.vitalTag}>T: {item.temp}°C</Text>
          <Text style={styles.vitalTag}>S: {item.sat}%</Text>
          <View style={styles.iaTag}>
             <Text style={styles.iaTagText}>IA Score: {item.iaScore}%</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" style={{ marginLeft: 'auto' }} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Histórico de Alta</Text>
        <Text style={styles.subtitle}>Pacientes que já passaram pela triagem.</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar paciente..."
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={historicoFiltrado}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#168C8C']} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {busca ? 'Nenhum paciente encontrado.' : 'Nenhum histórico disponível.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBEFF2' },
  header: { backgroundColor: '#FFF', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#D1D5DB' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 5 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, marginTop: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827' },
  listContent: { padding: 20, paddingBottom: 100 },
  patientCard: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 15, flexDirection: 'row', overflow: 'hidden', elevation: 2 },
  colorIndicator: { width: 8 },
  patientInfo: { flex: 1, padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  patientName: { fontSize: 16, fontWeight: 'bold', color: '#111827', flex: 1 },
  dataAlta: { fontSize: 12, color: '#9CA3AF', fontWeight: '500', marginLeft: 10 },
  patientCpf: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 12 },
  vitalsRow: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  vitalTag: { backgroundColor: '#F3F4F6', color: '#374151', fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  iaTag: { backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  iaTagText: { color: '#0284C7', fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 15, textAlign: 'center' },
});