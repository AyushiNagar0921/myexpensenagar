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
        <div className="md:hidden ml-auto">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link to="/" className="font-bold text-xl mb-6 flex items-center">
                <span className="gradient-text">Dream Tracker</span>
              </Link>
              <nav className="flex flex-col space-y-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary flex items-center py-2",
                      isActive(item.path)
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
