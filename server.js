require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');
const { Socket } = require('socket.io-client');

const app = express();

// The client should not be able to guess/sniff the MIME type.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Prevent XSS attacks
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// disable cache in client
app.use((req, res, next) => {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// site powered by 'PHP 7.4.3'
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'PHP 7.4.3');
  next();
});

// get all flies in public folder
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({ origin: '*' }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

const Player = require('./public/Player.mjs');
const Collectible = require('./public/Collectible.mjs');

let players = [];
const collectible = new Collectible({ x: 100, y: 100, value: 10, id: 0 });

const io = socket(server);

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);

  socket.on('new-player', (player) => {
    if (!players.find(p => p.id === player.id)) {
      players.push(new Player(player));
    }
    io.emit('new-player', player);
  });

  socket.on('move-player', (id, dir, pos) => {
    const player = players.find(player => player.id === socket.id);
    // console.log('move-player', id, dir, pos);
    player.movePlayer(dir, 3);
    io.emit('move-player', { id: socket.id, dir, pos });
  });

  socket.on('new-coin', () => {
    collectible.moveCollectible();
    io.emit('new-coin', collectible);
  });

  socket.on('remove-player', () => {
    players = players.filter(player => player.id !== socket.id);
    io.emit('remove-player', socket.id);
    console.log(`${socket.id} disconnected`);
  });

  socket.on('disconnect', () => {
    players = players.filter(player => player.id !== socket.id);
    io.emit('remove-player', socket.id);
    console.log(`${socket.id} disconnected`);
  });

  io.emit('init', { id: socket.id, players, collectible });
});

module.exports = app; // For testing
