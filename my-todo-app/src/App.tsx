import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip } from 'chart.js';
import Calendar from 'react-calendar';
import TimePicker from 'react-time-picker'; // Saat seçici eklendi
import 'react-calendar/dist/Calendar.css';
import 'react-time-picker/dist/TimePicker.css';
import localforage from 'localforage';


Chart.register(ArcElement, Tooltip);

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  hidden: boolean;
  category: 'okul' | 'iş' | 'eğlence';
  date: Date | null; // Göreve atanacak tarih
  time: string | null; // Göreve atanacak saat
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'okul' | 'iş' | 'eğlence'>('okul');
  const [showHiddenTodos, setShowHiddenTodos] = useState<boolean>(false);
  const [idCounter, setIdCounter] = useState(0);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null); // Saat ekleme

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const newTask: Todo = {
        id: idCounter,
        text: newTodo,
        completed: false,
        hidden: false,
        category: selectedCategory,
        date: selectedDate,
        time: selectedTime, // Saat seçimi
      };
      setTodos([...todos, newTask]);
      setNewTodo('');
      setIdCounter(idCounter + 1);
      setSelectedDate(null);
      setSelectedTime(null); // Saat seçiciyi sıfırlayın
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
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleShowHiddenTodos = () => {
    setShowHiddenTodos(!showHiddenTodos);
  };

  const completedTasks = todos.filter(todo => todo.completed).length;
  const totalTasks = todos.length;

  useEffect(() => {
    localforage.getItem<Todo[]>("savedTodos").then((savedTodos) => {
      if (savedTodos) {
        setTodos(savedTodos);
        setIdCounter(savedTodos.length > 0 ? Math.max(...savedTodos.map((todo) => todo.id)) + 1 : 1);
      }
    });
  }, []);
  
  useEffect(() => {
    localforage.setItem("savedTodos", todos);
  }, [todos]);

  const chartData = {
    labels: todos.map(todo => todo.text),
    datasets: [
      {
        data: todos.map(todo => 1),
        backgroundColor: todos.map(todo => {
          const baseColor = todo.completed ? 'rgba(76, 175, 80, 0.7)' : 'rgba(244, 67, 54, 0.7)';
          switch (todo.category) {
            case 'okul': return todo.completed ? '#4CAF50' : '#FFCDD2';
            case 'iş': return todo.completed ? '#FF9800' : '#FFE0B2';
            case 'eğlence': return todo.completed ? '#2196F3' : '#BBDEFB';
            default: return baseColor;
          }
        }),
        hoverBackgroundColor: todos.map(todo => {
          const baseColor = todo.completed ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)';
          switch (todo.category) {
            case 'okul': return todo.completed ? '#66BB6A' : '#FFEBEE';
            case 'iş': return todo.completed ? '#FFB74D' : '#FFF3E0';
            case 'eğlence': return todo.completed ? '#64B5F6' : '#E3F2FD';
            default: return baseColor;
          }
        }),
      },
    ],
  };

  const chartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const todo = todos[context.dataIndex];
            const status = todo.completed ? 'Tamamlandı' : 'Tamamlanmadı';
            return `${todo.text} - ${status} (${todo.category})`;
          },
        },
      },
    },
    maintainAspectRatio: false,
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
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as 'okul' | 'iş' | 'eğlence')}
          style={styles.select}
        >
          <option value="okul">Okul</option>
          <option value="iş">İş</option>
          <option value="eğlence">Eğlence</option>
        </select>
        <div style={styles.calendarContainer}>
          <Calendar onChange={setSelectedDate} value={selectedDate} style={{ width: '100px', height: '150px' }} />
        </div>
        <div style={styles.calendarContainer}>
          <TimePicker
            onChange={setSelectedTime}
            value={selectedTime}
            disableClock={true}
            clearIcon={null}
            format="HH:mm"
          />        
        </div>
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
                <span onClick={() => handleToggleComplete(todo.id)} style={styles.todoText}>
                  {todo.text} ({todo.category}) {todo.date ? `- ${todo.date.toLocaleDateString()}` : ''}
                </span>
                <button onClick={() => handleDeleteTodo(todo.id)} style={styles.deleteButton}>Delete</button>
              </li>
            ))}
        </ul>
      </div>
      <div style={styles.rightPanel}>
        <h2>Task Completion</h2>
        <div style={{ width: '200px', height: '200px' }}>
          <Doughnut data={chartData} options={chartOptions} />
        </div>
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
  calendarContainer: {
    marginBottom: '10px',
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
  select: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
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
    paddingLeft: '20px',
  },
};

export default App;
