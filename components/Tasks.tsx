import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { PlusCircleIcon, CalendarDaysIcon, CheckCircleIcon, ClipboardDocumentIcon, XIcon, AnimatedCheckCircleIcon } from './Icons';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface TasksProps {
    tasks: Task[];
    addTask: (text: string, dueDate?: Date) => void;
    toggleTask: (taskId: string) => void;
    deleteTask: (taskId: string) => void;
}

const TaskItem: React.FC<{ task: Task; onToggle: (id: string) => void; onDeleteRequest: (task: Task) => void; }> = ({ task, onToggle, onDeleteRequest }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = !task.completed && task.dueDate && task.dueDate < today;
    
    const formatDate = (date: Date) => {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className={`task-item flex items-center p-3 bg-slate-200 rounded-lg shadow-digital-inset transition-opacity duration-300 ${task.completed ? 'opacity-60 task-completed' : ''}`}>
            <button onClick={() => onToggle(task.id)} className="flex-shrink-0 p-1">
                {task.completed ? (
                    <AnimatedCheckCircleIcon className="w-6 h-6" />
                ) : (
                    <div className="w-6 h-6 border-2 border-slate-400 rounded-full hover:border-primary transition-colors"></div>
                )}
            </button>
            <div className="flex-grow mx-3">
                <p className={`text-slate-800 task-text`}>{task.text}</p>
                {task.dueDate && (
                    <div className={`flex items-center space-x-1 text-sm mt-1 ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>Due: {formatDate(task.dueDate)}</span>
                    </div>
                )}
            </div>
            <button onClick={() => onDeleteRequest(task)} className="text-slate-400 hover:text-red-500 p-1 rounded-full transition-colors">
                 <XIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

export const Tasks: React.FC<TasksProps> = ({ tasks, addTask, toggleTask, deleteTask }) => {
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        
        const date = dueDate ? new Date(dueDate) : undefined;
        // Adjust for timezone offset if date is provided
        if (date) {
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        }

        addTask(text, date);
        setText('');
        setDueDate('');
    };

    const pendingTasks = useMemo(() => tasks.filter(t => !t.completed).sort((a,b) => (a.dueDate?.getTime() || Infinity) - (b.dueDate?.getTime() || Infinity)), [tasks]);
    const completedTasks = useMemo(() => tasks.filter(t => t.completed).sort((a,b) => (b.dueDate?.getTime() || 0) - (a.dueDate?.getTime() || 0)), [tasks]);

    const handleConfirmDelete = () => {
        if (taskToDelete) {
            deleteTask(taskToDelete.id);
            setTaskToDelete(null);
        }
    };

    return (
        <>
            <div className="space-y-8 max-w-3xl mx-auto">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Financial Tasks</h2>
                    <p className="text-sm text-slate-500 mt-1">Organize your financial to-dos and stay on top of your goals.</p>
                </div>

                <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
                        <input 
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Add a new task..."
                            className="w-full bg-slate-200 p-3 rounded-md shadow-digital-inset focus:ring-2 focus:ring-primary"
                        />
                        <input 
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full sm:w-auto bg-slate-200 p-3 rounded-md shadow-digital-inset focus:ring-2 focus:ring-primary text-slate-600"
                        />
                        <button type="submit" className="w-full sm:w-auto flex-shrink-0 px-4 py-3 bg-primary text-white rounded-lg shadow-md flex items-center justify-center space-x-2">
                            <PlusCircleIcon className="w-5 h-5"/>
                            <span>Add</span>
                        </button>
                    </form>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Pending</h3>
                        {pendingTasks.length > 0 ? (
                            <div className="space-y-3">
                                {pendingTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} onDeleteRequest={setTaskToDelete} />)}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-slate-200 rounded-lg shadow-digital-inset">
                                <ClipboardDocumentIcon className="w-12 h-12 mx-auto text-slate-400 mb-2"/>
                                <p className="text-slate-500">All caught up!</p>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Completed</h3>
                        {completedTasks.length > 0 ? (
                            <div className="space-y-3">
                                {completedTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} onDeleteRequest={setTaskToDelete} />)}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-slate-200 rounded-lg shadow-digital-inset">
                                <p className="text-slate-500">No completed tasks yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {taskToDelete && (
                <DeleteConfirmationModal
                    taskText={taskToDelete.text}
                    onClose={() => setTaskToDelete(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </>
    );
};