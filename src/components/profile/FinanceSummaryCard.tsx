
// src/components/profile/FinanceSummaryTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { IndianRupee } from 'lucide-react';

export default function FinanceSummaryTab() {
  const { income, expenses, loans, savingGoals, totalIncome, remainingBalance } = useAppContext();

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(amount);

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalLoanPayments = loans.reduce((sum, loan) => sum + (loan.totalAmount - loan.remainingAmount), 0);
  const totalSavings = savingGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[{
          label: 'Total Income', value: totalIncome, color: 'text-green-600'
        }, {
          label: 'Total Expenses', value: totalExpenses, color: 'text-red-600'
        }, {
          label: 'Total Loan Payments', value: totalLoanPayments, color: 'text-blue-600'
        }, {
          label: 'Total Savings', value: totalSavings, color: 'text-purple-600'
        }, {
          label: 'Remaining Balance', value: remainingBalance, color: 'text-primary'
        }].map((item, idx) => (
          <div key={idx} className="flex justify-between border-b py-2">
            <div className="flex items-center gap-2">
              <IndianRupee className={`h-5 w-5 ${item.color}`} />
              <span>{item.label}</span>
            </div>
            <span className={`${item.color} font-bold`}>{formatCurrency(item.value)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}