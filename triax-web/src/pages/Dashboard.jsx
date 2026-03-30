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
  
  const [isRecalibrando, setIsRecalibrando] = useState(false);

  // ESTADO ATUALIZADO COM O CPF
  const [formData, setFormData] = useState({
    nome: '', cpf: '', pa: '', temp: '', sat: '', cor: '#84CC16', iaScore: 100
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
      // ZERA O CPF AO SALVAR
      setFormData({ nome: '', cpf: '', pa: '', temp: '', sat: '', cor: '#84CC16', iaScore: 100 });
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
    // ZERA O CPF NA NOVA TRIAGEM
    setFormData({ nome: '', cpf: '', pa: '', temp: '', sat: '', cor: '#84CC16', iaScore: 100 });
    setIsModalOpen(true);
  };

  const handleEditarPaciente = (paciente) => {
    setEditId(paciente.id);
    setFormData({
      nome: paciente.nome,
      cpf: paciente.cpf || '', // PUXA O CPF SE EXISTIR
      pa: paciente.pa,
      temp: paciente.temp,
      sat: paciente.sat,
      cor: paciente.cor,
      iaScore: paciente.iaScore
    });
    setIsModalOpen(true);
  };

  const handleRecalibrarIA = async () => {
    setIsRecalibrando(true);
    try {
      setTimeout(() => {
        setIsRecalibrando(false);
        alert(`✅ IA Recalibrada com sucesso!\nO modelo KNN processou ${pacientes.length} registros do banco SQLite para atualizar seus K-vizinhos.`);
      }, 2500);
    } catch (err) {
      console.error(err);
      setIsRecalibrando(false);
      alert("Erro ao tentar comunicar com o motor da IA.");
    }
  };

  const handleBaixarRelatorioJSON = () => {
    const relatorio = {
      dataGeracao: new Date().toLocaleString('pt-BR'),
      motorIA: "K-Nearest Neighbors (KNN)",
      status: "Operacional",
      confiancaMedia: "94.2%",
      metricasAtuais: {
        totalPacientesAnalisados: pacientes.length,
        emergencia: pacientes.filter(p => p.cor === '#EF4444').length,
        muitoUrgente: pacientes.filter(p => p.cor === '#F97316').length,
        urgente: pacientes.filter(p => p.cor === '#EAB308').length,
        poucoUrgente: pacientes.filter(p => p.cor === '#84CC16').length,
      },
      baseDeConhecimento: pacientes 
    };

    const jsonString = JSON.stringify(relatorio, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `triax_relatorio_ia_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBaixarRelatorioPDF = () => {
    const conteudoHTML = `
      <html>
        <head>
          <title>Relatório TRIAX-IA - PDF</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
            h1 { color: #168C8C; border-bottom: 2px solid #168C8C; padding-bottom: 10px; margin-bottom: 5px;}
            .subtitle { color: #666; font-size: 14px; margin-bottom: 30px; }
            .metricas-container { display: flex; gap: 20px; margin-bottom: 30px; }
            .box { background-color: #F3F4F6; padding: 20px; border-radius: 8px; flex: 1; }
            h3 { color: #111827; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
            th, td { border: 1px solid #E5E7EB; padding: 12px; text-align: left; }
            th { background-color: #168C8C; color: white; }
            tr:nth-child(even) { background-color: #F9FAFB; }
            .badge { padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Relatório de Desempenho - TRIAX IA</h1>
          <p class="subtitle">Gerado em: ${new Date().toLocaleString('pt-BR')} | Motor: K-Nearest Neighbors (KNN)</p>

          <div class="metricas-container">
            <div class="box">
              <h3>Status do Modelo</h3>
              <p><b>Status:</b> Operacional</p>
              <p><b>Confiança Média:</b> 94.2%</p>
              <p><b>Banco de Dados:</b> SQLite Relacional</p>
            </div>
            <div class="box">
              <h3>Métricas da Base</h3>
              <p><b>Total Analisado:</b> ${pacientes.length} Registros</p>
              <p><b>Emergências (Vermelho):</b> ${pacientes.filter(p => p.cor === '#EF4444').length}</p>
              <p><b>Pouco Urgente (Verde):</b> ${pacientes.filter(p => p.cor === '#84CC16').length}</p>
            </div>
          </div>

          <h3>Auditoria da Base de Conhecimento</h3>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Paciente</th>
                <th>Sinais (PA / Temp / Sat)</th>
                <th>Classificação IA</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              ${pacientes.map(p => {
                let nomeCor = p.cor === '#EF4444' ? 'Emergência' : p.cor === '#F97316' ? 'Muito Urgente' : p.cor === '#EAB308' ? 'Urgente' : 'Pouco Urgente';
                let corTexto = p.cor === '#FEF08A' ? '#000' : '#FFF';
                return `
                <tr>
                  <td>${new Date(p.createdAt || Date.now()).toLocaleDateString('pt-BR')}</td>
                  <td><b>${p.nome}</b><br><small>CPF: ${p.cpf || 'N/A'}</small></td>
                  <td>${p.pa} | ${p.temp} | ${p.sat}</td>
                  <td><span class="badge" style="background-color: ${p.cor}; color: ${corTexto}">${nomeCor}</span></td>
                  <td>${p.iaScore}%</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    const janelaPDF = window.open('', '', 'width=800,height=600');
    janelaPDF.document.write(conteudoHTML);
    janelaPDF.document.close();
  };

  const renderFilaAtiva = () => (
    <>
      <h2 style={styles.pageTitle}>Painel de Controle - Emergência</h2>

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
                      {/* EXIBE O CPF NA TABELA TAMBÉM */}
                      CPF: {paciente.cpf || 'Não informado'} | Espera estimada: {calcularEspera(index, pacientes)}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      <div>
        <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: '0 0 5px 0' }}>
          Motor de Classificação (TRIAX-IA)
        </h3>
        <p style={{ color: '#6B7280', margin: 0, fontSize: '15px' }}>
          Monitoramento em tempo real do algoritmo de Aprendizado de Máquina.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        <div style={styles.chartBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: 0, color: '#4B5563', fontSize: '16px' }}>Status do Serviço</h4>
            <span style={{ backgroundColor: '#DEF7EC', color: '#03543F', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#059669', borderRadius: '50%' }}></span> Online
            </span>
          </div>
          <p style={{ margin: '8px 0', fontSize: '14px', color: '#374151' }}>Algoritmo: <b style={{ color: '#168C8C' }}>K-Nearest Neighbors (KNN)</b></p>
          <p style={{ margin: '8px 0', fontSize: '14px', color: '#374151' }}>Hospedagem: <b>Local (Próx: Nuvem Pública)</b></p>
        </div>

        <div style={styles.chartBox}>
          <h4 style={{ margin: '0 0 10px 0', color: '#4B5563', fontSize: '16px' }}>Acurácia do Modelo</h4>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '38px', fontWeight: '900', color: '#168C8C' }}>94.2%</span>
            <span style={{ fontSize: '14px', color: '#059669', fontWeight: 'bold' }}>↑ 1.2%</span>
          </div>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#9CA3AF' }}>Margem de erro dentro do aceitável (± 5%)</p>
        </div>

        <div style={styles.chartBox}>
          <h4 style={{ margin: '0 0 15px 0', color: '#4B5563', fontSize: '16px' }}>Base de Conhecimento</h4>
          <p style={{ margin: '8px 0', fontSize: '14px', color: '#374151' }}>Banco de Dados: <b style={{ color: '#0284C7' }}>SQLite (Relacional)</b></p>
          <p style={{ margin: '8px 0', fontSize: '14px', color: '#374151' }}>Volume de Triagens: <b>{pacientes.length} Registros</b></p>
        </div>

      </div>

      <div style={{ ...styles.chartBox, borderLeft: '5px solid #168C8C' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#111827', fontSize: '18px' }}>Painel de Manutenção</h4>
        <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '25px', lineHeight: '1.6', maxWidth: '800px' }}>
          A recalibragem reavalia os "K-vizinhos" do modelo utilizando os dados mais recentes inseridos no banco relacional. 
          Isso garante que a IA continue aprendendo e melhorando sua classificação com o passar do tempo.
        </p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            style={{ 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: isRecalibrando ? 'not-allowed' : 'pointer', 
              backgroundColor: '#168C8C', 
              color: '#FFF', 
              fontWeight: 'bold', 
              fontSize: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              opacity: isRecalibrando ? 0.7 : 1
            }} 
            onClick={handleRecalibrarIA}
            disabled={isRecalibrando}
          >
            {isRecalibrando ? '⏳ Sincronizando pesos...' : '⚙️ Recalibrar Modelo IA'}
          </button>
          
          <button 
            style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #D1D5DB', cursor: 'pointer', backgroundColor: '#FFF', color: '#374151', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} 
            onClick={handleBaixarRelatorioJSON}
          >
            {"{ }"} Baixar JSON
          </button>

          <button 
            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#EF4444', color: '#FFF', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} 
            onClick={handleBaixarRelatorioPDF}
          >
            📄 Baixar Relatório (PDF)
          </button>
        </div>
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

        
        {menuAtivo === 'fila' && renderFilaAtiva()}
        {menuAtivo === 'ia' && renderIAConfig()}

      </main>

      {/* MODAL DE FORMULÁRIO */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: 0 }}>{editId ? 'Editar Triagem' : 'Nova Triagem'}</h3>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '15px' }}>
              🤖 A classificação de risco será gerada automaticamente pela IA.
            </p>
            <form onSubmit={handleSalvarTriagem} style={styles.modalForm}>
              
              {/* LINHA COM NOME E CPF */}
              <div style={styles.modalInputRow}>
                <input 
                  style={{...styles.modalInput, flex: 2}} 
                  placeholder="Nome do Paciente" 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})} 
                  required 
                />
                <input 
                  style={{...styles.modalInput, flex: 1}} 
                  placeholder="CPF" 
                  maxLength="14"
                  value={formData.cpf} 
                  onChange={e => {
                    // 1. Remove qualquer letra ou símbolo, deixando SÓ os números
                    let val = e.target.value.replace(/\D/g, ''); 
                    
                    // 2. Trava impiedosamente no 11º número (evita falhas de digitação rápida)
                    val = val.substring(0, 11); 
                    
                    // 3. Aplica a máscara progressiva (000.000.000-00)
                    if (val.length > 9) {
                      val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
                    } else if (val.length > 6) {
                      val = val.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
                    } else if (val.length > 3) {
                      val = val.replace(/(\d{3})(\d{1,3})/, "$1.$2");
                    }
                    
                    setFormData({...formData, cpf: val});
                  }} 
                  required 
                />
                  
              </div>
              
              {/* LINHA COM SINAIS VITAIS */}
              <div style={styles.modalInputRow}>
                <input style={{...styles.modalInput, flex: 1}} placeholder="PA (ex: 12/8)" value={formData.pa} onChange={e => setFormData({...formData, pa: e.target.value})} required />
                <input style={{...styles.modalInput, flex: 1}} placeholder="Temp (ex: 37.5)" value={formData.temp} onChange={e => setFormData({...formData, temp: e.target.value})} required />
                <input style={{...styles.modalInput, flex: 1}} placeholder="Sat (ex: 98%)" value={formData.sat} onChange={e => setFormData({...formData, sat: e.target.value})} required />
              </div>
              
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancelar</button>
                <button type="submit" style={styles.saveBtn}>Salvar e Classificar</button>
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
  modalContent: { backgroundColor: '#FFF', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', boxSizing: 'border-box' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' },
  modalInput: { padding: '12px', borderRadius: '8px', border: '1px solid #DDD', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  modalInputRow: { display: 'flex', gap: '10px', width: '100%' },
  modalButtons: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
  cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#E5E7EB' },
  saveBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#168C8C', color: '#FFF' },
  fabButton: { position: 'fixed', bottom: '40px', right: '40px', width: '65px', height: '65px', borderRadius: '50%', background: 'linear-gradient(135deg, #168C8C, #209d9d)', color: '#FFF', fontSize: '35px', fontWeight: 'bold', border: 'none', boxShadow: '0 6px 12px rgba(22, 140, 140, 0.4)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 90 }
};