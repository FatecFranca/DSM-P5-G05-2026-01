import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';


export default function HistoryScreen() {
  const router = useRouter();
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  // O IP da sua máquina com a porta do Back-end
  const API_URL = 'http://192.168.15.8:3000';

  useEffect(() => {
    buscarHistorico();
  }, []);

  const buscarHistorico = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/historico`);
      setHistorico(response.data);
    } catch (error) {
      console.error("Erro ao buscar histórico no mobile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função inteligente para não dar mais "Invalid Date"
  const formatarData = (item: any) => {
    const dataRaw = item.createdAt || item.dataAlta || new Date();
    const dateObj = new Date(dataRaw);
    
    if (isNaN(dateObj.getTime())) return "Data indisponível";

    const dataStr = dateObj.toLocaleDateString('pt-BR');
    const horaStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dataStr} às ${horaStr}`;
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.cpf}>CPF: {item.cpf || 'Não informado'}</Text>
        </View>
        <View style={[styles.corTag, { backgroundColor: item.cor }]}>
          <Text style={[styles.corTexto, { color: item.cor === '#FEF08A' ? '#000' : '#FFF' }]}>
            {item.cor === '#EF4444' ? 'Emergência' :
             item.cor === '#F97316' ? 'Muito Urgente' :
             item.cor === '#EAB308' ? 'Urgente' : 'Pouco Urgente'}
          </Text>
        </View>
      </View>

      <View style={styles.sinaisVitais}>
        <Text style={styles.sinal}>PA: <Text style={styles.sinalValor}>{item.pa}</Text></Text>
        <Text style={styles.sinal}>Temp: <Text style={styles.sinalValor}>{item.temp}°C</Text></Text>
        <Text style={styles.sinal}>Sat: <Text style={styles.sinalValor}>{item.sat}%</Text></Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.data}>{formatarData(item)}</Text>
        <Text style={styles.score}>IA Score: {item.iaScore}%</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header com Seta de Voltar e Logo */}
      <View style={styles.whiteBar}>
        <View style={styles.topBar}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.push('/triage')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#168C8C" />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Image source={require('../../assets/images/logob.png')} style={styles.logo} />
            </View>
          </View>
        </View>
      </View>

      {/* Título da Página (Fora do Cabeçalho Global) */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Histórico de Prontuários</Text>
        <Text style={styles.subtitle}>Auditoria de pacientes com alta</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#168C8C" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum registro encontrado no histórico.</Text>
          }
          refreshing={loading}
          onRefresh={buscarHistorico} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBEFF2', },
  whiteBar: { backgroundColor: '#FFF', paddingHorizontal: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3, marginBottom: 10 },
  topBar: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, marginTop: 10, marginBottom: -20  },
  headerContent: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { flex: 1, alignItems: 'center', paddingTop:15},
  logo: { width: 100, height: 100, resizeMode: 'contain', marginRight: 50 },
  pageHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  listContainer: { padding: 15, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  cpf: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  corTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  corTexto: { fontSize: 12, fontWeight: 'bold' },
  sinaisVitais: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, marginBottom: 15 },
  sinal: { fontSize: 13, color: '#4B5563' },
  sinalValor: { fontWeight: 'bold', color: '#111827' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#E5E7EB', paddingTop: 10 },
  data: { fontSize: 12, color: '#9CA3AF' },
  score: { fontSize: 14, fontWeight: 'bold', color: '#168C8C' },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 40, fontSize: 15 }
});