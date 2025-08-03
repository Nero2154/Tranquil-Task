export type Priority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  name: string;
  description?: string;
  deadline: string; // ISO string
  priority: Priority;
  completed: boolean;
  priorityScore?: number;
  reasoning?: string;
}

export interface Alarm {
  id: string;
  description: string;
  time: string; // HH:mm
}

export type Language = "english" | "hinglish";
