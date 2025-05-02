
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, History, Heart, Wallet, LogOut, DollarSign, User } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

const NavBar = () => {
  const location = useLocation();
  const { logout } = useAppContext();
  
  const navItems = [
    { path: '/', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { path: '/add-income', icon: <DollarSign className="w-5 h-5" />, label: 'Income' },
    { path: '/add-expense', icon: <PlusCircle className="w-5 h-5" />, label: 'Add' },
    { path: '/goals', icon: <Heart className="w-5 h-5" />, label: 'Goals' },
    { path: '/loans', icon: <Wallet className="w-5 h-5" />, label: 'Loans' },
    { path: '/transactions', icon: <History className="w-5 h-5" />, label: 'History' },
    { path: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center py-2 px-1 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700 md:hidden">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path} 
          className={`flex flex-col items-center justify-center px-1 py-2 rounded-md ${
            location.pathname === item.path 
              ? 'text-primary font-medium' 
              : 'text-muted-foreground hover:text-primary'
          }`}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAppContext();
  
  const navItems = [
    { path: '/', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/add-income', icon: <DollarSign className="w-5 h-5" />, label: 'Add Income' },
    { path: '/add-expense', icon: <PlusCircle className="w-5 h-5" />, label: 'Add Expense' },
    { path: '/transactions', icon: <History className="w-5 h-5" />, label: 'Transactions' },
    { path: '/goals', icon: <Heart className="w-5 h-5" />, label: 'Saving Goals' },
    { path: '/loans', icon: <Wallet className="w-5 h-5" />, label: 'Loans & EMIs' },
    { path: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' }
  ];

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-sidebar">
      <div className="p-6">
        <h2 className="text-2xl font-bold gradient-text">DreamTracker</h2>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                location.pathname === item.path 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-4">
        <Button
          variant="outline" 
          className="w-full justify-start gap-2" 
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
