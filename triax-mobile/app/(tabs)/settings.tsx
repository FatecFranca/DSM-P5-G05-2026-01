import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  PanResponder,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState(true);
  const [sons, setSons] = useState(true);
  const [vibracao, setVibracao] = useState(true);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dy) < 10,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          router.back();
        }
      },
    })
  ).current;

  const handleIssoCorreto = () => {
    Alert.alert(
      'Seu dispositivo está configurado corretamente!',
      'A conexão de rede está estável e o aplicativo é compatível com esta versão.'
    );
  };

  const handleVerificacao = () => {
    Alert.alert(
      'Verificação concluída',
      'Sua aplicação foi verificada com sucesso. Nenhum problema detectado.'
    );
  };

  const handleSuporte = () => {
    Alert.alert(
      'Contate o suporte',
      'Email: support@triax.com\nTelefone: +55 (11) 98765-4321'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} {...panResponder.panHandlers}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#168C8C" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Configurações</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Seção: Notificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color="#168C8C" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Notificações</Text>
                <Text style={styles.settingDescription}>Receba alertas de triagens novas</Text>
              </View>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={setNotificacoes}
              thumbColor={notificacoes ? '#168C8C' : '#ccc'}
              trackColor={{ false: '#e0e0e0', true: '#b3e5fc' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-high-outline" size={24} color="#168C8C" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Sons</Text>
                <Text style={styles.settingDescription}>Sons de notificação ativados</Text>
              </View>
            </View>
            <Switch
              value={sons}
              onValueChange={setSons}
              thumbColor={sons ? '#168C8C' : '#ccc'}
              trackColor={{ false: '#e0e0e0', true: '#b3e5fc' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait-outline" size={24} color="#168C8C" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Vibração</Text>
                <Text style={styles.settingDescription}>Feedback tátil ativado</Text>
              </View>
            </View>
            <Switch
              value={vibracao}
              onValueChange={setVibracao}
              thumbColor={vibracao ? '#168C8C' : '#ccc'}
              trackColor={{ false: '#e0e0e0', true: '#b3e5fc' }}
            />
          </View>
        </View>

        {/* Seção: Sistema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sistema</Text>

          <TouchableOpacity style={styles.buttonRow} onPress={handleVerificacao}>
            <View style={styles.buttonInfo}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#168C8C" />
              <View>
                <Text style={styles.buttonLabel}>Verificar aplicativo</Text>
                <Text style={styles.buttonDescription}>Verificar integridade do sistema</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonRow} onPress={handleIssoCorreto}>
            <View style={styles.buttonInfo}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#168C8C" />
              <View>
                <Text style={styles.buttonLabel}>Isso está correto?</Text>
                <Text style={styles.buttonDescription}>Verifique sua configuração</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Seção: Sobre e Suporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>

          <TouchableOpacity style={styles.buttonRow} onPress={handleSuporte}>
            <View style={styles.buttonInfo}>
              <Ionicons name="help-circle-outline" size={24} color="#168C8C" />
              <View>
                <Text style={styles.buttonLabel}>Contato de suporte</Text>
                <Text style={styles.buttonDescription}>Fale com nosso suporte</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#0284C7" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Versão do aplicativo</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="phone-portrait-outline" size={20} color="#0284C7" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Dispositivo</Text>
              <Text style={styles.infoValue}>iOS / Android</Text>
            </View>
          </View>
        </View>

        {/* Espaço extra no final */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EBEFF2' },
  container: { flex: 1, backgroundColor: '#EBEFF2' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backButton: { padding: 8 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },

  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 15 },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  settingDescription: { fontSize: 12, color: '#6B7280' },

  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  buttonInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  buttonLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  buttonDescription: { fontSize: 12, color: '#6B7280' },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 12,
  },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 13, fontWeight: '600', color: '#0284C7', marginBottom: 2 },
  infoValue: { fontSize: 12, color: '#0284C7' },
});
