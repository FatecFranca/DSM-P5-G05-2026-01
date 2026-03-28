import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoTriax from '../assets/logob.png';

export default function Dashboard() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menuAtivo, setMenuAtivo] = useState('fila');
  const [pacientes, setPacientes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    nome: '', pa: '', temp: '', sat: '', cor: '#84CC16', iaScore: 100
  });

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const calcularEspera = (index, lista) => {
    if (index === 0) return "Imediato";
    let minutosTotais = 0;
    for (let i = 0; i < index; i++) {
      const cor = lista[i].cor;
      if (cor === '#EF4444') minutosTotais += 0;
      if (cor === '#F97316') minutosTotais += 15;
      if (cor === '#EAB308') minutosTotais += 30;
      if (cor === '#84CC16') minutosTotais += 60;
    }
    if (minutosTotais >= 60) {
      const horas = Math.floor(minutosTotais / 60);
      const mins = minutosTotais % 60;
      return `${horas}h ${mins > 0 ? mins + 'min' : ''}`;
    }
    return `${minutosTotais} min`;
  };

  useEffect(() => {
    buscarPacientes();
    
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'n') handleNovaTriagem();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const buscarPacientes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/triagens');
      setPacientes(res.data);
    } catch (err) {
      console.error("Erro ao carregar banco de dados relacional", err);
    }
  };

  const handleSalvarTriagem = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:3000/triagens/${editId}`, formData);
      } else {
        await axios.post('http://localhost:3000/triagens', formData);
      }
      setIsModalOpen(false);
      setEditId(null);
      setFormData({ nome: '', pa: '', temp: '', sat: '', cor: '#84CC16', iaScore: 100 });
      buscarPacientes();
    } catch (err) {
      alert("Erro ao salvar no banco de dados.");
    }
  };

  const handleSair = () => {
    localStorage.removeItem('tokenTriax');
    navigate('/');
  };

  const handleNovaTriagem = () => {
    setEditId(null);
    setFormData({ nome: '', pa: '', temp: '', sat: '', cor: '#84CC16', iaScore: 100 });
    setIsModalOpen(true);
  };

  const handleEditarPaciente = (paciente) => {
    setEditId(paciente.id);
    setFormData({
      nome: paciente.nome,
      pa: paciente.pa,
      temp: paciente.temp,
      sat: paciente.sat,
      cor: paciente.cor,
      iaScore: paciente.iaScore
    });
    setIsModalOpen(true);
  };

  const renderFilaAtiva = () => (
    <>
      <div style={styles.cardsContainer}>
        <div style={{...styles.card, backgroundColor: '#EF4444'}}><h3 style={styles.cardNumber}>{pacientes.filter(p => p.cor === '#EF4444').length}</h3><p style={styles.cardText}>Emergência</p></div>
        <div style={{...styles.card, backgroundColor: '#F97316'}}><h3 style={styles.cardNumber}>{pacientes.filter(p => p.cor === '#F97316').length}</h3><p style={styles.cardText}>Muito urgente</p></div>
        <div style={{...styles.card, backgroundColor: '#EAB308'}}><h3 style={styles.cardNumber}>{pacientes.filter(p => p.cor === '#EAB308').length}</h3><p style={styles.cardText}>Urgente</p></div>
        <div style={{...styles.card, backgroundColor: '#84CC16'}}><h3 style={styles.cardNumber}>{pacientes.filter(p => p.cor === '#84CC16').length}</h3><p style={styles.cardText}>Pouco urgente</p></div>
      </div>

      <div style={styles.dashboardGrid}>
        <div style={styles.tableSection}>
          <h3 style={styles.sectionTitle}>Fila de Atendimento</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Triagem</th>
                <th style={styles.th}>Paciente</th>
                <th style={styles.th}>PA</th>
                <th style={styles.th}>Temp</th>
                <th style={styles.th}>Sat</th>
                <th style={styles.th}>IA</th>
                <th style={{...styles.th, textAlign: 'center'}}>Editar</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente, index) => (
                <tr key={paciente.id} style={{...styles.tableRow, backgroundColor: paciente.iaScore <= 60 ? '#FEF08A' : '#FFF'}}>
                  <td style={styles.td}><div style={{...styles.statusDot, backgroundColor: paciente.cor}}></div></td>
                  <td style={styles.td}>
                    <b>{paciente.nome}</b><br/>
                    <small style={{ color: '#666', fontSize: '11px' }}>
                      Espera estimada: {calcularEspera(index, pacientes)}
                    </small>
                  </td>
                  <td style={styles.td}>{paciente.pa}</td>
                  <td style={styles.td}>{paciente.temp}</td>
                  <td style={styles.td}>{paciente.sat}</td>
                  <td style={styles.td}>{paciente.iaScore}%</td>
                  <td style={{...styles.td, textAlign: 'center', cursor: 'pointer', fontSize: '20px'}} onClick={() => handleEditarPaciente(paciente)}>✎</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

  const renderIAConfig = () => (
    <div style={styles.chartBox}>
      <h3 style={styles.sectionTitle}>Métricas do Modelo TRIAX-IA</h3>
      <div style={{ padding: '10px', lineHeight: '2' }}>
        <p><b>Status do Motor:</b> Operacional</p>
        <p><b>Banco de Dados:</b> SQLite Relacional (Prisma)</p>
        <p><b>Confiança Média:</b> 94.2%</p>
        <button style={styles.saveBtn} onClick={() => alert('Sincronizando pesos do modelo...')}>Recalibrar IA</button>
      </div>
    </div>
  );

  return (
    <div style={styles.appContainer}>
      {isSidebarOpen && <div style={styles.overlay} onClick={() => setIsSidebarOpen(false)}></div>}
      <aside style={{...styles.sidebar, left: isSidebarOpen ? '0' : '-300px'}}>
        <div style={styles.sidebarHeader}>
          <img src={logoTriax} alt="TRIAX" style={styles.logoSidebar} />
          <button style={styles.closeBtn} onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
        <nav style={styles.navMenu}>
          <div style={{...styles.navItem, ...(menuAtivo === 'fila' ? styles.navItemAtivo : {})}} onClick={() => { setMenuAtivo('fila'); setIsSidebarOpen(false); }}> Fila Ativa</div>
          <div style={styles.navItem} onClick={() => navigate('/historico')}> Histórico</div>
          <div style={{...styles.navItem, ...(menuAtivo === 'ia' ? styles.navItemAtivo : {})}} onClick={() => { setMenuAtivo('ia'); setIsSidebarOpen(false); }}> Configurações IA</div>
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

        <h2 style={styles.pageTitle}>Painel de Controle - Emergência</h2>
        
        {menuAtivo === 'fila' && renderFilaAtiva()}
        {menuAtivo === 'ia' && renderIAConfig()}

      </main>

      {/* MODAL DE FORMULÁRIO */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: 0 }}>{editId ? 'Editar Triagem' : 'Nova Triagem'}</h3>
            <form onSubmit={handleSalvarTriagem} style={styles.modalForm}>
              <input style={styles.modalInput} placeholder="Nome do Paciente" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
              <div style={styles.modalInputRow}>
                <input style={styles.modalInput} placeholder="PA (ex: 12/8)" value={formData.pa} onChange={e => setFormData({...formData, pa: e.target.value})} required />
                <input style={styles.modalInput} placeholder="Temp" value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} required />
                <input style={styles.modalInput} placeholder="Sat" value={formData.sat} onChange={e => setFormData({...formData, sat: e.target.value})} required />
              </div>
              <select style={styles.modalInput} value={formData.cor} onChange={e => setFormData({...formData, cor: e.target.value})}>
                <option value="#EF4444">Emergência (Vermelho)</option>
                <option value="#F97316">Muito Urgente (Laranja)</option>
                <option value="#EAB308">Urgente (Amarelo)</option>
                <option value="#84CC16">Pouco Urgente (Verde)</option>
              </select>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancelar</button>
                <button type="submit" style={styles.saveBtn}>Salvar no Banco</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button style={styles.fabButton} onClick={handleNovaTriagem} title="Nova Triagem (Alt+N)">+</button>
    </div>
  );
}

const styles = {
  appContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6', fontFamily: 'Arial, sans-serif' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 99 },
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
  logoImage: { height: '75px', marginTop: '10px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '20px' },
  dateText: { fontSize: '15px', fontWeight: 'bold' },
  userIcon: { fontSize: '24px', cursor: 'pointer', backgroundColor: '#E5E7EB', borderRadius: '50%', padding: '8px' },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' },
  cardsContainer: { display: 'flex', gap: '20px', marginBottom: '30px' },
  card: { flex: 1, borderRadius: '12px', padding: '20px', color: '#FFF', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  cardNumber: { fontSize: '36px', fontWeight: '900', margin: 0 },
  cardText: { fontSize: '16px', fontWeight: 'bold', margin: '5px 0 0 0' },
  dashboardGrid: { display: 'flex', gap: '25px', flexWrap: 'wrap' },
  tableSection: { flex: '2 1 600px', backgroundColor: '#FFF', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px 10px', fontSize: '14px', color: '#6B7280', textAlign: 'left', borderBottom: '2px solid #E5E7EB' },
  tableRow: { borderBottom: '1px solid #E5E7EB' },
  td: { padding: '15px 10px', fontSize: '15px' },
  statusDot: { width: '16px', height: '16px', borderRadius: '50%' },
  chartsSection: { flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px' },
  chartBox: { backgroundColor: '#FFF', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  chartTitle: { fontSize: '15px', fontWeight: 'bold', color: '#374151', margin: '0 0 15px 0', textAlign: 'center' },
  lineChartContainer: { height: '100px', width: '100%', display: 'flex', alignItems: 'flex-end' },
  svgLine: { width: '100%', height: '100%' },
  pieChartWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  pieChart: { width: '120px', height: '120px', borderRadius: '50%', background: 'conic-gradient(#EF4444 0% 15%, #F97316 15% 35%, #EAB308 35% 60%, #84CC16 60% 100%)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#FFF', padding: '30px', borderRadius: '12px', width: '480px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', boxSizing: 'border-box' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  modalInput: { padding: '12px', borderRadius: '8px', border: '1px solid #DDD', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  modalInputRow: { display: 'flex', gap: '10px', width: '100%' },
  modalButtons: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
  cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#E5E7EB' },
  saveBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#168C8C', color: '#FFF' },
  fabButton: { position: 'fixed', bottom: '40px', right: '40px', width: '65px', height: '65px', borderRadius: '50%', background: 'linear-gradient(135deg, #168C8C, #209d9d)', color: '#FFF', fontSize: '35px', fontWeight: 'bold', border: 'none', boxShadow: '0 6px 12px rgba(22, 140, 140, 0.4)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 90 }
};