export class ParticleSystem {
  constructor() {
    this.items = [];
  }

  burst(x, y, color = '#ffffff', count = 36) {
    for (let i = 0; i < count; i += 1) {
      const speed = 80 + Math.random() * 240;
      const angle = Math.random() * Math.PI * 2;
      this.items.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.9 + Math.random() * 0.8,
        ttl: 0.9 + Math.random() * 0.8,
        size: 3 + Math.random() * 4,
        color,
      });
    }
  }

  update(dt) {
    this.items = this.items.filter((p) => {
      p.life -= dt;
      p.vy += 260 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return p.life > 0;
    });
  }

  draw(ctx) {
    for (const p of this.items) {
      const alpha = p.life / p.ttl;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}
