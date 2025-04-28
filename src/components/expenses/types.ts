
import { Expense } from '@/contexts/AppContext';

export interface ExpenseTableProps {
  expenses: Expense[];
}

export interface DataRange {
  from: Date | undefined;
  to: Date | undefined;
}
