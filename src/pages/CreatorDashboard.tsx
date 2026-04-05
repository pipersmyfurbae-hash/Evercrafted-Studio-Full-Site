import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, BarChart3, DollarSign, Package } from 'lucide-react';

export default function CreatorDashboard() {
  const stats = [
    { title: 'Total Revenue', value: '$2,160', icon: DollarSign },
    { title: 'Total Sales', value: '120', icon: Package },
    { title: 'Conversion Rate', value: '4.2%', icon: BarChart3 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-serif text-primary">Creator Dashboard</h1>
        <Button>
          <Plus className="mr-2" /> Create Listing
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Your Listings</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You have 3 active listings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
