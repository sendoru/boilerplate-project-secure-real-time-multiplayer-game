import Player from './Player.mjs';
import controls from './controls.mjs';
import Collectible from './Collectible.mjs';
import { X_MAX, Y_MAX } from './constants.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let currPlayers = [];

socket.on('init', ({ id, players, collectible }) => {
  console.log('init', id, players, collectible);

  if (id !== socket.id) {
    console.log('id mismatch');
    return;
  }

  let me =
    new Player({
      x: Math.random() * X_MAX,
      y: Math.random() * Y_MAX,
      score: 0,
      id
    });

  if (players.find(player => player.id === id)) {
    me = new Player(players.find(player => player.id === id));
  }

  controls(me, socket);

  // Handle player enter
  socket.emit('new-player', me);

  socket.on('new-player', (newPlayer) => {
    // console.log('new-player', newPlayer);
    const playerIds = currPlayers.map(player => player.id);
    if (!playerIds.includes(newPlayer.id)) {
      currPlayers.push(new Player(newPlayer));
    }
  });

  // Handle player movement
  socket.on('move-player', ({ id, dir, pos }) => {
    const player = currPlayers.find(player => player.id === id);
    console.log('move-player', player);
    player.movePlayer(dir, 3);

    // Force update player position to sync
    player.x = pos.x;
    player.y = pos.y;
  });

  // Handle new coin gen
  socket.on('new-coin', newCoin => {
    item = new Collectible(newCoin);
  });

  // Handle player disconnection
  socket.on('remove-player', id => {
    console.log(`${id} disconnected`);
    currPlayers = currPlayers.filter(player => player.id !== id);
  });

  currPlayers = players.map(player => new Player(player)).concat(me);
  const item = new Collectible(collectible);

  const draw = () => {
    // console.log(currPlayers);
    context.clearRect(0, 0, X_MAX, Y_MAX);
    currPlayers.forEach(player => player.draw(context, player.id === socket.id));
    item.draw(context);
  }

  const update = () => {
    currPlayers.forEach(player => {
      if (player.collision(item)) {
        player.score += item.value;
        item.moveCollectible();
      }
    });
  }

  const gameLoop = () => {
    draw();
    update();
  }

  setInterval(gameLoop, 1.000 / 60);
});