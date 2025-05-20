
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from '@/contexts/AppContext';
import { useExpenseContext } from '@/contexts/ExpenseContext';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  amount: z.coerce.number().positive('Expense must be a positive number'),
  description: z.string().optional(),
  category: z.string(),
});

interface ExpenseFormProps {
  onSuccess?: () => void;
}

const ExpenseForm = ({ onSuccess }: ExpenseFormProps) => {
  const { addExpense, isLoading, ensureProfileExists } = useAppContext();
  const { EXPENSE_CATEGORIES } = useExpenseContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: '',
      category: 'Food',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error('You must be logged in to add expense');
      navigate('/auth');
      return;
    }

    // Ensure user profile exists before proceeding
    const profileExists = await ensureProfileExists();
    if (!profileExists) {
      toast.error('Could not create your profile. Please try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use custom category if "Other" is selected and custom value is provided
      const finalCategory = values.category === 'Other' && customCategory ? customCategory : values.category;

      await addExpense({
        amount: values.amount,
        date: new Date(),
        description: values.description || '',
        category: finalCategory,
      });

      form.reset();
      setCustomCategory('');
      setShowCustomCategory(false);
      // toast.success('Expense added successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast.error(error.message || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    form.setValue('category', value);
    setShowCustomCategory(value === 'Other');
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm shadow-lg border border-white/40">
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
        <CardDescription>
          Record your expenses to better track your spending
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={handleCategoryChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showCustomCategory && (
              <FormItem>
                <FormLabel>Custom Category</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                </FormControl>
              </FormItem>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Groceries at SuperMart" {...field} />
                  </FormControl>
                  <FormDescription>
                    Add a short description for this expense
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ExpenseForm;
