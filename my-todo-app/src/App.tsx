import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';

Chart.register(ArcElement);

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  hidden: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>(''); 
  const [showHiddenTodos, setShowHiddenTodos] = useState<boolean>(false);

  // Load todos from localStorage when the app starts
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      try {
        const parsedTodos = JSON.parse(storedTodos);
        console.log('Loaded todos:', parsedTodos);
        setTodos(parsedTodos);
      } catch (error) {
        console.error('Error parsing todos from localStorage', error);
        localStorage.removeItem('todos'); // Remove corrupted data from localStorage
      }
    }
  }, []); // Runs only once, on initial load

  // Update localStorage every time todos change
  useEffect(() => {
    console.log('Saving todos to localStorage:', todos);
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]); // Runs every time todos array is updated

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const newTask: Todo = {
        id: Date.now(),
        text: newTodo,
        completed: false,
        hidden: false,
      };
      setTodos([...todos, newTask]);
      setNewTodo(''); // Clear the input field
    }
  };

  const handleToggleComplete = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed, hidden: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id)); // Remove task from state
  };

  const toggleShowHiddenTodos = () => {
    setShowHiddenTodos(!showHiddenTodos); // Toggle the visibility of completed tasks
  };

  const completedTasks = todos.filter(todo => todo.completed).length;
  const totalTasks = todos.length;

  const chartData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [completedTasks, totalTasks - completedTasks],
        backgroundColor: ['#4CAF50', '#ddd'],
        hoverBackgroundColor: ['#66BB6A', '#ccc'],
      },
    ],
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <h1 style={styles.title}>To-Do List</h1>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task"
          style={styles.input}
        />
        <button onClick={handleAddTodo} style={styles.addButton}>Add</button>
        <button onClick={toggleShowHiddenTodos} style={styles.toggleButton}>
          {showHiddenTodos ? 'Hide Completed Tasks' : 'Show Completed Tasks'}
        </button>
        <ul style={styles.todoList}>
          {todos
            .filter(todo => !todo.hidden || showHiddenTodos)
            .map(todo => (
              <li
                key={todo.id}
                style={{
                  ...styles.todoItem,
                  textDecoration: todo.completed ? 'line-through' : 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo.id)}
                  style={styles.checkbox}
                />
                <span
                  onClick={() => handleToggleComplete(todo.id)}
                  style={styles.todoText}
                >
                  {todo.text}
                </span>
                <button onClick={() => handleDeleteTodo(todo.id)} style={styles.deleteButton}>Delete</button>
              </li>
            ))}
        </ul>
      </div>
      <div style={styles.rightPanel}>
        <h2>Task Completion</h2>
        <Doughnut data={chartData} />
        <p>
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    padding: '20px',
    maxWidth: '800px',
    margin: 'auto',
    backgroundColor: '#ffffff',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
  },
  leftPanel: {
    flex: 1,
    paddingRight: '20px',
    borderRight: '1px solid #ddd',
  },
  title: {
    color: '#333333',
  },
  input: {
    width: 'calc(100% - 22px)',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    outline: 'none',
  },
  addButton: {
    padding: '10px 15px',
    marginRight: '5px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  toggleButton: {
    padding: '10px 15px',
    backgroundColor: '#f0ad4e',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  todoList: {
    listStyleType: 'none' as 'none',
    padding: '0',
  },
  todoItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  checkbox: {
    marginRight: '10px',
  },
  todoText: {
    cursor: 'pointer',
    flex: 1,
    marginLeft: '10px',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  rightPanel: {
    flex: 1,
    paddingLeft: '20px',
    textAlign: 'center' as 'center',
  },
};

export default App;
