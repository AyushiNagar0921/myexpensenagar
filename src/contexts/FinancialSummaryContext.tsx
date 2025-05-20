// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useIncomeContext } from './IncomeContext';
// import { useExpenseContext } from './ExpenseContext';

// interface FinancialSummary {
//   totalIncome: number;
//   totalExpenses: number;
//   remainingBalance: number;
// }

// const FinancialSummaryContext = createContext<FinancialSummary | undefined>(undefined);

// export const FinancialSummaryProvider = ({ children }: { children: React.ReactNode }) => {
//   const { incomes } = useIncomeContext();
//   const { expenses } = useExpenseContext();

//   const [summary, setSummary] = useState<FinancialSummary>({
//     totalIncome: 0,
//     totalExpenses: 0,
//     remainingBalance: 0,
//   });

//   useEffect(() => {
//     const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
//     const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
//     const remainingBalance = totalIncome - totalExpenses;

//     setSummary({
//       totalIncome,
//       totalExpenses,
//       remainingBalance,
//     });
//   }, [incomes, expenses]);

//   return (
//     <FinancialSummaryContext.Provider value={summary}>
//       {children}
//     </FinancialSummaryContext.Provider>
//   );
// };

// export const useFinancialSummary = () => {
//   const context = useContext(FinancialSummaryContext);
//   if (context === undefined) {
//     throw new Error('useFinancialSummary must be used within a FinancialSummaryProvider');
//   }
//   return context;
// };
