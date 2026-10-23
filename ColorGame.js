
let paintLayer;     // Holds the user's colored brush strokes
let outlineLayer;   // Holds the crisp black line art & background bursts
let maskLayer;      // Hidden hit-detection mask (Green = inside character, Red = outside)

let gameState = "NO_COLOR"; // "NO_COLOR" | "COLOR_SELECTED" | "DRAWING" | "END"
let activeTool = "brush";   // "brush" | "eraser"
let selectedColor = null;
let brushSize = 18;
let exerciseDifficulty = "Normal";
let passedExercise = false;
let passAccuracy = 85;
const DIFFICULTY_SETTINGS = {
  Easy: { brushSize: 28, passAccuracy: 70 },
  Normal: { brushSize: 18, passAccuracy: 85 },
  Hard: { brushSize: 10, passAccuracy: 95 }
};
let draggingSizeSlider = false;

let feedbackMessage = "Select a color on the left to begin!";
let feedbackType = "neutral"; // "neutral" | "positive" | "negative"
let insideStrokeCount = 0;
let outsideStrokeCount = 0;

// Drawing board dimensions
const BOARD = {
  x: 135,
  y: 65,
  w: 480,
  h: 410
};

// 7 Rainbow Palette Circles on the Left
const PALETTE = [
  { name: "Red",    hex: "#FF0000", x: 70, y: 95,  r: 25 },
  { name: "Orange", hex: "#FF8800", x: 70, y: 153, r: 25 },
  { name: "Yellow", hex: "#FFFF00", x: 70, y: 211, r: 25 },
  { name: "Green",  hex: "#00EE00", x: 70, y: 269, r: 25 },
  { name: "Blue",   hex: "#0022FF", x: 70, y: 327, r: 25 },
  { name: "Purple", hex: "#8800FF", x: 70, y: 385, r: 25 },
  { name: "Pink",   hex: "#FF00FF", x: 70, y: 443, r: 25 }
];

// Brush & Eraser Circular Buttons on the Right
const TOOLS = [
  { type: "brush",  label: "Brush",  x: 685, y: 115, r: 32 },
  { type: "eraser", label: "Eraser", x: 685, y: 195, r: 32 }
];

const FINISH_BTN = { x: 685, y: 435, w: 120, h: 42 };
const CLEAR_BTN  = { x: 685, y: 380, w: 120, h: 38 };
const SIZE_SLIDER = { x: 635, y: 345, w: 100, min: 4, max: 50 };

function setup() {
  exerciseDifficulty = window.exerciseDifficulty || "Normal";
  const difficultySettings = DIFFICULTY_SETTINGS[exerciseDifficulty];
  brushSize = difficultySettings.brushSize;
  passAccuracy = difficultySettings.passAccuracy;
  feedbackMessage = exerciseDifficulty === "Easy"
    ? "Easy: Color the superhero and lightning emblem."
    : exerciseDifficulty === "Normal"
      ? "Medium: Color Batman's cowl, cape, and utility belt."
      : "Hard: Color Spider-Man's mask and web-pattern suit.";

  let cnv = createCanvas(800, 500);
  if (cnv && cnv.elt) {
    cnv.elt.setAttribute("tabindex", "0");
  }

  paintLayer = createGraphics(BOARD.w, BOARD.h);
  paintLayer.clear();

  outlineLayer = createGraphics(BOARD.w, BOARD.h);
  maskLayer = createGraphics(BOARD.w, BOARD.h);
  maskLayer.pixelDensity(1);

  buildSuperheroArtwork();
}

function draw() {
  background(246, 247, 251);

  // 1. Header Title
  push();
  fill(20);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(22);
  text("COLOR IN THE LINES - " + exerciseDifficulty.toUpperCase(), BOARD.x + BOARD.w / 2, 26);
  pop();

  // 2. Feedback Banner
  drawFeedbackBanner();

  // 3. Keep slider drags separate from painting, even outside the slider.
  if (draggingSizeSlider && gameState !== "END") {
    updateBrushSize();
  } else if (mouseIsPressed && gameState !== "END") {
    handleBoardPainting();
  }

  // 4. Render Drawing Board (White base -> User Paint -> Crisp Line Art on top)
  push();
  stroke(90);
  strokeWeight(2);
  fill(255);
  rectMode(CORNER);
  rect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 12);

  image(paintLayer, BOARD.x, BOARD.y);
  image(outlineLayer, BOARD.x, BOARD.y);

  noFill();
  stroke(80);
  strokeWeight(2.5);
  rect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 12);
  pop();

  // 5. Draw Left Color Palette & Right Tool Buttons
  drawPaletteUI();
  drawToolsUI();
  drawStateTrackerUI();

  // 6. Custom Brush Cursor Preview
  if (isInsideBoard(mouseX, mouseY) && gameState !== "END") {
    push();
    noFill();
    stroke(activeTool === "eraser" ? 80 : 0);
    strokeWeight(1.5);
    circle(mouseX, mouseY, brushSize);
    pop();
  }

  // 7. End Screen Modal Overlay
  if (gameState === "END") {
    drawEndOverlay();
  }
}

function handleBoardPainting() {
  if (!isInsideBoard(mouseX, mouseY)) return;

  const lx = mouseX - BOARD.x;
  const ly = mouseY - BOARD.y;
  const plx = constrain(pmouseX - BOARD.x, 0, BOARD.w);
  const ply = constrain(pmouseY - BOARD.y, 0, BOARD.h);

  if (activeTool === "eraser") {
    paintLayer.erase();
    paintLayer.strokeWeight(brushSize);
    paintLayer.strokeCap(ROUND);
    paintLayer.line(plx, ply, lx, ly);
    paintLayer.noErase();

    feedbackType = "neutral";
    feedbackMessage = "Erasing strokes... Pick a color or switch to Brush to draw!";
    return;
  }

  if (!selectedColor || gameState === "NO_COLOR") {
    feedbackType = "negative";
    feedbackMessage = "Pick a color from the left palette first!";
    return;
  }

  gameState = "DRAWING";

  paintLayer.stroke(selectedColor);
  paintLayer.strokeWeight(brushSize);
  paintLayer.strokeCap(ROUND);
  paintLayer.line(plx, ply, lx, ly);

  const maskColor = maskLayer.get(Math.floor(lx), Math.floor(ly));
  const isInsideCharacter = maskColor[1] > 200 && maskColor[0] < 50;
  const isOutsideLines = maskColor[0] > 200 && maskColor[1] < 50;

  if (isOutsideLines) {
    outsideStrokeCount++;
    feedbackType = "negative";
    feedbackMessage = "Oops! Try to stay inside the superhero lines!";
  } else if (isInsideCharacter) {
    insideStrokeCount++;
    feedbackType = "positive";
    feedbackMessage = "Great job! You are coloring right inside the lines!";
  }
}

function mousePressed() {
  if (gameState === "END") {
    if (dist(mouseX, mouseY, width / 2, height / 2 + 75) < 80) {
      resetExercise();
    }
    return;
  }

  if (
    mouseX >= SIZE_SLIDER.x - 10 &&
    mouseX <= SIZE_SLIDER.x + SIZE_SLIDER.w + 10 &&
    Math.abs(mouseY - SIZE_SLIDER.y) <= 12
  ) {
    draggingSizeSlider = true;
    updateBrushSize();
    return;
  }

  for (const swatch of PALETTE) {
    if (dist(mouseX, mouseY, swatch.x, swatch.y) <= swatch.r) {
      selectedColor = swatch.hex;
      activeTool = "brush";
      gameState = "COLOR_SELECTED";
      feedbackType = "neutral";
      feedbackMessage = swatch.name + " selected! Now color inside the superhero lines.";
      return;
    }
  }

  for (const tool of TOOLS) {
    if (dist(mouseX, mouseY, tool.x, tool.y) <= tool.r) {
      activeTool = tool.type;
      if (tool.type === "eraser") {
        gameState = selectedColor ? "COLOR_SELECTED" : "NO_COLOR";
        feedbackType = "neutral";
        feedbackMessage = "Eraser active. Scrub over any paint outside the lines!";
      } else {
        feedbackType = "neutral";
        feedbackMessage = selectedColor
          ? "Brush active! Keep coloring inside the lines."
          : "Brush active! Select a color on the left first.";
      }
      return;
    }
  }

  if (
    mouseX > CLEAR_BTN.x - CLEAR_BTN.w / 2 &&
    mouseX < CLEAR_BTN.x + CLEAR_BTN.w / 2 &&
    mouseY > CLEAR_BTN.y - CLEAR_BTN.h / 2 &&
    mouseY < CLEAR_BTN.y + CLEAR_BTN.h / 2
  ) {
    resetExercise();
    return;
  }

  if (
    mouseX > FINISH_BTN.x - FINISH_BTN.w / 2 &&
    mouseX < FINISH_BTN.x + FINISH_BTN.w / 2 &&
    mouseY > FINISH_BTN.y - FINISH_BTN.h / 2 &&
    mouseY < FINISH_BTN.y + FINISH_BTN.h / 2
  ) {
    gameState = "END";
    return;
  }
}

function mouseReleased() {
  draggingSizeSlider = false;
}

function updateBrushSize() {
  const position = constrain((mouseX - SIZE_SLIDER.x) / SIZE_SLIDER.w, 0, 1);
  brushSize = Math.round(SIZE_SLIDER.min + position * (SIZE_SLIDER.max - SIZE_SLIDER.min));
}

function resetExercise() {
  draggingSizeSlider = false;
  paintLayer.clear();
  insideStrokeCount = 0;
  outsideStrokeCount = 0;
  selectedColor = null;
  activeTool = "brush";
  gameState = "NO_COLOR";
  feedbackType = "neutral";
  feedbackMessage = "Canvas cleared! Select a color on the left to start.";
}

function drawFeedbackBanner() {
  push();
  rectMode(CENTER);
  const cx = BOARD.x + BOARD.w / 2;
  const cy = 49;

  if (feedbackType === "positive") {
    fill(212, 245, 223);
    stroke(40, 167, 69);
  } else if (feedbackType === "negative") {
    fill(253, 217, 215);
    stroke(220, 53, 69);
  } else {
    fill(232, 236, 245);
    stroke(160, 172, 195);
  }

  strokeWeight(1.5);
  rect(cx, cy, BOARD.w, 24, 6);

  noStroke();
  if (feedbackType === "positive") fill(21, 115, 50);
  else if (feedbackType === "negative") fill(176, 32, 48);
  else fill(55, 65, 85);

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(13);
  text(feedbackMessage, cx, cy);
  pop();
}

function drawPaletteUI() {
  for (const swatch of PALETTE) {
    const isSelected = selectedColor === swatch.hex && activeTool === "brush";
    const isHovered = dist(mouseX, mouseY, swatch.x, swatch.y) <= swatch.r;

    push();
    if (isSelected) {
      stroke(20);
      strokeWeight(4);
      circle(swatch.x, swatch.y, swatch.r * 2 + 6);
    } else {
      stroke(40);
      strokeWeight(isHovered ? 2.5 : 1.5);
    }
    fill(swatch.hex);
    circle(swatch.x, swatch.y, swatch.r * 2);
    pop();
  }
}

function drawToolsUI() {
  for (const tool of TOOLS) {
    const isSelected = activeTool === tool.type;
    const isHovered = dist(mouseX, mouseY, tool.x, tool.y) <= tool.r;

    push();
    fill(isSelected ? 225 : 255);
    stroke(isSelected ? 20 : 70);
    strokeWeight(isSelected ? 3 : isHovered ? 2 : 1.5);
    circle(tool.x, tool.y, tool.r * 2);

    translate(tool.x, tool.y);
    if (tool.type === "brush") {
      rotate(-PI / 4);
      noStroke();
      fill(20);
      rectMode(CENTER);
      rect(0, 8, 6, 22, 2);
      fill(120);
      rect(0, -5, 7, 5);
      fill(selectedColor ? selectedColor : "#111111");
      stroke(20);
      strokeWeight(1);
      beginShape();
      vertex(-4, -7);
      vertex(4, -7);
      vertex(5, -15);
      vertex(0, -21);
      vertex(-5, -15);
      endShape(CLOSE);
    } else {
      rotate(-PI / 4);
      rectMode(CENTER);
      stroke(20);
      strokeWeight(2);
      fill(255);
      rect(0, 0, 16, 26, 3);
      fill(20);
      rect(0, 5, 16, 12);
    }
    pop();
  }

  const total = insideStrokeCount + outsideStrokeCount;
  const accuracy = getColoringAccuracy();

  push();
  fill(45);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(13);
  textStyle(BOLD);
  text("Accuracy: " + accuracy + "%", 685, 265);
  textSize(10);
  text(passAccuracy + "% required to pass", 685, 250);
  textStyle(NORMAL);
  textSize(11);
  fill(90);
  text("In lines: " + insideStrokeCount, 685, 285);
  text("Outside: " + outsideStrokeCount, 685, 302);

  textStyle(BOLD);
  fill(45);
  text("Thickness: " + brushSize + " px", 685, 325);
  const sizeKnobX = map(brushSize, SIZE_SLIDER.min, SIZE_SLIDER.max,
    SIZE_SLIDER.x, SIZE_SLIDER.x + SIZE_SLIDER.w);
  stroke(180);
  strokeWeight(6);
  line(SIZE_SLIDER.x, SIZE_SLIDER.y, SIZE_SLIDER.x + SIZE_SLIDER.w, SIZE_SLIDER.y);
  stroke("#3B82F6");
  line(SIZE_SLIDER.x, SIZE_SLIDER.y, sizeKnobX, SIZE_SLIDER.y);
  fill(255);
  stroke(draggingSizeSlider ? 20 : "#3B82F6");
  strokeWeight(2);
  circle(sizeKnobX, SIZE_SLIDER.y, 16);

  rectMode(CENTER);
  const hoverClear =
    mouseX > CLEAR_BTN.x - CLEAR_BTN.w / 2 &&
    mouseX < CLEAR_BTN.x + CLEAR_BTN.w / 2 &&
    mouseY > CLEAR_BTN.y - CLEAR_BTN.h / 2 &&
    mouseY < CLEAR_BTN.y + CLEAR_BTN.h / 2;
  fill(hoverClear ? 230 : 245);
  stroke(100);
  strokeWeight(1.5);
  rect(CLEAR_BTN.x, CLEAR_BTN.y, CLEAR_BTN.w, CLEAR_BTN.h, 8);
  noStroke();
  fill(40);
  textSize(14);
  textStyle(BOLD);
  text("Clear / Reset", CLEAR_BTN.x, CLEAR_BTN.y);

  const hoverFinish =
    mouseX > FINISH_BTN.x - FINISH_BTN.w / 2 &&
    mouseX < FINISH_BTN.x + FINISH_BTN.w / 2 &&
    mouseY > FINISH_BTN.y - FINISH_BTN.h / 2 &&
    mouseY < FINISH_BTN.y + FINISH_BTN.h / 2;
  fill(hoverFinish ? "#32CD32" : "#28A745");
  stroke(25, 110, 45);
  strokeWeight(1.5);
  rect(FINISH_BTN.x, FINISH_BTN.y, FINISH_BTN.w, FINISH_BTN.h, 8);
  noStroke();
  fill(255);
  textSize(14);
  text("Complete!", FINISH_BTN.x, FINISH_BTN.y);
  pop();
}

function drawStateTrackerUI() {
  push();
  fill(100);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(11);
  text("State: " + gameState, 685, 475);
  pop();
}

function drawEndOverlay() {
  const total = insideStrokeCount + outsideStrokeCount;
  const accuracy = getColoringAccuracy();
  passedExercise = total > 0 && (insideStrokeCount / total) * 100 >= passAccuracy;

  push();
  fill(15, 23, 42, 190);
  rectMode(CORNER);
  rect(0, 0, width, height);

  rectMode(CENTER);
  fill(255);
  stroke(40);
  strokeWeight(3);
  rect(width / 2, height / 2, 420, 250, 16);

  noStroke();
  fill(25);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(28);
  text(passedExercise ? "Level Passed!" : "Try Again", width / 2, height / 2 - 70);

  textSize(18);
  if (total === 0) {
    fill(180, 60, 60);
    text("You didn't color anything yet!", width / 2, height / 2 - 20);
  } else if (passedExercise) {
    fill(30, 140, 60);
    text("Great job! " + accuracy + "% accuracy.", width / 2, height / 2 - 20);
  } else {
    fill(200, 110, 20);
    text(
      accuracy + "% accuracy. You need " + passAccuracy + "% to pass.",
      width / 2,
      height / 2 - 20
    );
  }

  fill(90);
  textStyle(NORMAL);
  textSize(14);
  text(
    "Inside strokes: " + insideStrokeCount + "   |   Outside strokes: " + outsideStrokeCount,
    width / 2,
    height / 2 + 18
  );

  fill("#3B82F6");
  rect(width / 2, height / 2 + 75, 160, 44, 10);
  fill(255);
  textStyle(BOLD);
  textSize(16);
  text("Try Again", width / 2, height / 2 + 75);
  pop();
}

function getColoringAccuracy() {
  const total = insideStrokeCount + outsideStrokeCount;
  return total > 0 ? Math.floor((insideStrokeCount / total) * 100) : 0;
}

function isInsideBoard(x, y) {
  return (
    x >= BOARD.x &&
    x <= BOARD.x + BOARD.w &&
    y >= BOARD.y &&
    y <= BOARD.y + BOARD.h
  );
}

// ============================================================================
// SUPERHERO LINE ART & HIDDEN HITMASK GENERATOR (p5 v2.3 Compatible)
// ============================================================================
function buildSuperheroArtwork() {
  const cx = BOARD.w / 2;
  const cy = BOARD.h / 2 + 15;

  // 1. Setup Mask Layer: Red = OUTSIDE lines, Green = INSIDE superhero lines
  maskLayer.background(255, 0, 0);

  // 2. Setup Outline Layer: Radial comic burst lines in the background
  outlineLayer.clear();
  outlineLayer.stroke(140);
  outlineLayer.strokeWeight(1.5);
  for (let angle = 0; angle < TWO_PI; angle += PI / 8) {
    outlineLayer.line(cx, cy - 20, cx + cos(angle) * 360, cy - 20 + sin(angle) * 360);
  }

  // Populate the Green Hitmask Layer
  drawHeroShapes(maskLayer, cx, cy, "mask");

  // Knock out the radial lines behind the superhero on the outline layer
  outlineLayer.erase();
  drawHeroShapes(outlineLayer, cx, cy, "erase");
  outlineLayer.noErase();

  // Draw the crisp black outlines on top
  drawHeroShapes(outlineLayer, cx, cy, "outline");
  drawDifficultyDetails(outlineLayer, cx, cy, "outline");
}

function drawDifficultyDetails(pg, cx, cy, mode) {
  if (exerciseDifficulty !== "Easy") return;
  pg.push();
  pg.noFill();
  pg.stroke(15);
  pg.strokeWeight(2.5);
  heroPolygon(pg, cx, cy, [[-15,-12],[2,-12],[-4,1],[14,1],[-8,22],[-2,7],[-18,7]]);
  pg.pop();
}

function drawHeroShapes(pg, cx, cy, mode) {
  if (exerciseDifficulty === "Normal") {
    drawBatmanShapes(pg, cx, cy, mode);
    return;
  }
  if (exerciseDifficulty === "Hard") {
    drawSpiderManShapes(pg, cx, cy, mode);
    return;
  }

  pg.push();
  if (mode === "mask") {
    pg.fill(0, 255, 0);
    pg.stroke(0, 255, 0);
    pg.strokeWeight(2);
  } else if (mode === "erase") {
    pg.fill(255);
    pg.stroke(255);
    pg.strokeWeight(2);
  } else {
    pg.noFill();
    pg.stroke(15);
    pg.strokeWeight(3.5);
    pg.strokeJoin(ROUND);
    pg.strokeCap(ROUND);
  }

  // 1. Cape
  pg.beginShape();
  pg.vertex(cx - 32, cy - 38);
  pg.vertex(cx - 85, cy + 25);
  pg.vertex(cx - 112, cy + 125);
  pg.vertex(cx - 65, cy + 118);
  pg.vertex(cx, cy + 128);
  pg.vertex(cx + 65, cy + 118);
  pg.vertex(cx + 112, cy + 125);
  pg.vertex(cx + 85, cy + 25);
  pg.vertex(cx + 32, cy - 38);
  pg.endShape(CLOSE);

  // 2. Left Arm (Hand on Hip)
  pg.beginShape();
  pg.vertex(cx - 34, cy - 32);
  pg.vertex(cx - 72, cy + 2);
  pg.vertex(cx - 42, cy + 36);
  pg.vertex(cx - 32, cy + 24);
  pg.vertex(cx - 52, cy + 2);
  pg.vertex(cx - 28, cy - 16);
  pg.endShape(CLOSE);

  // 3. Right Arm (Raised Fist)
  pg.beginShape();
  pg.vertex(cx + 32, cy - 34);
  pg.vertex(cx + 78, cy - 92);
  pg.vertex(cx + 96, cy - 76);
  pg.vertex(cx + 44, cy - 12);
  pg.endShape(CLOSE);
  pg.circle(cx + 92, cy - 92, 34);

  // 4. Legs & Boots
  pg.rectMode(CENTER);
  pg.rect(cx - 24, cy + 90, 28, 60, 4);
  pg.beginShape();
  pg.vertex(cx - 40, cy + 110);
  pg.vertex(cx - 8, cy + 110);
  pg.vertex(cx - 8, cy + 165);
  pg.vertex(cx - 52, cy + 165);
  pg.vertex(cx - 52, cy + 148);
  pg.vertex(cx - 40, cy + 145);
  pg.endShape(CLOSE);

  pg.rect(cx + 24, cy + 90, 28, 60, 4);
  pg.beginShape();
  pg.vertex(cx + 8, cy + 110);
  pg.vertex(cx + 40, cy + 110);
  pg.vertex(cx + 40, cy + 145);
  pg.vertex(cx + 52, cy + 148);
  pg.vertex(cx + 52, cy + 165);
  pg.vertex(cx + 8, cy + 165);
  pg.endShape(CLOSE);

  // 5. Torso, Belt, Shield
  pg.beginShape();
  pg.vertex(cx - 38, cy - 36);
  pg.vertex(cx + 38, cy - 36);
  pg.vertex(cx + 34, cy + 58);
  pg.vertex(cx - 34, cy + 58);
  pg.endShape(CLOSE);

  pg.rect(cx, cy + 46, 72, 16, 3);
  pg.rect(cx, cy + 46, 22, 20, 3);

  pg.beginShape();
  pg.vertex(cx - 18, cy - 16);
  pg.vertex(cx + 18, cy - 16);
  pg.vertex(cx + 26, cy - 2);
  pg.vertex(cx, cy + 24);
  pg.vertex(cx - 26, cy - 2);
  pg.endShape(CLOSE);

  // 6. Cape Clasp, Ears & Head
  pg.ellipse(cx - 10, cy - 38, 16, 10);
  pg.ellipse(cx + 10, cy - 38, 16, 10);
  pg.circle(cx - 56, cy - 95, 20);
  pg.circle(cx + 56, cy - 95, 20);
  pg.circle(cx, cy - 98, 108);

  // 7. Spiky Hair Crown
  pg.beginShape();
  pg.vertex(cx - 54, cy - 108);
  pg.vertex(cx - 58, cy - 138);
  pg.vertex(cx - 36, cy - 160);
  pg.vertex(cx - 18, cy - 154);
  pg.vertex(cx - 10, cy - 172);
  pg.vertex(cx + 8, cy - 158);
  pg.vertex(cx + 25, cy - 170);
  pg.vertex(cx + 36, cy - 152);
  pg.vertex(cx + 56, cy - 142);
  pg.vertex(cx + 54, cy - 108);
  pg.vertex(cx + 22, cy - 122);
  pg.vertex(cx - 22, cy - 122);
  pg.endShape(CLOSE);

  // 8. Face Details (Only drawn on the visible outline layer)
  if (mode === "outline") {
    // Domino Mask
    pg.rect(cx, cy - 95, 88, 34, 16);

    // Eyes
    pg.fill(15);
    pg.ellipse(cx - 21, cy - 95, 14, 18);
    pg.ellipse(cx + 21, cy - 95, 14, 18);
    pg.fill(255);
    pg.noStroke();
    pg.circle(cx - 24, cy - 99, 5);
    pg.circle(cx + 18, cy - 99, 5);

    // Smile
    pg.stroke(15);
    pg.strokeWeight(3);
    pg.noFill();
    pg.arc(cx, cy - 68, 28, 18, 0.15, PI - 0.15, CHORD);
  }

  pg.pop();
}

// Use the same closed silhouettes for artwork, background knockout, and scoring.
function heroPolygon(pg, cx, cy, points, knockout = false) {
  if (knockout) {
    // Remove hidden cape lines without covering the user's paint underneath.
    pg.push();
    pg.erase();
    pg.fill(255);
    heroPolygon(pg, cx, cy, points);
    pg.noErase();
    pg.pop();
  }
  pg.beginShape();
  for (const [x, y] of points) pg.vertex(cx + x, cy + y);
  pg.endShape(CLOSE);
}

function setHeroDrawingStyle(pg, mode) {
  pg.strokeJoin(ROUND);
  pg.strokeCap(ROUND);
  pg.strokeWeight(mode === "outline" ? 3 : 2);
  if (mode === "outline") {
    pg.noFill();
    pg.stroke(15);
  } else {
    pg.fill(mode === "mask" ? "#00FF00" : "#FFFFFF");
    pg.stroke(mode === "mask" ? "#00FF00" : "#FFFFFF");
  }
}

function drawBatmanShapes(pg, cx, cy, mode) {
  pg.push();
  setHeroDrawingStyle(pg, mode);
  const shape = points => heroPolygon(pg, cx, cy, points, mode === "outline");
  // Scalloped cape, with generous regions for medium difficulty.
  pg.beginShape();
  pg.vertex(cx - 36, cy - 40);
  pg.bezierVertex(cx - 87, cy - 22, cx - 100, cy + 70, cx - 123, cy + 133);
  pg.bezierVertex(cx - 95, cy + 113, cx - 77, cy + 117, cx - 64, cy + 142);
  pg.bezierVertex(cx - 43, cy + 119, cx - 20, cy + 121, cx, cy + 145);
  pg.bezierVertex(cx + 20, cy + 121, cx + 43, cy + 119, cx + 64, cy + 142);
  pg.bezierVertex(cx + 77, cy + 117, cx + 95, cy + 113, cx + 123, cy + 133);
  pg.bezierVertex(cx + 100, cy + 70, cx + 87, cy - 22, cx + 36, cy - 40);
  pg.endShape(CLOSE);

  // Share the arm boundary with the gauntlet lines so their ends meet exactly.
  const arm = [[38,-36],[64,-20],[78,40],[63,57],[48,43],[39,4]];
  for (const side of [-1, 1]) {
    shape(arm.map(([x,y]) => [side*x,y]));
    shape([[side*4,58],[side*34,58],[side*36,112],
      [side*44,146],[side*54,153],[side*54,165],[side*7,165],[side*7,112]]);
  }
  shape([[-38,-40],[38,-40],[33,58],[-33,58]]);
  shape([[-19,-57],[19,-57],[20,-40],[-20,-40]]);
  // Tall pointed ears and a squared jaw make the cowl unmistakable.
  shape([[-44,-111],[-43,-171],[-23,-145],[23,-145],
    [43,-171],[44,-111],[37,-77],[22,-57],[-22,-57],[-37,-77]]);

  if (mode === "outline") {
    pg.strokeWeight(2.2);
    heroPolygon(pg, cx, cy, [[-33,-114],[-8,-107],[-15,-100],[-30,-102]]);
    heroPolygon(pg, cx, cy, [[33,-114],[8,-107],[15,-100],[30,-102]]);
    heroPolygon(pg, cx, cy, [[-28,-86],[-10,-91],[0,-84],[10,-91],[28,-86],
      [22,-65],[-22,-65]]);
    pg.line(cx-10, cy-74, cx+10, cy-74);
    pg.ellipse(cx, cy-7, 63, 34);
    heroPolygon(pg, cx, cy, [[-27,-14],[-17,-10],[-10,-12],[-6,-19],[-3,-14],
      [3,-14],[6,-19],[10,-12],[17,-10],[27,-14],[22,-2],[15,-4],
      [9,1],[4,0],[0,7],[-4,0],[-9,1],[-15,-4],[-22,-2]]);
    pg.rectMode(CENTER);
    pg.rect(cx, cy+44, 66, 15, 2);
    pg.rect(cx, cy+44, 16, 17, 2);
    for (const side of [-1,1]) {
      pg.rect(cx+side*22, cy+44, 10, 10, 1);
      pg.line(cx+side*7, cy+111, cx+side*36, cy+111);
      const armBoundary = arm.map(([x,y]) => [side*x,y]);
      drawWebCrossLine(pg, cx, cy, armBoundary, [side*47,16], [side*25,-5]);
      drawWebCrossLine(pg, cx, cy, armBoundary, [side*50,27], [side*25,-5]);
    }
  }
  pg.pop();
}

function drawSpiderManShapes(pg, cx, cy, mode) {
  pg.push();
  setHeroDrawingStyle(pg, mode);
  // Full mask, connected neck, and a raised web-shooting arm; no cape or belt.
  const leftArm = [[-34,-38],[-58,-20],[-96,37],[-91,55],[-77,59],[-63,42],[-40,8]];
  const rightArm = [[34,-38],[61,-68],[86,-105],[103,-94],[80,-49],[41,7]];
  heroPolygon(pg, cx, cy, leftArm);
  heroPolygon(pg, cx, cy, rightArm);
  heroPolygon(pg, cx, cy, [[86,-105],[84,-121],[89,-141],[96,-139],
    [94,-122],[99,-122],[105,-137],[111,-133],[106,-113],[110,-101],[103,-94]]);
  for (const side of [-1,1]) {
    heroPolygon(pg, cx, cy, [[side*3,57],[side*30,57],[side*34,111],
      [side*39,145],[side*51,153],[side*51,164],[side*7,164],[side*6,111]]);
  }
  heroPolygon(pg, cx, cy, [[-34,-38],[34,-38],[30,57],[0,68],[-30,57]]);
  heroPolygon(pg, cx, cy, [[-17,-58],[17,-58],[18,-38],[-18,-38]]);
  pg.ellipse(cx, cy-107, 83, 100);

  if (mode === "outline") {
    pg.strokeWeight(1.4);
    // Elliptical rings and spokes stay inside the mask silhouette.
    for (let i=0; i<12; i++) {
      const angle = i * TWO_PI / 12;
      pg.line(cx, cy-107, cx+41*cos(angle), cy-107+49*sin(angle));
    }
    for (const size of [0.35, 0.65]) pg.ellipse(cx, cy-107, 83*size, 100*size);

    // Clear web lines under each eye lens, leaving the paint layer visible.
    const eye = [[8,-109],[33,-130],[30,-108],[22,-91],[12,-94]];
    for (const side of [-1,1]) {
      const lens = eye.map(([x,y]) => [side*x,y]);
      pg.erase();
      pg.fill(255);
      heroPolygon(pg, cx, cy, lens);
      pg.noErase();
      pg.noFill();
      pg.stroke(15);
      pg.strokeWeight(3);
      heroPolygon(pg, cx, cy, lens);
    }

    pg.strokeWeight(1.4);
    // Construct each web section against the same edges as its suit region.
    for (const side of [-1,1]) {
      const panel = [[18,-38],[34,-38],[30,57],[15,62.5]]
        .map(([x,y]) => [side*x,y]);
      pg.line(cx+side*18, cy-38, cx+side*15, cy+62.5);
      drawWebCrossLine(pg, cx, cy, panel, [side*26,-38], [-side,95]);
      for (const y of [-24,-8,8,24,40]) {
        drawWebCrossLine(pg, cx, cy, panel, [0,y], [side*15,3]);
      }
      const boot = [[6,108],[33.78,108],[39,145],[51,153],[51,164],[7,164]]
        .map(([x,y]) => [side*x,y]);
      pg.line(cx+side*6, cy+108, cx+side*33.78, cy+108);
      drawWebCrossLine(pg, cx, cy, boot, [side*20,108], [side*3,56]);
      for (const y of [122,136,150]) {
        drawWebCrossLine(pg, cx, cy, boot, [0,y], [side*28,3]);
      }
    }
    for (let i=0; i<4; i++) {
      drawWebCrossLine(pg, cx, cy, leftArm, [-58-i*8,-17+i*13], [16,15]);
      drawWebCrossLine(pg, cx, cy, rightArm, [49+i*10,-54-i*13], [16,16-i]);
    }
    // Eight-legged spider emblem centered on the chest.
    pg.strokeWeight(2.3);
    pg.ellipse(cx, cy-12, 8, 10);
    pg.ellipse(cx, cy+1, 11, 18);
    for (const side of [-1,1]) {
      for (let i=0; i<4; i++) {
        const y = -12+i*6;
        pg.line(cx+side*4,cy+y,cx+side*11,cy+y+(i<2?-7:7));
        pg.line(cx+side*11,cy+y+(i<2?-7:7),cx+side*13,cy+y+(i<2?-14:14));
      }
    }
  }
  pg.pop();
}

// Intersect a web line with its closed panel so both ends meet the outline.
function drawWebCrossLine(pg, cx, cy, polygon, origin, direction) {
  const cross = (a, b) => a[0]*b[1] - a[1]*b[0];
  const hits = [];
  for (let i=0; i<polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i+1) % polygon.length];
    const edge = [b[0]-a[0], b[1]-a[1]];
    const offset = [a[0]-origin[0], a[1]-origin[1]];
    const denominator = cross(direction, edge);
    if (Math.abs(denominator) < 0.000001) continue;
    const t = cross(offset, edge) / denominator;
    const u = cross(offset, direction) / denominator;
    if (u >= 0 && u <= 1) hits.push(t);
  }
  hits.sort((a,b) => a-b);
  const unique = hits.filter((t,i) => i === 0 || Math.abs(t-hits[i-1]) > 0.000001);
  for (let i=0; i+1<unique.length; i+=2) {
    pg.line(cx+origin[0]+unique[i]*direction[0], cy+origin[1]+unique[i]*direction[1],
      cx+origin[0]+unique[i+1]*direction[0], cy+origin[1]+unique[i+1]*direction[1]);
  }
}
