"use client";

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore'; // Modular Firestore functions
import styles from './page.module.css';

interface Todo {
  id: string;
  task: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState<string>('');

  // Fetch todos from Firebase Firestore
  useEffect(() => {
    const q = query(collection(db, 'todos')); // Get reference to the 'todos' collection
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTodos: Todo[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        task: doc.data().task,
        completed: doc.data().completed,
      })) as Todo[];
      setTodos(newTodos);
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);

  // Add a new todo to Firebase Firestore
  const addTodo = async () => {
    if (task.trim()) {
      await addDoc(collection(db, 'todos'), {
        task,
        completed: false,
      });
      setTask(''); // Clear input field after adding task
    }
  };

  // Toggle completed state
  const toggleCompletion = async (id: string, completed: boolean) => {
    const todoDoc = doc(db, 'todos', id);
    await updateDoc(todoDoc, {
      completed: !completed,
    });
  };

  // Remove a todo
  const removeTodo = async (id: string) => {
    const todoDoc = doc(db, 'todos', id);
    await deleteDoc(todoDoc);
  };

  return (
    <div className={styles.container}>
      <h1>To-Do List</h1>

      <div className={styles.inputContainer}>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter a new task"
          className={styles.input}
        />
        <button onClick={addTodo} className={styles.addButton}>
          Add Task
        </button>
      </div>

      <ul className={styles.todoList}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`${styles.todoItem} ${todo.completed ? styles.completed : ''}`}
          >
            <span
              onClick={() => toggleCompletion(todo.id, todo.completed)}
              style={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
            >
              {todo.task}
            </span>
            <button onClick={() => removeTodo(todo.id)} className={styles.deleteButton}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
