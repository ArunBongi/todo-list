import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./globals.css";

export default function Component() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [todo, setTodo] = useState("");
  const [todoList, setTodoList] = useState([]);
  const [editTodoId, setEditTodoId] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token && userId) {
      setIsAuthenticated(true);
      fetchTodos();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:2183/todos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const todos = await response.json();
        setTodoList(todos);
      } else {
        console.error("Failed to fetch todos");
      }
    } catch (err) {
      console.error("Error fetching todos:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleTodoChange = (e) => {
    setTodo(e.target.value);
  };

  const handleTodoSubmit = async (e) => {
    e.preventDefault();
    if (todo.trim() === "") {
      alert("Please enter a task.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }

    const requestBody = JSON.stringify({ task: todo });

    try {
      const response = await fetch(
        editTodoId
          ? `http://localhost:2183/updateTodo/${editTodoId}`
          : "http://localhost:2183/addTodo",
        {
          method: editTodoId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: requestBody,
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (editTodoId) {
          setTodoList((prevList) =>
            prevList.map((t) => (t._id === editTodoId ? result : t))
          );
          setMessage("Task updated successfully!");
        } else {
          setTodoList((prevList) => [...prevList, result]);
          setMessage("Task added successfully!");
        }
        setTodo("");
        setEditTodoId(null);
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorResponse = await response.json();
        alert(
          `Failed to add/edit task: ${errorResponse.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error adding/editing task:", error);
      alert("An unexpected error occurred");
    }
  };

  const handleEditTodo = (todoItem) => {
    setTodo(todoItem.task);
    setEditTodoId(todoItem._id);
  };

  const handleCompleteTodo = async (todoId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:2183/completeTodo/${todoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setTodoList((prevList) =>
          prevList.map((t) =>
            t._id === todoId ? { ...t, completed: true } : t
          )
        );
        setMessage("Task marked as completed!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorResponse = await response.json();
        alert(
          `Failed to complete task: ${errorResponse.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error completing task:", error);
      alert("An unexpected error occurred");
    }
  };

  const handleDeleteTodo = async (todoId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:2183/deleteTodo/${todoId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setTodoList((prevList) => prevList.filter((t) => t._id !== todoId));
        setMessage("Task deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorResponse = await response.json();
        alert(
          `Failed to delete task: ${errorResponse.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("An unexpected error occurred");
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="logo">
          <h1>LOGO</h1>
        </div>
        <div className="logout">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      <div className="main-content">
        {isAuthenticated ? (
          <>
            <h1>Welcome to the Home Page</h1>
            {message && <p className="success-message">{message}</p>}
            <ul className="todo-list">
              {todoList.map((task) => (
                <li key={task._id} className="todo-item">
                  {task.task ? task.task : "Unnamed Task"}
                  <button
                    onClick={() => handleEditTodo(task)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(task._id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                  {!task.completed && (
                    <button
                      onClick={() => handleCompleteTodo(task._id)}
                      className="complete-button"
                    >
                      Complete
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <h2>
              {editTodoId ? "Edit Your Task" : "Add a Task to Your Todo List"}
            </h2>
            <form onSubmit={handleTodoSubmit} className="todo-form">
              <input
                type="text"
                value={todo}
                onChange={handleTodoChange}
                placeholder="Enter a task"
                className="input-field"
              />
              <button type="submit" className="submit-button">
                {editTodoId ? "Update Task" : "Add Task"}
              </button>
            </form>
          </>
        ) : (
          <p>Redirecting to login...</p>
        )}
      </div>
    </div>
  );
}
