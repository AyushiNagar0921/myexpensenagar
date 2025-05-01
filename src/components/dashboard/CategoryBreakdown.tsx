
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/contexts/AppContext';
import { ExpenseCategory } from '@/contexts/AppContext';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';

// Define colors for each expense category
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#10B981', // green
  Shopping: '#6366F1', // indigo 
  Transportation: '#F59E0B', // amber
  Utilities: '#EF4444', // red
  Entertainment: '#8B5CF6', // purple
  Health: '#06B6D4', // sky
  Other: '#6B7280', // gray
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    // Format currency in INR
    const amount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(payload[0].value);
    
    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="font-medium">{`${payload[0].name}: ${amount}`}</p>
        <p className="text-sm text-gray-500">{`${payload[0].payload.percentage}%`}</p>
      </div>
    );
  }
  return null;
};

const CategoryBreakdown = () => {
  const { expenses } = useAppContext();
  
  // Group expenses by category and calculate totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    const { category, amount } = expense;
    if (!acc[category]) acc[category] = 0;
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);
  
  const totalAmount = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
  
  // Format data for the chart
  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: amount,
    percentage: ((amount / totalAmount) * 100).toFixed(1)
  }));
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-muted-foreground">No expense data available</p>
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[entry.name as ExpenseCategory] || CATEGORY_COLORS.Other} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdown;
