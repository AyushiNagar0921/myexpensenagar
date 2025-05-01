
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  amount: z.coerce.number().positive('Income must be a positive number'),
  description: z.string().optional(),
  category: z.string().optional(),
});

const categoryOptions = [
  { label: 'Salary', value: 'salary' },
  { label: 'Freelance', value: 'freelance' },
  { label: 'Business', value: 'business' },
  { label: 'Investment', value: 'investment' },
  { label: 'Gift', value: 'gift' },
  { label: 'Other', value: 'other' },
];

interface IncomeFormProps {
  onSuccess?: () => void;
}

const IncomeForm = ({ onSuccess }: IncomeFormProps) => {
  const { addIncome, isLoading, ensureProfileExists } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Ensure profile exists when component mounts
    const checkProfile = async () => {
      await ensureProfileExists();
    };
    checkProfile();
  }, [ensureProfileExists]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: '',
      category: 'salary',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error('You must be logged in to add income');
      navigate('/auth');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Ensure profile exists before adding income
      await ensureProfileExists();
      
      await addIncome({
        amount: values.amount,
        date: new Date(),
        description: values.description,
        category: values.category,
      });
      
      form.reset();
      toast.success('Income added successfully!');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding income:', error);
      toast.error(error.message || 'Failed to add income');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Income</CardTitle>
        <CardDescription>
          Record your income to better track your finances
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
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Monthly salary" {...field} />
                  </FormControl>
                  <FormDescription>
                    Add a short description for this income
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
              {isSubmitting ? 'Adding...' : 'Add Income'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default IncomeForm;
