import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoTriax from '../assets/logob.png';

export default function Dashboard() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estados do Banco (Pacientes Classificados)
  const [pacientes, setPacientes] = useState([]);
  
  // Estados da Fila de Recepção (Aguardando)
  const [pacientesAguardando, setPacientesAguardando] = useState([]);
  const [isRecepcaoModalOpen, setIsRecepcaoModalOpen] = useState(false);
  const [recepcaoData, setRecepcaoData] = useState({ nome: '', cpf: '' });

  // Estados do Formulário de Triagem
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ idRecepcao: null, nome: '', cpf: '', pa: '', temp: '', sat: '', cor: '#84CC16', iaScore: 100 });

  const dataAtual = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  // ==========================================
  // SINCRONIZAÇÃO EM TEMPO REAL (POLLING)
  // ==========================================
  useEffect(() => {
    buscarPacientes();
    
    // O "Radar": a cada 3 segundos ele busca dados novos do banco
    const interval = setInterval(() => {
      buscarPacientes();
    }, 3000);

    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'n') abrirNovaTriagem();
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const buscarPacientes = async () => {
    try {
      const resTriagens = await axios.get('http://localhost:3000/triagens');
      setPacientes(resTriagens.data);

      // Busca também a fila de recepção do banco
      const resRecepcao = await axios.get('http://localhost:3000/recepcao');
      setPacientesAguardando(resRecepcao.data);
    } catch (err) {
      console.error("Erro ao carregar banco de dados", err);
    }
  };

  // ==========================================
  // MÁSCARA DE CPF
  // ==========================================
  const aplicarMascaraCPF = (valor) => {
    let val = valor.replace(/\D/g, ''); 
    if (val.length > 11) val = val.substring(0, 11); 
    if (val.length > 9) val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    else if (val.length > 6) val = val.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (val.length > 3) val = val.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    return val;
  };

  // ==========================================
  // FUNÇÕES DA RECEPÇÃO
  // ==========================================
  const handleAdicionarRecepcao = async (e) => {
    e.preventDefault();
    if (!recepcaoData.nome || !recepcaoData.cpf) return alert('O nome e o CPF são obrigatórios!');

    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');

    try {
      // Salva no banco de dados via API
      await axios.post('http://localhost:3000/recepcao', {
        nome: recepcaoData.nome,
        cpf: recepcaoData.cpf,
        entrada: `${horas}:${minutos}`
      });
      
      setRecepcaoData({ nome: '', cpf: '' });
      setIsRecepcaoModalOpen(false);
      buscarPacientes(); // Atualiza a tela
    } catch (err) {
      alert("Erro ao adicionar na fila do banco de dados.");
    }
  };

  const iniciarTriagem = (paciente) => {
    setEditId(null);
    // Puxa o ID da recepção para podermos deletar ele depois
    setFormData({ idRecepcao: paciente.id, nome: paciente.nome, cpf: paciente.cpf || '', pa: '', temp: '', sat: '', cor: '#84CC16', iaScore: 100 });
    setIsModalOpen(true);
  };

  // ==========================================
  // FUNÇÕES DE TRIAGEM
  // ==========================================
  const handleSalvarTriagem = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:3000/triagens/${editId}`, formData);
      } else {
        await axios.post('http://localhost:3000/triagens', formData);
        
        // Se o paciente veio da recepção, exclui ele da fila de espera do banco
        if (formData.idRecepcao) {
          await axios.delete(`http://localhost:3000/recepcao/${formData.idRecepcao}`);
        }
      }
      setIsModalOpen(false);
      setEditId(null);
      setFormData({ idRecepcao: null, nome: '', cpf: '', pa: '', temp: '', sat: '', cor: '#84CC16', iaScore: 100 });
      buscarPacientes();
    } catch (err) {
      alert("Erro ao salvar no banco de dados.");
    }
  };

  const abrirNovaTriagem = () => {
    setEditId(null);
    setFormData({ idRecepcao: null, nome: '', cpf: '', pa: '', temp: '', sat: '', cor: '#84CC16', iaScore: 100 });
    setIsModalOpen(true);
  };

  const handleEditarPaciente = (paciente) => {
    setEditId(paciente.id);
    setFormData({
      idRecepcao: null, nome: paciente.nome, cpf: paciente.cpf || '', pa: paciente.pa, temp: paciente.temp, sat: paciente.sat, cor: paciente.cor, iaScore: paciente.iaScore
    });
    setIsModalOpen(true);
  };

  const handleSair = () => {
    localStorage.removeItem('tokenTriax');
    navigate('/');
  };

  const renderFilaAtiva = () => (
    <>
      <h2 style={styles.pageTitle}>Painel de Controle - Emergência</h2>

      <div style={styles.cardsContainer}>
        <div style={{...styles.card, backgroundColor: '#EF4444'}}><h3 style={styles.cardNumber}>{pacientes.filter(p => p.cor === '#EF4444').length}</h3><p style={styles.cardText}>Emergência</p></div>
        <div style={{...styles.card, backgroundColor: '#F97316'}}><h3 style={styles.cardNumber}>{pacientes.filter(p => p.cor === '#F97316').length}</h3><p style={styles.cardText}>Muito urgente</p></div>
        <div style={{...styles.card, backgroundColor: '#EAB308'}}><h3 style={styles.cardNumber}>{pacientes.filter(p => p.cor === '#EAB308').length}</h3><p style={styles.cardText}>Urgente</p></div>
        <div style={{...styles.card, backgroundColor: '#84CC16'}}><h3 style={styles.cardNumber}>{pacientes.filter(p => p.cor === '#84CC16').length}</h3><p style={styles.cardText}>Pouco urgente</p></div>
        <div style={{...styles.card, backgroundColor: '#3B82F6'}}><h3 style={styles.cardNumber}>{pacientes.filter(p => p.cor === '#3B82F6').length}</h3><p style={styles.cardText}>Não urgente</p></div>
      </div>

      <div style={styles.dashboardGrid}>
        
        {/* LADO ESQUERDO: LISTAS */}
        <div style={styles.listsColumn}>
          
          {/* SEÇÃO: AGUARDANDO TRIAGEM */}
          <div style={styles.tableSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={styles.sectionTitle}>Aguardando Triagem (Recepção)</h3>
              <button style={styles.addBtn} onClick={() => setIsRecepcaoModalOpen(true)}>+ Adicionar Fila</button>
            </div>
            
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Entrada</th>
                  <th style={styles.th}>Paciente</th>
                  <th style={{...styles.th, textAlign: 'right'}}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {pacientesAguardando.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Nenhum paciente aguardando.</td></tr>
                ) : (
                  pacientesAguardando.map((paciente) => (
                    <tr key={paciente.id} style={styles.tableRow}>
                      <td style={styles.td}><b>{paciente.entrada}</b></td>
                      <td style={styles.td}>{paciente.nome}<br/><small style={{ color: '#666' }}>CPF: {paciente.cpf || 'N/A'}</small></td>
                      <td style={{...styles.td, textAlign: 'right'}}>
                        <button style={styles.triarBtn} onClick={() => iniciarTriagem(paciente)}>[ TRIAR ]</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SEÇÃO: PACIENTES CLASSIFICADOS */}
          <div style={{...styles.tableSection, marginTop: '25px'}}>
            <h3 style={styles.sectionTitle}>Pacientes Classificados</h3>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Risco</th>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>PA</th>
                  <th style={styles.th}>Temp</th>
                  <th style={styles.th}>Sat</th>
                  <th style={styles.th}>IA Score</th>
                  <th style={{...styles.th, textAlign: 'center'}}>Editar</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((paciente) => (
                  <tr key={paciente.id} style={styles.tableRow}>
                    <td style={styles.td}><div style={{...styles.statusDot, backgroundColor: paciente.cor}}></div></td>
                    <td style={styles.td}>
                      <b>{paciente.nome}</b><br/>
                      <small style={{ color: '#666' }}>CPF: {paciente.cpf || 'Não informado'}</small>
                    </td>
                    <td style={styles.td}>{paciente.pa}</td>
                    <td style={styles.td}>{paciente.temp}°C</td>
                    <td style={styles.td}>{paciente.sat}%</td>
                    <td style={{...styles.td, fontWeight: 'bold', color: '#168C8C'}}>{paciente.iaScore}%</td>
                    <td style={{...styles.td, textAlign: 'center', cursor: 'pointer', fontSize: '20px'}} onClick={() => handleEditarPaciente(paciente)}>✎</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LADO DIREITO: GRÁFICOS */}
        <div style={styles.chartsSection}>
          <div style={styles.chartBox}>
            <h4 style={styles.chartTitle}>Tempo Médio por Risco</h4>
            <div style={styles.lineChartContainer}>
              <svg viewBox="0 0 100 50" style={styles.svgLine}>
                <path d="M5,40 L25,30 L50,35 L75,15 L95,5" fill="none" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div style={styles.chartBox}>
            <h4 style={styles.chartTitle}>Distribuição 24h</h4>
            <div style={styles.pieChartWrapper}>
              <div style={styles.pieChart}></div>
            </div>
          </div>
        </div>

      </div>
    </>
  );

  return (
    <div style={styles.appContainer}>
      <aside style={{...styles.sidebar, left: isSidebarOpen ? '0' : '-300px'}}>
        <div style={styles.sidebarHeader}>
          <img src={logoTriax} alt="TRIAX" style={styles.logoSidebar} />
          <button style={styles.closeBtn} onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
        <nav style={styles.navMenu}>
          <div style={{...styles.navItem, ...styles.navItemAtivo}}> Fila Ativa</div>
          <div style={styles.navItem}> Histórico</div>
        </nav>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.menuIcon} onClick={() => setIsSidebarOpen(true)}>☰</span>
            <img src={logoTriax} alt="TRIAX" style={styles.logoImage} />
          </div>
          <div style={styles.headerRight}>
            <span style={styles.dateText}>{dataAtual}</span>
            <div style={styles.userIcon} onClick={handleSair}>👤</div>
          </div>
        </header>

        {renderFilaAtiva()}

      </main>

      {/* MODAL: NOVA TRIAGEM (IA) */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: 0 }}>{editId ? 'Editar Triagem' : 'Nova Triagem'}</h3>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '15px' }}>🤖 A IA fará a classificação automaticamente.</p>
            <form onSubmit={handleSalvarTriagem} style={styles.modalForm}>
              <div style={styles.modalInputRow}>
                <input style={{...styles.modalInput, flex: 2}} placeholder="Nome Completo" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                <input style={{...styles.modalInput, flex: 1}} placeholder="CPF" maxLength="14" value={formData.cpf} onChange={e => setFormData({...formData, cpf: aplicarMascaraCPF(e.target.value)})} required />
              </div>
              <div style={styles.modalInputRow}>
                <input style={{...styles.modalInput, flex: 1}} placeholder="PA (ex: 12/8)" value={formData.pa} onChange={e => setFormData({...formData, pa: e.target.value})} required />
                <input style={{...styles.modalInput, flex: 1}} placeholder="Temp (°C)" value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} required />
                <input style={{...styles.modalInput, flex: 1}} placeholder="Sat (%)" value={formData.sat} onChange={e => setFormData({...formData, sat: e.target.value})} required />
              </div>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancelar</button>
                <button type="submit" style={styles.saveBtn}>Salvar e Classificar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECEPÇÃO (Aguardando Triagem) */}
      {isRecepcaoModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, width: '400px'}}>
            <h3 style={{ margin: '0 0 15px 0' }}>Recepção - Adicionar Fila</h3>
            <form onSubmit={handleAdicionarRecepcao} style={styles.modalForm}>
              <input style={styles.modalInput} placeholder="Nome Completo" value={recepcaoData.nome} onChange={e => setRecepcaoData({...recepcaoData, nome: e.target.value})} required />
              
              {/* INPUT COM MÁSCARA E OBRIGATÓRIO (REQUIRED) */}
              <input style={styles.modalInput} placeholder="CPF" maxLength="14" value={recepcaoData.cpf} onChange={e => setRecepcaoData({...recepcaoData, cpf: aplicarMascaraCPF(e.target.value)})} required />
              
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setIsRecepcaoModalOpen(false)} style={styles.cancelBtn}>Cancelar</button>
                <button type="submit" style={styles.saveBtn}>Salvar na Fila</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button style={styles.fabButton} onClick={abrirNovaTriagem} title="Nova Triagem Avulsa">+</button>
    </div>
  );
}

const styles = {
  appContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6', fontFamily: 'Arial, sans-serif' },
  sidebar: { position: 'fixed', top: 0, bottom: 0, width: '280px', backgroundColor: '#FFF', zIndex: 100, transition: 'left 0.3s ease', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.1)' },
  sidebarHeader: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' },
  logoSidebar: { height: '35px' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' },
  navMenu: { flex: 1, padding: '20px 0' },
  navItem: { padding: '15px 25px', fontSize: '14px', color: '#4B5563', cursor: 'pointer', fontWeight: '500' },
  navItemAtivo: { backgroundColor: '#E0F2FE', color: '#0284C7', borderRight: '4px solid #0284C7' },
  mainContent: { flex: 1, padding: '20px 40px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: '#FFF', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
  menuIcon: { fontSize: '28px', cursor: 'pointer' },
  logoImage: { height: '50px', marginTop: '5px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '20px' },
  dateText: { fontSize: '15px', fontWeight: 'bold' },
  userIcon: { fontSize: '24px', cursor: 'pointer', backgroundColor: '#E5E7EB', borderRadius: '50%', padding: '8px' },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' },
  
  cardsContainer: { display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' },
  card: { flex: '1 1 120px', borderRadius: '12px', padding: '20px', color: '#FFF', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  cardNumber: { fontSize: '36px', fontWeight: '900', margin: 0 },
  cardText: { fontSize: '14px', fontWeight: 'bold', margin: '5px 0 0 0' },
  
  dashboardGrid: { display: 'flex', gap: '25px', flexWrap: 'wrap' },
  listsColumn: { flex: '2 1 600px', display: 'flex', flexDirection: 'column' },
  
  tableSection: { backgroundColor: '#FFF', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#374151' },
  addBtn: { backgroundColor: '#E0F2FE', color: '#0284C7', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  triarBtn: { backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB', padding: '5px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { padding: '12px 10px', fontSize: '14px', color: '#6B7280', textAlign: 'left', borderBottom: '2px solid #E5E7EB' },
  tableRow: { borderBottom: '1px solid #E5E7EB' },
  td: { padding: '12px 10px', fontSize: '14px' },
  statusDot: { width: '16px', height: '16px', borderRadius: '50%' },
  
  chartsSection: { flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px' },
  chartBox: { backgroundColor: '#FFF', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  chartTitle: { fontSize: '15px', fontWeight: 'bold', color: '#374151', margin: '0 0 15px 0', textAlign: 'center' },
  lineChartContainer: { height: '100px', width: '100%', display: 'flex', alignItems: 'flex-end' },
  svgLine: { width: '100%', height: '100%' },
  pieChartWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  pieChart: { width: '120px', height: '120px', borderRadius: '50%', background: 'conic-gradient(#EF4444 0% 10%, #F97316 10% 25%, #EAB308 25% 45%, #84CC16 45% 75%, #3B82F6 75% 100%)' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#FFF', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', boxSizing: 'border-box' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
  modalInput: { padding: '12px', borderRadius: '8px', border: '1px solid #DDD', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  modalInputRow: { display: 'flex', gap: '10px', width: '100%' },
  modalButtons: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
  cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#E5E7EB' },
  saveBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#168C8C', color: '#FFF' },
  fabButton: { position: 'fixed', bottom: '40px', right: '40px', width: '65px', height: '65px', borderRadius: '50%', background: 'linear-gradient(135deg, #168C8C, #209d9d)', color: '#FFF', fontSize: '35px', fontWeight: 'bold', border: 'none', boxShadow: '0 6px 12px rgba(22, 140, 140, 0.4)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 90 }
};