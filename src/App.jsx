import { useState, useEffect } from "react";

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
      backgroundColor: "black",
      color: "#00FF00",
      padding: "20px",
      fontFamily: "monospace",
      border: "2px solid #007700",
      borderRadius: "5px",
      boxSizing: "border-box",
      boxShadow: "0 4px 8px rgba(0, 255, 0, 0.3)"
    }}>
      <h2 style={{ 
        textAlign: "center", 
        marginBottom: "20px", 
        borderBottom: "2px solid #007700", 
        paddingBottom: "10px" 
      }}>
        📜 Terminal To-Do App
      </h2>
      
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        marginBottom: "15px" 
      }}>
        <button 
          onClick={() => setCalendarMode(!calendarMode)} 
          style={{ 
            backgroundColor: "#007700", 
            color: "#00FF00", 
            border: "none", 
            padding: "10px", 
            borderRadius: "5px", 
            cursor: "pointer" 
          }}
        >
          {calendarMode ? "📃 List Mode" : "📅 Calendar Mode"}
        </button>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={downloadTodos} 
            style={{ 
              backgroundColor: "#007700", 
              color: "#00FF00", 
              border: "none", 
              padding: "10px", 
              borderRadius: "5px", 
              cursor: "pointer" 
            }}
          >
            📥 Download JSON
          </button>
          <button 
            onClick={clearTodos} 
            style={{ 
              backgroundColor: "red", 
              color: "white", 
              border: "none", 
              padding: "10px", 
              borderRadius: "5px", 
              cursor: "pointer" 
            }}
          >
            ❌ Clear All
          </button>
        </div>
      </div>

      {calendarMode ? (
        <div style={{ flex: 1, marginBottom: "20px" }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "15px" 
          }}>
            <button 
              onClick={() => changeMonth(-1)} 
              style={{ 
                backgroundColor: "#007700", 
                color: "#00FF00", 
                border: "none", 
                padding: "5px 10px", 
                borderRadius: "5px", 
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
                backgroundColor: "#007700", 
                color: "#00FF00", 
                border: "none", 
                padding: "5px 10px", 
                borderRadius: "5px", 
                cursor: "pointer" 
              }}
            >
              Next ▶
            </button>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(7, 1fr)", 
            gap: "5px", 
            marginBottom: "15px" 
          }}>
            {dayNames.map((day, i) => (
              <div 
                key={i} 
                style={{ 
                  textAlign: "center", 
                  fontWeight: "bold", 
                  padding: "5px", 
                  backgroundColor: "rgba(0, 119, 0, 0.3)", 
                  borderRadius: "3px" 
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
                  padding: "5px", 
                  backgroundColor: day ? "rgba(0, 119, 0, 0.2)" : "transparent", 
                  borderRadius: "3px", 
                  overflow: "auto" 
                }}
              >
                {day && (
                  <>
                    <div style={{ 
                      fontWeight: "bold", 
                      marginBottom: "5px",
                      fontSize: "14px" 
                    }}>
                      {day}
                    </div>
                    {getTodosForDay(day).map((todo, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          fontSize: "12px", 
                          padding: "3px", 
                          marginBottom: "3px", 
                          backgroundColor: "rgba(0, 119, 0, 0.4)", 
                          borderRadius: "3px", 
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
          marginBottom: "20px",
          maxHeight: "400px"
        }}>
          {todos.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "20px", 
              color: "#007700" 
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
                    marginBottom: "10px", 
                    padding: "10px", 
                    border: "1px solid #007700", 
                    borderRadius: "5px", 
                    backgroundColor: "rgba(0, 119, 0, 0.2)" 
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    marginBottom: "8px" 
                  }}>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>📝 {todo.text}</div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button 
                        onClick={() => completeTodo(index)} 
                        style={{ 
                          backgroundColor: "#007700", 
                          color: "white", 
                          border: "none", 
                          padding: "3px 8px", 
                          borderRadius: "3px",
                          cursor: "pointer" 
                        }}
                        title="Mark as completed"
                      >
                        ✓
                      </button>
                      <button 
                        onClick={() => removeTodo(index)} 
                        style={{ 
                          backgroundColor: "red", 
                          color: "white", 
                          border: "none", 
                          padding: "3px 8px", 
                          borderRadius: "3px",
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
        backgroundColor: "rgba(0, 119, 0, 0.2)", 
        padding: "15px", 
        borderRadius: "5px", 
        marginTop: "auto" 
      }}>
        <input
          style={{ 
            backgroundColor: "black", 
            color: "#00FF00", 
            border: "1px solid #007700", 
            padding: "8px", 
            width: "100%", 
            marginBottom: "10px", 
            borderRadius: "5px",
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
            marginBottom: "10px", 
            backgroundColor: "black", 
            color: "#00FF00", 
            border: "1px solid #007700", 
            borderRadius: "5px", 
            padding: "8px",
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
          gap: "10px", 
          marginBottom: "10px" 
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>Due Date:</label>
            <input 
              type="date"
              style={{ 
                width: "100%", 
                backgroundColor: "black", 
                color: "#00FF00", 
                border: "1px solid #007700", 
                padding: "5px", 
                borderRadius: "3px",
                boxSizing: "border-box"
              }}
              value={dueDate.toISOString().split('T')[0]}
              onChange={(e) => setDueDate(new Date(e.target.value))}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>Start Time:</label>
            <input 
              type="time"
              style={{ 
                width: "100%", 
                backgroundColor: "black", 
                color: "#00FF00", 
                border: "1px solid #007700", 
                padding: "5px", 
                borderRadius: "3px",
                boxSizing: "border-box"
              }}
              value={`${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const newDate = new Date();
                newDate.setHours(hours, minutes);
                setStartTime(newDate);
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>End Time:</label>
            <input 
              type="time"
              style={{ 
                width: "100%", 
                backgroundColor: "black", 
                color: "#00FF00", 
                border: "1px solid #007700", 
                padding: "5px", 
                borderRadius: "3px",
                boxSizing: "border-box"
              }}
              value={`${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const newDate = new Date();
                newDate.setHours(hours, minutes);
                setEndTime(newDate);
              }}
            />
          </div>
        </div>
        
        <button 
          onClick={addTodo} 
          style={{ 
            width: "100%", 
            backgroundColor: "#007700", 
            color: "#00FF00", 
            border: "none", 
            padding: "10px", 
            borderRadius: "5px", 
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          ➕ Add Task
        </button>
      </div>
      
      {completedTodos.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ 
            marginBottom: "10px", 
            paddingBottom: "5px", 
            borderBottom: "1px solid #007700" 
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
                  padding: "8px", 
                  marginBottom: "5px", 
                  backgroundColor: "rgba(0, 119, 0, 0.1)", 
                  borderRadius: "3px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span style={{ 
                  textDecoration: "line-through", 
                  color: "rgba(0, 255, 0, 0.6)" 
                }}>
                  {todo.text} (Due: {todo.dueDate})
                </span>
                <button
                  onClick={() => restoreTodo(index)}
                  style={{ 
                    backgroundColor: "#007700", 
                    color: "white", 
                    border: "none", 
                    padding: "3px 8px", 
                    borderRadius: "3px",
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
        marginTop: "20px", 
        color: "rgba(0, 255, 0, 0.5)" 
      }}>
        Auto-save enabled - Your todos are automatically saved locally
      </div>
    </div>
  );
}