import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LayoutDashboard, CheckSquare, Clock, AlertCircle } from 'lucide-react';

export default function ProductivityDashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Wreath Build: Rustic Spring', deadline: '2026-04-05', status: 'In Progress' },
    { id: 2, title: 'Etsy Listing: Summer Collection', deadline: '2026-04-07', status: 'Pending' },
    { id: 3, title: 'Client Consultation: Custom Order', deadline: '2026-04-10', status: 'Scheduled' },
  ]);

  return (
    <div className="p-12 space-y-12">
      <header className="space-y-4">
        <span className="display-text opacity-40">Workflow & Productivity</span>
        <h1 className="editorial-title text-6xl">Productivity Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tasks.map(task => (
          <Card key={task.id} className="glass-panel p-6 bg-muted/20">
            <CardHeader>
              <CardTitle className="editorial-title text-2xl flex items-center gap-2">
                <CheckSquare className="w-6 h-6" />
                {task.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 opacity-60">
                <Clock className="w-4 h-4" />
                <span>Deadline: {task.deadline}</span>
              </div>
              <div className="flex items-center gap-2 opacity-60">
                <AlertCircle className="w-4 h-4" />
                <span>Status: {task.status}</span>
              </div>
              <Button className="w-full bg-foreground text-background hover:opacity-80">View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
