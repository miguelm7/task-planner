"use client"

import { useState, useEffect } from "react"
import { Plus, Check, X, Edit, Trash2, Calendar } from "lucide-react"

interface Task {
  id: number
  title: string
  completed: boolean
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [showInput, setShowInput] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editedTaskTitle, setEditedTaskTitle] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check for user's preferred color scheme
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }

    fetch("http://localhost:8000/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error fetching tasks:", error))
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const addTask = () => {
    if (newTask.trim() === "") return

    fetch("http://localhost:8000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask, completed: false }),
    })
      .then((res) => res.json())
      .then((data) => setTasks([...tasks, data]))
      .catch((error) => console.error("Error adding task:", error))

    setNewTask("")
    setShowInput(false)
  }

  const toggleComplete = (id: number) => {
    const taskToUpdate = tasks.find((task) => task.id === id)
    if (!taskToUpdate) return

    fetch(`http://localhost:8000/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !taskToUpdate.completed }),
    })
      .then(() => {
        setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
      })
      .catch((error) => console.error("Error updating task:", error))
  }

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id)
    setEditedTaskTitle(task.title)
  }

  const saveEdit = (id: number) => {
    if (editedTaskTitle.trim() === "") {
      setEditingTaskId(null)
      return
    }

    fetch(`http://localhost:8000/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editedTaskTitle }),
    })
      .then(() => {
        setTasks(tasks.map((task) => (task.id === id ? { ...task, title: editedTaskTitle } : task)))
        setEditingTaskId(null)
      })
      .catch((error) => console.error("Error updating task:", error))
  }

  const deleteTask = (id: number) => {
    fetch(`http://localhost:8000/tasks/${id}`, { method: "DELETE" })
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== id))
      })
      .catch((error) => console.error("Error deleting task:", error))
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-background text-foreground font-sans">
      <div className="w-full max-w-xl p-6 bg-card shadow-lg rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            <span>Task Planner</span>
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        <div className="mb-6">
          {showInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-grow p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="New task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                autoFocus
              />
              <button
                className="p-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                onClick={addTask}
                aria-label="Add task"
              >
                <Check className="h-5 w-5" />
              </button>
              <button
                className="p-3 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
                onClick={() => setShowInput(false)}
                aria-label="Cancel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              className="flex items-center justify-center gap-2 w-full p-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors"
              onClick={() => setShowInput(true)}
            >
              <Plus className="h-5 w-5" />
              <span>Add Task</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks yet. Add one to get started!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    className={`flex-shrink-0 h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                      task.completed
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-gray-400 dark:border-gray-600"
                    }`}
                    onClick={() => toggleComplete(task.id)}
                    aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {task.completed && <Check className="h-4 w-4" />}
                  </button>

                  {editingTaskId === task.id ? (
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={editedTaskTitle}
                      onChange={(e) => setEditedTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                      onBlur={() => saveEdit(task.id)}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`text-base cursor-pointer flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}
                      onClick={() => startEditing(task)}
                    >
                      {task.title}
                    </span>
                  )}
                </div>

                <div className="flex gap-1 ml-2">
                  <button
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    onClick={() => startEditing(task)}
                    aria-label="Edit task"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

