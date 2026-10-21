let currentScreen = "menu";
let clickUsed = false;
let typingPhrases = [
  "Heroes never give up.",
  "I can save the city!",
  "Courage is my superpower.",
  "Together, we are stronger.",
  "Every hero starts somewhere."
];
let typingPhraseIndex = 0;
let typingAnswer = "";
let typingMessage = "";
let typingMessageUntil = 0;
let typingAudioContext;
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
  } else if (currentScreen === "typing") {
    drawTypingGame();
  } else if (currentScreen === "typingComplete") {
    drawTypingComplete();
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
  textSize(40);
  text("Hero Academy", 0, 0);
  let displayName = settings.name.trim() !== "" ? settings.name : "Player";
  pop();

  push();
  translate(width / 2, 140);
  textSize(16);
  fill(180, 195, 220);
  text("Welcome back, " + displayName + "! Train your super skills", 0, 0);
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

  drawGameCard(250, 190, "Catch the Stars", "Tap falling stars", color(46, 140, 88), "game1");
  drawGameCard(550, 190, "Maze Runner", "Find the exit", color(48, 110, 168), "game2");
  drawGameCard(250, 340, "Target Toss", "Hit the targets", color(176, 92, 52), "game3");
  drawGameCard(550, 340, "Superhero Typing", "Type to save the city!", color(190, 54, 58), "typing");

  drawUIButton(100, height - 50, 140, 44, "Back", "menu");
}

function drawGameCard(x, y, title, blurb, cardColor, action) {
  let w = 230;
  let h = 125;
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
  rect(0, -34, 120, 30, 10);

  fill(255);
  textSize(18);
  text(title, 0, -5);
  textSize(13);
  fill(230);
  text(blurb, 0, 25);
  pop();

  if (hovering && mouseIsPressed && !clickUsed) {
    clickUsed = true;
    useButton(action);
  }
}

function drawTypingGame() {
  background(38, 32, 52);

  fill(255, 220, 92);
  textSize(15);
  text("SUPERHERO TRAINING", width / 2, 35);

  fill(255);
  textSize(28);
  text("Tap the keys to save the day!", width / 2, 68);

  fill(194, 205, 225);
  textSize(16);
  text("Mission " + (typingPhraseIndex + 1) + " of " + typingPhrases.length, width / 2, 105);

  fill(25, 35, 57);
  noStroke();
  rect(width / 2, 150, 700, 58, 12);
  fill(255);
  textSize(21);
  text(typingPhrases[typingPhraseIndex], width / 2, 150);

  fill(194, 205, 225);
  textSize(14);
  text("Your taps:", 70, 205);
  drawTypedAnswer();

  if (typingMessage && millis() < typingMessageUntil) {
    fill(100, 230, 145);
    textSize(18);
    text(typingMessage, width / 2, 245);
  } else {
    fill(194, 205, 225);
    textSize(14);
    text("Tap a letter, SPACE, punctuation, or DEL to fix a tap.", width / 2, 245);
  }

  drawTypingKeyboard();

  drawUIButton(100, height - 50, 140, 44, "Back", "selection");
}

function drawTypedAnswer() {
  const target = typingPhrases[typingPhraseIndex];
  const startX = 70;
  let cursorX = startX;

  textAlign(LEFT, CENTER);
  textSize(20);
  textFont("monospace");
  if (typingAnswer.length === 0) {
    fill(115, 130, 155);
    text("Tap the on-screen keys below", startX, 225);
  } else {
    for (let i = 0; i < typingAnswer.length; i++) {
      const characterIsCorrect =
        typingAnswer[i].toLowerCase() === target[i].toLowerCase();
      fill(characterIsCorrect ? color(100, 230, 145) : color(255, 100, 105));
      text(typingAnswer[i], cursorX, 225);
      cursorX += textWidth(typingAnswer[i]);
    }
  }
  textFont("sans-serif");
  textAlign(CENTER, CENTER);
}

function drawTypingKeyboard() {
  const firstRow = "QWERTYUIOP";
  for (let i = 0; i < firstRow.length; i++) {
    drawTypingKey(110 + i * 58, 290, 52, firstRow[i], firstRow[i].toLowerCase());
  }

  const secondRow = "ASDFGHJKL";
  for (let i = 0; i < secondRow.length; i++) {
    drawTypingKey(142 + i * 58, 333, 52, secondRow[i], secondRow[i].toLowerCase());
  }

  const thirdRow = "ZXCVBNM";
  for (let i = 0; i < thirdRow.length; i++) {
    drawTypingKey(56 + i * 50, 376, 45, thirdRow[i], thirdRow[i].toLowerCase());
  }
  drawTypingKey(482, 376, 145, "SPACE", " ");
  drawTypingKey(569, 376, 78, "DEL", "delete");
  drawTypingKey(668, 376, 40, ",", ",");
  drawTypingKey(716, 376, 40, ".", ".");
  drawTypingKey(764, 376, 40, "!", "!");
}

function drawTypingKey(x, y, keyWidth, label, value) {
  const keyHeight = 34;
  const hovering =
    mouseX >= x - keyWidth / 2 &&
    mouseX <= x + keyWidth / 2 &&
    mouseY >= y - keyHeight / 2 &&
    mouseY <= y + keyHeight / 2;

  noStroke();
  fill(hovering ? color(88, 140, 255) : color(58, 76, 112));
  rect(x, y, keyWidth, keyHeight, 6);
  fill(255);
  textSize(label.length > 1 ? 13 : 18);
  text(label, x, y);

  if (hovering && mouseIsPressed && !clickUsed) {
    clickUsed = true;
    pressTypingKey(value);
  }
}

function pressTypingKey(value) {
  if (value === "delete") {
    typingAnswer = typingAnswer.slice(0, -1);
    return;
  }

  const target = typingPhrases[typingPhraseIndex];
  if (typingAnswer.length >= target.length) {
    return;
  }

  typingAnswer += value;
  const index = typingAnswer.length - 1;
  if (typingAnswer[index].toLowerCase() !== target[index].toLowerCase()) {
    playTypingFeedback(false);
    return;
  }

  if (typingAnswer.toLowerCase() === target.toLowerCase()) {
    playTypingFeedback(true);
    typingPhraseIndex++;
    if (typingPhraseIndex === typingPhrases.length) {
      currentScreen = "typingComplete";
    } else {
      typingAnswer = "";
      typingMessage = "Correct!";
      typingMessageUntil = millis() + 800;
    }
  }
}

function playTypingFeedback(correct) {
  if (!settings.sound) {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  if (!typingAudioContext) {
    typingAudioContext = new AudioContextClass();
  }
  if (typingAudioContext.state === "suspended") {
    typingAudioContext.resume();
  }

  const frequencies = correct ? [880, 1320] : [220];
  frequencies.forEach((frequency, index) => {
    const startTime = typingAudioContext.currentTime + index * 0.12;
    const oscillator = typingAudioContext.createOscillator();
    const gain = typingAudioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    if (!correct) {
      oscillator.frequency.exponentialRampToValueAtTime(140, startTime + 0.16);
    }
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, 0.12 * settings.volume / 100),
      startTime + 0.015
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);
    oscillator.connect(gain);
    gain.connect(typingAudioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.23);
  });
}

function drawTypingComplete() {
  background(38, 32, 52);
  fill(255, 220, 92);
  textSize(36);
  text("MISSION COMPLETE!", width / 2, 170);
  fill(255);
  textSize(20);
  text("You saved the city, one word at a time.", width / 2, 230);
  drawUIButton(width / 2, 320, 220, 48, "Train Again", "restartTyping");
  drawUIButton(100, height - 50, 140, 44, "Back", "selection");
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
  } else if (action === "restartTyping") {
    typingPhraseIndex = 0;
    typingAnswer = "";
    typingMessage = "";
    currentScreen = "typing";
  } else {
    if (action === "typing") {
      typingPhraseIndex = 0;
      typingAnswer = "";
      typingMessage = "";
    }
    currentScreen = action;
  }
}