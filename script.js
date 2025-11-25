// --- GAME VARIABLES ---

// 0 = start screen
// 1 = game
// 2 = game over
let gameScreen = 0;

// Ball
let ballX, ballY;
let ballSize = 20;
let ballColor;
let gravity = 1;
let ballSpeedVert = 0;
let airfriction = 0.0001;
let friction = 0.1;
let ballSpeedHorizon = 0;

// Racket
let racketWidth = 100;
let racketHeight = 10;

// Walls
let wallSpeed = 2;
let wallInterval = 1500;
let lastAddTime = 0;
let minGapHeight = 120;
let maxGapHeight = 200;
let wallWidth = 80;
// wall = {x, y, width, gapH, scored, topCol, bottomCol}
let walls = [];

// Health
let maxHealth = 100;
let health = 100;
let healthDecrease = 15;
let healthBarWidth = 60;

// Score
let score = 0;

// ---------- SETUP ----------
function setup() {
  createCanvas(500, 500);
  resetBallAndState();
  textFont("Arial");
}

// ---------- DRAW LOOP ----------
function draw() {
  if (gameScreen === 0) initScreen();
  else if (gameScreen === 1) gameScreenLoop();
  else if (gameScreen === 2) gameOverScreen();
}

// ---------- SCREENS ----------
function initScreen() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("Klik untuk memulai", width / 2, height / 2);
  textSize(12);
  text("Gerakkan mouse untuk memantulkan bola", width / 2, height / 2 + 30);
}

function gameScreenLoop() {
  background(255);

  drawBall();
  applyGravity();
  applyHorizontalSpeed();
  keepInScreen();

  drawRacket();
  watchRacketBounce();

  wallAdder();
  wallHandler();

  drawHealthBar();
  printScore();
}

function gameOverScreen() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Game Over", width / 2, height / 2 - 20);
  textSize(18);
  text(`Score: ${score}`, width / 2, height / 2 + 10);
  textSize(14);
  text("Klik untuk restart", width / 2, height / 2 + 40);
}

// ---------- BALL ----------
function drawBall() {
  fill(ballColor);
  noStroke();
  ellipse(ballX, ballY, ballSize, ballSize);
}

function applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= ballSpeedVert * airfriction;
}

function applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= ballSpeedHorizon * airfriction;
}

function makeBounceBottom(surface) {
  ballY = surface - ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function makeBounceTop(surface) {
  ballY = surface + ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function makeBounceLeft(surface) {
  ballX = surface + ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function makeBounceRight(surface) {
  ballX = surface - ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function keepInScreen() {
  if (ballY + ballSize / 2 > height) makeBounceBottom(height);
  if (ballY - ballSize / 2 < 0) makeBounceTop(0);
  if (ballX - ballSize / 2 < 0) makeBounceLeft(0);
  if (ballX + ballSize / 2 > width) makeBounceRight(width);
}

// ---------- RACKET ----------
function drawRacket() {
  fill(0);
  noStroke();
  rectMode(CENTER);
  rect(mouseX, mouseY, racketWidth, racketHeight);
}

function watchRacketBounce() {
  let overhead = mouseY - pmouseY;

  if (
    ballX + ballSize / 2 > mouseX - racketWidth / 2 &&
    ballX - ballSize / 2 < mouseX + racketWidth / 2
  ) {
    let verticalDist = abs(ballY - mouseY);
    if (verticalDist <= ballSize / 2 + abs(overhead) + racketHeight / 2) {
      makeBounceBottom(mouseY - racketHeight / 2);
      ballSpeedHorizon = (ballX - mouseX) / 5;

      if (overhead < 0) {
        ballY += overhead;
        ballSpeedVert += overhead;
      }
    }
  }
}

// ---------- HEALTH ----------
function drawHealthBar() {
  noStroke();
  rectMode(CENTER);
  fill(230);
  rect(ballX, ballY - 30, healthBarWidth, 6);

  if (health > 60) fill(46, 204, 113);
  else if (health > 30) fill(230, 126, 34);
  else fill(231, 76, 60);

  let w = healthBarWidth * (health / maxHealth);
  rectMode(CORNER);
  rect(ballX - healthBarWidth / 2, ballY - 33, w, 6);
}

function decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) {
    health = 0;
    gameover();
  }
}

// ---------- WALLS ----------
function wallAdder() {
  if (millis() - lastAddTime > wallInterval) {
    let gapH = round(random(minGapHeight, maxGapHeight));
    let randY = round(random(0, height - gapH));

    let topCol = color(random(255), random(255), random(255));
    let bottomCol = color(random(255), random(255), random(255));

    walls.push({
      x: width,
      y: randY,
      w: wallWidth,
      gapH: gapH,
      scored: false,
      topCol,
      bottomCol
    });

    lastAddTime = millis();
  }
}

function wallHandler() {
  for (let i = walls.length - 1; i >= 0; i--) {
    wallMover(i);
    wallDrawer(i);
    watchWallCollision(i);
    wallRemover(i);
  }
}

function wallMover(i) {
  walls[i].x -= wallSpeed;
}

function wallRemover(i) {
  if (walls[i].x + walls[i].w <= 0) walls.splice(i, 1);
}

function wallDrawer(i) {
  let wall = walls[i];

  noStroke();
  rectMode(CORNER);

  fill(wall.topCol);
  rect(wall.x, 0, wall.w, wall.y);

  fill(wall.bottomCol);
  rect(wall.x, wall.y + wall.gapH, wall.w, height - (wall.y + wall.gapH));
}

function watchWallCollision(i) {
  let wall = walls[i];

  if (ballX > wall.x + wall.w / 2 && !wall.scored) {
    wall.scored = true;
    score++;
  }

  let hitTop =
    ballX + ballSize / 2 > wall.x &&
    ballX - ballSize / 2 < wall.x + wall.w &&
    ballY - ballSize / 2 < wall.y;

  if (hitTop && wall.y > 0) {
    decreaseHealth();
    ballX = wall.x - ballSize / 2 - 1;
    ballSpeedHorizon = -abs(ballSpeedHorizon) - 2;
  }

  let hitBottom =
    ballX + ballSize / 2 > wall.x &&
    ballX - ballSize / 2 < wall.x + wall.w &&
    ballY + ballSize / 2 > wall.y + wall.gapH;

  if (hitBottom && wall.y + wall.gapH < height) {
    decreaseHealth();
    ballX = wall.x - ballSize / 2 - 1;
    ballSpeedHorizon = -abs(ballSpeedHorizon) - 2;
  }
}

// ---------- SCORE + UI ----------
function printScore() {
  fill(0);
  textAlign(LEFT, CENTER);
  textSize(18);
  text(`Score: ${score}`, 10, 20);
  textSize(12);
  text(`Health: ${int(health)}`, 10, 40);
}

// ---------- INPUT ----------
function mousePressed() {
  if (gameScreen === 0) startGame();
  else if (gameScreen === 2) restart();
}

function startGame() {
  score = 0;
  health = maxHealth;
  walls = [];
  lastAddTime = millis();
  resetBallAndState();
  gameScreen = 1;
}

function restart() {
  score = 0;
  health = maxHealth;
  walls = [];
  lastAddTime = 0;
  resetBallAndState();
  gameScreen = 0;
}

function gameover() {
  gameScreen = 2;
}

function resetBallAndState() {
  ballX = width / 4;
  ballY = height / 5;
  ballSpeedVert = 2;
  ballSpeedHorizon = 2;
  ballColor = color(0);
}
