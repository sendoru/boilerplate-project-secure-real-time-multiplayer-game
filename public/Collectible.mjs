import { X_MAX, Y_MAX } from './constants.mjs';

class Collectible {
  constructor({ x, y, value, id }) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
  }

  moveCollectible() {
    this.x = Math.floor(Math.random() * X_MAX);
    this.y = Math.floor(Math.random() * Y_MAX);
  }

  draw(ctx) {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, 5, 5);
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch (e) { }

export default Collectible;
