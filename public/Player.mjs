import { X_MAX, Y_MAX } from './constants.mjs';

class Player {
  constructor({ x, y, score, id }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case 'left':
        this.x -= speed;
        break;
      case 'right':
        this.x += speed;
        break;
      case 'up':
        this.y -= speed;
        break;
      case 'down':
        this.y += speed;
        break;
    }
    if (this.x < 0) this.x = 0;
    if (this.x >= X_MAX) this.x = X_MAX - 1;
    if (this.y < 0) this.y = 0;
    if (this.y >= Y_MAX) this.y = Y_MAX - 1;
  }

  collision(item) {
    if (Math.abs(this.x - item.x) < 5 && Math.abs(this.y - item.y) < 5) {
      return true;
    }
    return false;
  }

  calculateRank(arr) {
    arr.sort((a, b) => b.score - a.score);
    return `Rank: ${arr.findIndex(player => player.id === this.id) + 1}/${arr.length}`;
  }

  draw(ctx, isMe) {
    if (isMe) {
      ctx.fillStyle = 'green';
    }
    else {
      ctx.fillStyle = 'red';
    }
    ctx.fillRect(this.x, this.y, 15, 15);
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Player;
}
catch (e) { }
export default Player;
