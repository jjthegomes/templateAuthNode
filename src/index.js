import express from 'express';
import path from "path";
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({
  origin: '*',
  credentials: true
}));

require('./app/controllers/index')(app);

const BUILD_PATH = process.env.BUILD_PATH || '../build'

fs.stat(path.join(__dirname, `${BUILD_PATH}/index.html`), function (err, stat) {
  if (err == null) {
    app.use(express.static(path.join(__dirname, BUILD_PATH)));
    app.get('/*', function (req, res) {
      res.sendFile(path.join(__dirname, BUILD_PATH, 'index.html'));
    });
  } else {
    app.get("/*", (req, res) => {
      res.sendFile(path.join(__dirname, "index.html"));
    });
  }
});

app.listen(process.env.PORT, function () {
  console.log(`API listening on port ${process.env.PORT}`);
});
