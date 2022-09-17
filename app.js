const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  const statusGetQuery = `
    SELECT * FROM todo
    WHERE 
    status LIKE '%${status}%'
    priority LIKE '%${priority}%'
    todo LIKE '%${search_q}%'
    ;`;
  const arrayOf = await db.all(statusGetQuery);
  response.send(arrayOf);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getToDoQuery = `
    SELECT
      *
    FROM
      todo
      WHERE id= ${todoId};`;

  const oneTodo = await db.get(getToDoQuery);
  response.send(oneTodo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo ( id, todo, priority, status)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}');`;

  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateColumn = "";

  const getToDo = `
  SELECT * FROM todo
  WHERE id=${todoId};`;
  const previousObject = await db.get(getToDo);

  const {
    status = previousObject.status,
    priority = previousObject.priority,
    todo = previousObject.todo,
  } = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
  }

  const putTodo = `
            UPDATE
              todo
            SET
              priority = '${priority}',
              status = '${status}',
              todo = '${todo}'
              
            WHERE
              id = ${todoId};`;

  await db.run(putTodo);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
