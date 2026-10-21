
let paintLayer;     // Holds the user's colored brush strokes
let outlineLayer;   // Holds the crisp black line art & background bursts
let maskLayer;      // Hidden hit-detection mask (Green = inside character, Red = outside)

let gameState = "NO_COLOR"; // "NO_COLOR" | "COLOR_SELECTED" | "DRAWING" | "END"
let activeTool = "brush";   // "brush" | "eraser"
let selectedColor = null;
let brushSize = 18;

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

function setup() {
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
  text("COLOR IN THE LINES!", BOARD.x + BOARD.w / 2, 26);
  pop();

  // 2. Feedback Banner
  drawFeedbackBanner();

  // 3. Handle painting if mouse is held inside the drawing board
  if (mouseIsPressed && gameState !== "END") {
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
    paintLayer.strokeWeight(brushSize + 6);
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

function resetExercise() {
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
  const accuracy = total > 0 ? Math.round((insideStrokeCount / total) * 100) : 100;

  push();
  fill(45);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(13);
  textStyle(BOLD);
  text("Accuracy: " + accuracy + "%", 685, 265);
  textStyle(NORMAL);
  textSize(11);
  fill(90);
  text("In lines: " + insideStrokeCount, 685, 285);
  text("Outside: " + outsideStrokeCount, 685, 302);

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
  const accuracy = total > 0 ? Math.round((insideStrokeCount / total) * 100) : 0;

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
  text("Exercise Complete!", width / 2, height / 2 - 70);

  textSize(18);
  if (total === 0) {
    fill(180, 60, 60);
    text("You didn't color anything yet!", width / 2, height / 2 - 20);
  } else if (accuracy >= 80) {
    fill(30, 140, 60);
    text("Amazing Job! " + accuracy + "% Inside the Lines!", width / 2, height / 2 - 20);
  } else {
    fill(200, 110, 20);
    text("Good Try! " + accuracy + "% Inside the Lines.", width / 2, height / 2 - 20);
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
  text("Color Again", width / 2, height / 2 + 75);
  pop();
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
}

function drawHeroShapes(pg, cx, cy, mode) {
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