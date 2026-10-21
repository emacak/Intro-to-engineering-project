let w = 600;
let h = 400;
let gameOver = false;
let gameWinning = false;

let r = 25;
let x1 = r;
let y1 = h / 2;

let x2 = w - r;
let y2 = h / 2;

let drag1 = false;
let drag2 = false;

let characterX = w / 2;
let characterY = h / 2;
let characterR = 30;

function setup() {
  createCanvas(w, h);
}

function mousePressed() {
  if (gameOver || gameWinning) return;

  let d1 = dist(mouseX, mouseY, x1, y1);
  let d2 = dist(mouseX, mouseY, x2, y2);

  if (d1 <= r) {
    drag1 = true;
  } else if (d2 <= r) {
    drag2 = true;
  }
}

function mouseReleased() {
  drag1 = false;
  drag2 = false;
}

function draw() {
  background(220);

  if (drag1) {
    x1 = mouseX;
    y1 = mouseY;
  }

  if (drag2) {
    x2 = mouseX;
    y2 = mouseY;
  }

  fill(255, 100, 100);
  circle(characterX, characterY, characterR * 2);

  fill(0);
  circle(characterX - 10, characterY - 5, 5);
  circle(characterX + 10, characterY - 5, 5);

  fill(100, 150, 255);
  circle(x1, y1, r * 2);

  fill(100, 255, 150);
  circle(x2, y2, r * 2);

  let d1 = dist(x1, y1, characterX, characterY);
  let d2 = dist(x2, y2, characterX, characterY);

  if (d1 <= r + characterR &&
      d2 <= r + characterR) {
    gameWinning = true;
    drag1 = false;
    drag2 = false;
  }

  // Display win message
  if (gameWinning) {
    fill(0, 150, 0);
    textAlign(CENTER);
    textSize(30);
    text("YOU WIN!", w / 2, 60);
    noLoop();
  }
}
