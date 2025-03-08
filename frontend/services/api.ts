const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export const getTasks = async (): Promise<Task[]> => {
  const res = await fetch(`${API_URL}/tasks`);
  if (!res.ok) throw new Error("Error fetching tasks");
  return await res.json();
};

export const createTask = async (task: Omit<Task, "id">): Promise<Task> => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Error creating task");
  return await res.json();
};

export const updateTask = async (id: number, task: Task): Promise<Task> => {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Error updating task");
    return await res.json();
  };
  
  
  export const deleteTask = async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error deleting task");
  };
  