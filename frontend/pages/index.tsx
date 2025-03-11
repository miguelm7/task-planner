import { useState, useEffect } from "react"
import { Plus, Check, X, Edit, Trash2, Calendar, Search, Filter, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all")

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

  // Filter tasks based on active filter and search query
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeFilter === "active") return !task.completed && matchesSearch
    if (activeFilter === "completed") return task.completed && matchesSearch
    return matchesSearch
  })

  // Calculate task statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const activeTasks = totalTasks - completedTasks
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-background to-secondary/30 text-foreground font-sans p-4">
      <Card className="w-full max-w-2xl p-6 shadow-lg rounded-xl border border-border/50 backdrop-blur-sm bg-card/95">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <Calendar className="h-7 w-7 text-primary" />
            <span>Task Planner</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              <Label htmlFor="dark-mode" className="text-sm">
                {isDarkMode ? "Dark" : "Light"}
              </Label>
            </div>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                className="pl-9 bg-background/80 border-border/50 focus-visible:ring-primary"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-border/50 hover:bg-primary/10 hover:text-primary"
              title="Filter tasks"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-border/50 hover:bg-primary/10 hover:text-primary"
              title="Sort tasks"
            >
              <SortAsc className="h-4 w-4" />
            </Button>
          </div>

          {showInput ? (
            <div className="flex gap-2 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <Input
                type="text"
                className="flex-grow p-3 border-border/50 bg-background/80 text-foreground placeholder-muted-foreground focus-visible:ring-primary"
                placeholder="New task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                autoFocus
              />
              <Button
                className="p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                onClick={addTask}
                aria-label="Add task"
              >
                <Check className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="p-3 rounded-lg border-border/50 hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={() => setShowInput(false)}
                aria-label="Cancel"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button
              className="flex items-center justify-center gap-2 w-full p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors border border-primary/20"
              onClick={() => setShowInput(true)}
            >
              <Plus className="h-5 w-5" />
              <span>Add Task</span>
            </Button>
          )}
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-background/80 text-foreground">
              Total: {totalTasks}
            </Badge>
            <Badge variant="outline" className="bg-background/80 text-primary">
              Active: {activeTasks}
            </Badge>
            <Badge variant="outline" className="bg-background/80 text-muted-foreground">
              Completed: {completedTasks}
            </Badge>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {completionPercentage}% Complete
          </Badge>
        </div>

        <Tabs
          defaultValue="all"
          className="mb-6"
          onValueChange={(value) => setActiveFilter(value as "all" | "active" | "completed")}
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-0">
            <TaskList
              tasks={filteredTasks}
              editingTaskId={editingTaskId}
              editedTaskTitle={editedTaskTitle}
              setEditedTaskTitle={setEditedTaskTitle}
              toggleComplete={toggleComplete}
              startEditing={startEditing}
              saveEdit={saveEdit}
              deleteTask={deleteTask}
            />
          </TabsContent>
          <TabsContent value="active" className="mt-0">
            <TaskList
              tasks={filteredTasks}
              editingTaskId={editingTaskId}
              editedTaskTitle={editedTaskTitle}
              setEditedTaskTitle={setEditedTaskTitle}
              toggleComplete={toggleComplete}
              startEditing={startEditing}
              saveEdit={saveEdit}
              deleteTask={deleteTask}
            />
          </TabsContent>
          <TabsContent value="completed" className="mt-0">
            <TaskList
              tasks={filteredTasks}
              editingTaskId={editingTaskId}
              editedTaskTitle={editedTaskTitle}
              setEditedTaskTitle={setEditedTaskTitle}
              toggleComplete={toggleComplete}
              startEditing={startEditing}
              saveEdit={saveEdit}
              deleteTask={deleteTask}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

interface TaskListProps {
  tasks: Task[]
  editingTaskId: number | null
  editedTaskTitle: string
  setEditedTaskTitle: (title: string) => void
  toggleComplete: (id: number) => void
  startEditing: (task: Task) => void
  saveEdit: (id: number) => void
  deleteTask: (id: number) => void
}

function TaskList({
  tasks,
  editingTaskId,
  editedTaskTitle,
  setEditedTaskTitle,
  toggleComplete,
  startEditing,
  saveEdit,
  deleteTask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-border/50">
        <p>No tasks found. Add one to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md ${
            task.completed
              ? "bg-muted/30 border border-border/30"
              : "bg-card border border-border/50 hover:border-primary/30 hover:shadow-primary/5"
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            <button
              className={`flex-shrink-0 h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                task.completed
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground hover:border-primary"
              }`}
              onClick={() => toggleComplete(task.id)}
              aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.completed && <Check className="h-4 w-4" />}
            </button>

            {editingTaskId === task.id ? (
              <Input
                type="text"
                className="flex-1 p-2 border border-primary/30 rounded-lg bg-background text-foreground focus-visible:ring-primary"
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              onClick={() => startEditing(task)}
              aria-label="Edit task"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => deleteTask(task.id)}
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

