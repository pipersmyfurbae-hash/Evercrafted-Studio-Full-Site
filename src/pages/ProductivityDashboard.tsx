import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutList, 
  LayoutGrid, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  X,
  Trash2,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Task, Project, DashboardMetrics } from '../types';
import { subscribeToTasks, saveTask, updateTaskStatus, deleteTask } from '../services/firebase/taskService';
import { subscribeToProjects, saveProject } from '../services/firebase/projectService';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

type ViewMode = 'list' | 'board' | 'calendar';

export default function ProductivityDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // New Task Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    status: 'pending' as Task['status'],
    dueDate: new Date().toISOString().split('T')[0],
    projectId: ''
  });

  useEffect(() => {
    if (!user) return;

    const unsubscribeTasks = subscribeToTasks(user.uid, setTasks);
    const unsubscribeProjects = subscribeToProjects(user.uid, setProjects);

    return () => {
      unsubscribeTasks();
      unsubscribeProjects();
    };
  }, [user]);

  const metrics: DashboardMetrics = useMemo(() => {
    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    return {
      active_projects: projects.filter(p => p.status === 'active').length,
      pending_tasks: tasks.filter(t => t.status !== 'completed').length,
      completed_tasks: tasks.filter(t => t.status === 'completed').length,
      upcoming_deadlines: tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        return t.status !== 'completed' && dueDate >= now && dueDate <= next7Days;
      }).length
    };
  }, [tasks, projects]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const selectedTask = useMemo(() => 
    tasks.find(t => t.id === selectedTaskId), 
    [tasks, selectedTaskId]
  );

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const task: Task = {
      id: `task_${Date.now()}`,
      userId: user.uid,
      ...newTask,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await saveTask(task);
      setIsNewTaskModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date().toISOString().split('T')[0],
        projectId: ''
      });
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await saveTask({ ...task, ...updates, updatedAt: new Date().toISOString() });
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setSelectedTaskId(null);
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Overview Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-background/50 backdrop-blur-sm border-b border-foreground/5 sticky top-0 z-10">
          <MetricCard 
            label="Active Projects" 
            value={metrics.active_projects} 
            icon={<LayoutGrid className="w-5 h-5 text-blue-500" />} 
          />
          <MetricCard 
            label="Pending Tasks" 
            value={metrics.pending_tasks} 
            icon={<Clock className="w-5 h-5 text-amber-500" />} 
          />
          <MetricCard 
            label="Completed Today" 
            value={metrics.completed_tasks} 
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} 
          />
          <MetricCard 
            label="Upcoming Deadlines" 
            value={metrics.upcoming_deadlines} 
            icon={<AlertCircle className="w-5 h-5 text-rose-500" />} 
          />
        </div>

        {/* View Toggle & Filter Bar */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-foreground/5">
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg">
            <ViewToggleButton 
              active={viewMode === 'list'} 
              onClick={() => setViewMode('list')} 
              icon={<LayoutList className="w-4 h-4" />} 
              label="List" 
            />
            <ViewToggleButton 
              active={viewMode === 'board'} 
              onClick={() => setViewMode('board')} 
              icon={<LayoutGrid className="w-4 h-4" />} 
              label="Board" 
            />
            <ViewToggleButton 
              active={viewMode === 'calendar'} 
              onClick={() => setViewMode('calendar')} 
              icon={<CalendarIcon className="w-4 h-4" />} 
              label="Calendar" 
            />
          </div>

          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="px-3 py-2 bg-muted/20 border border-foreground/10 rounded-lg focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <Button onClick={() => setIsNewTaskModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> New Task
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {viewMode === 'list' && (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                {filteredTasks.map(task => (
                  <TaskRow 
                    key={task.id} 
                    task={task} 
                    onClick={() => setSelectedTaskId(task.id)}
                    onStatusChange={(status) => handleUpdateTask(task.id, { status })}
                    isSelected={selectedTaskId === task.id}
                  />
                ))}
                {filteredTasks.length === 0 && (
                  <div className="text-center py-20 opacity-40">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p>No tasks found matching your filters.</p>
                  </div>
                )}
              </motion.div>
            )}

            {viewMode === 'board' && (
              <motion.div 
                key="board"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full"
              >
                <BoardColumn 
                  title="Pending" 
                  tasks={filteredTasks.filter(t => t.status === 'pending')} 
                  onTaskClick={setSelectedTaskId}
                  onDrop={(taskId) => handleUpdateTask(taskId, { status: 'pending' })}
                />
                <BoardColumn 
                  title="In Progress" 
                  tasks={filteredTasks.filter(t => t.status === 'in_progress')} 
                  onTaskClick={setSelectedTaskId}
                  onDrop={(taskId) => handleUpdateTask(taskId, { status: 'in_progress' })}
                />
                <BoardColumn 
                  title="Completed" 
                  tasks={filteredTasks.filter(t => t.status === 'completed')} 
                  onTaskClick={setSelectedTaskId}
                  onDrop={(taskId) => handleUpdateTask(taskId, { status: 'completed' })}
                />
              </motion.div>
            )}

            {viewMode === 'calendar' && (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <CalendarView tasks={filteredTasks} onTaskClick={setSelectedTaskId} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Project Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Active Projects</h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground">View All</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} tasks={tasks.filter(t => t.projectId === project.id)} />
              ))}
              <button 
                className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-foreground/10 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={() => toast.info('Project creation coming soon!')}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Create New Project</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <AnimatePresence>
        {selectedTaskId && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-96 border-l border-foreground/5 bg-background/80 backdrop-blur-xl p-6 overflow-y-auto z-20 shadow-2xl"
          >
            {selectedTask ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Task Details</h3>
                  <button 
                    onClick={() => setSelectedTaskId(null)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Title</label>
                    <input 
                      type="text" 
                      className="w-full bg-muted/20 border-none rounded-lg p-3 focus:ring-2 focus:ring-primary/20"
                      value={selectedTask.title}
                      onChange={(e) => handleUpdateTask(selectedTask.id, { title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Description</label>
                    <textarea 
                      rows={4}
                      className="w-full bg-muted/20 border-none rounded-lg p-3 focus:ring-2 focus:ring-primary/20 resize-none"
                      value={selectedTask.description}
                      onChange={(e) => handleUpdateTask(selectedTask.id, { description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Status</label>
                      <select 
                        className="w-full bg-muted/20 border-none rounded-lg p-2 focus:ring-2 focus:ring-primary/20"
                        value={selectedTask.status}
                        onChange={(e) => handleUpdateTask(selectedTask.id, { status: e.target.value as Task['status'] })}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Priority</label>
                      <select 
                        className="w-full bg-muted/20 border-none rounded-lg p-2 focus:ring-2 focus:ring-primary/20"
                        value={selectedTask.priority}
                        onChange={(e) => handleUpdateTask(selectedTask.id, { priority: e.target.value as Task['priority'] })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Due Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-muted/20 border-none rounded-lg p-2 focus:ring-2 focus:ring-primary/20"
                      value={selectedTask.dueDate}
                      onChange={(e) => handleUpdateTask(selectedTask.id, { dueDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Project</label>
                    <select 
                      className="w-full bg-muted/20 border-none rounded-lg p-2 focus:ring-2 focus:ring-primary/20"
                      value={selectedTask.projectId || ''}
                      onChange={(e) => handleUpdateTask(selectedTask.id, { projectId: e.target.value })}
                    >
                      <option value="">No Project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-6 flex flex-col gap-3">
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => handleUpdateTask(selectedTask.id, { status: 'completed' })}
                    disabled={selectedTask.status === 'completed'}
                  >
                    <Check className="w-4 h-4" /> Mark as Complete
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-100"
                    onClick={() => handleDeleteTask(selectedTask.id)}
                  >
                    <Trash2 className="w-4 h-4" /> Delete Task
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p>Task not found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Task Modal */}
      <AnimatePresence>
        {isNewTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsNewTaskModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-background border border-foreground/10 rounded-2xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-medium">Create New Task</h2>
                <button onClick={() => setIsNewTaskModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Title</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-muted/20 border border-foreground/5 rounded-lg p-3 focus:ring-2 focus:ring-primary/20"
                      placeholder="What needs to be done?"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Description</label>
                    <textarea 
                      rows={3}
                      className="w-full bg-muted/20 border border-foreground/5 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Add more details..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Priority</label>
                      <select 
                        className="w-full bg-muted/20 border border-foreground/5 rounded-lg p-2 focus:ring-2 focus:ring-primary/20"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Due Date</label>
                      <input 
                        type="date" 
                        required
                        className="w-full bg-muted/20 border border-foreground/5 rounded-lg p-2 focus:ring-2 focus:ring-primary/20"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Project</label>
                    <select 
                      className="w-full bg-muted/20 border border-foreground/5 rounded-lg p-2 focus:ring-2 focus:ring-primary/20"
                      value={newTask.projectId}
                      onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                    >
                      <option value="">No Project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsNewTaskModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Create Task</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-muted/10 border border-foreground/5 p-4 rounded-xl flex items-center gap-4 hover:bg-muted/20 transition-colors cursor-pointer group">
      <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ViewToggleButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        active ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function TaskRow({ task, onClick, onStatusChange, isSelected }: { task: Task; onClick: () => void; onStatusChange: (status: Task['status']) => void; isSelected: boolean }) {
  const priorityColors = {
    low: 'bg-blue-50 text-blue-600',
    medium: 'bg-amber-50 text-amber-600',
    high: 'bg-rose-50 text-rose-600'
  };

  const statusColors = {
    pending: 'bg-slate-100 text-slate-600',
    in_progress: 'bg-indigo-100 text-indigo-600',
    completed: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <div 
      onClick={onClick}
      className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected ? 'bg-primary/5 border-primary/20 shadow-md' : 'bg-background border-foreground/5 hover:border-foreground/10 hover:shadow-sm'
      }`}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(task.status === 'completed' ? 'pending' : 'completed');
        }}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-foreground/10 hover:border-primary'
        }`}
      >
        {task.status === 'completed' && <Check className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={`font-medium truncate ${task.status === 'completed' ? 'line-through opacity-40' : ''}`}>
          {task.title}
        </h4>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${statusColors[task.status]}`}>
          {task.status.replace('_', ' ')}
        </span>
        <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isSelected ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
      </div>
    </div>
  );
}

function BoardColumn({ title, tasks, onTaskClick, onDrop }: { title: string; tasks: Task[]; onTaskClick: (id: string) => void; onDrop: (id: string) => void }) {
  return (
    <div className="flex flex-col h-full bg-muted/10 rounded-2xl border border-foreground/5 overflow-hidden">
      <div className="p-4 border-b border-foreground/5 flex items-center justify-between bg-muted/20">
        <h3 className="font-medium flex items-center gap-2">
          {title}
          <span className="text-xs bg-background px-2 py-0.5 rounded-full text-muted-foreground">{tasks.length}</span>
        </h3>
        <MoreVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {tasks.map(task => (
          <div 
            key={task.id}
            onClick={() => onTaskClick(task.id)}
            className="bg-background p-4 rounded-xl border border-foreground/5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">{task.title}</h4>
              <span className={`text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                task.priority === 'high' ? 'bg-rose-50 text-rose-600' : 
                task.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {task.priority}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{task.description}</p>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString()}</span>
              {task.projectId && <span className="bg-muted px-2 py-0.5 rounded-full">Project</span>}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-foreground/5 rounded-xl flex items-center justify-center text-xs text-muted-foreground opacity-40">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, tasks }: { project: Project; tasks: Task[] }) {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="bg-background p-6 rounded-2xl border border-foreground/5 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{project.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
        </div>
        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
          project.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
        }`}>
          {project.status}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
              {String.fromCharCode(64 + i)}
            </div>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{tasks.length} Tasks</span>
      </div>
    </div>
  );
}

function CalendarView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (id: string) => void }) {
  // Simple calendar implementation for demo
  const days = Array.from({ length: 35 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + i);
    return date;
  });

  return (
    <div className="grid grid-cols-7 border border-foreground/5 rounded-2xl overflow-hidden bg-background">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-4 text-center text-xs font-bold uppercase tracking-widest border-b border-foreground/5 bg-muted/20">
          {day}
        </div>
      ))}
      {days.map((date, i) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = tasks.filter(t => t.dueDate === dateStr);
        const isToday = new Date().toDateString() === date.toDateString();

        return (
          <div key={i} className={`min-h-[120px] p-2 border-r border-b border-foreground/5 ${isToday ? 'bg-primary/5' : ''}`}>
            <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
              {date.getDate()}
            </span>
            <div className="mt-2 space-y-1">
              {dayTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => onTaskClick(task.id)}
                  className={`text-[10px] p-1 rounded truncate cursor-pointer transition-colors ${
                    task.priority === 'high' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 
                    task.priority === 'medium' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
