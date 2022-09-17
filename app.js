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
  const { status = "", priority = "" } = request.query;
  const statusGetQuery = `
    SELECT * FROM todo
    WHERE 
    status LIKE '%${status}%',
    priority LIKE '%${priority}%';`;
  const arrayOf = await db.all(statusGetQuery);
  response.send(arrayOf);
});

module.exports = app;
