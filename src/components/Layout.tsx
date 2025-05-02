
import React from 'react';
import NavBar from './NavBar';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
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
