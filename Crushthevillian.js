let w = 600;
let h = 400;
let gameOver = false;
let gameWinning = false;
let exerciseDifficulty = "Normal";
let targetRadius = 60;
let pinchAccuracy = 0;
let targetIndex = 0;
let targetAccuracies = [];
let targets = [];
let passAccuracy = 85;
const DIFFICULTY_SETTINGS = {
  Easy: { targetRadius: 90, passAccuracy: 70, targets: [{ x: 300, y: 200 }] },
  Normal: {
    targetRadius: 60,
    passAccuracy: 85,
    targets: [{ x: 220, y: 200 }, { x: 380, y: 200 }]
  },
  Hard: {
    targetRadius: 40,
    passAccuracy: 95,
    targets: [{ x: 300, y: 150 }, { x: 190, y: 250 }, { x: 410, y: 250 }]
  }
};

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
  exerciseDifficulty = window.exerciseDifficulty || "Normal";
  const difficultySettings = DIFFICULTY_SETTINGS[exerciseDifficulty];
  targetRadius = difficultySettings.targetRadius;
  passAccuracy = difficultySettings.passAccuracy;
  targets = difficultySettings.targets;
  setTarget(0);
  createCanvas(w, h);
}

function mousePressed() {
  if (gameOver) {
    if (mouseX > w / 2 - 90 && mouseX < w / 2 + 90 &&
        mouseY > h / 2 + 75 - 22 && mouseY < h / 2 + 75 + 22) {
      resetExercise();
    }
    return;
  }

  if (mouseX > w / 2 - 90 && mouseX < w / 2 + 90 &&
      mouseY > 350 && mouseY < 392) {
    targetAccuracies.push(getPinchAccuracy());
    targetIndex++;
    if (targetIndex >= targets.length) {
      const averageAccuracy =
        targetAccuracies.reduce((total, accuracy) => total + accuracy, 0) /
        targetAccuracies.length;
      pinchAccuracy = Math.floor(averageAccuracy);
      gameWinning = averageAccuracy >= passAccuracy;
      gameOver = true;
    } else {
      setTarget(targetIndex);
    }
    return;
  }

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

  fill(45);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(17);
  text("PINCH THE VILLAIN - " + exerciseDifficulty.toUpperCase(), w / 2, 22);
  textSize(13);
  const instructions = exerciseDifficulty === "Easy"
    ? "Pinch the single large target."
    : exerciseDifficulty === "Normal"
      ? "Pinch both targets, one at a time."
      : "Pinch all three smaller targets in order.";
  text(instructions + " Average " + passAccuracy + "% to pass.", w / 2, 44);

  if (!gameOver && drag1) {
    x1 = constrain(mouseX, r, w - r);
    y1 = constrain(mouseY, r, h - r);
  }

  if (!gameOver && drag2) {
    x2 = constrain(mouseX, r, w - r);
    y2 = constrain(mouseY, r, h - r);
  }

  noFill();
  stroke(55, 170, 80, 130);
  strokeWeight(2);
  circle(characterX, characterY, targetRadius * 2);
  circle(characterX, characterY, targetRadius * 1.3);

  drawLevelVillain(characterX, characterY);
  drawLevelHero(75, 316);

  fill(100, 150, 255);
  circle(x1, y1, r * 2);

  fill(100, 255, 150);
  circle(x2, y2, r * 2);

  let d1 = dist(x1, y1, characterX, characterY);
  let d2 = dist(x2, y2, characterX, characterY);

  if (!gameOver) {
    pinchAccuracy = getPinchAccuracy();
    fill(45);
    noStroke();
    textSize(14);
    text(
      "Target " + (targetIndex + 1) + " of " + targets.length +
        " | Pinch accuracy: " + Math.floor(pinchAccuracy) + "%",
      w / 2,
      70
    );
  }

  if (gameWinning) {
    drawResultOverlay("Level Passed!", "Great pinch control! " + pinchAccuracy + "% accuracy.", color(30, 140, 60));
  } else if (gameOver) {
    drawResultOverlay(
      "Try Again",
      pinchAccuracy + "% accuracy. You need " + passAccuracy + "% to pass.",
      color(190, 80, 30)
    );
  } else {
    drawCheckScoreButton();
  }
}

function getPinchAccuracy() {
  const usableDistance = targetRadius + r;
  const firstFingerAccuracy = constrain(100 * (1 - dist(x1, y1, characterX, characterY) / usableDistance), 0, 100);
  const secondFingerAccuracy = constrain(100 * (1 - dist(x2, y2, characterX, characterY) / usableDistance), 0, 100);
  return (firstFingerAccuracy + secondFingerAccuracy) / 2;
}

function drawLevelVillain(x, y) {
  push();
  translate(x, y);
  stroke(42, 35, 74);
  strokeWeight(3);
  strokeJoin(ROUND);

  if (exerciseDifficulty === "Easy") {
    fill(120, 205, 115);
    ellipse(0, -2, 48, 52);
    fill(106, 72, 166);
    triangle(-23, -19, -17, -38, -5, -22);
    triangle(23, -19, 17, -38, 5, -22);
    fill(42, 35, 74);
    circle(-9, -5, 4);
    circle(9, -5, 4);
    noFill();
    arc(0, 3, 13, 8, 0, PI);
    noStroke();
    fill(106, 72, 166);
    triangle(-19, 21, 19, 21, 0, 38);
    fill(255, 205, 65);
    circle(0, 18, 10);
  } else if (exerciseDifficulty === "Normal") {
    fill(92, 60, 150);
    triangle(-29, -5, -20, -43, -5, -24);
    triangle(29, -5, 20, -43, 5, -24);
    fill(95, 210, 124);
    ellipse(0, -3, 50, 54);
    fill(42, 35, 74);
    triangle(-19, -6, -4, -11, -9, 1);
    triangle(19, -6, 4, -11, 9, 1);
    stroke(42, 35, 74);
    line(-10, 9, 10, 9);
    noStroke();
    fill(92, 60, 150);
    beginShape();
    vertex(-24, 18);
    vertex(24, 18);
    vertex(31, 38);
    vertex(0, 31);
    vertex(-31, 38);
    endShape(CLOSE);
    fill(255, 205, 65);
    circle(0, 24, 10);
  } else {
    fill(50, 54, 82);
    beginShape();
    vertex(-33, -8);
    vertex(-26, -31);
    vertex(-10, -24);
    vertex(0, -42);
    vertex(10, -24);
    vertex(26, -31);
    vertex(33, -8);
    vertex(23, 18);
    vertex(0, 27);
    vertex(-23, 18);
    endShape(CLOSE);
    fill(176, 55, 65);
    triangle(-22, -9, -4, -15, -11, 1);
    triangle(22, -9, 4, -15, 11, 1);
    stroke(245, 80, 75);
    strokeWeight(3);
    line(-9, 11, 9, 11);
    noStroke();
    fill(95, 42, 65);
    beginShape();
    vertex(-28, 19);
    vertex(-17, 12);
    vertex(0, 18);
    vertex(17, 12);
    vertex(28, 19);
    vertex(35, 40);
    vertex(0, 32);
    vertex(-35, 40);
    endShape(CLOSE);
    fill(255, 190, 55);
    beginShape();
    vertex(0, 19);
    vertex(8, 26);
    vertex(0, 33);
    vertex(-8, 26);
    endShape(CLOSE);
  }
  pop();
}

function drawLevelHero(x, y) {
  push();
  translate(x, y);
  scale(0.62);
  stroke(35, 40, 65);
  strokeWeight(3);
  strokeJoin(ROUND);

  if (exerciseDifficulty === "Easy") {
    fill(225, 55, 60);
    triangle(-24, -14, 24, -14, 0, 43);
    fill(48, 112, 225);
    rect(0, 10, 38, 42, 9);
    fill(255, 205, 65);
    circle(0, 8, 17);
    fill(255, 202, 158);
    circle(0, -27, 34);
    fill(225, 55, 60);
    arc(0, -29, 36, 19, PI, TWO_PI, CHORD);
    noStroke();
    fill(35, 40, 65);
    circle(-6, -26, 3);
    circle(6, -26, 3);
    fill(255, 205, 65);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(11);
    text("H", 0, 10);
  } else if (exerciseDifficulty === "Normal") {
    fill(26, 165, 185);
    triangle(-24, -14, 24, -14, 0, 43);
    fill(35, 80, 155);
    rect(0, 10, 40, 44, 8);
    fill(255, 205, 65);
    triangle(0, -2, 13, 7, -7, 27);
    triangle(-7, 27, 7, 17, 7, 29);
    fill(255, 202, 158);
    circle(0, -27, 34);
    fill(35, 80, 155);
    rect(0, -27, 37, 10, 5);
    noStroke();
    fill(255);
    circle(-7, -27, 4);
    circle(7, -27, 4);
  } else {
    fill(92, 62, 165);
    triangle(-27, -13, 27, -13, 0, 46);
    fill(40, 48, 105);
    beginShape();
    vertex(-21, -11);
    vertex(21, -11);
    vertex(17, 30);
    vertex(0, 39);
    vertex(-17, 30);
    endShape(CLOSE);
    fill(255, 205, 65);
    beginShape();
    vertex(0, -3);
    vertex(11, 7);
    vertex(7, 22);
    vertex(-7, 22);
    vertex(-11, 7);
    endShape(CLOSE);
    fill(255, 202, 158);
    circle(0, -28, 34);
    fill(40, 48, 105);
    triangle(-20, -27, -13, -46, -3, -31);
    triangle(20, -27, 13, -46, 3, -31);
    rect(0, -25, 34, 8, 4);
    noStroke();
    fill(245, 250, 255);
    circle(-7, -25, 4);
    circle(7, -25, 4);
  }
  pop();
}

function drawCheckScoreButton() {
  const hovering = mouseX > w / 2 - 90 && mouseX < w / 2 + 90 &&
    mouseY > 350 && mouseY < 392;
  rectMode(CENTER);
  noStroke();
  fill(hovering ? color(50, 145, 75) : color(35, 125, 60));
  rect(w / 2, 371, 180, 42, 8);
  fill(255);
  textSize(16);
  text("Check Score", w / 2, 371);
}

function drawResultOverlay(title, message, titleColor) {
  rectMode(CORNER);
  noStroke();
  fill(15, 23, 42, 200);
  rect(0, 0, w, h);

  rectMode(CENTER);
  fill(255);
  rect(w / 2, h / 2, 390, 190, 16);
  fill(titleColor);
  textSize(28);
  text(title, w / 2, h / 2 - 48);
  fill(45);
  textSize(15);
  text(message, w / 2, h / 2 - 8);

  fill(58, 96, 196);
  rect(w / 2, h / 2 + 75, 180, 44, 8);
  fill(255);
  textSize(16);
  text("Try Again", w / 2, h / 2 + 75);
}

function resetExercise() {
  gameOver = false;
  gameWinning = false;
  pinchAccuracy = 0;
  targetIndex = 0;
  targetAccuracies = [];
  setTarget(0);
  drag1 = false;
  drag2 = false;
}

function setTarget(index) {
  characterX = targets[index].x;
  characterY = targets[index].y;
  x1 = r;
  y1 = h / 2;
  x2 = w - r;
  y2 = h / 2;
}
