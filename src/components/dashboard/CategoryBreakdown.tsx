
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/contexts/AppContext';
import { ExpenseCategory, CATEGORY_COLORS } from '@/contexts/ExpenseContext';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';

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
  const categoryTotals = expenses.reduce((acc: Record<string, number>, expense) => {
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
    percentage: totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : '0'
  }));
  
  return (
    <Card className="bg-white/60 backdrop-blur-sm shadow-lg border border-white/40">
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
