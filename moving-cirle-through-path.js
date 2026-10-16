let w = 600;
let h = 400;
let gameOver = false;
let gameWinning = false;

function setup() {
  createCanvas(w, h);
}
// elements of cirle:
let r = 25, x = r, y = h / 2;
let drag = false;

function mouseReleased(){
  drag = false;
}

function mousePressed(){
  let d = dist(mouseX, mouseY, x, y);
  if( d <= r){
    drag = true;
  }
}

function draw() {
  background(220);
  
  let lineY = h / 2;
  let gap = 100;

  line(0, lineY - gap / 2, w, lineY - gap / 2);
  line(0, lineY + gap / 2, w, lineY + gap / 2);
  
  let topLine = lineY - gap / 2;
  let bottomLine = lineY + gap / 2;

  let finishX = w - 50;
  line(finishX, topLine, finishX, bottomLine);
  
  if (y - r <= topLine || y + r >= bottomLine) {
    gameOver = true;
  }

  if (x + r >= finishX) {
    drag = false;
    gameWinning = true;
  }
  
  if(drag){
    x = mouseX;
    y = mouseY;
  }
  circle(x, y, r * 2);
  if(gameOver){
    textSize(32);
    text("GAME OVER", w / 2 - 50, 50);
    noLoop();
  }
  if (gameWinning) {
    textAlign(CENTER);
    textSize(32);
    text("YOU ARE THE WINNER", w / 2, 80);
    noLoop();
  }
}
