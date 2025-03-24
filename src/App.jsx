import { useState, useEffect } from "react";
import DatePickerModal from "./components/DatePickerModal";

const theme = {
  colors: {
    background: "#0D0D0D",
    text: "#00FFFF", // Cyan neon
    primary: "#FF00FF", // Magenta neon
    secondary: "rgba(255, 0, 255, 0.2)", // Semi-transparent magenta
    accent: "#00FF00", // Green neon
    error: "#FF0000", // Red neon
    success: "#00FF99", // Mint neon
  },
  spacing: {
    small: "5px",
    medium: "10px",
    large: "20px",
  },
  borderRadius: {
    small: "3px",
    medium: "5px",
    large: "10px",
  },
  fontFamily: "'Courier New', monospace",
  boxShadow: "0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)", // Multi-color glow
};

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // State variables for modal visibility
  const [isStartTimeModalOpen, setIsStartTimeModalOpen] = useState(false);
  const [isEndTimeModalOpen, setIsEndTimeModalOpen] = useState(false);
  const [isDueDateModalOpen, setIsDueDateModalOpen] = useState(false);

  // Load todos on initial mount
  useEffect(() => {
    loadTodos();
  }, []);

  // Auto-save whenever todos or completedTodos change
  useEffect(() => {
    if (todos.length > 0 || completedTodos.length > 0) {
      saveTodos();
    }
  }, [todos, completedTodos]);

  const loadTodos = () => {
    try {
      // Try to load from localStorage first
      const savedData = localStorage.getItem('todos-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setTodos(parsedData.todos || []);
        setCompletedTodos(parsedData.completedTodos || []);
        console.log('Todos loaded from localStorage');
        return;
      }

      // If not in localStorage, try fetching from the server
      fetch("/todos.json")
        .then((res) => res.json())
        .then((data) => {
          setTodos(data.todos || []);
          setCompletedTodos(data.completedTodos || []);
          console.log('Todos loaded from server');
        })
        .catch((err) => {
          console.log('Failed to load todos from server:', err);
          setTodos([]);
          setCompletedTodos([]);
        });
    } catch (error) {
      console.error('Error loading todos:', error);
      setTodos([]);
      setCompletedTodos([]);
    }
  };

  const saveTodos = () => {
    try {
      // Save to localStorage for immediate persistence
      const data = { todos, completedTodos };
      localStorage.setItem('todos-data', JSON.stringify(data));
      console.log('Todos saved to localStorage');

      // You could also implement a server-side save here with fetch
      // This is a simulated server save (in a real app, you'd use fetch with POST/PUT)
      console.log('Todos would be saved to server here');
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const addTodo = () => {
    if (!input.trim()) return;
    const newTodo = {
      text: input,
      notes,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      dueDate: dueDate.toDateString(),
      id: Date.now()
    };
    setTodos([...todos, newTodo]);
    setInput("");
    setNotes("");
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const removeTodo = (index) => {
    const updatedTodos = [...todos];
    updatedTodos.splice(index, 1);
    setTodos(updatedTodos);
  };

  const clearTodos = () => {
    setTodos([]);
    setCompletedTodos([]);
    // Also clear localStorage when explicitly clearing todos
    localStorage.removeItem('todos-data');
  };

  const downloadTodos = () => {
    const json = JSON.stringify({ todos, completedTodos }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "todos.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const completeTodo = (index) => {
    const todoToComplete = todos[index];
    setCompletedTodos([...completedTodos, todoToComplete]);
    const updatedTodos = [...todos];
    updatedTodos.splice(index, 1);
    setTodos(updatedTodos);
  };

  const restoreTodo = (index) => {
    const todoToRestore = completedTodos[index];
    setTodos([...todos, todoToRestore]);
    const updatedCompletedTodos = [...completedTodos];
    updatedCompletedTodos.splice(index, 1);
    setCompletedTodos(updatedCompletedTodos);
  };

  const generateCalendarDays = () => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();

    let days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const changeMonth = (increment) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
  };

  const getTodosForDay = (day) => {
    if (!day) return [];

    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
    return todos.filter(todo => new Date(todo.dueDate).toDateString() === date);
  };

  const days = generateCalendarDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      width: "100%",
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      padding: theme.spacing.large,
      fontFamily: theme.fontFamily,
      border: `2px solid ${theme.colors.primary}`,
      borderRadius: theme.borderRadius.medium,
      boxSizing: "border-box",
      boxShadow: theme.boxShadow
    }}>

      <DatePickerModal
        isOpen={isStartTimeModalOpen}
        onClose={() => setIsStartTimeModalOpen(false)}
        selectedDate={startTime}
        onDateChange={(date) => setStartTime(date)}
      />
      <DatePickerModal
        isOpen={isEndTimeModalOpen}
        onClose={() => setIsEndTimeModalOpen(false)}
        selectedDate={endTime}
        onDateChange={(date) => setEndTime(date)}
      />
      <DatePickerModal
        isOpen={isDueDateModalOpen}
        onClose={() => setIsDueDateModalOpen(false)}
        selectedDate={dueDate}
        onDateChange={(date) => setDueDate(date)}
      />

      <h2 style={{
        textAlign: "center",
        marginBottom: theme.spacing.large,
        borderBottom: `2px solid ${theme.colors.primary}`,
        paddingBottom: theme.spacing.medium
      }}>
        📜 Terminal To-Do App
      </h2>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: theme.spacing.medium
      }}>
        <button
          onClick={() => setCalendarMode(!calendarMode)}
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.text,
            border: "none",
            padding: theme.spacing.medium,
            borderRadius: theme.borderRadius.medium,
            cursor: "pointer"
          }}
        >
          {calendarMode ? "📃 List Mode" : "📅 Calendar Mode"}
        </button>

        <div style={{ display: "flex", gap: theme.spacing.medium }}>
          <button
            onClick={downloadTodos}
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.text,
              border: "none",
              padding: theme.spacing.medium,
              borderRadius: theme.borderRadius.medium,
              cursor: "pointer"
            }}
          >
            📥 Download JSON
          </button>
          <button
            onClick={clearTodos}
            style={{
              backgroundColor: theme.colors.error,
              color: "white",
              border: "none",
              padding: theme.spacing.medium,
              borderRadius: theme.borderRadius.medium,
              cursor: "pointer"
            }}
          >
            ❌ Clear All
          </button>
        </div>
      </div>

      {calendarMode ? (
        <div style={{ flex: 1, marginBottom: theme.spacing.large }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.medium
          }}>
            <button
              onClick={() => changeMonth(-1)}
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.text,
                border: "none",
                padding: theme.spacing.small,
                borderRadius: theme.borderRadius.medium,
                cursor: "pointer"
              }}
            >
              ◀ Prev
            </button>
            <h3 style={{ margin: 0 }}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => changeMonth(1)}
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.text,
                border: "none",
                padding: theme.spacing.small,
                borderRadius: theme.borderRadius.medium,
                cursor: "pointer"
              }}
            >
              Next ▶
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: theme.spacing.small,
            marginBottom: theme.spacing.medium
          }}>
            {dayNames.map((day, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: theme.spacing.small,
                  backgroundColor: theme.colors.secondary,
                  borderRadius: theme.borderRadius.small
                }}
              >
                {day}
              </div>
            ))}

            {days.map((day, i) => (
              <div
                key={i}
                style={{
                  height: "100px",
                  padding: theme.spacing.small,
                  backgroundColor: day ? theme.colors.secondary : "transparent",
                  borderRadius: theme.borderRadius.small,
                  overflow: "auto"
                }}
              >
                {day && (
                  <>
                    <div style={{
                      fontWeight: "bold",
                      marginBottom: theme.spacing.small,
                      fontSize: "14px"
                    }}>
                      {day}
                    </div>
                    {getTodosForDay(day).map((todo, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: "12px",
                          padding: theme.spacing.small,
                          marginBottom: theme.spacing.small,
                          backgroundColor: theme.colors.secondary,
                          borderRadius: theme.borderRadius.small,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                        title={todo.text}
                      >
                        {todo.text}
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: theme.spacing.large,
          maxHeight: "400px"
        }}>
          {todos.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: theme.spacing.large,
              color: theme.colors.primary
            }}>
              No todos yet. Add your first task below!
            </div>
          ) : (
            <ul style={{
              listStyleType: "none",
              padding: 0,
              margin: 0
            }}>
              {todos.map((todo, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: theme.spacing.medium,
                    padding: theme.spacing.medium,
                    border: `1px solid ${theme.colors.primary}`,
                    borderRadius: theme.borderRadius.medium,
                    backgroundColor: theme.colors.secondary
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: theme.spacing.small
                  }}>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>📝 {todo.text}</div>
                    <div style={{ display: "flex", gap: theme.spacing.small }}>
                      <button
                        onClick={() => completeTodo(index)}
                        style={{
                          backgroundColor: theme.colors.primary,
                          color: "white",
                          border: "none",
                          padding: theme.spacing.small,
                          borderRadius: theme.borderRadius.small,
                          cursor: "pointer"
                        }}
                        title="Mark as completed"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => removeTodo(index)}
                        style={{
                          backgroundColor: theme.colors.error,
                          color: "white",
                          border: "none",
                          padding: theme.spacing.small,
                          borderRadius: theme.borderRadius.small,
                          cursor: "pointer"
                        }}
                        title="Delete task"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: "14px" }}>
                    <div>🗒 Notes: {todo.notes}</div>
                    <div>⏳ Time: {todo.startTime} - {todo.endTime}</div>
                    <div>📅 Due: {todo.dueDate}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div style={{
        backgroundColor: theme.colors.secondary,
        padding: theme.spacing.medium,
        borderRadius: theme.borderRadius.medium,
        marginTop: "auto"
      }}>
        <input
          style={{
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.primary}`,
            padding: theme.spacing.small,
            width: "100%",
            marginBottom: theme.spacing.medium,
            borderRadius: theme.borderRadius.medium,
            boxSizing: "border-box"
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a new todo..."
        />

        <textarea
          style={{
            width: "100%",
            height: "60px",
            marginBottom: theme.spacing.medium,
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.primary}`,
            borderRadius: theme.borderRadius.medium,
            padding: theme.spacing.small,
            boxSizing: "border-box",
            resize: "vertical"
          }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
        />

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: theme.spacing.medium,
          marginBottom: theme.spacing.medium
        }}>
          <div>
            <label style={{ display: "block", marginBottom: theme.spacing.small, fontSize: "14px" }}>Due Date:</label>
            <button
              onClick={() => setIsDueDateModalOpen(true)}
              style={{
                width: "100%",
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.primary}`,
                padding: theme.spacing.small,
                borderRadius: theme.borderRadius.medium,
                boxSizing: "border-box",
                cursor: "pointer"
              }}
            >
              {dueDate.toLocaleDateString()}
            </button>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: theme.spacing.small, fontSize: "14px" }}>Start Time:</label>
            <button
              onClick={() => setIsStartTimeModalOpen(true)}
              style={{
                width: "100%",
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.primary}`,
                padding: theme.spacing.small,
                borderRadius: theme.borderRadius.medium,
                boxSizing: "border-box",
                cursor: "pointer"
              }}
            >
              {startTime.toLocaleTimeString()}
            </button>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: theme.spacing.small, fontSize: "14px" }}>End Time:</label>
            <button
              onClick={() => setIsEndTimeModalOpen(true)}
              style={{
                width: "100%",
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.primary}`,
                padding: theme.spacing.small,
                borderRadius: theme.borderRadius.medium,
                boxSizing: "border-box"
              }}
              value={`${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const newDate = new Date();
                newDate.setHours(hours, minutes);
                setEndTime(newDate);
              }}
            > {endTime.toLocaleTimeString()} </button>
          </div>
        </div>

        <button
          onClick={addTodo}
          style={{
            width: "100%",
            backgroundColor: theme.colors.primary,
            color: theme.colors.text,
            border: "none",
            padding: theme.spacing.medium,
            borderRadius: theme.borderRadius.medium,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          ➕ Add Task
        </button>
      </div>

      {completedTodos.length > 0 && (
        <div style={{ marginTop: theme.spacing.large }}>
          <h3 style={{
            marginBottom: theme.spacing.medium,
            paddingBottom: theme.spacing.small,
            borderBottom: `1px solid ${theme.colors.primary}`
          }}>
            ✓ Completed Tasks
          </h3>
          <ul style={{
            listStyleType: "none",
            padding: 0,
            margin: 0
          }}>
            {completedTodos.map((todo, index) => (
              <li
                key={index}
                style={{
                  padding: theme.spacing.small,
                  marginBottom: theme.spacing.small,
                  backgroundColor: theme.colors.secondary,
                  borderRadius: theme.borderRadius.small,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span style={{
                  textDecoration: "line-through",
                  color: theme.colors.accent
                }}>
                  {todo.text} (Due: {todo.dueDate})
                </span>
                <button
                  onClick={() => restoreTodo(index)}
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: "white",
                    border: "none",
                    padding: theme.spacing.small,
                    borderRadius: theme.borderRadius.small,
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                  title="Restore task"
                >
                  ↩️
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{
        textAlign: "center",
        fontSize: "12px",
        marginTop: theme.spacing.large,
        color: theme.colors.accent
      }}>
        Auto-save enabled - Your todos are automatically saved locally
      </div>
    </div>
  );
}