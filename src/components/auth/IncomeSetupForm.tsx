
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from '@/contexts/AppContext';
import { IndianRupee } from 'lucide-react';

const IncomeSetupForm = () => {
  const navigate = useNavigate();
  const { setIncome } = useAppContext();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await setIncome({
        amount: parseFloat(amount),
        date: new Date(),
        description: 'Monthly Income'
      });
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
          <CardDescription>
            Let's set up your monthly income to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="income" className="text-base">Your Monthly Income</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <IndianRupee className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  id="income"
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                This helps us provide personalized financial insights
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Setting up...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeSetupForm;
