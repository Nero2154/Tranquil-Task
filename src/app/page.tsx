
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isToday, parseISO, addMinutes, setHours, setMinutes, startOfToday, isBefore, startOfDay, endOfDay } from "date-fns";
import {
  Bell,
  Check,
  CloudLightning,
  Plus,
  Info,
  Settings,
  Palette,
  Music,
  Moon,
  Sun,
  Upload,
  Trash2,
  Edit,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Task, Alarm, Language, ThemeColor, AlarmSound } from "@/lib/types";
import { translations, presetSounds } from "@/lib/translations";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { prioritizeTasks } from "@/ai/flows/prioritize-tasks";
import { motivateTaskCompletion } from "@/ai/flows/motivate-task-completion";
import { sarcasticAlarmSnooze } from "@/ai/flows/sarcastic-alarm-snooze";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "@/components/icons";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

const taskSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  deadlineDate: z.date(),
  deadlineTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  priority: z.enum(["Low", "Medium", "High"]),
});

const alarmSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  sound: z.enum(["classic", "digital", "chime", "custom"]),
  customSoundDataUri: z.string().optional(),
});

const themeColors: { name: ThemeColor; value: string; foreground: string }[] = [
    { name: "default", value: "216 44% 66%", foreground: "210 40% 98%" },
    { name: "stone", value: "40 85% 65%", foreground: "40 85% 10%" },
    { name: "red", value: "0 84% 65%", foreground: "0 84% 98%" },
    { name: "green", value: "142 76% 50%", foreground: "142 76% 98%" },
    { name: "blue", value: "262 83% 72%", foreground: "262 83% 98%" },
];

export default function Home() {
  const [language, setLanguage] = useLocalStorage<Language>("language", "english");
  const [theme, setTheme] = useLocalStorage<ThemeColor>("theme", "default");
  const [themeMode, setThemeMode] = useLocalStorage<"light" | "dark">("themeMode", "light");
  const t = translations[language];

  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [alarms, setAlarms] = useLocalStorage<Alarm[]>("alarms", []);
  
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isAlarmDialogOpen, setIsAlarmDialogOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [installPrompt, setInstallPrompt] = useState<any>(null);


  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      if ("Notification" in window) {
        setNotificationPermission(Notification.permission);
      }

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        }).catch(function(error) {
          console.log('Service Worker registration failed:', error);
        });
      }
      
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setInstallPrompt(e);
      });
    }
  }, []);
  
  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        toast({ title: "Notifications enabled!" });
      } else {
        toast({ title: "Notifications not enabled.", variant: "destructive" });
      }
    }
  };

  const scheduleNotification = (task: Task) => {
    if (notificationPermission !== "granted") return;
    const deadline = parseISO(task.deadline);
    const notificationTime = addMinutes(deadline, -5).getTime();
    const now = new Date().getTime();
    
    if (notificationTime > now) {
      setTimeout(() => {
        new Notification("Task Reminder", {
          body: `Your task "${task.name}" is due in 5 minutes!`,
          icon: '/icons/icon-192x192.png',
        });
      }, notificationTime - now);
    }
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => (a.priorityScore || 0) - (b.priorityScore || 0) || new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks]);
  
  const activeTasks = sortedTasks.filter((task) => !task.completed);
  
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const completedTasksToday = sortedTasks.filter((task) => {
    if (!task.completed || !task.completedAt) return false;
    const completedDate = parseISO(task.completedAt);
    return completedDate >= todayStart && completedDate <= todayEnd;
  });

  const todayTasks = activeTasks.filter(task => isToday(parseISO(task.deadline)));

  useEffect(() => {
    // Clean up tasks that were completed before today
    const now = new Date();
    const startOfToday = startOfDay(now);
    const relevantTasks = tasks.filter(task => {
        if (!task.completed) return true; // Keep active tasks
        if (!task.completedAt) return true; // Keep completed tasks without a completion date (for safety)
        return parseISO(task.completedAt) >= startOfToday; // Keep tasks completed today
    });
    if(relevantTasks.length !== tasks.length) {
        setTasks(relevantTasks);
    }
  }, []); // Runs once on mount


  useEffect(() => {
    if (isMounted) {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(themeMode);

      const selectedColor = themeColors.find(c => c.name === theme);
      if (selectedColor) {
        root.style.setProperty('--primary', selectedColor.value);
        root.style.setProperty('--primary-foreground', selectedColor.foreground);
      }
    }
  }, [theme, themeMode, isMounted]);

  const handleTaskFormSubmit = (values: z.infer<typeof taskSchema>) => {
    const [hours, minutes] = values.deadlineTime.split(':').map(Number);
    const deadline = setMinutes(setHours(values.deadlineDate, hours), minutes);

    if (editingTask) {
        const updatedTask: Task = { ...editingTask, ...values, deadline: deadline.toISOString() };
        setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
        toast({ title: "Task updated!" });
        scheduleNotification(updatedTask);
    } else {
        const newTask: Task = {
          id: Date.now().toString(),
          name: values.name,
          description: values.description,
          deadline: deadline.toISOString(),
          priority: values.priority,
          completed: false,
        };
        setTasks([...tasks, newTask]);
        toast({
            title: t.toastTaskCreated,
            description: newTask.name,
        });
        scheduleNotification(newTask);
    }
    
    setEditingTask(null);
    setIsTaskDialogOpen(false);
  };

  const handleAlarmFormSubmit = (values: z.infer<typeof alarmSchema>) => {
    if (editingAlarm) {
        const updatedAlarm: Alarm = { ...editingAlarm, ...values };
        setAlarms(alarms.map(a => a.id === editingAlarm.id ? updatedAlarm : a));
        toast({ title: "Alarm updated!" });
    } else {
        const newAlarm: Alarm = { id: Date.now().toString(), ...values };
        setAlarms([...alarms, newAlarm]);
        toast({
            title: t.toastAlarmSet,
            description: `${newAlarm.description} at ${newAlarm.time}`,
        });
    }
    setEditingAlarm(null);
    setIsAlarmDialogOpen(false);
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed, completedAt: completed ? new Date().toISOString() : undefined } : task
    );
    setTasks(updatedTasks);
    
    if (completed) {
      const completedTask = tasks.find(t => t.id === taskId);
      if(completedTask) {
        try {
          const res = await motivateTaskCompletion({
            taskName: completedTask.name,
            taskDescription: `${completedTask.description || ''} (in ${language})`,
          });
          toast({
            title: t.toastTaskCompleted,
            description: res.motivationalMessage,
          });
        } catch (error) {
          console.error("Motivation AI error:", error);
          toast({
            title: t.toastTaskCompleted,
            description: "Great job!",
          });
        }
      }
    }
  };
  
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    toast({ title: "Task deleted", variant: "destructive" });
  }

  const deleteAlarm = (alarmId: string) => {
    setAlarms(alarms.filter(a => a.id !== alarmId));
    toast({ title: "Alarm deleted", variant: "destructive" });
  }
  
  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  }

  const openEditAlarmDialog = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setIsAlarmDialogOpen(true);
  }


  const handlePrioritize = async () => {
    if (todayTasks.length === 0) {
      toast({ title: t.toastNoTasks, description: t.toastNoTasksDescription });
      return;
    }
    setIsLoading(true);
    try {
      const prioritized = await prioritizeTasks(todayTasks.map(t => ({...t, description: `${t.description || ''} (in ${language})`})));
      const prioritizedMap = new Map(prioritized.map(p => [p.name, { score: p.priorityScore, reasoning: p.reasoning }]));
      
      const updatedTasks = tasks.map(task => {
        const pTask = prioritizedMap.get(task.name);
        if (pTask) {
          return { ...task, priorityScore: pTask.score, reasoning: p.reasoning };
        }
        return task;
      });
      setTasks(updatedTasks);
      toast({
        title: t.toastPrioritized,
        description: t.toastPrioritizedDescription,
      });
    } catch (error) {
      console.error("Prioritization AI error:", error);
      toast({ title: t.errorAITitle, description: t.errorAIDescription, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const stopAlarmSound = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
  };

  const handleSnooze = async (minutes: number) => {
    if(!activeAlarm) return;
    stopAlarmSound();
    
    const snoozedTime = addMinutes(new Date(), minutes);
    const newAlarmTime = format(snoozedTime, 'HH:mm');

    const snoozedAlarm: Alarm = {
        ...activeAlarm,
        id: Date.now().toString(),
        time: newAlarmTime,
        description: `${activeAlarm.description} (Snoozed)`
    };

    setAlarms([...alarms, snoozedAlarm]);
    setActiveAlarm(null);

    toast({
        title: `Alarm Snoozed for ${minutes} minutes`,
        description: `Will ring again at ${newAlarmTime}`
    });

    setIsLoading(true);
    try {
      const res = await sarcasticAlarmSnooze({ alarmDescription: `${activeAlarm.description} (in ${language})`});
      if (audioRef.current) {
        audioRef.current.src = res.audio;
        audioRef.current.play();
      }
    } catch (error) {
       console.error("Snooze AI error:", error);
       toast({ title: t.errorAITitle, description: t.errorAIDescription, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const playAlarmSound = (alarm: Alarm) => {
    if (!audioRef.current) return;
    
    let soundSrc = '';
    if (alarm.sound === 'custom' && alarm.customSoundDataUri) {
      soundSrc = alarm.customSoundDataUri;
    } else if (alarm.sound !== 'custom') {
        soundSrc = presetSounds[alarm.sound];
    }
    
    if (soundSrc) {
        audioRef.current.src = soundSrc;
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeAlarm) return; // Don't check for new alarms if one is already active
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const dueAlarm = alarms.find(alarm => alarm.time === currentTime);
      if(dueAlarm) {
        playAlarmSound(dueAlarm);
        setActiveAlarm(dueAlarm);
        setAlarms(alarms.filter(a => a.id !== dueAlarm.id));
      }
    }, 1000 * 10); // Check every 10 seconds for accuracy
    return () => clearInterval(interval);
  }, [alarms, setAlarms, activeAlarm]);
  
  const TaskForm = ({ onFinished, task }: { onFinished: (values: z.infer<typeof taskSchema>) => void, task: Task | null }) => {
    const defaultDeadline = task ? parseISO(task.deadline) : new Date();
    const form = useForm<z.infer<typeof taskSchema>>({
      resolver: zodResolver(taskSchema),
      defaultValues: {
        name: task?.name || "",
        description: task?.description || "",
        priority: task?.priority || "Medium",
        deadlineDate: defaultDeadline,
        deadlineTime: format(defaultDeadline, 'HH:mm'),
      },
    });
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinished)} className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>{t.taskName}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>{t.description}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
          )} />
           <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="deadlineDate" render={({ field }) => (
              <FormItem className="flex flex-col"><FormLabel>{t.deadline}</FormLabel>
                <Popover><PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>{t.pickDate}</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover><FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="deadlineTime" render={({ field }) => (
              <FormItem className="flex flex-col"><FormLabel>{t.time}</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="priority" render={({ field }) => (
            <FormItem><FormLabel>{t.priority}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder={t.selectPriority} /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Low">{t.low}</SelectItem>
                  <SelectItem value="Medium">{t.medium}</SelectItem>
                  <SelectItem value="High">{t.high}</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <DialogFooter><Button type="submit">{task ? "Update Task" : t.addTask}</Button></DialogFooter>
        </form>
      </Form>
    );
  };

  const AlarmForm = ({ onFinished, alarm }: { onFinished: (values: z.infer<typeof alarmSchema>) => void, alarm: Alarm | null }) => {
    const form = useForm<z.infer<typeof alarmSchema>>({
      resolver: zodResolver(alarmSchema),
      defaultValues: { 
        description: alarm?.description || "",
        time: alarm?.time || "",
        sound: alarm?.sound || "classic",
        customSoundDataUri: alarm?.customSoundDataUri || ""
      },
    });
    const [fileName, setFileName] = useState(alarm?.customSoundDataUri ? "Custom sound loaded" : "");
    const soundValue = form.watch('sound');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUri = event.target?.result as string;
                form.setValue('customSoundDataUri', dataUri);
                setFileName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinished)} className="space-y-4">
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>{t.alarmDescription}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="time" render={({ field }) => (
            <FormItem><FormLabel>{t.time}</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="sound" render={({ field }) => (
            <FormItem><FormLabel>{t.alarmSound}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder={t.selectAlarmSound} /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="classic">{t.classic}</SelectItem>
                  <SelectItem value="digital">{t.digital}</SelectItem>
                  <SelectItem value="chime">{t.chime}</SelectItem>
                  <SelectItem value="custom">{t.customSound}</SelectItem>
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          {soundValue === "custom" && (
            <FormItem>
              <FormLabel>{t.customSound}</FormLabel>
              <FormControl>
                  <div className="relative">
                      <Input
                          type="file"
                          id="customSound"
                          accept="audio/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                       <Button asChild variant="outline" className="w-full">
                          <div>
                              <Upload className="mr-2 h-4 w-4" />
                              <span>{fileName || t.uploadSound}</span>
                          </div>
                      </Button>
                  </div>
              </FormControl>
              <FormMessage />
            </FormItem>
           )}
          <DialogFooter><Button type="submit">{alarm ? "Update Alarm" : t.setAlarm}</Button></DialogFooter>
        </form>
      </Form>
    );
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="flex items-center space-x-4 p-3 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10">
      <TooltipProvider><Tooltip><TooltipTrigger>
        <Checkbox id={task.id} checked={task.completed} onCheckedChange={(checked) => handleTaskComplete(task.id, !!checked)} />
      </TooltipTrigger><TooltipContent><p>{task.completed ? "Mark as active" : "Mark as completed"}</p></TooltipContent></Tooltip></TooltipProvider>
      <div className="flex-1">
        <label htmlFor={task.id} className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.name}</label>
        <div className="text-sm text-muted-foreground flex items-center flex-wrap gap-x-2 gap-y-1">
          <span>{format(parseISO(task.deadline), "PPp")}</span>
          <Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'secondary' : 'outline'}>{task.priority}</Badge>
          {task.reasoning && (
             <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5"><Info className="h-3 w-3"/></Button>
                </TooltipTrigger>
                <TooltipContent><p>{task.reasoning}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
       <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => openEditTaskDialog(task)}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
            <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
       </div>
    </div>
  );
  
  const AlarmItem = ({ alarm }: { alarm: Alarm }) => (
     <div key={alarm.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 dark:bg-background/20">
      <div>
        <p className="font-medium">{alarm.description}</p>
        <p className="text-sm text-muted-foreground">{alarm.time}</p>
      </div>
      <div className="flex items-center">
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Music className="h-4 w-4 text-muted-foreground mr-2" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{alarm.sound === 'custom' ? "Custom Sound" : alarm.sound}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Button variant="ghost" size="icon" onClick={() => openEditAlarmDialog(alarm)}>
          <Edit className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => deleteAlarm(alarm.id)}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  )

  if (!isMounted) {
    return <div className="min-h-screen w-full bg-background flex items-center justify-center"><Logo className="h-16 w-16 text-primary animate-pulse" /></div>;
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold font-headline">{t.appName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isTaskDialogOpen} onOpenChange={(open) => { setIsTaskDialogOpen(open); if(!open) setEditingTask(null);}}>
              <DialogTrigger asChild><Button className="shadow-lg"><Plus className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">{t.addTask}</span></Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{editingTask ? "Edit Task" : t.addNewTask}</DialogTitle></DialogHeader><TaskForm onFinished={handleTaskFormSubmit} task={editingTask} /></DialogContent>
            </Dialog>
            <Dialog open={isAlarmDialogOpen} onOpenChange={(open) => { setIsAlarmDialogOpen(open); if(!open) setEditingAlarm(null);}}>
              <DialogTrigger asChild><Button variant="secondary" className="shadow-lg"><Bell className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">{t.addAlarm}</span></Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{editingAlarm ? "Edit Alarm" : t.setNewAlarm}</DialogTitle></DialogHeader><AlarmForm onFinished={handleAlarmFormSubmit} alarm={editingAlarm}/></DialogContent>
            </Dialog>

             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="shadow-lg">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{t.settings}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 space-y-4">
                    {installPrompt && (
                        <Button onClick={handleInstallClick} className="w-full"><Download className="mr-2" /> {t.addToHome}</Button>
                    )}
                    {notificationPermission === 'default' && (
                        <Button onClick={requestNotificationPermission} variant="outline" className="w-full">Enable Notifications</Button>
                    )}
                    <div>
                        <Label htmlFor="language-select">{t.language}</Label>
                        <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                            <SelectTrigger id="language-select" className="w-full mt-1">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="hinglish">Hinglish</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>{t.themeColor}</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {themeColors.map((color) => (
                            <Button
                                key={color.name}
                                variant={theme === color.name ? "default" : "outline"}
                                size="icon"
                                className="rounded-full h-8 w-8"
                                onClick={() => setTheme(color.name)}
                                style={{ backgroundColor: `hsl(${color.value})` }}
                            >
                                {theme === color.name && <Check className="h-4 w-4 text-primary-foreground" />}
                                <span className="sr-only">{color.name}</span>
                            </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dark-mode-switch" className="flex items-center gap-2">
                         {themeMode === 'dark' ? <Moon/> : <Sun />}
                         <span>{t.darkMode}</span>
                      </Label>
                      <Switch 
                        id="dark-mode-switch"
                        checked={themeMode === 'dark'}
                        onCheckedChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
                      />
                    </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="themed-card">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <CardTitle>{t.dailyTimeline}</CardTitle>
                      <CardDescription>{t.todayTasksDescription}</CardDescription>
                    </div>
                    <Button variant="secondary" onClick={handlePrioritize} disabled={isLoading} className="w-full sm:w-auto shadow-lg">
                      <CloudLightning className="mr-2 h-4 w-4" />{isLoading ? t.prioritizing : t.prioritizeWithAI}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="active">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="active">{t.active} ({todayTasks.length})</TabsTrigger>
                      <TabsTrigger value="completed">{t.completed} ({completedTasksToday.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active" className="mt-4 space-y-2">
                      {todayTasks.length > 0 ? todayTasks.map(task => <TaskItem key={task.id} task={task} />) : <p className="text-muted-foreground p-4 text-center">{t.noTasksForToday}</p>}
                    </TabsContent>
                    <TabsContent value="completed" className="mt-4 space-y-2">
                      {completedTasksToday.length > 0 ? completedTasksToday.map(task => <TaskItem key={task.id} task={task} />) : <p className="text-muted-foreground p-4 text-center">{t.noCompletedTasks}</p>}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="themed-card">
                <CardHeader>
                  <CardTitle>{t.alarms}</CardTitle>
                  <CardDescription>{t.upcomingAlarms}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alarms.length > 0 ? alarms.map(alarm => <AlarmItem key={alarm.id} alarm={alarm}/>) : <p className="text-muted-foreground text-center p-4">{t.noAlarmsSet}</p>}
                </CardContent>
              </Card>
            </div>
        </div>
      </main>
      
      <AlertDialog open={!!activeAlarm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.alarmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {activeAlarm?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <Button variant="outline" onClick={() => { stopAlarmSound(); setActiveAlarm(null); }}>{t.dismiss}</Button>
             <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={() => handleSnooze(5)} disabled={isLoading}>{t.snooze} 5 min</Button>
                <Button onClick={() => handleSnooze(10)} disabled={isLoading}>{t.snooze} 10 min</Button>
                <Button onClick={() => handleSnooze(15)} disabled={isLoading}>{t.snooze} 15 min</Button>
             </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
