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

fs.stat(path.join(__dirname, '../../Template/build/index.html'), function (err, stat) {
  if (err == null) {
    app.use(express.static(path.join(__dirname, '../../Template/build')));
    app.get('/*', function (req, res) {
      res.sendFile(path.join(__dirname, '../../Template/build', 'index.html'));
    });
  } else if (err.code == 'ENOENT') {
    app.get("/*", (req, res) => {
      res.sendFile(path.join(__dirname, "index.html"));
    });
  } else {
    app.get("/*", (req, res) => {
      res.sendFile(path.join(__dirname, "index.html"));
    });
    console.log(err.code);
  }
});

app.listen(3001, function () {
  console.log('API listening on port 3001');
});
