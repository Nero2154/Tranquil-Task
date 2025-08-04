import type { AlarmSound, Language } from "./types";

type Translation = {
  appName: string;
  addTask: string;
  addAlarm: string;
  addNewTask: string;
  setNewAlarm: string;
  taskName: string;
  description: string;
  deadline: string;
  pickDate: string;
  priority: string;
  selectPriority: string;
  low: string;
  medium: string;
  high:string;
  alarmDescription: string;
  time: string;
  setAlarm: string;
  dailyTimeline: string;
  todayTasksDescription: string;
  prioritizeWithAI: string;
  prioritizing: string;
  active: string;
  completed: string;
  noTasksForToday: string;
  noCompletedTasks: string;
  alarms: string;
  upcomingAlarms: string;
  noAlarmsSet: string;
  alarmTitle: string;
  dismiss: string;
  snooze: string;
  snoozing: string;
  toastTaskCreated: string;
  toastAlarmSet: string;
  toastTaskCompleted: string;
  toastNoTasks: string;
  toastNoTasksDescription: string;
  toastPrioritized: string;
  toastPrioritizedDescription: string;
  errorAITitle: string;
  errorAIDescription: string;
  settings: string;
  language: string;
  themeColor: string;
  alarmSound: string;
  selectAlarmSound: string;
  classic: string;
  digital: string;
  chime: string;
  darkMode: string;
  customSound: string;
  uploadSound: string;
  addToHome: string;
  suggestions: string;
  duration: string;
};

export const translations: Record<Language, Translation> = {
  english: {
    appName: "Tranquil Task",
    addTask: "Add Task",
    addAlarm: "Add Alarm",
    addNewTask: "Add a new task",
    setNewAlarm: "Set a new alarm",
    taskName: "Task Name",
    description: "Description",
    deadline: "Date",
    pickDate: "Pick a date",
    priority: "Priority",
    selectPriority: "Select a priority",
    low: "Low",
    medium: "Medium",
    high: "High",
    alarmDescription: "Alarm Description",
    time: "Time",
    setAlarm: "Set Alarm",
    dailyTimeline: "Daily Timeline",
    todayTasksDescription: "Here are your tasks for today.",
    prioritizeWithAI: "Prioritize with AI",
    prioritizing: "Prioritizing...",
    active: "Active",
    completed: "Completed",
    noTasksForToday: "No tasks for today. Enjoy your day!",
    noCompletedTasks: "No completed tasks yet.",
    alarms: "Alarms",
    upcomingAlarms: "Your upcoming alarms.",
    noAlarmsSet: "No alarms set.",
    alarmTitle: "Time to wake up!",
    dismiss: "Dismiss",
    snooze: "Snooze",
    snoozing: "Snoozing...",
    toastTaskCreated: "Task created!",
    toastAlarmSet: "Alarm set!",
    toastTaskCompleted: "Task Completed!",
    toastNoTasks: "No tasks to prioritize.",
    toastNoTasksDescription: "Add some tasks for today first.",
    toastPrioritized: "Tasks have been prioritized!",
    toastPrioritizedDescription: "Check the new order of your tasks.",
    errorAITitle: "AI Error",
    errorAIDescription: "The AI service is currently unavailable. Please try again later.",
    settings: "Settings",
    language: "Language",
    themeColor: "Theme Color",
    alarmSound: "Alarm Sound",
    selectAlarmSound: "Select a sound",
    classic: "Classic",
    digital: "Digital",
    chime: "Chime",
    darkMode: "Dark Mode",
    customSound: "Custom",
    uploadSound: "Upload a sound file",
    addToHome: "Add to Home Screen",
    suggestions: "For suggestions, please email:",
    duration: "Duration (minutes)",
  },
  hinglish: {
    appName: "Tranquil Task",
    addTask: "Task Jodo",
    addAlarm: "Alarm Lagao",
    addNewTask: "Naya task jodo",
    setNewAlarm: "Naya alarm lagao",
    taskName: "Task ka Naam",
    description: "Vivaran",
    deadline: "Aakhri Tareekh",
    pickDate: "Tareekh chuno",
    priority: "Prathmikta",
    selectPriority: "Prathmikta chuno",
    low: "Kam",
    medium: "Madhyam",
    high: "Adhik",
    alarmDescription: "Alarm ka Vivaran",
    time: "Samay",
    setAlarm: "Alarm Lagao",
    dailyTimeline: "Aaj ka Timeline",
    todayTasksDescription: "Yeh hain aapke aaj ke tasks.",
    prioritizeWithAI: "AI se prathmikta dein",
    prioritizing: "Prathmikta de rahe hain...",
    active: "Chalu",
    completed: "Poora Hua",
    noTasksForToday: "Aaj ke liye koi tasks nahi. Din ka anand lein!",
    noCompletedTasks: "Abhi tak koi task poora nahi hua.",
    alarms: "Alarms",
    upcomingAlarms: "Aapke aane wale alarms.",
    noAlarmsSet: "Koi alarm set nahi hai.",
    alarmTitle: "Uthne ka samay ho gaya!",
    dismiss: "Hatao",
    snooze: "Snooze",
    snoozing: "Snooze kar rahe hain...",
    toastTaskCreated: "Task ban gaya!",
    toastAlarmSet: "Alarm lag gaya!",
    toastTaskCompleted: "Task Poora Hua!",
    toastNoTasks: "Prathmikta ke liye koi tasks nahi.",
    toastNoTasksDescription: "Pehle aaj ke liye kuch tasks jodo.",
    toastPrioritized: "Tasks ko prathmikta di gayi hai!",
    toastPrioritizedDescription: "Apne tasks ka naya kram dekhein.",
    errorAITitle: "AI Error",
    errorAIDescription: "AI seva abhi uplabdh nahi hai. Kripya baad mein prayas karein.",
    settings: "Settings",
    language: "Bhasha",
    themeColor: "Theme ka Rang",
    alarmSound: "Alarm ki aawaz",
    selectAlarmSound: "Aawaz chuno",
    classic: "Classic",
    digital: "Digital",
    chime: "Chime",
    darkMode: "Dark Mode",
    customSound: "Apni aawaz",
    uploadSound: "Sound file upload karein",
    addToHome: "Home Screen pe Jodo",
    suggestions: "Sujhav ke liye, kripya email karein:",
    duration: "Avadhi (minutes)",
  },
};


// Base64 encoded WAV files for preset sounds
export const presetSounds: Record<Exclude<AlarmSound, 'custom'>, string> = {
    classic: "data:audio/wav;base64,UklGRlJ8AABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABRkYXRhQHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAzAEwAbgBvAHQAfAB+AIUAigCNAI4AkgCVAGAAUgA8ADoAPwBBAE4AZgBzAIMAjQCPAJEAlgCYAJoAnACcAJwAlgCSAI8AjACGAHwAfAB9AH8AgQCHAIgAigCMAIsAigCHAH8AfQB6AHgAdgB1AGkAYgBeAFoAVgBRAEkARgBDAEIAQABAAEAAPgA7ADoANwA0ADIAMwA2ADkAOwA/AEMARgBJAEwAUQBUAFYAVQBSAFEATgBLAEgARgBDAEEAPgA8ADgANgA0ADMANAA1ADcANAAvACsAJgAhABwAGgAYABYAFgAWABUAFQAVABYAFgAWABcAFwAXABcAFwAXABYAFQAVABUAFQAVABUAFQAVABUAFQAVABYAFgAWABcAFwAXABcAFwAXABcAFwAWABYAFQAVABUAFQAVABUAFQAWABUAFQAWABYAFgAWABcAFwAXABcAFwAXABcAFwAWABYAFgAVABYAFgAWABYAFgAWABYAFQAVABQAEwATABIAEgARABEADwAOAAsACgAJAAgABwAFAAMAAgABAAAAAAD//v/+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+///+-8AK/+9wL8/NvC+/zaQvv83cL7/OJ++/+FW/P/wXvy//F78v/xi/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8Xvy//F78v/xe/L/8/eP9P/4D+X/8G/pL+6vym/un9nP7c/aL+zv2h/tn9mv7g/bf/Ev6E/j4AHgE0AQMBFQEGAQoBDwEcAUMBlwEaAeoAlQHbAN0ArQCkAJ4AmgChAIQAgwCAAH8BfwB/AH8AfAB9AH0AfAB+AH4AgQB/AHwAgwCCAHwAewB3AHcAdgB2AHQAeAB6AH8AewB6AHkAeABxAGgAYwBfAF0AWgBWAFUAUQBQAEwASQBHAEUAQwBBAEIAQAA/AD4APQA8ADsAFAA2AC4AJQAgABoAGQAYABgAGAAZABoAGgAaABkAGQAYABcAFwAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFg-",
    digital: "data:audio/wav;base64,UklGRqIBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABRkYXRhgAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgIaGvr6+rq6urKyso6OjoaGhoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKC"
};
