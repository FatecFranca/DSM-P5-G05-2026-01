import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable, Image } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  const [menuVisivel, setMenuVisivel] = useState(false);
  const router = useRouter();

  // Função para navegar no menu
  const navegarPara = (rota: '/triage' | '/history' | '/(tabs)/settings') => {
    setMenuVisivel(false);
    router.push(rota);
  };

  // Função do botão Sair
  const fazerLogout = () => {
    setMenuVisivel(false);
    router.replace('/'); // Joga o usuário de volta para a tela de Login
  };

  // SEU CABEÇALHO PERSONALIZADO (Menu + Logo + Sair)
  const CustomHeader = () => (
    <View style={styles.header}>
      {/* Botão Menu  */}
      <TouchableOpacity onPress={() => setMenuVisivel(true)} style={styles.menuButton}>
        <Ionicons name="menu" size={32} color="#168C8C" />
      </TouchableOpacity>

      {/* Logo Centralizada */}
      <Image 
        source={require('../assets/images/logob.png')} 
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Botão Sair */}
      <TouchableOpacity onPress={fazerLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Mantém a barra de baixo escondida
      }}>
        
        {/* TELA PRINCIPAL */}
        <Tabs.Screen
          name="triage" 
          options={{ 
            header: () => <CustomHeader /> 
          }}
        />
        
        {/* TELA DE HISTÓRICO */}
        <Tabs.Screen
          name="history"
          options={{ 
            header: () => <CustomHeader /> 
          }}
        />

        {/* TELA DE CONFIGURAÇÕES */}
        <Tabs.Screen
          name="settings"
          options={{ 
            headerShown: false
          }}
        />
        
      </Tabs>

      {/* MENU LATERAL DESLIZANTE */}
      <Modal visible={menuVisivel} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackground} onPress={() => setMenuVisivel(false)} />
          
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerLogo}>TRIAX</Text>
              <TouchableOpacity onPress={() => setMenuVisivel(false)}>
                <Ionicons name="close" size={28} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Link para a tela de triagem */}
            <TouchableOpacity style={styles.menuItem} onPress={() => navegarPara('/triage')}>
              <Ionicons name="pulse" size={24} color="#168C8C" />
              <Text style={styles.menuText}>Fila Ativa</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navegarPara('/history')}>
              <Ionicons name="time" size={24} color="#168C8C" />
              <Text style={styles.menuText}>Histórico</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => navegarPara('/(tabs)/settings')}>
              <Ionicons name="settings-outline" size={24} color="#168C8C" />
              <Text style={styles.menuText}>Configurações</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
               <TouchableOpacity style={styles.menuItem} onPress={fazerLogout}>
                 <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                 <Text style={[styles.menuText, { color: '#EF4444' }]}>Sair da Conta</Text>
               </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Estilos do Cabeçalho
  header: {
    height: 68,
    paddingTop: 18, // Dá espaço para a barra de status do celular
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuButton: { padding: 5, marginLeft: -5 },
  logo: { width: 190, height: 44 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8 },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },

  // Estilos do Menu Modal
  modalOverlay: { flex: 1, flexDirection: 'row' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '75%', backgroundColor: '#FFF', padding: 20, paddingTop: 50, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  drawerLogo: { fontSize: 24, fontWeight: '900', color: '#168C8C', letterSpacing: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, marginBottom: 5 },
  menuText: { fontSize: 16, fontWeight: '600', color: '#111827', marginLeft: 15 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 15 },
  footer: { flex: 1, justifyContent: 'flex-end', marginBottom: 20 }
});