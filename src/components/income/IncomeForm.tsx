
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
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  amount: z.coerce.number().positive('Income must be a positive number'),
  description: z.string().optional(),
  category: z.string(),
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
  const [profileReady, setProfileReady] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  
  useEffect(() => {
    // Ensure profile exists when component mounts
    const checkProfile = async () => {
      const exists = await ensureProfileExists();
      setProfileReady(exists);
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
    
    if (!profileReady) {
      const exists = await ensureProfileExists();
      if (!exists) {
        toast.error('Could not create your profile. Please try again.');
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      // Use the custom category if "other" is selected and a custom value is provided
      const finalCategory = values.category === 'other' && customCategory ? customCategory : values.category;
      
      await addIncome({
        amount: values.amount,
        date: new Date(),
        description: values.description,
        category: finalCategory,
      });
      
      form.reset();
      setCustomCategory('');
      setShowCustomCategory(false);
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
  
  const handleCategoryChange = (value: string) => {
    form.setValue('category', value);
    setShowCustomCategory(value === 'other');
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
                    onValueChange={handleCategoryChange}
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
                    <Textarea placeholder="Monthly salary" {...field} />
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
