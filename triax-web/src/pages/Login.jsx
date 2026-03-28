import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoTriax from '../assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/login', {
        email,
        senha
      });

      localStorage.setItem('tokenTriax', response.data.token);
      navigate('/dashboard'); 

    } catch (error) {
      alert(error.response?.data?.erro || 'Erro inesperado ao fazer login.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.logoContainer}>
          <img src={logoTriax} alt="TRIAX" style={styles.logoImage} />
        </div>
        <h2 style={styles.title}>Bem-vindo de volta!</h2>

        <form style={styles.form} onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail</label>
            <input 
              type="email" 
              placeholder="Digite seu e-mail" 
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input 
              type="password" 
              placeholder="Digite sua senha" 
              style={styles.input}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={styles.button}>Entrar</button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Não tem conta? </span>
          <span style={styles.linkText} onClick={() => navigate('/cadastro')}>
            Cadastre-se
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', fontFamily: 'Arial, sans-serif' },
  content: { width: '100%', maxWidth: '400px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  logoContainer: { marginBottom: '20px' },
  logoImage: { width: '260px', height: 'auto' }, 
  title: { fontSize: '24px', color: '#333', marginBottom: '10px', fontWeight: 'normal' },
  form: { width: '100%', display: 'flex', flexDirection: 'column' },
  inputGroup: { display: 'flex', flexDirection: 'column', marginBottom: '20px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '8px' },
  input: { height: '45px', padding: '0 15px', fontSize: '15px', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#F5F5F5', outline: 'none', fontStyle: 'italic' },
  button: { height: '50px', background: 'linear-gradient(90deg, #0f606b, #209d9d)', color: '#FFF', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', transition: 'opacity 0.2s' },
  footer: { marginTop: '20px', fontSize: '15px' },
  footerText: { color: '#333' },
  linkText: { fontWeight: 'bold', color: '#333', cursor: 'pointer', textDecoration: 'underline' }
};