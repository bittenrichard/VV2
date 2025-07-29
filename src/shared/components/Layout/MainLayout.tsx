import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header'; // Modificado para Header
import { PageKey } from '../../types';
import { UserProfile } from '../../../features/auth/types';

interface MainLayoutProps {
  currentPage: PageKey;
  user: UserProfile | null;
  onNavigate: (page: PageKey) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  currentPage,
  user,
  onNavigate,
  onLogout,
  children
}) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className="flex flex-col flex-grow relative">
        {/* Overlay para o menu mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}
        <Header 
          currentPage={currentPage} 
          onToggleMobileMenu={toggleMobileMenu}
        />
        <main className="flex-grow p-6 sm:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;