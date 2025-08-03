
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isToday, parseISO } from "date-fns";
import {
  Bell,
  Check,
  CloudLightning,
  Plus,
  Info,
  Settings,
  Palette,
  Music,
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
import { translations } from "@/lib/translations";
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

const taskSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  deadline: z.date(),
  priority: z.enum(["Low", "Medium", "High"]),
});

const alarmSchema = z.object({
  description: z.string().min(1, "Description is required"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  sound: z.enum(["classic", "digital", "chime"]),
});

const themeColors: { name: ThemeColor; value: string }[] = [
    { name: "default", value: "216 44% 66%" },
    { name: "stone", value: "25 95% 53%" },
    { name: "red", value: "0 72% 51%" },
    { name: "green", value: "142 76% 36%" },
    { name: "blue", value: "221 83% 53%" },
];

export default function Home() {
  const [language, setLanguage] = useLocalStorage<Language>("language", "english");
  const [theme, setTheme] = useLocalStorage<ThemeColor>("theme", "default");
  const t = translations[language];

  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);
  const [alarms, setAlarms] = useLocalStorage<Alarm[]>("alarms", []);
  
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isAlarmDialogOpen, setIsAlarmDialogOpen] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => (a.priorityScore || 0) - (b.priorityScore || 0) || new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks]);
  
  const activeTasks = sortedTasks.filter((task) => !task.completed);
  const completedTasks = sortedTasks.filter((task) => task.completed);
  const todayTasks = activeTasks.filter(task => isToday(parseISO(task.deadline)));

  useEffect(() => {
    if (isMounted) {
      document.body.classList.remove(...themeColors.map(c => `theme-${c.name}`));
      document.body.classList.add(`theme-${theme}`);
      const selectedColor = themeColors.find(c => c.name === theme)?.value;
      if (selectedColor) {
        document.documentElement.style.setProperty('--primary', selectedColor);
      }
    }
  }, [theme, isMounted]);

  const handleTaskFormSubmit = (values: z.infer<typeof taskSchema>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...values,
      deadline: values.deadline.toISOString(),
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setIsTaskDialogOpen(false);
    toast({
        title: t.toastTaskCreated,
        description: newTask.name,
      });
  };

  const handleAlarmFormSubmit = (values: z.infer<typeof alarmSchema>) => {
    const newAlarm: Alarm = { id: Date.now().toString(), ...values };
    setAlarms([...alarms, newAlarm]);
    setIsAlarmDialogOpen(false);
    toast({
        title: t.toastAlarmSet,
        description: `${newAlarm.description} at ${newAlarm.time}`,
    });
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed } : task
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
            variant: 'destructive'
          });
        }
      }
    }
  };

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

  const handleSnooze = async () => {
    if(!activeAlarm) return;
    setIsLoading(true);
    try {
      const res = await sarcasticAlarmSnooze({ alarmDescription: `${activeAlarm.description} (in ${language})`});
      const audio = new Audio(res.audio);
      audio.play();
    } catch (error) {
       console.error("Snooze AI error:", error);
       toast({ title: t.errorAITitle, description: t.errorAIDescription, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setActiveAlarm(null);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const dueAlarm = alarms.find(alarm => alarm.time === currentTime);
      if(dueAlarm) {
        // Here you would play the alarm sound `dueAlarm.sound`
        // For this prototype, we'll just log it.
        console.log(`Playing alarm sound: ${dueAlarm.sound}`);
        setActiveAlarm(dueAlarm);
        setAlarms(alarms.filter(a => a.id !== dueAlarm.id));
      }
    }, 1000 * 30); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [alarms, setAlarms]);
  
  const TaskForm = ({ onFinished }: { onFinished: (values: z.infer<typeof taskSchema>) => void }) => {
    const form = useForm<z.infer<typeof taskSchema>>({
      resolver: zodResolver(taskSchema),
      defaultValues: { name: "", description: "", priority: "Medium", deadline: new Date() },
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
          <FormField control={form.control} name="deadline" render={({ field }) => (
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
          <DialogFooter><Button type="submit">{t.addTask}</Button></DialogFooter>
        </form>
      </Form>
    );
  };

  const AlarmForm = ({ onFinished }: { onFinished: (values: z.infer<typeof alarmSchema>) => void }) => {
    const form = useForm<z.infer<typeof alarmSchema>>({
      resolver: zodResolver(alarmSchema),
      defaultValues: { description: "", time: "", sound: "classic"},
    });
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
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <DialogFooter><Button type="submit">{t.setAlarm}</Button></DialogFooter>
        </form>
      </Form>
    );
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="flex items-center space-x-4 p-3 rounded-lg transition-colors hover:bg-accent/50">
      <Checkbox id={task.id} checked={task.completed} onCheckedChange={(checked) => handleTaskComplete(task.id, !!checked)} />
      <div className="flex-1">
        <label htmlFor={task.id} className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>{task.name}</label>
        <div className="text-sm text-muted-foreground flex items-center space-x-2">
          <span>{format(parseISO(task.deadline), "PP")}</span>
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
  );

  if (!isMounted) {
    return <div className="min-h-screen w-full bg-background flex items-center justify-center"><Logo className="h-16 w-16 text-primary animate-pulse" /></div>;
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline">{t.appName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> <span>{t.addTask}</span></Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{t.addNewTask}</DialogTitle></DialogHeader><TaskForm onFinished={handleTaskFormSubmit} /></DialogContent>
            </Dialog>
            <Dialog open={isAlarmDialogOpen} onOpenChange={setIsAlarmDialogOpen}>
              <DialogTrigger asChild><Button variant="secondary"><Bell className="mr-2 h-4 w-4" /> <span>{t.addAlarm}</span></Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{t.setNewAlarm}</DialogTitle></DialogHeader><AlarmForm onFinished={handleAlarmFormSubmit} /></DialogContent>
            </Dialog>

             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{t.settings}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 space-y-4">
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
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-primary-foreground">{t.dailyTimeline}</CardTitle>
                      <CardDescription className="text-primary-foreground/80">{t.todayTasksDescription}</CardDescription>
                    </div>
                    <Button variant="secondary" onClick={handlePrioritize} disabled={isLoading} className="w-full sm:w-auto">
                      <CloudLightning className="mr-2 h-4 w-4" />{isLoading ? t.prioritizing : t.prioritizeWithAI}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="active">
                    <TabsList>
                      <TabsTrigger value="active">{t.active} ({todayTasks.length})</TabsTrigger>
                      <TabsTrigger value="completed">{t.completed} ({completedTasks.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active" className="mt-4 space-y-2">
                      {todayTasks.length > 0 ? todayTasks.map(task => <TaskItem key={task.id} task={task} />) : <p className="text-muted-foreground p-4 text-center">{t.noTasksForToday}</p>}
                    </TabsContent>
                    <TabsContent value="completed" className="mt-4 space-y-2">
                      {completedTasks.length > 0 ? completedTasks.map(task => <TaskItem key={task.id} task={task} />) : <p className="text-muted-foreground p-4 text-center">{t.noCompletedTasks}</p>}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                  <CardTitle className="text-primary-foreground">{t.alarms}</CardTitle>
                  <CardDescription className="text-primary-foreground/80">{t.upcomingAlarms}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {alarms.length > 0 ? alarms.map(alarm => (
                    <div key={alarm.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-medium">{alarm.description}</p>
                        <p className="text-sm text-muted-foreground">{alarm.time}</p>
                      </div>
                      <div className="flex items-center">
                        <Music className="h-4 w-4 text-muted-foreground mr-2" />
                        <Button variant="ghost" size="icon" onClick={() => setAlarms(alarms.filter(a => a.id !== alarm.id))}>
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                      </div>
                    </div>
                  )) : <p className="text-muted-foreground text-center">{t.noAlarmsSet}</p>}
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
            <AlertDialogCancel onClick={() => setActiveAlarm(null)}>{t.dismiss}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSnooze} disabled={isLoading}>{isLoading ? t.snoozing : t.snooze}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
