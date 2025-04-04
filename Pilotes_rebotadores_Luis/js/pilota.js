// pilota.js

export class Pilota {
  constructor(x, y, velX, velY, color, mida) {
      this.x = x;
      this.y = y;
      this.velX = velX;
      this.velY = velY;
      this.color = color;
      this.mida = mida;
  }

  dibuixa(ctx) {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.mida, 0, 2 * Math.PI);
      ctx.fill();
  }

  mou(width, height) {
      // Rebote en bordes horizontales
      if ((this.x + this.mida) >= width || (this.x - this.mida) <= 0) {
          this.velX = -(this.velX);
      }

      // Rebote en bordes verticales
      if ((this.y + this.mida) >= height || (this.y - this.mida) <= 0) {
          this.velY = -(this.velY);
      }

      // Movimiento
      this.x += this.velX;
      this.y += this.velY;
  }

  colisio(altrePilota) {
      const dx = this.x - altrePilota.x;
      const dy = this.y - altrePilota.y;
      const distancia = Math.sqrt(dx * dx + dy * dy);

      if (distancia < this.mida + altrePilota.mida) {
          // Intercambio de velocidades en colisión
          [this.velX, altrePilota.velX] = [altrePilota.velX, this.velX];
          [this.velY, altrePilota.velY] = [altrePilota.velY, this.velY];
      }
  }
}