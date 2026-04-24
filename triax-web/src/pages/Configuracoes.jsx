import React, { useState } from 'react';
import { Settings, Clock, Bot, Bell, Save } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import logoTriax from '../assets/logob.png'; // <-- IMPORTAÇÃO DA LOGO
import './Configuracoes.css';

export default function Configuracoes() {
  const [menuAberto, setMenuAberto] = useState(false);

  // Estados das configurações
  const [usarIA, setUsarIA] = useState(true);
  const [alertas, setAlertas] = useState(true);
  
  // Tempos padrão do Protocolo de Manchester (em minutos)
  const [tempos, setTempos] = useState({
    vermelho: 0,
    laranja: 10,
    amarelo: 60,
    verde: 120,
    azul: 240
  });

  const handleSalvar = () => {
    alert('Configurações atualizadas com sucesso!');
  };

  return (
    <div className="settings-container">
      {/* MENU LATERAL */}
      <Sidebar isOpen={menuAberto} onClose={() => setMenuAberto(false)} />

      {/* CABEÇALHO PADRÃO (Igual ao Histórico e Dashboard) */}
      <header className="page-top-header">
        <div className="header-left">
          <span className="menu-trigger-icon" onClick={() => setMenuAberto(true)}>☰</span>
          <img src={logoTriax} alt="TRIAX" className="header-logo" />
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="settings-main-content">
        
        {/* TÍTULO FORA DO CABEÇALHO */}
        <div className="page-title-section">
          <h1 className="main-title">Configurações do Sistema</h1>
          <p className="main-subtitle">Gerencie os parâmetros de triagem e preferências do plantão.</p>
        </div>
        
        {/* BLOCO 1: Tempos de Espera */}
        <div className="settings-card">
          <div className="card-header">
            <Clock size={24} className="card-icon" />
            <h2>Tempos Alvo (Protocolo)</h2>
          </div>
          <p className="card-desc">Defina o tempo máximo de espera em minutos para cada classificação de risco.</p>
          
          <div className="time-inputs-grid">
            <div className="time-input-group">
              <span className="color-dot" style={{ backgroundColor: '#EF4444' }}></span>
              <label>Vermelho (Emergência)</label>
              <input type="number" value={tempos.vermelho} onChange={(e) => setTempos({...tempos, vermelho: e.target.value})} />
            </div>
            <div className="time-input-group">
              <span className="color-dot" style={{ backgroundColor: '#F97316' }}></span>
              <label>Laranja (Muito Urgente)</label>
              <input type="number" value={tempos.laranja} onChange={(e) => setTempos({...tempos, laranja: e.target.value})} />
            </div>
            <div className="time-input-group">
              <span className="color-dot" style={{ backgroundColor: '#EAB308' }}></span>
              <label>Amarelo (Urgente)</label>
              <input type="number" value={tempos.amarelo} onChange={(e) => setTempos({...tempos, amarelo: e.target.value})} />
            </div>
            <div className="time-input-group">
              <span className="color-dot" style={{ backgroundColor: '#84CC16' }}></span>
              <label>Verde (Pouco Urgente)</label>
              <input type="number" value={tempos.verde} onChange={(e) => setTempos({...tempos, verde: e.target.value})} />
            </div>
            <div className="time-input-group">
              <span className="color-dot" style={{ backgroundColor: '#3B82F6' }}></span>
              <label>Azul (Não Urgente)</label>
              <input type="number" value={tempos.azul} onChange={(e) => setTempos({...tempos, azul: e.target.value})} />
            </div>
          </div>
        </div>

        {/* BLOCO 2: IA e Alertas */}
        <div className="settings-card">
          <div className="card-header">
            <Bot size={24} className="card-icon" />
            <h2>Inteligência Artificial</h2>
          </div>
          <div className="toggle-row">
            <div>
              <strong>Assistente de Classificação (IA)</strong>
              <p>Permitir que a IA sugira a cor e o score do paciente com base nos sinais vitais.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={usarIA} onChange={() => setUsarIA(!usarIA)} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <Bell size={24} className="card-icon" />
            <h2>Notificações do Plantão</h2>
          </div>
          <div className="toggle-row">
            <div>
              <strong>Alerta de Tempo Excedido</strong>
              <p>Destacar em vermelho os pacientes que ultrapassaram o tempo alvo na fila.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={alertas} onChange={() => setAlertas(!alertas)} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="save-container">
          <button className="btn-save" onClick={handleSalvar}>
            <Save size={20} />
            Salvar Alterações
          </button>
        </div>

      </main>
    </div>
  );
}