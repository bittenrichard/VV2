// Local: src/App.tsx
import React, { useEffect, useCallback, useState } from 'react';
import { useAuth } from './features/auth/hooks/useAuth';
import { useNavigation } from './shared/hooks/useNavigation';
import LoginPage from './features/auth/components/LoginPage';
import SignUpPage from './features/auth/components/SignUpPage';
import MainLayout from './shared/components/Layout/MainLayout';
import DashboardPage from './features/dashboard/components/DashboardPage';
import NewScreeningPage from './features/screening/components/NewScreeningPage';
import ResultsPage from './features/results/components/ResultsPage';
import SettingsPage from './features/settings/components/SettingsPage';
import { LoginCredentials, SignUpCredentials } from './features/auth/types';
import { JobPosting } from './features/screening/types';
import { Candidate } from './features/results/types';
import { baserow } from './shared/services/baserowClient';
import { Loader2 } from 'lucide-react';
import CandidateDatabasePage from './features/database/components/CandidateDatabasePage';
import AgendaPage from './features/agenda/components/AgendaPage';

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"><div className="text-center"><Loader2 className="mx-auto h-12 w-12 text-indigo-600 animate-spin" /><h2 className="mt-6 text-xl font-semibold text-gray-800">Carregando...</h2><p className="mt-2 text-gray-500">Estamos preparando tudo para você.</p></div></div>
);

const VAGAS_TABLE_ID = '709';
const CANDIDATOS_TABLE_ID = '710';
const WHATSAPP_CANDIDATOS_TABLE_ID = '712';

function App() {
  const { profile, isAuthenticated, isLoading: isAuthLoading, error: authError, signIn, signOut, signUp } = useAuth();
  const { currentPage, navigateTo } = useNavigation(isAuthenticated ? 'dashboard' : 'login');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!profile) return;
    setIsDataLoading(true);
    try {
      const [jobsResult, regularCandidatesResult, whatsappCandidatesResult] = await Promise.all([
        baserow.get(VAGAS_TABLE_ID, ''),
        baserow.get(CANDIDATOS_TABLE_ID, ''),
        baserow.get(WHATSAPP_CANDIDATOS_TABLE_ID, '')
      ]);
      const normalizedWhatsappCandidates = (whatsappCandidatesResult.results || []).map((c: any) => (typeof c.vaga === 'string' ? { ...c, vaga: [{ id: 0, value: c.vaga }] } : c));
      const allCandidates = [...(regularCandidatesResult.results || []), ...normalizedWhatsappCandidates];
      const allJobs = jobsResult.results || [];
      const userJobs = allJobs.filter(j => j.usuario && j.usuario.some(u => u.id === profile.id));
      const userCandidates = allCandidates.filter(c => c.usuario && c.usuario.some(u => u.id === profile.id));
      setJobs(userJobs);
      setCandidates(userCandidates);
    } catch (error) {
      console.error("Erro ao buscar dados do Baserow:", error);
      setJobs([]);
      setCandidates([]);
    } finally {
      setIsDataLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchAllData();
    }
  }, [isAuthenticated, profile, fetchAllData]);

  const handleLogin = async (credentials: LoginCredentials) => { if (await signIn(credentials)) navigateTo('dashboard'); };
  const handleSignUp = async (credentials: SignUpCredentials) => { if (await signUp(credentials)) await handleLogin({ email: credentials.email, password: credentials.password }); };
  const handleLogout = () => { signOut(); setJobs([]); setCandidates([]); setSelectedJob(null); navigateTo('login'); };
  const handleViewResults = (job: JobPosting) => { setSelectedJob(job); navigateTo('results'); };
  const handleJobCreated = (newJob: JobPosting) => { setJobs(prev => [newJob, ...prev]); setSelectedJob(newJob); navigateTo('results'); };
  const handleDeleteJob = async (jobId: number) => { try { await baserow.delete(VAGAS_TABLE_ID, jobId); await fetchAllData(); } catch (error) { console.error("Erro ao deletar vaga:", error); alert("Não foi possível excluir a vaga."); }};

  if (isAuthLoading) return <LoadingSpinner />;
  if (!isAuthenticated) {
    return (
      <div className="font-inter antialiased">
        {currentPage === 'signup' ? <SignUpPage onSignUp={handleSignUp} onNavigateLogin={() => navigateTo('login')} isLoading={isAuthLoading} error={authError} /> : <LoginPage onLogin={handleLogin} onNavigateSignUp={() => navigateTo('signup')} isLoading={isAuthLoading} error={authError} />}
      </div>
    );
  }
  if (!profile || isDataLoading) return <LoadingSpinner />;

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage jobs={jobs} candidates={candidates} onViewResults={handleViewResults} onDeleteJob={handleDeleteJob} onNavigate={navigateTo} />;
      case 'new-screening': return <NewScreeningPage onJobCreated={handleJobCreated} onCancel={() => navigateTo('dashboard')} />;
      case 'results': return <ResultsPage selectedJob={selectedJob} candidates={candidates} onDataSynced={fetchAllData} />;
      case 'settings': return <SettingsPage />;
      case 'database': return <CandidateDatabasePage />;
      case 'agenda': return <AgendaPage />;
      default: return <DashboardPage jobs={jobs} candidates={candidates} onViewResults={handleViewResults} onDeleteJob={handleDeleteJob} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="font-inter antialiased">
      <MainLayout currentPage={currentPage} user={profile} onNavigate={navigateTo} onLogout={handleLogout}>{renderContent()}</MainLayout>
    </div>
  );
}
export default App;