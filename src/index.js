const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (user) {
    request.user = user;
    return next();
  }
  return response.status(404).json({ error: "username not found" });
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = !!users.find(
    (user) => user.username === username
  );

  if (usernameAlreadyExists)
    return response.status(400).json({ error: "Username already exists" });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  request.user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { todos } = request.user;
  
  const isNotAValidTodo = !request.user.todos.some(todo => todo.id === id)
  if(isNotAValidTodo) return response.status(404).json({error: "Todo not found"})

  request.user.todos = todos.map((todo) => {
    if (todo.id === id) {
      return {
        ...todo,
        title,
        deadline,
      };
    }
    return todo;
  });
  const updatedTodo = request.user.todos.find(todo => todo.id ===  id)
  return response.status(200).json(updatedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;

  const isNotAValidTodo = !request.user.todos.some(todo => todo.id === id)
  if(isNotAValidTodo) return response.status(404).json({error: "Todo not found"})
  
  request.user.todos = todos.map((todo) => {
    if (todo.id === id) {
      return {
        ...todo,
        done: true,
      };
    }
    return todo;
  });

  const updatedTodo = request.user.todos.find(todo => todo.id ===  id)
  return response.status(200).json(updatedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;
  
  const isNotAValidTodo = !request.user.todos.some(todo => todo.id === id)
  if(isNotAValidTodo) return response.status(404).json({error: "Todo not found"})
  
  request.user.todos = todos.filter((todo) => todo.id !== id);

  return response.status(204).json();
});

module.exports = app;
