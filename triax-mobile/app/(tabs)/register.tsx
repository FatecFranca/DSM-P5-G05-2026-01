import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://192.168.15.8:3000/cadastro';

export default function RegisterScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isCarregando, setIsCarregando] = useState(false);

  const handleRegister = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setIsCarregando(true);

    try {
      await axios.post(API_URL, { nome, email: email.trim(), senha });
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      const mensagemErro = error.response?.data?.erro || 'Erro de conexão ao cadastrar.';
      Alert.alert('Erro no Cadastro', mensagemErro);
    } finally {
      setIsCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/logob.png')} style={styles.logo} />
          <Text style={styles.title}>Bem-vindo de volta!</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput style={styles.input} placeholder="Digite seu nome completo" autoCapitalize="words" value={nome} onChangeText={setNome} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput style={styles.input} placeholder="Digite seu e-mail profissional" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput style={styles.input} placeholder="Digite sua senha" secureTextEntry value={senha} onChangeText={setSenha} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput style={styles.input} placeholder="Digite sua senha novamente" secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} />
          </View>

          <TouchableOpacity style={[styles.button, isCarregando && styles.buttonDisabled]} onPress={handleRegister} disabled={isCarregando}>
            <Text style={styles.buttonText}>{isCarregando ? 'Cadastrando...' : 'Cadastrar'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Faça login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  header: { alignItems: 'center', marginBottom: 40, marginTop: -30 },
  logo: { width: 180, height: 180, marginBottom: -25, marginTop: 20, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  formCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 15, fontWeight: 'bold', color: '#555', marginBottom: 8, marginLeft: 5 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#111827',
  },
  button: { backgroundColor: '#168C8C', padding: 17, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: '#6B7280' },
  loginLink: { fontSize: 14, color: '#168C8C', fontWeight: 'bold', textDecorationLine: 'underline' },
});
