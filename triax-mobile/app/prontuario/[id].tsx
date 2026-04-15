import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// A sua URL atualizada com o IP correto!
const API_URL = 'http://172.20.10.5:3000/historico';

type Prontuario = {
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

export default function RecordDetail() {
  const { id } = useLocalSearchParams();
  const [paciente, setPaciente] = useState<Prontuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AQUI ESTÁ A TRAVA DE SEGURANÇA!
    if (!id) return; 
    
    buscarDetalhes();
  }, [id]);

  const buscarDetalhes = async () => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      setPaciente(res.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do prontuário.');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataIso: string | undefined) => {
    if (!dataIso) return "Data indisponível";
    const data = new Date(dataIso);
    return `${data.toLocaleDateString('pt-BR')} às ${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#168C8C" />
        <Text style={styles.loadingText}>Carregando prontuário...</Text>
      </View>
    );
  }

  if (!paciente) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorText}>Prontuário não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Configuração da Barra Superior do App */}
      <Stack.Screen 
        options={{ 
          title: 'Prontuário Médico', 
          headerBackTitle: 'Voltar',
          headerTintColor: '#111827',
          headerStyle: { backgroundColor: '#FFF' },
          headerShadowVisible: false,
        }} 
      />

      {/* Faixa de cor da Triagem */}
      <View style={[styles.triageBanner, { backgroundColor: paciente.cor }]}>
        <Ionicons name="warning" size={20} color="#FFF" />
        <Text style={styles.bannerText}>
          Classificação de Risco Identificada
        </Text>
      </View>

      <View style={styles.content}>
        
        {/* CARD 1: Identificação do Paciente */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={40} color="#9CA3AF" />
            <View style={styles.headerText}>
              <Text style={styles.patientName}>{paciente.nome}</Text>
              <Text style={styles.patientId}>Prontuário #{paciente.id}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>CPF</Text>
              <Text style={styles.infoValue}>{paciente.cpf || 'Não informado'}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Data da Alta</Text>
              <Text style={styles.infoValue}>{formatarData(paciente.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* CARD 2: Sinais Vitais */}
        <Text style={styles.sectionTitle}>Sinais Vitais na Triagem</Text>
        <View style={styles.vitalsGrid}>
          
          <View style={styles.vitalCard}>
            <Ionicons name="heart-half" size={24} color="#EF4444" />
            <Text style={styles.vitalLabel}>Pressão</Text>
            <Text style={styles.vitalValue}>{paciente.pa}</Text>
          </View>

          <View style={styles.vitalCard}>
            <Ionicons name="thermometer" size={24} color="#F59E0B" />
            <Text style={styles.vitalLabel}>Temp.</Text>
            <Text style={styles.vitalValue}>{paciente.temp}°C</Text>
          </View>

          <View style={styles.vitalCard}>
            <Ionicons name="water" size={24} color="#3B82F6" />
            <Text style={styles.vitalLabel}>Saturação</Text>
            <Text style={styles.vitalValue}>{paciente.sat}%</Text>
          </View>

        </View>

        {/* CARD 3: Análise da IA */}
        <Text style={styles.sectionTitle}>Análise do Sistema (IA)</Text>
        <View style={styles.card}>
          <View style={styles.iaHeader}>
            <Ionicons name="hardware-chip" size={28} color="#168C8C" />
            <View style={styles.iaTitleContainer}>
              <Text style={styles.iaTitle}>IA Score de Risco</Text>
              <Text style={styles.iaSubtitle}>Nível de gravidade calculado</Text>
            </View>
            <Text style={styles.iaScore}>{paciente.iaScore}%</Text>
          </View>

          <View style={styles.iaProgressBarBackground}>
            <View 
              style={[
                styles.iaProgressBarFill, 
                { width: `${paciente.iaScore}%`, backgroundColor: paciente.cor }
              ]} 
            />
          </View>
          <Text style={styles.iaDisclaimer}>
            O score é calculado com base nos sinais vitais inseridos e no Protocolo de Manchester.
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBEFF2' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EBEFF2' },
  loadingText: { marginTop: 10, color: '#6B7280', fontSize: 16 },
  errorText: { marginTop: 10, color: '#EF4444', fontSize: 18, fontWeight: 'bold' },
  
  triageBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8 },
  bannerText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' },
  
  content: { padding: 20, paddingBottom: 40 },
  
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 25, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  headerText: { marginLeft: 15 },
  patientName: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  patientId: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 15 },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBlock: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600', marginBottom: 4 },
  infoValue: { fontSize: 15, color: '#374151', fontWeight: '500' },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 10, marginLeft: 5 },
  
  vitalsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, gap: 10 },
  vitalCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 15, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  vitalLabel: { fontSize: 12, color: '#6B7280', marginTop: 8, marginBottom: 4 },
  vitalValue: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  
  iaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iaTitleContainer: { flex: 1, marginLeft: 15 },
  iaTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  iaSubtitle: { fontSize: 12, color: '#6B7280' },
  iaScore: { fontSize: 24, fontWeight: 'bold', color: '#168C8C' },
  
  iaProgressBarBackground: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  iaProgressBarFill: { height: '100%', borderRadius: 4 },
  iaDisclaimer: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', marginTop: 5 }
});