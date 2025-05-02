import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, PlusCircle, BarChart3, PiggyBank, CreditCard, Menu } from "lucide-react";
import { cn } from '@/lib/utils';

const NavBar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  
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
  ];
  
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link to="/" className="font-bold text-xl mr-6 flex items-center">
          <span className="gradient-text">Dream Tracker</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                isActive(item.path)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="ml-auto flex items-center space-x-4">
          <Link to="/profile">
            <Button variant="outline" size="sm">
              Profile
            </Button>
          </Link>
        </div>
        
        {/* Mobile Navigation */}
{/* Bottom Navigation for Mobile */}
<div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow md:hidden">
  <nav className="flex justify-around items-center h-16">
    {navItems.map((item) => (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          "flex flex-col items-center text-xs",
          isActive(item.path) ? "text-primary" : "text-muted-foreground"
        )}
      >
        {item.icon}
        <span>{item.name}</span>
      </Link>
    ))}
  </nav>
</div>

      </div>
    </div>
  );
};

export default NavBar;
