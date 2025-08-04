export type Priority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  name: string;
  description?: string;
  deadline: string; // ISO string
  priority: Priority;
  completed: boolean;
  completedAt?: string; // ISO string
  priorityScore?: number;
  reasoning?: string;
}

export type AlarmSound = "classic" | "digital" | "chime" | "custom";

export interface Alarm {
  id: string;
  description: string;
  time: string; // HH:mm
  sound: AlarmSound;
  customSoundDataUri?: string;
}

export type Language = "english" | "hinglish";

export type ThemeColor = "default" | "stone" | "red" | "green" | "blue";
