import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://192.168.15.8:3000/triagens';
const API_RECEPCAO_URL = 'http:/192.168.15.8:3000/recepcao';

type PacienteAguardando = {
  id: string;
  nome: string;
  cpf: string;
  entrada: string;
};

type PacienteClassificado = {
  id: string;
  nome: string;
  cpf: string;
  pa: string;
  temp: string;
  sat: string;
  cor: string;
  iaScore: number;
};

type FormData = {
  id: string;
  idRecepcao?: string | null;
  nome: string;
  cpf: string;
  pa: string;
  temp: string;
  sat: string;
};

const formatCpf = (value: string) => {
  let digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 9) return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  if (digits.length > 6) return digits.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  if (digits.length > 3) return digits.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  return digits;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<PacienteClassificado[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<PacienteClassificado | null>(null);
  const [showAguardando, setShowAguardando] = useState(true);
  const [modalRecepcaoVisible, setModalRecepcaoVisible] = useState(false);
  const [recepcaoData, setRecepcaoData] = useState({ nome: '', cpf: '' });
  
  const [pacientesAguardando, setPacientesAguardando] = useState<PacienteAguardando[]>([]);
  
  // Adicionado o idRecepcao para saber quem deletar depois da triagem
  const [formData, setFormData] = useState<FormData>({ id: '', idRecepcao: null, nome: '', cpf: '', pa: '', temp: '', sat: '' });
  const [isCarregando, setIsCarregando] = useState(false);

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      // 1. Busca as triagens finalizadas
      const resTriagens = await axios.get(API_URL);
      setPacientes(resTriagens.data);

      // 2. Busca a fila da recepção no banco de dados
      const resRecepcao = await axios.get(API_RECEPCAO_URL);
      setPacientesAguardando(resRecepcao.data);
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchPacientes();
    setIsRefreshing(false);
  };

  const handleAdicionarRecepcao = async () => {
    if (!recepcaoData.nome.trim() || !recepcaoData.cpf.trim()) {
      Alert.alert('Atenção', 'O nome e o CPF do paciente são obrigatórios para a fila.');
      return;
    }

    const horario = new Date();
    const entrada = `${String(horario.getHours()).padStart(2, '0')}:${String(horario.getMinutes()).padStart(2, '0')}`;

    try {
      // Salva no banco de dados
      await axios.post(API_RECEPCAO_URL, {
        nome: recepcaoData.nome.trim(),
        cpf: recepcaoData.cpf,
        entrada
      });

      setRecepcaoData({ nome: '', cpf: '' });
      setModalRecepcaoVisible(false);
      fetchPacientes(); // Atualiza a lista buscando do banco
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar à recepção.');
    }
  };

  const handleClassificar = async () => {
    if (!formData.nome || !formData.cpf || !formData.pa || !formData.temp || !formData.sat) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios (CPF incluso)!');
      return;
    }

    setIsCarregando(true);
    try {
      if (formData.id) {
        await axios.put(`${API_URL}/${formData.id}`, formData);
        Alert.alert('Sucesso', 'Triagem atualizada e reclassificada pela IA!');
      } else {
        await axios.post(API_URL, formData);
        
        // Se o paciente veio da recepção, exclui ele da fila de espera do banco
        if (formData.idRecepcao) {
          await axios.delete(`${API_RECEPCAO_URL}/${formData.idRecepcao}`);
        }
        
        Alert.alert('Sucesso', 'Paciente classificado pela IA com sucesso!');
      }

      setModalVisible(false);
      setFormData({ id: '', idRecepcao: null, nome: '', cpf: '', pa: '', temp: '', sat: '' });
      fetchPacientes();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a triagem.');
    } finally {
      setIsCarregando(false);
    }
  };

  const iniciarTriagem = (paciente: PacienteAguardando) => {
    // Passa o ID da recepção para podermos apagar ele quando classificar
    setFormData({ id: '', idRecepcao: paciente.id, nome: paciente.nome, cpf: paciente.cpf || '', pa: '', temp: '', sat: '' });
    setModalVisible(true);
  };

  const abrirDetalhesPaciente = (paciente: PacienteClassificado) => {
    setPacienteSelecionado(paciente);
    setModalDetalhesVisible(true);
  };

  const prepararEdicao = () => {
    if (!pacienteSelecionado) return;
    setFormData({
      id: pacienteSelecionado.id,
      idRecepcao: null,
      nome: pacienteSelecionado.nome,
      cpf: pacienteSelecionado.cpf || '',
      pa: pacienteSelecionado.pa,
      temp: String(pacienteSelecionado.temp),
      sat: String(pacienteSelecionado.sat),
    });
    setModalDetalhesVisible(false);
    setModalVisible(true);
  };

  const darAltaPaciente = async () => {
    if (!pacienteSelecionado) return;

    Alert.alert('Dar Alta / Excluir', `Deseja remover ${pacienteSelecionado.nome} da fila de atendimento?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim, Dar Alta',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/${pacienteSelecionado.id}`);
            setModalDetalhesVisible(false);
            fetchPacientes();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível remover o paciente.');
          }
        },
      },
    ]);
  };

  const renderCardRisco = (corBase: string, tituloCor: string, subtitulo: string) => {
    const quantidade = pacientes.filter(p => p.cor === corBase).length;
    const qtdFormatada = quantidade < 10 ? `0${quantidade}` : String(quantidade);

    return (
      <View style={styles.riskCardWrapper}>
        <View style={[styles.riskBox, { backgroundColor: corBase }]}> 
          <Text style={styles.riskBoxNumber}>{qtdFormatada}</Text>
        </View>
        <Text style={styles.riskCardColorTitle}>{tituloCor}</Text>
        <Text style={styles.riskCardSub}>{subtitulo}</Text>
      </View>
    );
  };

  const atualizaCpfRecepcao = (cpf: string) => setRecepcaoData({ ...recepcaoData, cpf: formatCpf(cpf) });
  const atualizaCpfForm = (cpf: string) => setFormData({ ...formData, cpf: formatCpf(cpf) });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.menuButton} onPress={() => {}}>
            <Ionicons name="menu" size={32} color="#168C8C" />
          </TouchableOpacity>
          <Image source={require('../../assets/images/logob.png')} style={styles.logo} />
          <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.pageTitle}>Painel de Controle - Emergência</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#168C8C']} />}
      >
        <Text style={styles.sectionHeading}>RESUMO DO PLANTÃO</Text>
        <View style={styles.resumoContainer}>
          {renderCardRisco('#EF4444', 'VERMELHO', 'Emergência')}
          {renderCardRisco('#F97316', 'LARANJA', 'Muito Urgente')}
          {renderCardRisco('#EAB308', 'AMARELO', 'Urgente')}
          {renderCardRisco('#84CC16', 'VERDE', 'Pouco Urgente')}
          {renderCardRisco('#3B82F6', 'AZUL', 'Não Urgente')}
        </View>

        <Text style={styles.sectionHeading}>FILA DE PACIENTES</Text>
        <View style={styles.filaContainer}>
          <TouchableOpacity style={styles.accordionHeader} activeOpacity={0.8} onPress={() => setShowAguardando(!showAguardando)}>
            <View style={styles.iconAlert}>
              <Text style={styles.iconAlertText}>!</Text>
            </View>
            <Text style={styles.accordionTitle}>AGUARDANDO TRIAGEM ({pacientesAguardando.length})</Text>
            <Ionicons name={showAguardando ? 'chevron-up' : 'chevron-down'} size={20} color="#333" />
          </TouchableOpacity>

          {showAguardando && (
            <View style={styles.accordionContent}>
              {pacientesAguardando.map(paciente => (
                <View key={paciente.id} style={styles.aguardandoItem}>
                  <Text style={styles.aguardandoText}>
                    <Ionicons name="chevron-forward" size={14} color="#666" /> {paciente.nome} | {paciente.entrada}
                  </Text>
                  <TouchableOpacity style={styles.triarBtn} onPress={() => iniciarTriagem(paciente)}>
                    <Text style={styles.triarBtnText}>TRIAR</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {pacientesAguardando.length === 0 && <Text style={styles.aguardandoText}>Nenhum paciente aguardando.</Text>}

              <TouchableOpacity style={styles.addAguardandoBtn} onPress={() => setModalRecepcaoVisible(true)}>
                <Ionicons name="add-circle-outline" size={20} color="#168C8C" />
                <Text style={styles.addAguardandoText}>Adicionar à Fila</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.accordionTitle, { marginTop: 20, marginBottom: 10, paddingHorizontal: 5 }]}>PACIENTES CLASSIFICADOS ({pacientes.length})</Text>

          {pacientes.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma triagem finalizada.</Text>
          ) : (
            pacientes.map(paciente => (
              <TouchableOpacity key={paciente.id} style={styles.patientCard} activeOpacity={0.7} onPress={() => abrirDetalhesPaciente(paciente)}>
                <View style={[styles.colorIndicator, { backgroundColor: paciente.cor }]} />
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{paciente.nome}</Text>
                  <Text style={styles.patientCpf}>CPF: {paciente.cpf || 'Não informado'}</Text>
                  <View style={styles.vitalsRow}>
                    <Text style={styles.vitalTag}>PA: {paciente.pa}</Text>
                    <Text style={styles.vitalTag}>T: {paciente.temp}°C</Text>
                    <Text style={styles.vitalTag}>S: {paciente.sat}</Text>
                  </View>
                </View>
                <View style={styles.iaScoreContainer}>
                  <Text style={styles.iaScoreLabel}>IA Score</Text>
                  <Text style={styles.iaScoreValue}>{paciente.iaScore}%</Text>
                </View>
              </TouchableOpacity>
            ))
          )}

        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => {
          setFormData({ id: '', idRecepcao: null, nome: '', cpf: '', pa: '', temp: '', sat: '' });
          setModalVisible(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal animationType="fade" transparent visible={modalDetalhesVisible} onRequestClose={() => setModalDetalhesVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentSmall}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Paciente</Text>
              <TouchableOpacity onPress={() => setModalDetalhesVisible(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            {pacienteSelecionado && (
              <>
                <View style={styles.detailsHeader}>
                  <View style={[styles.colorIndicatorModal, { backgroundColor: pacienteSelecionado.cor }]} />
                  <View style={styles.detailsHeaderText}>
                    <Text style={styles.detailsName}>{pacienteSelecionado.nome}</Text>
                    <Text style={styles.detailsCpf}>CPF: {pacienteSelecionado.cpf}</Text>
                  </View>
                </View>

                <View style={styles.vitalsRow}>
                  <Text style={styles.vitalTag}>P.A.: {pacienteSelecionado.pa}</Text>
                  <Text style={styles.vitalTag}>Temp: {pacienteSelecionado.temp}°C</Text>
                  <Text style={styles.vitalTag}>Sat: {pacienteSelecionado.sat}%</Text>
                </View>

                <View style={styles.detailsActions}>
                  <TouchableOpacity style={[styles.button, styles.editButton]} onPress={prepararEdicao}>
                    <Text style={styles.buttonText}>✎ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={darAltaPaciente}>
                    <Text style={styles.buttonText}>✓ Dar Alta</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent visible={modalRecepcaoVisible} onRequestClose={() => setModalRecepcaoVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContentSmall}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recepção</Text>
              <TouchableOpacity onPress={() => setModalRecepcaoVisible(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Adicione o paciente à fila de triagem.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Maria da Silva"
                value={recepcaoData.nome}
                onChangeText={text => setRecepcaoData({ ...recepcaoData, nome: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF</Text>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                keyboardType="numeric"
                maxLength={14}
                value={recepcaoData.cpf}
                onChangeText={atualizaCpfRecepcao}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleAdicionarRecepcao}>
              <Text style={styles.buttonText}>Salvar na Fila</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{formData.id ? 'Editar Triagem' : 'Nova Triagem'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>A IA fará a classificação pelo Protocolo de Manchester.</Text>

            <ScrollView>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: João da Silva"
                  value={formData.nome}
                  onChangeText={text => setFormData({ ...formData, nome: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CPF</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00"
                  keyboardType="numeric"
                  maxLength={14}
                  value={formData.cpf}
                  onChangeText={atualizaCpfForm}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>P.A.</Text>
                  <TextInput style={styles.input} placeholder="12/8" value={formData.pa} onChangeText={text => setFormData({ ...formData, pa: text })} />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Temp.</Text>
                  <TextInput style={styles.input} placeholder="37.5" keyboardType="numeric" value={formData.temp} onChangeText={text => setFormData({ ...formData, temp: text })} />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Sat. (%)</Text>
                  <TextInput style={styles.input} placeholder="98" keyboardType="numeric" value={formData.sat} onChangeText={text => setFormData({ ...formData, sat: text })} />
                </View>
              </View>

              <TouchableOpacity style={[styles.button, isCarregando && styles.buttonDisabled]} onPress={handleClassificar} disabled={isCarregando}>
                <Text style={styles.buttonText}>{isCarregando ? 'Processando IA...' : formData.id ? 'Salvar Alterações' : 'Analisar e Classificar'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBEFF2' },
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#D1D5DB' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuButton: { padding: 5, marginLeft: -5 },
  logo: { width: 120, height: 40, resizeMode: 'contain' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 5 },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 15 },

  scrollContent: { paddingBottom: 100 },
  sectionHeading: { fontSize: 18, color: '#111827', marginTop: 20, marginBottom: 10, paddingHorizontal: 20 },

  resumoContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  riskCardWrapper: { alignItems: 'center', flex: 1, marginHorizontal: 2 },
  riskBox: { width: '100%', aspectRatio: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  riskBoxNumber: { fontSize: 28, fontWeight: '400', color: '#FFF' },
  riskCardColorTitle: { fontSize: 10, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  riskCardSub: { fontSize: 9, color: '#555', textAlign: 'center' },

  filaContainer: { paddingHorizontal: 20 },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  iconAlert: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#757575', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  iconAlertText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  accordionTitle: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#333' },
  accordionContent: { backgroundColor: '#FFF', borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#D1D5DB', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  aguardandoItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  aguardandoText: { fontSize: 14, color: '#111827', flex: 1 },
  triarBtn: { backgroundColor: '#C4C4C4', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  triarBtnText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  addAguardandoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, backgroundColor: '#F0FDF4', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, gap: 5 },
  addAguardandoText: { color: '#168C8C', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 20, fontSize: 14 },

  patientCard: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 15, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  colorIndicator: { width: 10 },
  patientInfo: { flex: 1, padding: 15 },
  patientName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  patientCpf: { fontSize: 12, color: '#6B7280', marginTop: 2, marginBottom: 8 },
  vitalsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  vitalTag: { backgroundColor: '#F3F4F6', color: '#374151', fontSize: 12, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  iaScoreContainer: { padding: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA', borderLeftWidth: 1, borderColor: '#F3F4F6', minWidth: 80 },
  iaScoreLabel: { fontSize: 10, color: '#6B7280', fontWeight: 'bold', marginBottom: 2 },
  iaScoreValue: { fontSize: 16, fontWeight: '900', color: '#168C8C' },

  fab: { position: 'absolute', bottom: 30, right: 25, width: 65, height: 65, borderRadius: 35, backgroundColor: '#168C8C', justifyContent: 'center', alignItems: 'center', shadowColor: '#168C8C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  fabText: { color: '#FFF', fontSize: 36, fontWeight: '300', marginTop: -2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingVertical: 25 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 25, padding: 25, width: '90%', alignSelf: 'center', height: '52%' },
  modalContentSmall: { backgroundColor: '#FFF', borderRadius: 25, padding: 25, width: '90%', height: '40%', alignSelf: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  closeModalText: { fontSize: 24, color: '#9CA3AF', paddingHorizontal: 10 },
  modalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 25 },

  detailsHeader: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  colorIndicatorModal: { width: 16, height: 16, borderRadius: 8 },
  detailsHeaderText: { marginLeft: 15, flex: 1 },
  detailsName: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  detailsCpf: { color: '#6B7280', marginTop: 2 },
  detailsActions: { flexDirection: 'row', gap: 10, marginTop: 25 },
  editButton: { flex: 1, backgroundColor: '#EAB308', marginTop: 0 },
  deleteButton: { flex: 1, backgroundColor: '#EF4444', marginTop: 0 },

  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 14, fontSize: 16, color: '#111827' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  halfInput: { flex: 1 },
  button: { backgroundColor: '#168C8C', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});