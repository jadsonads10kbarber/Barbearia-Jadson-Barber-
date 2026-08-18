import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { PwaProvider } from './context/PwaContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import { PwaInstallModal } from './components/PwaInstallModal';
import { ClientReviewModal } from './components/ClientReviewModal';
import { AccessCodeModal } from './components/AccessCodeModal';

import { AgendamentoPage } from './pages/AgendamentoPage';
import { MeusAgendamentosPage } from './pages/MeusAgendamentosPage';
import { BarbeariaPage } from './pages/BarbeariaPage';
import { ServicosPage } from './pages/ServicosPage';
import { BarbeirosPage } from './pages/BarbeirosPage';
import { LoginPage } from './pages/LoginPage';
import { PerfilPage } from './pages/PerfilPage';
import { CuponsClientePage } from './pages/CuponsClientePage';
import { IndiqueEGanhePage } from './pages/IndiqueEGanhePage';
import { AvaliacoesClientePage } from './pages/AvaliacoesClientePage';
import { FeedPage } from './pages/FeedPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminFinanceiroPage } from './pages/admin/AdminFinanceiroPage';
import { AdminAgendamentosPage } from './pages/admin/AdminAgendamentosPage';
import { AdminEquipePage } from './pages/admin/AdminEquipePage';
import { AdminClientesPage } from './pages/admin/AdminClientesPage';
import { AdminServicosPage } from './pages/admin/AdminServicosPage';
import { AdminEstoqueInsumosPage } from './pages/admin/AdminEstoqueInsumosPage';
import { AdminEstoqueProdutosPage } from './pages/admin/AdminEstoqueProdutosPage';
import { AdminCuponsPage } from './pages/admin/AdminCuponsPage';
import { AdminIndiqueGanhePage } from './pages/admin/AdminIndiqueGanhePage';
import { AdminHorariosPage } from './pages/admin/AdminHorariosPage';
import { AdminAvaliacoesPage } from './pages/admin/AdminAvaliacoesPage';
import { AdminConfiguracoesPage } from './pages/admin/AdminConfiguracoesPage';
import { AdminHistoricoPage } from './pages/admin/AdminHistoricoPage';

import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { activePage } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activePage]);

  const isAdminPage = activePage.startsWith('admin-');

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-amber-500 selection:text-black flex flex-col">
        <main className="flex-1 w-full">
          {activePage === 'admin-login' && <AdminLoginPage />}
          {activePage === 'admin-dashboard' && <AdminDashboardPage />}
          {activePage === 'admin-financeiro' && <AdminFinanceiroPage />}
          {activePage === 'admin-agendamentos' && <AdminAgendamentosPage />}
          {activePage === 'admin-historico' && <AdminHistoricoPage />}
          {activePage === 'admin-equipe' && <AdminEquipePage />}
          {activePage === 'admin-clientes' && <AdminClientesPage />}
          {activePage === 'admin-servicos' && <AdminServicosPage />}
          {activePage === 'admin-estoque' && <AdminEstoqueInsumosPage />}
          {activePage === 'admin-produtos' && <AdminEstoqueProdutosPage />}
          {activePage === 'admin-cupons' && <AdminCuponsPage />}
          {activePage === 'admin-indique-ganhe' && <AdminIndiqueGanhePage />}
          {activePage === 'admin-horarios' && <AdminHorariosPage />}
          {activePage === 'admin-avaliacoes' && <AdminAvaliacoesPage />}
          {activePage === 'admin-configuracoes' && <AdminConfiguracoesPage />}
          {activePage === 'admin-feed' && <AdminDashboardPage />}
        </main>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black flex flex-col">
      {/* Header */}
      <Header />

      {/* Sidebar Drawer */}
      <Sidebar />

      {/* Main Page Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto">
        {activePage === 'agenda' && <AgendamentoPage />}
        {activePage === 'meus-agendamentos' && <MeusAgendamentosPage />}
        {activePage === 'barbearia' && <BarbeariaPage />}
        {activePage === 'servicos' && <ServicosPage />}
        {activePage === 'barbeiros' && <BarbeirosPage />}
        {activePage === 'login' && <LoginPage />}
        {activePage === 'perfil' && <PerfilPage />}
        {activePage === 'cupons' && <CuponsClientePage />}
        {activePage === 'indique-e-ganhe' && <IndiqueEGanhePage />}
        {activePage === 'avaliacoes' && <AvaliacoesClientePage />}
        {activePage === 'feed' && <FeedPage />}
      </main>

      {/* Fixed Bottom Navigation (Mobile) */}
      <BottomNav />

      {/* Unique Access Code Celebration Modal */}
      <AccessCodeModal />

      {/* Toast Notifications Overlay */}
      <ToastContainer />

      {/* PWA Full Install Modal (iOS Guide / Android Prompt) */}
      <PwaInstallModal />

      {/* Interactive Client Review Modal / Floating Prompt */}
      <ClientReviewModal />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <PwaProvider>
            <AppContent />
          </PwaProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
