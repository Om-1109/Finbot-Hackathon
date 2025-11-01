import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define some consistent colors for your asset classes
// This ensures your chart looks professional and consistent
const COLORS = {
  "Direct Equity": "#0088FE",
  "Equity Funds": "#00C49F",
  "Debt Instruments": "#FFBB28",
  "Gold": "#FF8042",
  "Default": "#8884d8" // Fallback color
};

// This component is "dumb" and reusable.
// It just takes data and plots it.
export default function AllocationPieChart({ allocationData }) {

  // Helper to format currency in the Tooltip
  const formatTooltip = (value) => `₹${value.toLocaleString('en-IN')}`;

  // This reformats the data for the pie chart
  const pieChartData = allocationData.map(item => ({
    name: item.asset_class,
    value: item.amount,
    percentage: item.percentage
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieChartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="80%"
          fill="#8884d8"
          // Show the percentage as the label on the chart
          label={(entry) => `${(entry.percentage * 100).toFixed(0)}%`}
        >
          {pieChartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.name] || COLORS.Default} 
            />
          ))}
        </Pie>
        <Tooltip formatter={formatTooltip} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}