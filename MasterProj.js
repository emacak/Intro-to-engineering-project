let currentScreen = "menu";
let clickUsed = false;
let mainCanvas;
let exerciseFrame;
let exerciseBackButton;
const typingPhrasesByDifficulty = {
  Easy: [
    "I am a hero.",
    "Save the day!",
    "I can be brave.",
    "Help our city.",
    "Heroes help."
  ],
  Normal: [
    "Heroes never give up.",
    "I can save the city!",
    "Courage is my superpower.",
    "Together, we are stronger.",
    "Every hero starts somewhere."
  ],
  Hard: [
    "A brave hero protects everyone.",
    "Together, we can rescue the city!",
    "Courage grows when we help others.",
    "Use your powers to make a difference.",
    "The strongest heroes never give up."
  ]
};
const typingChallengeNames = {
  Easy: "Hero Word Warm-up",
  Normal: "Superhero Sentence Sprint",
  Hard: "Advanced Rescue Briefing"
};
const PASS_ACCURACY_BY_DIFFICULTY = {
  Easy: 70,
  Normal: 85,
  Hard: 95
};
let typingPhrases = typingPhrasesByDifficulty.Normal;
let typingPhraseIndex = 0;
let typingAnswer = "";
let typingMessage = "";
let typingMessageUntil = 0;
let typingAudioContext;
let typingCorrectTaps = 0;
let typingTotalTaps = 0;
let typingLastAccuracy = 0;
const character = { hero: "female", shirt: 0, pants: 0, shoes: 0, headwear: 0 };
const characterOptions = {
  shirt: [
    { name: "Royal blue", color: "#477BEE" },
    { name: "Crimson", color: "#e33030" },
    { name: "Emerald", color: "#269C79" },
    { name: "Violet", color: "#9862DD" }
  ],
  pants: [
    { name: "Navy", color: "#263C70" },
    { name: "Charcoal", color: "#343947" },
    { name: "Purple", color: "#603E85" },
    { name: "White", color: "#E1E8F3" }
  ],
  shoes: [
    { name: "Gold", color: "#F4C653" },
    { name: "Red", color: "#e33030" },
    { name: "Black", color: "#252C3A" },
    { name: "White", color: "#E1E8F3" }
  ],
  headwear: [
    { name: "Hero hair" }, { name: "Short hair" }, { name: "Long hair" },
    { name: "Cap" }, { name: "Helmet" }
  ]
};
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
  mainCanvas = createCanvas(800, 500);
  mainCanvas.elt.setAttribute("tabindex", "0");
  mainCanvas.elt.focus();
  exerciseFrame = createElement("iframe");
  exerciseFrame.attribute("title", "Superhero exercise");
  exerciseFrame.attribute("allow", "autoplay");
  exerciseFrame.style("position", "fixed");
  exerciseFrame.style("inset", "0");
  exerciseFrame.style("width", "100vw");
  exerciseFrame.style("height", "100vh");
  exerciseFrame.style("border", "0");
  exerciseFrame.style("z-index", "10");
  exerciseFrame.hide();

  exerciseBackButton = createButton("Back to games");
  exerciseBackButton.style("position", "fixed");
  exerciseBackButton.style("left", "16px");
  exerciseBackButton.style("top", "16px");
  exerciseBackButton.style("z-index", "11");
  exerciseBackButton.style("padding", "10px 16px");
  exerciseBackButton.style("border", "0");
  exerciseBackButton.style("border-radius", "8px");
  exerciseBackButton.style("background", "#3a60c4");
  exerciseBackButton.style("color", "white");
  exerciseBackButton.style("font-size", "16px");
  exerciseBackButton.style("cursor", "pointer");
  exerciseBackButton.mousePressed(exitExercise);
  exerciseBackButton.hide();

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

  drawComicBurst(135, 255, 95, color(255, 205, 75));
  drawSuperhero(135, 270, 1.25);
  drawComicBurst(665, 255, 95, color(150, 110, 235));
  drawVillain(665, 270, 1.15);

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

function drawComicBurst(x, y, size, burstColor) {
  push();
  translate(x, y);
  noStroke();
  fill(burstColor);
  beginShape();
  for (let i = 0; i < 20; i++) {
    const angle = TWO_PI * i / 20;
    const radius = i % 2 === 0 ? size : size * 0.83;
    vertex(cos(angle) * radius, sin(angle) * radius);
  }
  endShape(CLOSE);
  fill(255, 255, 255, 100);
  circle(0, 0, size * 1.15);
  pop();
}

function drawSuperhero(x, y, scaleFactor) {
  push();
  translate(x, y);
  scale(scaleFactor);
  stroke(35, 40, 65);
  strokeWeight(3);
  strokeJoin(ROUND);

  fill(207, 48, 65);
  beginShape();
  vertex(-25, -22);
  vertex(25, -22);
  vertex(39, 43);
  vertex(0, 30);
  vertex(-39, 43);
  endShape(CLOSE);

  fill(44, 102, 224);
  rect(0, 18, 46, 48, 12);

  fill(255, 205, 65);
  beginShape();
  vertex(0, 1);
  vertex(16, 11);
  vertex(10, 29);
  vertex(-10, 29);
  vertex(-16, 11);
  endShape(CLOSE);
  noStroke();
  fill(44, 102, 224);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(17);
  text("H", 0, 15);

  stroke(35, 40, 65);
  strokeWeight(3);
  fill(255, 202, 158);
  circle(0, -24, 43);

  fill(207, 48, 65);
  beginShape();
  vertex(-24, -29);
  vertex(-16, -47);
  vertex(0, -41);
  vertex(16, -47);
  vertex(24, -29);
  vertex(12, -34);
  vertex(0, -30);
  vertex(-12, -34);
  endShape(CLOSE);

  noStroke();
  fill(35, 40, 65);
  circle(-8, -22, 4);
  circle(8, -22, 4);
  noFill();
  stroke(140, 54, 48);
  strokeWeight(2);
  arc(0, -17, 12, 8, 0, PI);
  pop();
}

function drawVillain(x, y, scaleFactor) {
  push();
  translate(x, y);
  scale(scaleFactor);
  stroke(42, 35, 74);
  strokeWeight(3);
  strokeJoin(ROUND);

  fill(92, 60, 150);
  beginShape();
  vertex(-22, -15);
  vertex(22, -15);
  vertex(43, 42);
  vertex(0, 32);
  vertex(-43, 42);
  endShape(CLOSE);

  fill(95, 210, 124);
  ellipse(0, -22, 48, 53);

  fill(92, 60, 150);
  beginShape();
  vertex(-27, -29);
  vertex(-19, -49);
  vertex(-7, -34);
  vertex(0, -52);
  vertex(9, -34);
  vertex(21, -47);
  vertex(27, -25);
  endShape(CLOSE);

  noStroke();
  fill(42, 35, 74);
  triangle(-18, -20, -5, -25, -9, -14);
  triangle(18, -20, 5, -25, 9, -14);
  stroke(42, 35, 74);
  strokeWeight(2);
  line(-11, -3, 11, -3);
  noStroke();
  fill(255, 205, 65);
  circle(0, 14, 13);
  pop();
}

function drawSelection() {
  background(28, 36, 52);

  push();
  translate(width / 2, 70);
  fill(245);
  textSize(36);
  text("Choose a Game", 0, 0);
  pop();

  drawUIButton(width / 2, 125, 220, 38, "Difficulty: " + settings.difficulty, "cycleDifficulty");
  drawGameCard(155, 250, "Color in the Lines", "Color the superhero carefully", color(46, 140, 88), "colorGame");
  drawGameCard(400, 250, "Crush the Villain", "Pinch the villain to save the hero", color(176, 92, 52), "villainGame");
  drawGameCard(645, 250, "Superhero Typing", "Tap keys to save the city", color(190, 54, 58), "typing");

  drawUIButton(100, height - 50, 140, 44, "Back", "menu");
}

function enterExercise(fileName) {
  currentScreen = fileName === "ColorGame.js" ? "colorExercise" : "villainExercise";
  exerciseFrame.attribute(
    "src",
    "./exercise.html?sketch=" + encodeURIComponent(fileName) +
      "&difficulty=" + encodeURIComponent(settings.difficulty)
  );
  mainCanvas.hide();
  exerciseFrame.show();
  exerciseBackButton.show();
}

function exitExercise() {
  exerciseFrame.hide();
  exerciseFrame.attribute("src", "about:blank");
  exerciseBackButton.hide();
  mainCanvas.show();
  currentScreen = "selection";
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

  if (action === "villainGame") {
    drawVillain(0, -33, 0.43);
  } else {
    drawSuperhero(0, -33, 0.43);
  }

  fill(255);
  textSize(18);
  text(title, 0, 9);
  textSize(13);
  fill(230);
  text(blurb, 0, 39);
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
  text(typingChallengeNames[settings.difficulty].toUpperCase(), width / 2, 35);

  fill(255);
  textSize(28);
  text("Tap the keys to save the day!", width / 2, 68);

  fill(194, 205, 225);
  textSize(16);
  text("Mission " + (typingPhraseIndex + 1) + " of " + typingPhrases.length, width / 2, 105);
  textSize(13);
  fill(194, 205, 225);
  const passAccuracy = PASS_ACCURACY_BY_DIFFICULTY[settings.difficulty];
  text(
    "Accuracy: " + getTypingAccuracyDisplay() + "% (" + passAccuracy + "% to pass)",
    width / 2,
    128
  );

  fill(25, 35, 57);
  noStroke();
  rect(width / 2, 174, 700, 58, 12);
  fill(255);
  textSize(21);
  text(typingPhrases[typingPhraseIndex], width / 2, 174);

  fill(194, 205, 225);
  textSize(14);
  text("Your taps:", 70, 222);
  drawTypedAnswer();

  if (typingMessage && millis() < typingMessageUntil) {
    fill(100, 230, 145);
    textSize(18);
    text(typingMessage, width / 2, 255);
  } else {
    fill(194, 205, 225);
    textSize(14);
    text("Tap a letter, SPACE, punctuation, or DEL to fix a tap.", width / 2, 255);
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
    text("Tap the on-screen keys below", startX, 242);
  } else {
    for (let i = 0; i < typingAnswer.length; i++) {
      const characterIsCorrect =
        typingAnswer[i].toLowerCase() === target[i].toLowerCase();
      fill(characterIsCorrect ? color(100, 230, 145) : color(255, 100, 105));
      text(typingAnswer[i], cursorX, 242);
      cursorX += textWidth(typingAnswer[i]);
    }
  }
  textFont("sans-serif");
  textAlign(CENTER, CENTER);
}

function drawTypingKeyboard() {
  const firstRow = "QWERTYUIOP";
  for (let i = 0; i < firstRow.length; i++) {
    drawTypingKey(110 + i * 58, 305, 52, firstRow[i], firstRow[i].toLowerCase());
  }

  const secondRow = "ASDFGHJKL";
  for (let i = 0; i < secondRow.length; i++) {
    drawTypingKey(142 + i * 58, 348, 52, secondRow[i], secondRow[i].toLowerCase());
  }

  const thirdRow = "ZXCVBNM";
  for (let i = 0; i < thirdRow.length; i++) {
    drawTypingKey(56 + i * 50, 391, 45, thirdRow[i], thirdRow[i].toLowerCase());
  }
  drawTypingKey(482, 391, 145, "SPACE", " ");
  drawTypingKey(569, 391, 78, "DEL", "delete");
  drawTypingKey(668, 391, 40, ",", ",");
  drawTypingKey(716, 391, 40, ".", ".");
  drawTypingKey(764, 391, 40, "!", "!");
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
  typingTotalTaps++;
  const index = typingAnswer.length - 1;
  if (typingAnswer[index].toLowerCase() !== target[index].toLowerCase()) {
    playTypingFeedback(false);
    return;
  }

  typingCorrectTaps++;
  if (typingAnswer.toLowerCase() === target.toLowerCase()) {
    playTypingFeedback(true);
    const accuracy = getTypingAccuracy();
    const exactAccuracy = (typingCorrectTaps / typingTotalTaps) * 100;
    const passAccuracy = PASS_ACCURACY_BY_DIFFICULTY[settings.difficulty];
    if (exactAccuracy < passAccuracy) {
      typingMessage =
        "Accuracy " + accuracy + "%. Need " + passAccuracy + "% - try this phrase again.";
      typingMessageUntil = millis() + 1800;
      typingAnswer = "";
      typingCorrectTaps = 0;
      typingTotalTaps = 0;
      typingLastAccuracy = accuracy;
      return;
    }

    typingPhraseIndex++;
    typingCorrectTaps = 0;
    typingTotalTaps = 0;
    typingLastAccuracy = 0;
    if (typingPhraseIndex === typingPhrases.length) {
      currentScreen = "typingComplete";
    } else {
      typingAnswer = "";
      typingMessage = "Correct!";
      typingMessageUntil = millis() + 800;
    }
  }
}

function getTypingAccuracy() {
  return typingTotalTaps > 0
    ? Math.floor((typingCorrectTaps / typingTotalTaps) * 100)
    : 100;
}

function getTypingAccuracyDisplay() {
  return typingTotalTaps > 0 ? getTypingAccuracy() : typingLastAccuracy;
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
  text("TRAINING COMPLETE!", width / 2, 170);
  fill(255);
  textSize(20);
  text("You saved the city, one word at a time.", width / 2, 230);
  drawUIButton(width / 2, 320, 220, 48, "Train Again", "restartTyping");
  drawUIButton(100, height - 50, 140, 44, "Back", "selection");
}

function drawCharacter() {
  background(72, 48, 96);
  push();
  textAlign(CENTER, CENTER);
  fill(245);
  textSize(32);
  text("Create Your Superhero", width / 2, 40);
  fill(220, 210, 238);
  textSize(14);
  text("Choose a hero, then use the arrows to change their look.", width / 2, 76);

  noStroke();
  fill(52, 35, 74);
  rect(215, 257, 290, 310, 18);
  drawHeroPreview(215, 250);
  fill(245);
  textSize(16);
  text(character.hero === "female" ? "Female Superhero" : "Male Superhero", 215, 391);

  drawCharacterChoice(475, 122, 170, 38, "Female Hero", character.hero === "female",
    () => { character.hero = "female"; });
  drawCharacterChoice(665, 122, 170, 38, "Male Hero", character.hero === "male",
    () => { character.hero = "male"; });

  const rows = [
    { key: "shirt", label: "Shirt" },
    { key: "pants", label: "Pants" },
    { key: "shoes", label: "Shoes" },
    { key: "headwear", label: "Hair / Hat" }
  ];
  rows.forEach((row, index) => {
    const y = 191 + index * 61;
    const options = characterOptions[row.key];
    fill(220, 210, 238);
    textSize(13);
    text(row.label, 570, y - 21);
    drawCharacterChoice(415, y + 5, 42, 32, "<", false,
      () => cycleCharacterOption(row.key, -1));
    drawCharacterChoice(725, y + 5, 42, 32, ">", false,
      () => cycleCharacterOption(row.key, 1));
    fill(255);
    textSize(16);
    text(options[character[row.key]].name, 570, y + 5);
  });
  fill(220, 210, 238);
  textSize(12);
  text("Your choices are kept while you play.", 560, 450);
  pop();

  drawUIButton(100, height - 50, 140, 44, "Back", "menu");
}

function cycleCharacterOption(part, direction) {
  const count = characterOptions[part].length;
  character[part] = (character[part] + direction + count) % count;
}

function drawCharacterChoice(x, y, w, h, label, selected, onSelect) {
  const hovering = mouseX >= x - w / 2 && mouseX <= x + w / 2 &&
    mouseY >= y - h / 2 && mouseY <= y + h / 2;
  push();
  rectMode(CENTER);
  stroke(selected ? "#F4C653" : "#AA96C6");
  strokeWeight(selected ? 3 : 1);
  fill(hovering ? "#6C58A0" : selected ? "#534486" : "#3C2D56");
  rect(x, y, w, h, 8);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(label, x, y);
  pop();
  if (hovering && mouseIsPressed && !clickUsed) {
    clickUsed = true;
    onSelect();
  }
}

function drawHeroPreview(x, y) {
  const female = character.hero === "female";
  const headwear = character.headwear;
  const longHair = headwear === 2 || (headwear === 0 && female);
  const shirt = characterOptions.shirt[character.shirt].color;
  const pants = characterOptions.pants[character.pants].color;
  const shoes = characterOptions.shoes[character.shoes].color;
  push();
  translate(x, y);
  rectMode(CENTER);
  noStroke();
  fill(30, 22, 48, 100);
  ellipse(0, 117, 152, 18);

  // Cape sits behind the entire outfit.
  fill("#C43B64");
  quad(-31, -39, 31, -39, 74, 99, -74, 99);
  fill("#A82D56");
  triangle(0, -30, 16, 97, -16, 97);
  if (longHair) {
    fill("#36263A");
    rect(0, -55, 80, 100, 26);
  }

  // Pants and boots remain independently customizable for either hero.
  fill(pants);
  rect(-19, 65, 31, 72, 8);
  rect(19, 65, 31, 72, 8);
  fill(shoes);
  rect(-22, 104, 38, 27, 7);
  rect(22, 104, 38, 27, 7);

  fill(shirt);
  quad(-32, -38, 32, -38, female ? 24 : 32, 37, female ? -24 : -32, 37);
  // Sleeves and hands form a classic superhero pose.
  quad(-30, -36, -42, -30, -63, 10, -48, 19);
  quad(30, -36, 42, -30, 63, 10, 48, 19);
  fill("#DDA078");
  circle(-55, 18, 18);
  circle(55, 18, 18);
  rect(0, -41, 20, 22, 5);
  fill("#F4C653");
  rect(0, 34, female ? 51 : 66, 10, 3);
  fill("#FFF0A4");
  quad(0, -18, 17, -3, 0, 17, -17, -3);
  fill(shirt);
  textSize(18);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("H", 0, -1);
  textStyle(NORMAL);

  fill("#EAB38D");
  ellipse(0, -72, female ? 59 : 65, 69);
  fill("#36263A");
  arc(0, -88, 66, 43, PI, TWO_PI);
  triangle(-32, -89, 22, -105, -20, -72);
  if (longHair) {
    rect(-31, -62, 12, 58, 6);
    rect(31, -62, 12, 58, 6);
  }

  if (headwear === 3) {
    fill(shirt);
    arc(0, -93, 72, 47, PI, TWO_PI);
    rect(15, -94, 90, 9, 4);
  } else if (headwear === 4) {
    fill(shoes);
    arc(0, -85, 79, 69, PI, TWO_PI);
    rect(-34, -76, 10, 34, 4);
    rect(34, -76, 10, 34, 4);
    fill("#FFF0A4");
    rect(0, -108, 10, 19, 3);
  }

  fill(shirt);
  rect(0, -73, 61, 21, 8);
  fill(255);
  ellipse(-13, -73, 13, 9);
  ellipse(13, -73, 13, 9);
  fill("#242739");
  circle(-12, -73, 5);
  circle(12, -73, 5);
  noFill();
  stroke("#713D3C");
  strokeWeight(2);
  arc(0, -57, 18, 10, 0, PI);
  pop();
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
  if (action === "colorGame") {
    enterExercise("ColorGame.js");
  } else if (action === "villainGame") {
    enterExercise("Crushthevillian.js");
  } else if (action === "toggleSound") {
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
    typingPhrases = typingPhrasesByDifficulty[settings.difficulty];
    typingPhraseIndex = 0;
    typingAnswer = "";
    typingMessage = "";
    typingCorrectTaps = 0;
    typingTotalTaps = 0;
    typingLastAccuracy = 0;
    currentScreen = "typing";
  } else {
    if (action === "typing") {
      typingPhrases = typingPhrasesByDifficulty[settings.difficulty];
      typingPhraseIndex = 0;
      typingAnswer = "";
      typingMessage = "";
      typingCorrectTaps = 0;
      typingTotalTaps = 0;
      typingLastAccuracy = 0;
    }
    currentScreen = action;
  }
}
