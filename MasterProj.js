let screen = "menu";
let buttons = [];
let backButton;
let settings = {
  sound: true,
  difficulty: "Normal"
};

function setup() {
  createCanvas(800, 500);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);

  buttons = [
    new Button(width / 2, 220, 220, 50, "Start", () => {
      screen = "game";
    }),
    new Button(width / 2, 290, 220, 50, "Character", () => {
      screen = "character";
    }),
    new Button(width / 2, 360, 220, 50, "Settings", () => {
      screen = "settings";
    })
  ];

  backButton = new Button(100, height - 50, 140, 44, "Back", () => {
    screen = "menu";
  });
}

function draw() {
  if (screen === "menu") {
    drawMenu();
  } else if (screen === "game") {
    drawGame();
  } else if (screen === "character") {
    drawCharacter();
  } else if (screen === "settings") {
    drawSettings();
  }
}

function drawMenu() {
  background(28, 36, 52);
  noStroke();
  fill(45, 58, 82);
  rect(width / 2, height / 2, width - 40, height - 40, 16);

  fill(245);
  textSize(42);
  text("Main Menu", width / 2, 90);

  textSize(16);
  fill(180, 195, 220);
  text("Choose where to go", width / 2, 140);

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].display();
  }
}

function drawGame() {
  background(34, 92, 64);
  fill(245);
  textSize(36);
  text("Game", width / 2, height / 2 - 20);
  textSize(16);
  fill(210);
  backButton.display();
}

function drawCharacter() {
  background(72, 48, 96);
  fill(245);
  textSize(36);
  text("Character", width / 2, height / 2 - 40);
  textSize(16);
  fill(210);
  text("Character select will go here", width / 2, height / 2);
  backButton.display();
}

function drawSettings() {
  background(36, 44, 68);
  fill(245);
  textSize(36);
  text("Settings", width / 2, 90);

  textSize(18);
  fill(220);
  text("Sound: " + (settings.sound ? "On" : "Off"), width / 2, 180);
  text("Difficulty: " + settings.difficulty, width / 2, 230);

  textSize(14);
  fill(180, 195, 220);
  text("Click Sound to toggle  |  Click Difficulty to cycle", width / 2, 290);
  backButton.display();
}

function mousePressed() {
  if (screen === "menu") {
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].tryClick();
    }
    return;
  }

  if (screen === "settings") {
    if (mouseOverRect(width / 2, 180, 240, 36)) {
      settings.sound = !settings.sound;
      return;
    }
    if (mouseOverRect(width / 2, 230, 240, 36)) {
      if (settings.difficulty === "Easy") {
        settings.difficulty = "Normal";
      } else if (settings.difficulty === "Normal") {
        settings.difficulty = "Hard";
      } else {
        settings.difficulty = "Easy";
      }
      return;
    }
  }

  backButton.tryClick();
}

function keyPressed() {
  if (keyCode === ESCAPE && screen !== "menu") {
    screen = "menu";
  }
}

function mouseOverRect(x, y, w, h) {
  return mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2;
}

class Button {
  constructor(x, y, w, h, label, onClick) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.onClick = onClick;
  }

  hovered() {
    return mouseOverRect(this.x, this.y, this.w, this.h);
  }

  display() {
    if (this.hovered()) {
      fill(88, 140, 255);
    } else {
      fill(58, 96, 196);
    }
    noStroke();
    rect(this.x, this.y, this.w, this.h, 10);

    fill(255);
    textSize(20);
    text(this.label, this.x, this.y);
  }

  tryClick() {
    if (this.hovered()) {
      this.onClick();
    }
  }
}
