//server.js
const express = require('express');
const favicon = require('express-favicon');
const path = require('path');
const port = process.env.PORT || 5000;
const app = express();

// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));
app.use(favicon(__dirname + '/favicon.ico'));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

/**
 * If you add a new root path in the UI (like a new feature or top menu item)
 * you will need to add the root path here. index.html should be served back
 * in order to load the react classes, including react-router, which manages
 * the internal state/rendering for individual pages/views.
 */
// app.get('/dashboard/*', function (req, res) {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.listen(port);
