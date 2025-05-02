
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useBudgetContext } from '@/contexts/BudgetContext';
import { toast } from 'sonner';

// Define the ExpenseCategory enum values directly in this file
const ExpenseCategories = {
  Food: 'Food',
  Housing: 'Housing',
  Transportation: 'Transportation',
  Utilities: 'Utilities',
  Entertainment: 'Entertainment',
  Healthcare: 'Healthcare',
  Clothing: 'Clothing',
  Debt: 'Debt',
  Saving: 'Saving',
  Other: 'Other'
};

interface BudgetSetupFormProps {
  onComplete: () => void;
  onDismiss?: () => void; // Add optional onDismiss prop
}

const BudgetSetupForm: React.FC<BudgetSetupFormProps> = ({ onComplete, onDismiss }) => {
  const [food, setFood] = useState(0);
  const [housing, setHousing] = useState(0);
  const [transportation, setTransportation] = useState(0);
  const [utilities, setUtilities] = useState(0);
  const [entertainment, setEntertainment] = useState(0);
  const [healthcare, setHealthcare] = useState(0);
  const [clothing, setClothing] = useState(0);
  const [debt, setDebt] = useState(0);
  const [saving, setSaving] = useState(0);
  const [other, setOther] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { saveBudgetCategories } = useBudgetContext();
  
  useEffect(() => {
    // Load budget from local storage on component mount
    const storedBudget = localStorage.getItem('budget');
    if (storedBudget) {
      const budget = JSON.parse(storedBudget);
      setFood(budget.food || 0);
      setHousing(budget.housing || 0);
      setTransportation(budget.transportation || 0);
      setUtilities(budget.utilities || 0);
      setEntertainment(budget.entertainment || 0);
      setHealthcare(budget.healthcare || 0);
      setClothing(budget.clothing || 0);
      setDebt(budget.debt || 0);
      setSaving(budget.saving || 0);
      setOther(budget.other || 0);
    }
  }, []);
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Calculate total percentage
      const totalPercentage = food + housing + transportation + utilities + entertainment + healthcare + clothing + debt + saving + other;
      
      if (totalPercentage !== 100) {
        toast.error('Total budget allocation must be 100%');
        return;
      }
      
      // Save budget categories
      await saveBudgetCategories([
        { category: ExpenseCategories.Food, amount: 0, percentage: food },
        { category: ExpenseCategories.Housing, amount: 0, percentage: housing },
        { category: ExpenseCategories.Transportation, amount: 0, percentage: transportation },
        { category: ExpenseCategories.Utilities, amount: 0, percentage: utilities },
        { category: ExpenseCategories.Entertainment, amount: 0, percentage: entertainment },
        { category: ExpenseCategories.Healthcare, amount: 0, percentage: healthcare },
        { category: ExpenseCategories.Clothing, amount: 0, percentage: clothing },
        { category: ExpenseCategories.Debt, amount: 0, percentage: debt },
        { category: ExpenseCategories.Saving, amount: 0, percentage: saving },
        { category: ExpenseCategories.Other, amount: 0, percentage: other },
      ]);
      
      // Save budget to local storage
      const budget = {
        food,
        housing,
        transportation,
        utilities,
        entertainment,
        healthcare,
        clothing,
        debt,
        saving,
        other,
      };
      localStorage.setItem('budget', JSON.stringify(budget));
      
      onComplete();
    } catch (error) {
      // Error handled in the budget context
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="food">Food ({food}%)</Label>
        <Slider
          id="food"
          defaultValue={[food]}
          max={100}
          step={1}
          onValueChange={(value) => setFood(value[0])}
        />
      </div>
      
      <div>
        <Label htmlFor="housing">Housing ({housing}%)</Label>
        <Slider
          id="housing"
          defaultValue={[housing]}
          max={100}
          step={1}
          onValueChange={(value) => setHousing(value[0])}
        />
      </div>
      
      <div>
        <Label htmlFor="transportation">Transportation ({transportation}%)</Label>
        <Slider
          id="transportation"
          defaultValue={[transportation]}
          max={100}
          step={1}
          onValueChange={(value) => setTransportation(value[0])}
        />
      </div>
      
      <div>
        <Label htmlFor="utilities">Utilities ({utilities}%)</Label>
        <Slider
          id="utilities"
          defaultValue={[utilities]}
          max={100}
          step={1}
          onValueChange={(value) => setUtilities(value[0])}
        />
      </div>
      
      <div>
        <Label htmlFor="entertainment">Entertainment ({entertainment}%)</Label>
        <Slider
          id="entertainment"
          defaultValue={[entertainment]}
          max={100}
          step={1}
          onValueChange={(value) => setEntertainment(value[0])}
        />
      </div>
      
      <div>
        <Label htmlFor="healthcare">Healthcare ({healthcare}%)</Label>
        <Slider
          id="healthcare"
          defaultValue={[healthcare]}
          max={100}
          step={1}
          onValueChange={(value) => setHealthcare(value[0])}
        />
      </div>
      
      <div>
        <Label htmlFor="clothing">Clothing ({clothing}%)</Label>
        <Slider
          id="clothing"
          defaultValue={[clothing]}
          max={100}
          step={1}
          onValueChange={(value) => setClothing(value[0])}
        />
      </div>
      
      <div>
        <Label htmlFor="debt">Debt ({debt}%)</Label>
        <Slider
          id="debt"
          defaultValue={[debt]}
          max={100}
          step={1}
          onValueChange={(value) => setDebt(value[0])}
        />
      </div>
      
      <div>
        <Label htmlFor="saving">Saving ({saving}%)</Label>
        <Slider
          id="saving"
          defaultValue={[saving]}
          max={100}
          step={1}
          onValueChange={(value) => setSaving(value[0])}
        />
      </div>
      
      <div>
        <Label htmlFor="other">Other ({other}%)</Label>
        <Slider
          id="other"
          defaultValue={[other]}
          max={100}
          step={1}
          onValueChange={(value) => setOther(value[0])}
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        {onDismiss && (
          <Button variant="outline" onClick={handleDismiss}>
            Remind Me Later
          </Button>
        )}
        <Button onClick={handleSave} disabled={isLoading}>
          Save Budget
        </Button>
      </div>
    </div>
  );
};

export default BudgetSetupForm;
