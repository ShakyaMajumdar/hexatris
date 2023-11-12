import express from 'express';
import path from 'path';

const app = express();
const port = 80;

app.use(express.static("public"));

app.get('/', (req, res) => {
  console.log("world")
  console.log(__dirname)
  res.sendFile("index.html",);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
