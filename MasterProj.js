let currentScreen = "menu";
let clickUsed = false;
let settings = {
  name: "",
  sound: true,
  volume: 100,
  difficulty: "Normal", 
  hapticFeedback: true
};

let nameInputFocused = false;
const nameInput = {
  x: 430,
  y: 115,
  w: 200,
  h: 38
};

function setup() {
  let cnv = createCanvas(800, 500);
  cnv.elt.setAttribute("tabindex", "0");
  cnv.elt.focus();

  textAlign(CENTER, CENTER);
  rectMode(CENTER);

  // Native keyboard listener so typing and holding Backspace work reliably
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && currentScreen !== "menu") {
      currentScreen = "menu";
      nameInputFocused = false;
      return;
    }

    if (currentScreen !== "settings" || !nameInputFocused) {
      return;
    }

    if (e.key === "Backspace" || e.key === "Delete" || e.keyCode === 8) {
      e.preventDefault();
      settings.name = settings.name.slice(0, -1);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      nameInputFocused = false;
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && settings.name.length < 24) {
      e.preventDefault();
      settings.name += e.key;
    }
  });
}

function draw() {
  if (currentScreen === "menu") {
    drawMenu();
  } else if (currentScreen === "selection") {
    drawSelection();
  } else if (currentScreen === "game1") {
    drawGameScreen("Catch the Stars", color(34, 92, 64));
  } else if (currentScreen === "game2") {
    drawGameScreen("Maze Runner", color(32, 78, 110));
  } else if (currentScreen === "game3") {
    drawGameScreen("Target Toss", color(110, 62, 42));
  } else if (currentScreen === "character") {
    drawCharacter();
  } else if (currentScreen === "settings") {
    drawSettings();
  }

  if (!mouseIsPressed) {
    clickUsed = false;
  }
}

function drawMenu() {
  background(28, 36, 52);

  push();
  translate(width / 2, height / 2);
  noStroke();
  fill(45, 58, 82);
  rect(0, 0, width - 40, height - 40, 16);
  pop();

  push();
  translate(width / 2, 90);
  fill(245);
  textSize(36);
  let displayName = settings.name.trim() !== "" ? settings.name : "Player";
  text("Welcome back, " + displayName + "!", 0, 0);
  pop();

  push();
  translate(width / 2, 140);
  textSize(16);
  fill(180, 195, 220);
  text("Choose where to go", 0, 0);
  pop();

  drawUIButton(width / 2, 220, 220, 50, "Start", "selection");
  drawUIButton(width / 2, 290, 220, 50, "Character", "character");
  drawUIButton(width / 2, 360, 220, 50, "Settings", "settings");
}

function drawSelection() {
  background(28, 36, 52);

  push();
  translate(width / 2, 70);
  fill(245);
  textSize(36);
  text("Choose a Game", 0, 0);
  pop();

  drawGameCard(width / 2 - 230, height / 2 + 10, "Catch the Stars", "Tap falling stars", color(46, 140, 88), "game1");
  drawGameCard(width / 2, height / 2 + 10, "Maze Runner", "Find the exit", color(48, 110, 168), "game2");
  drawGameCard(width / 2 + 230, height / 2 + 10, "Target Toss", "Hit the targets", color(176, 92, 52), "game3");

  drawUIButton(100, height - 50, 140, 44, "Back", "menu");
}

function drawGameCard(x, y, title, blurb, cardColor, action) {
  let w = 200;
  let h = 260;
  let hovering =
    mouseX > x - w / 2 &&
    mouseX < x + w / 2 &&
    mouseY > y - h / 2 &&
    mouseY < y + h / 2;

  push();
  translate(x, y);
  if (hovering) {
    scale(1.05);
  }
  noStroke();
  fill(cardColor);
  rect(0, 0, w, h, 16);

  fill(255, 255, 255, 40);
  rect(0, -60, 120, 80, 12);

  fill(255);
  textSize(18);
  text(title, 0, 40);
  textSize(13);
  fill(230);
  text(blurb, 0, 70);
  pop();

  if (hovering && mouseIsPressed && !clickUsed) {
    clickUsed = true;
    currentScreen = action;
  }
}

function drawGameScreen(title, bgColor) {
  background(bgColor);

  push();
  translate(width / 2, height / 2);
  fill(245);
  textSize(36);
  text(title, 0, -20);
  textSize(16);
  fill(210);
  text("Game will go here", 0, 20);
  pop();

  drawUIButton(100, height - 50, 140, 44, "Back", "selection");
}

function drawCharacter() {
  background(72, 48, 96);

  push();
  translate(width / 2, height / 2);
  fill(245);
  textSize(36);
  text("Character", 0, -40);
  textSize(16);
  fill(210);
  text("Character select will go here", 0, 0);
  pop();

  drawUIButton(100, height - 50, 140, 44, "Back", "menu");
}

function drawSettings() {
  background(36, 44, 68);

  push();
  translate(width / 2, 50);
  fill(245);
  textSize(36);
  text("Settings", 0, 0);
  pop();

  drawNameInput();
  drawUIButton(width / 2, 175, 280, 44, "Sound: " + (settings.sound ? "On" : "Off"), "toggleSound");
  drawVolumeSlider(width / 2, 250, 280);
  drawUIButton(width / 2, 320, 280, 44, "Haptic Feedback: " + (settings.hapticFeedback ? "On" : "Off"), "toggleHaptic");
  drawUIButton(width / 2, 380, 280, 44, "Difficulty: " + settings.difficulty, "cycleDifficulty");
  drawUIButton(100, height - 50, 140, 44, "Back", "menu");
}

function drawNameInput() {
  nameInput.x = width / 2 + 30;
  let hovering =
    mouseX > nameInput.x - nameInput.w / 2 &&
    mouseX < nameInput.x + nameInput.w / 2 &&
    mouseY > nameInput.y - nameInput.h / 2 &&
    mouseY < nameInput.y + nameInput.h / 2;

  if (mouseIsPressed && !clickUsed) {
    if (hovering) {
      nameInputFocused = true;
      clickUsed = true;
    } else {
      nameInputFocused = false;
    }
  }

  push();
  fill(220);
  textSize(18);
  textAlign(RIGHT, CENTER);
  text("Name:", nameInput.x - nameInput.w / 2 - 12, nameInput.y);

  rectMode(CENTER);
  stroke(nameInputFocused ? 120 : 90, nameInputFocused ? 170 : 110, 220);
  strokeWeight(2);
  fill(248);
  rect(nameInput.x, nameInput.y, nameInput.w, nameInput.h, 6);

  noStroke();
  textAlign(LEFT, CENTER);
  textSize(16);

  if (settings.name.length === 0 && !nameInputFocused) {
    fill(150, 155, 170);
    text("Enter name...", nameInput.x - nameInput.w / 2 + 10, nameInput.y);
  } else {
    fill(35, 42, 60);
    const visibleName = settings.name.length > 18
      ? settings.name.slice(-18)
      : settings.name;
    text(
      visibleName + (nameInputFocused && frameCount % 60 < 30 ? "|" : ""),
      nameInput.x - nameInput.w / 2 + 10,
      nameInput.y
    );
  }
  pop();
}

function drawVolumeSlider(x, y, w) {
  let trackH = 12;
  let knobSize = 22;
  let hovering =
    mouseX > x - w / 2 - 12 &&
    mouseX < x + w / 2 + 12 &&
    mouseY > y - 36 &&
    mouseY < y + 24;

  push();
  translate(x, y);
  fill(245);
  textSize(16);
  text("Volume: " + settings.volume, 0, -28);

  noStroke();
  fill(50, 70, 110);
  rect(0, 0, w, trackH, 8);

  let fillW = map(settings.volume, 0, 100, 0, w);
  fill(88, 140, 255);
  rect(-w / 2 + fillW / 2, 0, fillW, trackH, 8);

  let knobX = map(settings.volume, 0, 100, -w / 2, w / 2);
  fill(255);
  circle(knobX, 0, knobSize);
  pop();

  if (hovering && mouseIsPressed) {
    let t = constrain(mouseX - (x - w / 2), 0, w);
    settings.volume = round(map(t, 0, w, 0, 100));
  }
}

function drawUIButton(x, y, w, h, label, action) {
  let hovering =
    mouseX > x - w / 2 &&
    mouseX < x + w / 2 &&
    mouseY > y - h / 2 &&
    mouseY < y + h / 2;

  push();
  translate(x, y);
  if (hovering) {
    scale(1.06);
  }
  noStroke();
  if (hovering) {
    fill(88, 140, 255);
  } else {
    fill(58, 96, 196);
  }
  rect(0, 0, w, h, 10);
  fill(255);
  textSize(20);
  text(label, 0, 0);
  pop();

  if (hovering && mouseIsPressed && !clickUsed) {
    clickUsed = true;
    useButton(action);
  }
}

function useButton(action) {
  nameInputFocused = false;
  if (action === "toggleSound") {
    settings.sound = !settings.sound;
  } else if (action === "toggleHaptic") {
    settings.hapticFeedback = !settings.hapticFeedback;
  } else if (action === "cycleDifficulty") {
    if (settings.difficulty === "Easy") {
      settings.difficulty = "Normal";
    } else if (settings.difficulty === "Normal") {
      settings.difficulty = "Hard";
    } else {
      settings.difficulty = "Easy";
    }
  } else {
    currentScreen = action;
  }
}