// components/loans/LoanForm.tsx
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/contexts/AppContext";

interface LoanFormProps {
  onClose: () => void;
  loanToEdit?: {
    id: string;
    title: string;
    totalAmount: number;
    remainingAmount: number;
    monthlyPayment: number;
    dueDay: number;
    nextPaymentDate: Date;
  };
}

const LoanForm: React.FC<LoanFormProps> = ({ onClose, loanToEdit }) => {
  const { addLoan, updateLoan } = useAppContext();

  const [formData, setFormData] = useState({
    title: '',
    totalAmount: '',
    remainingAmount: '',
    monthlyPayment: '',
    dueDay: '',
    nextPaymentDate: '',
  });

  useEffect(() => {
    if (loanToEdit) {
      setFormData({
        title: loanToEdit.title,
        totalAmount: loanToEdit.totalAmount.toString(),
        remainingAmount: loanToEdit.remainingAmount.toString(),
        monthlyPayment: loanToEdit.monthlyPayment.toString(),
        dueDay: loanToEdit.dueDay.toString(),
        nextPaymentDate: loanToEdit.nextPaymentDate.toISOString().substring(0, 10),
      });
    }
  }, [loanToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loanData = {
      title: formData.title,
      totalAmount: Number(formData.totalAmount),
      remainingAmount: Number(formData.remainingAmount),
      monthlyPayment: Number(formData.monthlyPayment),
      dueDay: Number(formData.dueDay),
      nextPaymentDate: new Date(formData.nextPaymentDate),
    };

    try {
      if (loanToEdit) {
        await updateLoan(loanToEdit.id, loanData);
      } else {
        await addLoan(loanData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving loan:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">{loanToEdit ? 'Edit Loan' : 'Add New Loan'}</h2>

      {[
        { label: 'Title', name: 'title', type: 'text' },
        { label: 'Total Amount', name: 'totalAmount', type: 'number' },
        { label: 'Remaining Amount', name: 'remainingAmount', type: 'number' },
        { label: 'Monthly Payment', name: 'monthlyPayment', type: 'number' },
        { label: 'Due Day (1-31)', name: 'dueDay', type: 'number' },
        { label: 'Next Payment Date', name: 'nextPaymentDate', type: 'date' },
      ].map(({ label, name, type }) => (
        <div key={name}>
          <Label htmlFor={name}>{label}</Label>
          <Input
            id={name}
            name={name}
            type={type}
            value={formData[name as keyof typeof formData]}
            onChange={handleChange}
            required
          />
        </div>
      ))}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {loanToEdit ? 'Update Loan' : 'Add Loan'}
        </Button>
      </div>
    </form>
  );
};

export default LoanForm;
