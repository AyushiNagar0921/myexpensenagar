
import React from 'react';
import NavBar, { Sidebar } from './NavBar';
import { useAppContext } from '@/contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex flex-1 flex-col overflow-y-auto pb-20 md:pb-0 px-4 md:px-8 py-6">
          {children}
        </main>
        <NavBar />
      </div>
    </div>
  );
};

export default Layout;
