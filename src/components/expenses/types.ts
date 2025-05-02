
import { Expense } from '@/contexts/ExpenseContext';

export interface ExpenseTableProps {
  expenses: Expense[];
}

export interface DataRange {
  from: Date | undefined;
  to: Date | undefined;
}
