
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
  ListTodo,
  AlertCircle,
  MicOff,
  Clock,
  Mail,
  PlayCircle,
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
  DialogDescription,
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
  AlertDialogDescription as AlertDialogDescriptionComponent,
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
import Image from 'next/image';

const taskSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  deadlineDate: z.date(),
  deadlineTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  priority: z.enum(["Low", "Medium", "High"]),
  duration: z.string().optional(),
});

const alarmSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  sound: z.enum(["classic", "digital", "chime", "custom"]),
  customSoundDataUri: z.string().optional(),
});

const themeColors: { name: ThemeColor; value: string; foreground: string }[] = [
    { name: "default", value: "262 83% 72%", foreground: "210 40% 98%" }, // Indigo
    { name: "stone", value: "34 97% 64%", foreground: "24 9.8% 10%" }, // Orange
    { name: "green", value: "142 71% 45%", foreground: "142 71% 95%" }, // Green
    { name: "red", value: "0 72% 51%", foreground: "0 72% 95%" }, // Red
    { name: "blue", value: "217 91% 60%", foreground: "217 91% 95%" }, // Blue
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
  const snoozeAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isMounted, setIsMounted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [isJokePlaying, setIsJokePlaying] = useState(false);


  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      if (!audioRef.current) audioRef.current = new Audio();
      if (!snoozeAudioRef.current) {
        snoozeAudioRef.current = new Audio();
        snoozeAudioRef.current.onended = () => setIsJokePlaying(false);
      }
      
      if ("Notification" in window) {
        setNotificationPermission(Notification.permission);
      }

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    }

    return () => {
      if (snoozeAudioRef.current) {
        snoozeAudioRef.current.onended = null;
      }
    }
  }, []);
  
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
        if (Notification.permission === 'granted') {
             toast({ title: "Notifications are already enabled!" });
             return;
        }
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        toast({ title: "Notifications enabled!" });
      } else {
        toast({ title: "Notifications not enabled.", description: "You might miss your alarms!", variant: "destructive" });
      }
    }
  };

  const scheduleNotification = (task: Task) => {
    if (notificationPermission !== "granted") return;
    const deadline = parseISO(task.deadline);
    const notificationTime = addMinutes(deadline, -5).getTime();
    const now = new Date().getTime();
    
    if (notificationTime > now) {
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(swRegistration => {
            swRegistration.showNotification("Task Reminder", {
                body: `Your task "${task.name}" is due in 5 minutes!`,
                icon: '/tranquil_icon.png',
            });
        });
      }
    }
  };

  const scheduleAlarmNotification = (alarm: Alarm) => {
      if (notificationPermission !== 'granted') {
          requestNotificationPermission();
          return;
      }

      const [hours, minutes] = alarm.time.split(':').map(Number);
      let alarmTime = setMinutes(setHours(new Date(), hours), minutes);

      if (isBefore(alarmTime, new Date())) {
          alarmTime = addMinutes(alarmTime, 24 * 60); // Schedule for next day if time has passed
      }
      
      const soundSrc = alarm.sound === 'custom' && alarm.customSoundDataUri
          ? alarm.customSoundDataUri
          : presetSounds[alarm.sound as Exclude<AlarmSound, 'custom'>];

      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification(t.alarmTitle, {
                  tag: alarm.id,
                  body: alarm.description,
                  icon: '/tranquil_icon.png',
                  timestamp: alarmTime.getTime(),
                  data: {
                      soundSrc,
                      alarmId: alarm.id
                  },
                  actions: [
                      { action: 'snooze', title: 'Snooze 5 min' },
                      { action: 'dismiss', title: 'Dismiss' },
                  ],
                  requireInteraction: true,
              });
              toast({
                  title: t.toastAlarmSet,
                  description: `${alarm.description} at ${alarm.time}`,
              });
          });
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
    const now = new Date();
    const startOfToday = startOfDay(now);
    const relevantTasks = tasks.filter(task => {
        if (!task.completed) return true; 
        if (!task.completedAt) return true; 
        return parseISO(task.completedAt) >= startOfToday; 
    });
    if(relevantTasks.length !== tasks.length) {
        setTasks(relevantTasks);
    }
  }, [tasks, setTasks]); 


  useEffect(() => {
    if (isMounted) {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(themeMode);

      const selectedColor = themeColors.find(c => c.name === theme);
      if (selectedColor) {
        root.style.setProperty('--primary', selectedColor.value);
        root.style.setProperty('--primary-foreground', selectedColor.foreground);
        root.style.setProperty('--ring', selectedColor.value);
      }
    }
  }, [theme, themeMode, isMounted]);

  const handleTaskFormSubmit = (values: z.infer<typeof taskSchema>) => {
    const [hours, minutes] = values.deadlineTime.split(':').map(Number);
    const deadline = setMinutes(setHours(values.deadlineDate, hours), minutes);

    if (editingTask) {
        const updatedTask: Task = { 
            ...editingTask, 
            ...values, 
            deadline: deadline.toISOString(),
            duration: values.duration ? parseInt(values.duration, 10) : undefined,
        };
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
          duration: values.duration ? parseInt(values.duration, 10) : undefined,
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
        const updatedAlarm: Alarm = {
            ...editingAlarm,
            ...values,
        };
        const newAlarms = alarms.map(a => a.id === editingAlarm.id ? updatedAlarm : a);
        setAlarms(newAlarms);
        toast({ title: "Alarm updated!" });
        scheduleAlarmNotification(updatedAlarm);
    } else {
        const newAlarm: Alarm = { id: Date.now().toString(), ...values };
        setAlarms([...alarms, newAlarm]);
        scheduleAlarmNotification(newAlarm);
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

  const deleteAlarm = async (alarmId: string) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        const registration = await navigator.serviceWorker.ready;
        const notifications = await registration.getNotifications({ tag: alarmId });
        notifications.forEach(notification => notification.close());
    }
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
      const prioritized = await prioritizeTasks(todayTasks.map(t => ({
          ...t, 
          description: `${t.description || ''} (in ${language})`,
          duration: t.duration
        })));
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
      toast({ title: t.errorAITitle, description: t.errorAIDescription, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
    const playAudio = useCallback((ref: React.RefObject<HTMLAudioElement>, src: string, loop = false) => {
        const audio = ref.current;
        if (!audio) return;
        audio.pause();
        audio.src = src;
        audio.loop = loop;
        audio.load();
        const playPromise = audio.play();
        if (playPromise) {
            playPromise.catch(() => {});
        }
    }, []);

    const stopAudio = useCallback((ref: React.RefObject<HTMLAudioElement>) => {
        const audio = ref.current;
        if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
            if (ref === snoozeAudioRef) {
                setIsJokePlaying(false);
            }
        }
    }, []);

    const playAlarmSound = useCallback((alarm: Alarm) => {
        let soundSrc = '';
        if (alarm.sound === 'custom' && alarm.customSoundDataUri) {
            soundSrc = alarm.customSoundDataUri;
        } else if (alarm.sound !== 'custom') {
            soundSrc = presetSounds[alarm.sound as Exclude<AlarmSound, 'custom'>];
        }
        if (soundSrc) {
            playAudio(audioRef, soundSrc, true);
        }
    }, [playAudio]);


  const handleSnooze = (minutes: number) => {
    if (!activeAlarm) return;
    
    const originalAlarmDescription = activeAlarm.description;
    
    stopAudio(audioRef);
    setActiveAlarm(null);
  
    setTimeout(() => {
        const snoozedTime = addMinutes(new Date(), minutes);
        const newAlarmTime = format(snoozedTime, 'HH:mm');

        const snoozedAlarm: Alarm = {
            ...activeAlarm,
            id: Date.now().toString(),
            time: newAlarmTime,
            description: `${originalAlarmDescription} (Snoozed)`
        };
        
        setAlarms(current => [...current, snoozedAlarm]);
        scheduleAlarmNotification(snoozedAlarm);

        toast({
            title: `Alarm Snoozed for ${minutes} minutes`,
            description: `Will ring again at ${newAlarmTime}`
        });
    }, 200);

    sarcasticAlarmSnooze({ alarmDescription: `${originalAlarmDescription} (in ${language})` })
    .then(res => {
        if (res.audio) {
            setTimeout(() => {
                playAudio(snoozeAudioRef, res.audio, false);
                setIsJokePlaying(true);
            }, 500); // Delay to ensure dialog is gone
        }
    })
    .catch(() => {
        toast({ title: "Error", description: "Failed to play snooze joke", variant: "destructive" });
    });
  };
  
  const handleDismiss = () => {
    stopAudio(audioRef);
    setActiveAlarm(null);
  };


  useEffect(() => {
    const interval = setInterval(() => {
      if (activeAlarm) return;

      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const dueAlarmIndex = alarms.findIndex(alarm => alarm.time === currentTime);
      
      if(dueAlarmIndex > -1) {
        const dueAlarm = alarms[dueAlarmIndex];
        
        const updatedAlarms = alarms.filter((_, index) => index !== dueAlarmIndex);
        setAlarms(updatedAlarms);

        setActiveAlarm(dueAlarm);
        playAlarmSound(dueAlarm);
      }
    }, 1000);
    
    return () => {
        clearInterval(interval);
    };
  }, [alarms, setAlarms, activeAlarm, playAlarmSound]);
  
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
        duration: task?.duration?.toString() || "",
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
          <div className="grid grid-cols-2 gap-4">
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
            <FormField control={form.control} name="duration" render={({ field }) => (
                <FormItem><FormLabel>{t.duration}</FormLabel><FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
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
    
    const playPreview = () => {
        if (soundValue && soundValue !== 'custom') {
            const soundSrc = presetSounds[soundValue as Exclude<AlarmSound, 'custom'>];
            playAudio(audioRef, soundSrc, false);
        }
    }

    useEffect(() => {
        return () => {
            stopAudio(audioRef);
        };
    }, [stopAudio]);

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinished)} className="space-y-4">
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>{t.alarmDescription}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="time" render={({ field }) => (
            <FormItem><FormLabel>{t.time}</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
           <div className="flex items-end gap-2">
            <FormField control={form.control} name="sound" render={({ field }) => (
              <FormItem className="flex-grow"><FormLabel>{t.alarmSound}</FormLabel>
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
            <Button type="button" variant="outline" size="icon" onClick={playPreview} disabled={soundValue === 'custom'}>
                <PlayCircle className="h-5 w-5" />
            </Button>
          </div>
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
    <div className="flex items-start space-x-4 p-4 rounded-lg bg-background hover:bg-muted/80 transition-colors">
      <div className="flex-grow flex items-start space-x-4">
        <TooltipProvider><Tooltip><TooltipTrigger>
          <Checkbox id={task.id} checked={task.completed} onCheckedChange={(checked) => handleTaskComplete(task.id, !!checked)} className="mt-1" />
        </TooltipTrigger><TooltipContent><p>{task.completed ? "Mark as active" : "Mark as completed"}</p></TooltipContent></Tooltip></TooltipProvider>
        
        <div className="flex-1">
          <label htmlFor={task.id} className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.name}</label>
          <div className="text-sm text-muted-foreground flex items-center flex-wrap gap-x-4 gap-y-1 mt-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(parseISO(task.deadline), "p")}</span>
            </div>
            {task.duration && (
              <div className="flex items-center gap-1">
                  <span>({task.duration} min)</span>
              </div>
            )}
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
      </div>
      
      <div className="flex items-center flex-shrink-0">
          <div className="flex flex-col">
              <Button variant="ghost" size="icon" onClick={() => openEditTaskDialog(task)}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
              <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
          </div>
       </div>
    </div>
  );
  
  const AlarmItem = ({ alarm }: { alarm: Alarm }) => (
     <div key={alarm.id} className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-muted/80 transition-colors">
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
            {isJokePlaying && (
                <Button variant="destructive" onClick={() => stopAudio(snoozeAudioRef)} className="rounded-full shadow-md">
                    <MicOff className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">Stop Joke</span>
                </Button>
            )}
            <Dialog open={isTaskDialogOpen} onOpenChange={(open) => { setIsTaskDialogOpen(open); if(!open) setEditingTask(null);}}>
              <DialogTrigger asChild><Button className="rounded-full shadow-md"><Plus className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">{t.addTask}</span></Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{editingTask ? "Edit Task" : t.addNewTask}</DialogTitle></DialogHeader><TaskForm onFinished={handleTaskFormSubmit} task={editingTask} /></DialogContent>
            </Dialog>
            <Dialog open={isAlarmDialogOpen} onOpenChange={(open) => { setIsAlarmDialogOpen(open); if(!open) setEditingAlarm(null);}}>
              <DialogTrigger asChild><Button variant="secondary" className="rounded-full shadow-md"><Bell className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">{t.addAlarm}</span></Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{editingAlarm ? "Edit Alarm" : t.setNewAlarm}</DialogTitle></DialogHeader><AlarmForm onFinished={handleAlarmFormSubmit} alarm={editingAlarm}/></DialogContent>
            </Dialog>

             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full shadow-md">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{t.settings}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 space-y-2">
                    {notificationPermission !== 'granted' && (
                        <Button onClick={requestNotificationPermission} variant="outline" className="w-full">Enable Notifications</Button>
                    )}

                    <div className="pt-2">
                        <Label>{t.suggestions}</Label>
                        <div className="text-sm text-muted-foreground p-2 rounded-md bg-muted/50 flex items-start gap-2">
                            <Mail className="h-4 w-4 mt-1 shrink-0" />
                            <a href="mailto:tranquilsuggestion@zohomail.in" className="underline hover:text-primary">tranquilsuggestion@zohomail.in</a>
                        </div>
                    </div>


                    <div className="pt-2">
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
                                variant={"outline"}
                                size="icon"
                                className={cn(
                                  "rounded-full h-8 w-8 border-2",
                                  theme === color.name ? "border-ring" : "border-transparent"
                                )}
                                onClick={() => setTheme(color.name)}
                                style={{ backgroundColor: `hsl(${color.value})` }}
                            >
                                {theme === color.name && <Check className="h-4 w-4" style={{color: `hsl(${color.foreground})`}} />}
                                <span className="sr-only">{color.name}</span>
                            </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
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
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <Card className="shadow-lg rounded-3xl themed-card">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <ListTodo className="h-6 w-6"/>
                            <div>
                                <CardTitle className="font-bold text-2xl">{t.dailyTimeline}</CardTitle>
                                <CardDescription>{t.todayTasksDescription}</CardDescription>
                            </div>
                        </div>
                        <Button variant="secondary" onClick={handlePrioritize} disabled={isLoading} className="w-full sm:w-auto rounded-full shadow-md">
                            <CloudLightning className="mr-2 h-4 w-4" />{isLoading ? t.prioritizing : t.prioritizeWithAI}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <Tabs defaultValue="active">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="active">{t.active} ({todayTasks.length})</TabsTrigger>
                      <TabsTrigger value="completed">{t.completed} ({completedTasksToday.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active" className="mt-4 space-y-2">
                      {todayTasks.length > 0 ? todayTasks.map(task => <TaskItem key={task.id} task={task} />) : <p className="text-muted-foreground p-8 text-center">{t.noTasksForToday}</p>}
                    </TabsContent>
                    <TabsContent value="completed" className="mt-4 space-y-2">
                      {completedTasksToday.length > 0 ? completedTasksToday.map(task => <TaskItem key={task.id} task={task} />) : <p className="text-muted-foreground p-8 text-center">{t.noCompletedTasks}</p>}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-8">
              <Card className="shadow-lg rounded-3xl themed-card">
                <CardHeader className="flex flex-row items-center gap-3">
                  <AlertCircle className="h-6 w-6"/>
                  <div>
                    <CardTitle className="font-bold text-2xl">{t.alarms}</CardTitle>
                    <CardDescription>{t.upcomingAlarms}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {alarms.length > 0 ? alarms.map(alarm => <AlarmItem key={alarm.id} alarm={alarm}/>) : <p className="text-muted-foreground text-center p-8">{t.noAlarmsSet}</p>}
                </CardContent>
              </Card>
            </div>
        </div>
      </main>
      
      <AlertDialog open={!!activeAlarm} onOpenChange={(open) => !open && handleDismiss()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.alarmTitle}</AlertDialogTitle>
            <AlertDialogDescriptionComponent>
              {activeAlarm?.description}
            </AlertDialogDescriptionComponent>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
             <Button variant="outline" onClick={handleDismiss}>{t.dismiss}</Button>
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
