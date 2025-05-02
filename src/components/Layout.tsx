
import React, { useState } from 'react';
import NavBar from './NavBar';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart3, PiggyBank, CreditCard, User, Menu, X } from "lucide-react";
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: 'Add Income',
      path: '/add-income',
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      name: 'Add Expense',
      path: '/add-expense',
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      name: 'Transactions',
      path: '/transactions',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: 'Goals',
      path: '/goals',
      icon: <PiggyBank className="h-5 w-5" />,
    },
    {
      name: 'Loans',
      path: '/loans',
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className="h-5 w-5" />,
    },
  ];
  
  if (!user) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex flex-col w-64 bg-background border-r transition-all duration-300",
        !sidebarOpen && "w-20"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <Link to="/" className={cn("font-bold text-xl", !sidebarOpen && "hidden")}>
            <span className="gradient-text">Dream Tracker</span>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 hover:bg-muted transition-colors",
                isActive(item.path) && "bg-muted font-medium text-primary",
                !isActive(item.path) && "text-muted-foreground"
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex flex-1 flex-col overflow-y-auto pb-20 md:pb-0 px-4 md:px-8 py-6">
          {children}
        </main>
        <div className="md:hidden">
          <NavBar />
        </div>
      </div>
    </div>
  );
};

export default Layout;
