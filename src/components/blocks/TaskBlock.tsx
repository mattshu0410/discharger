'use client';
import type { BlockProps, TaskBlock as TaskBlockType } from '@/types/blocks';
import { Calendar, Check, CheckSquare, Edit3, Square } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function TaskBlock({ block, mode, onUpdate, onInteraction }: BlockProps<TaskBlockType>) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleTaskComplete = (taskId: string, completed: boolean) => {
    if (mode === 'patient' && onInteraction) {
      onInteraction('task_completed', { taskId, completed, timestamp: new Date() });
    }

    if (onUpdate) {
      const updatedBlock = {
        ...block,
        data: {
          ...block.data,
          tasks: block.data.tasks.map(task =>
            task.id === taskId ? { ...task, completed, completedAt: completed ? new Date() : undefined } : task,
          ),
        },
      };
      onUpdate(updatedBlock);
    }
  };

  const handleEdit = (taskId: string, field: string, value: string) => {
    if (onUpdate) {
      const updatedBlock = {
        ...block,
        data: {
          ...block.data,
          tasks: block.data.tasks.map(task =>
            task.id === taskId ? { ...task, [field]: value } : task,
          ),
        },
      };
      onUpdate(updatedBlock);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDueDate = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Tomorrow';
    }
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    }
    return `In ${diffDays} days`;
  };

  if (mode === 'patient') {
    const completedTasks = block.data.tasks.filter(t => t.completed).length;
    const totalTasks = block.data.tasks.length;

    return (
      <Card className="w-full border-green-200">
        <CardHeader className="bg-green-100 border-b border-green-200">
          <CardTitle className="flex items-center justify-between text-lg font-bold text-green-900">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              <span>{block.title}</span>
            </div>
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
              {completedTasks}
              /
              {totalTasks}
              {' '}
              completed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {block.data.tasks.map(task => (
            <div key={task.id} className="p-4 border-b border-green-100 last:border-b-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    onClick={() => handleTaskComplete(task.id, !task.completed)}
                  >
                    {task.completed
                      ? (
                          <Check className="w-5 h-5 text-green-600" />
                        )
                      : (
                          <Square className="w-5 h-5 text-muted-foreground" />
                        )}
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDueDate(new Date(task.dueDate))}
                        </div>
                      )}
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className={`font-medium mb-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-gray-900'}`}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div className={`text-sm ${task.completed ? 'text-muted-foreground' : 'text-gray-600'}`}>
                        {task.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Doctor edit/preview mode
  return (
    <Card className="w-full border-green-200">
      <CardHeader className="bg-green-100 border-b border-green-200">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-green-900">
          <CheckSquare className="w-5 h-5" />
          {mode === 'edit'
            ? (
                <Input
                  value={block.title}
                  onChange={e => onUpdate?.({ ...block, title: e.target.value })}
                  className="font-medium border-none p-0 h-auto bg-transparent text-green-900 flex-1"
                />
              )
            : (
                <span className="flex-1">{block.title}</span>
              )}
          {mode === 'edit' && <Edit3 className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {block.data.tasks.map(task => (
          <div key={task.id} className="p-4 border-b border-green-100 last:border-b-0">
            {mode === 'edit' && editingId === task.id
              ? (
                  <div className="space-y-3">
                    <Input
                      value={task.title}
                      onChange={e => handleEdit(task.id, 'title', e.target.value)}
                      placeholder="Task title"
                    />
                    <Textarea
                      value={task.description}
                      onChange={e => handleEdit(task.id, 'description', e.target.value)}
                      placeholder="Task description"
                      className="min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <select
                        value={task.priority}
                        onChange={e => handleEdit(task.id, 'priority', e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <Button size="sm" onClick={() => setEditingId(null)}>Done</Button>
                    </div>
                  </div>
                )
              : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDueDate(new Date(task.dueDate))}
                          </div>
                        )}
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="font-medium mb-1 text-gray-900">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-600 mb-2">{task.description}</div>
                      )}
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      {mode === 'edit' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(task.id)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
          </div>
        ))}

        {mode === 'edit' && (
          <div className="p-4 border-t border-green-200">
            <Button variant="outline" className="w-full border-dashed border-green-300 text-green-700">
              + Add Task
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
