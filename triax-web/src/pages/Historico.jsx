import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoTriax from '../assets/logob.png';
import lixoDelet from '../assets/lixo.png';

export default function Historico() {
  const navigate = useNavigate();
  const [historico, setHistorico] = useState([]);
  const [busca, setBusca] = useState('');
  const [prontuarioAberto, setProntuarioAberto] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  useEffect(() => {
    buscarHistorico();
  }, []);

  const buscarHistorico = async () => {
    try {
      const res = await axios.get('http://localhost:3000/triagens');
      setHistorico(res.data);
    } catch (err) {
      console.error("Erro ao carregar histórico", err);
    }
  };

  const handleDeletar = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este registro? Isso apagará do banco de dados.")) {
      try {
        await axios.delete(`http://localhost:3000/triagens/${id}`);
        buscarHistorico();
        setProntuarioAberto(false); 
      } catch (err) {
        alert("Erro ao excluir registro. Verifique se a rota DELETE existe no back-end.");
      }
    }
  };

  const voltarDashboard = () => {
    navigate('/dashboard'); 
  };

  const abrirProntuario = (paciente) => {
    setPacienteSelecionado(paciente);
    setProntuarioAberto(true);
  };

  const historicoFiltrado = historico.filter((paciente) =>
    paciente.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const visitasPaciente = pacienteSelecionado 
    ? historico.filter(p => p.nome.toLowerCase() === pacienteSelecionado.nome.toLowerCase()) 
    : [];

  return (
    <div style={styles.container}>
      
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={logoTriax} alt="TRIAX" style={styles.logoImage} />
        </div>
        <button style={styles.backButton} onClick={voltarDashboard}>
          ← Voltar ao painel
        </button>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.pageHeader}>
          <div>
            <h2 style={styles.pageTitle}>Histórico de Prontuários</h2>
            <p style={styles.subtitle}>Auditoria de todos os pacientes triados no sistema.</p>
          </div>
          
          <div style={styles.actionArea}>
            <input 
              type="text" 
              placeholder="Buscar paciente por nome..." 
              style={styles.searchInput}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <button style={styles.refreshButton} onClick={buscarHistorico}>
               Atualizar
            </button>
          </div>
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Data e Hora</th>
                <th style={styles.th}>Paciente</th>
                <th style={styles.th}>PA</th>
                <th style={styles.th}>Temp</th>
                <th style={styles.th}>Sat</th>
                <th style={styles.th}>IA Score</th>
                <th style={styles.th}>Classificação</th>
                <th style={{...styles.th, textAlign: 'center'}}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {historicoFiltrado.length > 0 ? (
                historicoFiltrado.map((p) => (
                  <tr key={p.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      {new Date(p.createdAt).toLocaleDateString('pt-BR')} <br/>
                      <small style={{color: '#666'}}>{new Date(p.createdAt).toLocaleTimeString('pt-BR')}</small>
                    </td>
                    <td style={styles.td}>
                      <b 
                        style={styles.clickableName} 
                        onClick={() => abrirProntuario(p)}
                        title="Ver prontuário completo"
                      >
                        {p.nome}
                      </b>
                    </td>
                    <td style={styles.td}>{p.pa}</td>
                    <td style={styles.td}>{p.temp}</td>
                    <td style={styles.td}>{p.sat}</td>
                    <td style={styles.td}>{p.iaScore}%</td>
                    <td style={styles.td}>
                      <span style={{ 
                        backgroundColor: p.cor, 
                        color: p.cor === '#FEF08A' ? '#000' : '#FFF', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 'bold' 
                      }}>
                        {p.cor === '#EF4444' ? 'Emergência' : 
                         p.cor === '#F97316' ? 'Muito Urgente' : 
                         p.cor === '#EAB308' ? 'Urgente' : 'Pouco Urgente'}
                      </span>
                    </td>
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <button style={styles.deleteBtn} onClick={() => handleDeletar(p.id)} title="Excluir Registro">
                        <img src={lixoDelet} alt='Excluir' style={styles.lixoIcon} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {prontuarioAberto && pacienteSelecionado && (
        <div style={styles.modalOverlay} onClick={() => setProntuarioAberto(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: '#111827' }}>Prontuário Médico</h2>
              <button style={styles.closeModalBtn} onClick={() => setProntuarioAberto(false)}>✕</button>
            </div>
            
            <div style={styles.pacienteInfo}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{pacienteSelecionado.nome}</h3>
              <p style={{ margin: 0, color: '#6B7280' }}>Total de visitas registradas: <b>{visitasPaciente.length}</b></p>
            </div>

            <h4 style={{ borderBottom: '2px solid #E5E7EB', paddingBottom: '10px', marginTop: '20px' }}>
              Histórico de Visitas (Linha do Tempo)
            </h4>

            <div style={styles.timeline}>
              {visitasPaciente.map((visita, index) => (
                <div key={visita.id} style={styles.timelineItem}>
                  <div style={styles.timelineDate}>
                    <b>{new Date(visita.createdAt).toLocaleDateString('pt-BR')}</b><br/>
                    {new Date(visita.createdAt).toLocaleTimeString('pt-BR')}
                  </div>
                  <div style={{...styles.timelineCard, borderLeft: `5px solid ${visita.cor}`}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold' }}>Triagem IA: {visita.iaScore}%</span>
                      <span style={{ 
                        backgroundColor: visita.cor, 
                        color: visita.cor === '#FEF08A' ? '#000' : '#FFF', 
                        padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' 
                      }}>
                        {visita.cor === '#EF4444' ? 'Emergência' : visita.cor === '#F97316' ? 'Muito Urgente' : visita.cor === '#EAB308' ? 'Urgente' : 'Pouco Urgente'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', color: '#4B5563', fontSize: '14px' }}>
                      <span><b>PA:</b> {visita.pa}</span>
                      <span><b>Temp:</b> {visita.temp}</span>
                      <span><b>Sat:</b> {visita.sat}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#F3F4F6', fontFamily: 'Arial, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: '15px 40px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  logoImage: { height: '70px' },
  backButton: { background: 'none', border: '1px solid #D1D5DB', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#374151' },
  mainContent: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' },
  pageTitle: { fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '0 0 5px 0' },
  subtitle: { color: '#6B7280', margin: 0, fontSize: '15px' },
  actionArea: { display: 'flex', gap: '15px' },
  searchInput: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #D1D5DB', width: '300px', fontSize: '14px' },
  refreshButton: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#168C8C', color: '#FFF', fontWeight: 'bold' },
  tableCard: { backgroundColor: '#FFF', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  th: { padding: '15px 10px', fontSize: '14px', color: '#6B7280', textAlign: 'left', borderBottom: '2px solid #E5E7EB', backgroundColor: '#F9FAFB' },
  tableRow: { borderBottom: '1px solid #E5E7EB', transition: 'background-color 0.2s' },
  td: { padding: '15px 10px', fontSize: '14px', color: '#111827', verticalAlign: 'middle' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' },
  lixoIcon: { width: '22px', height: '22px', objectFit: 'contain' },
  clickableName: { cursor: 'pointer', color: '#0284C7', textDecoration: 'underline' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#FFF', padding: '30px', borderRadius: '12px', width: '600px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  closeModalBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6B7280' },
  pacienteInfo: { backgroundColor: '#F3F4F6', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' },
  timelineItem: { display: 'flex', gap: '15px' },
  timelineDate: { minWidth: '100px', fontSize: '13px', color: '#4B5563', textAlign: 'right', paddingTop: '5px' },
  timelineCard: { flex: 1, backgroundColor: '#F9FAFB', padding: '15px', borderRadius: '8px', border: '1px solid #E5E7EB' }
};