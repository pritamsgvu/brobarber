import { Component, OnInit } from '@angular/core';
import { TodoService } from 'src/app/services/todo.service';

interface Todo {
  _id?: string;
  task: string;
  isCompleted: boolean;
  createdAt: string;  // Added the createdAt field
}

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {

  todos: Todo[] = [];
  newTask: string = '';

  constructor(private todoService: TodoService) { }

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.todoService.getTodos().subscribe(todos => {
      this.todos = todos;
    });
  }

  addTodo(): void {
    if (this.newTask.trim()) {
      const newTodo: Todo = { task: this.newTask, isCompleted: false, createdAt: new Date().toLocaleString() };
      this.todoService.addTodo(newTodo).subscribe(todo => {
        this.todos.push(todo);
        this.newTask = '';  // Clear input field
      });
    }
  }

  toggleCompletion(todo: Todo): void {
    const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };
    this.todoService.updateTodo(todo._id!, updatedTodo).subscribe(() => {
      todo.isCompleted = updatedTodo.isCompleted;
    });
  }

  deleteTodo(id: string): void {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.todos = this.todos.filter(todo => todo._id !== id);
    });
  }
}
