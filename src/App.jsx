import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());

  // Load todos from the JSON file in the public directory
  useEffect(() => {
    fetch("/todos.json")
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch(() => setTodos([]));
  }, []);

  const addTodo = () => {
    if (!input.trim()) return;
    const newTodo = {
      text: input,
      startTime: startTime.toLocaleTimeString(),
      endTime: endTime.toLocaleTimeString(),
      dueDate: dueDate.toDateString(),
    };
    const newTodos = [...todos, newTodo];
    setTodos(newTodos);
    setInput("");
  };

  // Function to download the todos as a JSON file
  const downloadTodos = () => {
    const json = JSON.stringify(todos, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "todos.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "#00FF00",
        padding: "20px",
        fontFamily: "monospace",
        border: "2px solid #007700",
        borderRadius: "5px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Terminal To-Do App</h2>
      <ul style={{ listStyleType: "none", padding: "0" }}>
        {todos.map((todo, index) => (
          <li
            key={index}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #007700",
              borderRadius: "5px",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{todo.text}</div>
            <div>Start: {todo.startTime}</div>
            <div>End: {todo.endTime}</div>
            <div>Due: {todo.dueDate}</div>
          </li>
        ))}
      </ul>
      <input
        style={{
          backgroundColor: "black",
          color: "#00FF00",
          border: "1px solid #007700",
          padding: "8px",
          width: "100%",
          marginBottom: "10px",
          borderRadius: "5px",
        }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter a new todo"
      />
      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "10px" }}>Start Time: </label>
        <DatePicker
          selected={startTime}
          onChange={(date) => setStartTime(date)}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="h:mm aa"
          style={{ padding: "5px", borderRadius: "5px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "10px" }}>End Time: </label>
        <DatePicker
          selected={endTime}
          onChange={(date) => setEndTime(date)}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="h:mm aa"
          style={{ padding: "5px", borderRadius: "5px" }}
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>Due Date: </label>
        <DatePicker
          selected={dueDate}
          onChange={(date) => setDueDate(date)}
          dateFormat="MM/dd/yyyy"
          style={{ padding: "5px", borderRadius: "5px" }}
        />
      </div>
      <button
        style={{
          backgroundColor: "#007700",
          color: "#00FF00",
          border: "none",
          padding: "10px 20px",
          marginRight: "10px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={addTodo}
      >
        Add
      </button>
      <button
        style={{
          backgroundColor: "#007700",
          color: "#00FF00",
          border: "none",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={downloadTodos}
      >
        Download Todos as JSON
      </button>
    </div>
  );
}