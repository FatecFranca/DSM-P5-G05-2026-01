import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, Clock, Settings, LogOut, X } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation(); 

  const fazerLogout = () => {
    navigate('/'); 
  };

  return (
    <>
      
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      {/* Menu Lateral */}
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">
            TRIAX <span className="logo-icon"></span>
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={28} />
          </button>
        </div>

        <ul className="menu-list">
          {/* FILA ATIVA */}
          <li 
            className={`menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => {
              navigate('/dashboard');
              onClose();
            }}
          >
            <Activity size={20} className="menu-icon" />
            <span>Fila Ativa</span>
          </li>

          {/* HISTÓRICO */}
          <li 
            className={`menu-item ${location.pathname === '/historico' ? 'active' : ''}`}
            onClick={() => {
              navigate('/historico');
              onClose();
            }}
          >
            <Clock size={20} className="menu-icon" />
            <span>Histórico</span>
          </li>
        </ul>

        <div className="menu-divider"></div>

        <ul className="menu-list">
          {/* CONFIGURAÇÕES */}
          <li 
            className={`menu-item ${location.pathname === '/configuracoes' ? 'active' : ''}`}
            onClick={() => {
              navigate('/configuracoes');
              onClose();
            }}
          >
            <Settings size={20} className="menu-icon" />
            <span>Configurações</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <li className="menu-item logout-item" onClick={fazerLogout}>
            <LogOut size={20} className="menu-icon text-red" />
            <span className="text-red">Sair da Conta</span>
          </li>
        </div>
      </div>
    </>
  );
}