// Hand-drawn canvas sprites in the mustard/brown hoodie palette,
// matching the reference character art style (bold outline, flat fill).

export function drawHoodiePlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  facing: -1 | 0 | 1
) {
  ctx.save();
  ctx.translate(x, y);

  const outline = "#0e0e10";
  const brown = "#7a4e23";
  const brownDark = "#5c3a19";
  const gray = "#9a9a9a";
  const grayLight = "#c4c4c4";

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // lean slightly in movement direction
  const lean = facing * 0.06;
  ctx.translate(w / 2, h);
  ctx.rotate(lean);
  ctx.translate(-w / 2, -h);

  // body (hoodie torso, trapezoid)
  ctx.beginPath();
  ctx.moveTo(w * 0.18, h * 0.42);
  ctx.lineTo(w * 0.82, h * 0.42);
  ctx.lineTo(w * 0.95, h * 1.0);
  ctx.lineTo(w * 0.05, h * 1.0);
  ctx.closePath();
  ctx.fillStyle = brown;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = outline;
  ctx.stroke();

  // hoodie pocket line
  ctx.beginPath();
  ctx.moveTo(w * 0.32, h * 0.78);
  ctx.lineTo(w * 0.5, h * 0.85);
  ctx.lineTo(w * 0.68, h * 0.78);
  ctx.strokeStyle = brownDark;
  ctx.lineWidth = 2;
  ctx.stroke();

  // hood (behind head, darker brown collar)
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.4, w * 0.42, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = brownDark;
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = 3;
  ctx.stroke();

  // face (gray)
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.3, w * 0.28, h * 0.24, 0, 0, Math.PI * 2);
  ctx.fillStyle = grayLight;
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // fringe/hair
  ctx.beginPath();
  ctx.moveTo(w * 0.24, h * 0.2);
  ctx.lineTo(w * 0.76, h * 0.2);
  ctx.lineTo(w * 0.7, h * 0.12);
  ctx.lineTo(w * 0.3, h * 0.12);
  ctx.closePath();
  ctx.fillStyle = "#2a2018";
  ctx.fill();

  // hood outer rim (mustard highlight edge, on top)
  ctx.beginPath();
  ctx.moveTo(w * 0.12, h * 0.36);
  ctx.quadraticCurveTo(w * 0.02, h * 0.1, w * 0.32, h * 0.02);
  ctx.quadraticCurveTo(w * 0.5, -h * 0.04, w * 0.68, h * 0.02);
  ctx.quadraticCurveTo(w * 0.98, h * 0.1, w * 0.88, h * 0.36);
  ctx.strokeStyle = outline;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // eyes
  ctx.fillStyle = outline;
  ctx.beginPath();
  ctx.ellipse(w * 0.41, h * 0.3, 2.4, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.59, h * 0.3, 2.4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // mouth (neutral)
  ctx.beginPath();
  ctx.moveTo(w * 0.44, h * 0.4);
  ctx.lineTo(w * 0.56, h * 0.4);
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
  void gray;
}

export function drawCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  spin: number
) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  const squash = Math.max(0.25, Math.abs(Math.cos(spin)));
  ctx.scale(squash, 1);

  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#e8b23d";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#8a5d12";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, size / 2 - 5, 0, Math.PI * 2);
  ctx.strokeStyle = "#f6d27a";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

export function drawRugObstacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  ctx.translate(x, y);

  // sack body
  ctx.beginPath();
  ctx.moveTo(size * 0.1, size * 0.35);
  ctx.quadraticCurveTo(-size * 0.05, size * 0.8, size * 0.5, size);
  ctx.quadraticCurveTo(size * 1.05, size * 0.8, size * 0.9, size * 0.35);
  ctx.closePath();
  ctx.fillStyle = "#d6462f";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#0e0e10";
  ctx.stroke();

  // tied neck
  ctx.beginPath();
  ctx.ellipse(size * 0.5, size * 0.3, size * 0.22, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#a83322";
  ctx.fill();
  ctx.stroke();

  // rope tie
  ctx.beginPath();
  ctx.moveTo(size * 0.3, size * 0.22);
  ctx.lineTo(size * 0.7, size * 0.22);
  ctx.strokeStyle = "#3a2418";
  ctx.lineWidth = 3;
  ctx.stroke();

  // "rug" text mark
  ctx.fillStyle = "#0e0e10";
  ctx.font = `bold ${size * 0.22}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText("!", size * 0.5, size * 0.7);

  ctx.restore();
}
