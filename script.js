// GAME JAVASCRIPT (p5.js VERSION)

// ==========================================
let gameScreen = 0;
let ballX, ballY;
let ballSize = 20;
let ballColor;
let gravity = 1;
let ballSpeedVert = 0;
let airfriction = 0.0001;
let friction = 0.1;

let racketColor;
let racketWidth = 100;
let racketHeight = 10;

let ballSpeedHorizon = 10;
let wallSpeed = 5;
let wallInterval = 1000;
let lastAddTime = 0;
let minGapHeight = 200;
let maxGapHeight = 300;
let wallWidth = 80;

let walls = [];

let maxHealth = 100;
let health = 100;
let healthDecrease = 1;
let healthBarWidth = 60;

let score = 0;


// ==========================================
// WALL CLASS
// ==========================================
class Wall {
  constructor(x, y, w, h, col) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.col = col;
    this.scored = 0;
  }
}


// ==========================================
// SETUP
// ==========================================
function setup() {
  createCanvas(500, 500);
  ballX = width / 4;
  ballY = height / 5;
  ballColor = color(0);
  racketColor = color(0);
  textFont("Arial");
}


// ==========================================
// DRAW LOOP
// ==========================================
function draw() {
  if (gameScreen === 0) initScreen();
  else if (gameScreen === 1) gamePlay();
  else if (gameScreen === 2) gameOverScreen();
}


// ==========================================
// SCREEN CONTENT
// ==========================================
function initScreen() {
  background(0);
  fill(255);
  textSize(30);
  textAlign(CENTER, CENTER);
  text("Klik untuk memulai", width / 2, height / 2);
}

function gamePlay() {
  background(255);

  drawBall();
  applyGravity();
  keepInScreen();
  drawRacket();
  watchRacketBounce();
  applyHorizontalSpeed();

  wallAdder();
  wallHandler();

  drawHealthBar();
  printScore();
}

function gameOverScreen() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);

  textSize(40);
  text("GAME OVER", width / 2, height / 2 - 40);

  textSize(22);
  text("Score kamu: " + score, width / 2, height / 2);

  textSize(16);
  text("Klik untuk Restart", width / 2, height / 2 + 40);
}


// ==========================================
// RESTART
// ==========================================
function restart() {
  score = 0;
  health = maxHealth;
  ballX = width / 4;
  ballY = height / 5;
  ballSpeedVert = 0;
  ballSpeedHorizon = 0;
  lastAddTime = 0;
  walls = [];
  gameScreen = 0;
}


// ==========================================
// DRAWING OBJECTS
// ==========================================
function drawBall() {
  fill(ballColor);
  noStroke();
  ellipse(ballX, ballY, ballSize, ballSize);
}

function drawRacket() {
  fill(racketColor);
  noStroke();
  rectMode(CENTER);
  rect(mouseX, mouseY, racketWidth, racketHeight, 8);
}


// ==========================================
// PHYSICS
// ==========================================
function applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= ballSpeedVert * airfriction;
}

function applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= ballSpeedHorizon * airfriction;
}


// ==========================================
// BALL BOUNCE
// ==========================================
function makeBounceBottom(s) {
  ballY = s - ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}
function makeBounceTop(s) {
  ballY = s + ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}
function makeBounceLeft(s) {
  ballX = s + ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}
function makeBounceRight(s) {
  ballX = s - ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}


// ==========================================
// BALL LIMIT TO SCREEN
// ==========================================
function keepInScreen() {
  if (ballY + ballSize / 2 > height) makeBounceBottom(height);
  if (ballY - ballSize / 2 < 0) makeBounceTop(0);
  if (ballX - ballSize / 2 < 0) makeBounceLeft(0);
  if (ballX + ballSize / 2 > width) makeBounceRight(width);
}


// ==========================================
// COLLISION WITH RACKET
// ==========================================
function watchRacketBounce() {
  let overhead = mouseY - pmouseY;
  if (ballX > mouseX - racketWidth / 2 && ballX < mouseX + racketWidth / 2) {
    if (abs(ballY - mouseY) <= ballSize / 2 + abs(overhead)) {
      makeBounceBottom(mouseY);
      ballSpeedHorizon = (ballX - mouseX) / 5.0;
      if (overhead < 0) {
        ballY += overhead;
        ballSpeedVert += overhead;
      }
    }
  }
}


// ==========================================
// WALL SYSTEM
// ==========================================
function wallAdder() {
  if (millis() - lastAddTime > wallInterval) {
    let gapHeight = 250; 
    let randY = round(random(0, height - gapHeight));
    let col = color(random(50,255), random(50,255), random(50,255));
    walls.push(new Wall(width, randY, wallWidth, gapHeight, col));
    lastAddTime = millis();
  }
}


function wallHandler() {
  for (let i = walls.length - 1; i >= 0; i--) {
    wallMover(i);
    wallCollision(i);
    wallDrawer(i);

    if (walls[i].x + walls[i].w < 0) walls.splice(i, 1);
  }
}

function wallDrawer(index) {
  let w = walls[index];
  rectMode(CORNER);
  noStroke();
  fill(w.col);

  rect(w.x, 0, w.w, w.y, 15);
  rect(w.x, w.y + w.h, w.w, height - (w.y + w.h), 15);
}

function wallMover(index) {
  walls[index].x -= wallSpeed;
}


// ==========================================
// WALL COLLISION & SCORE
// ==========================================
function wallCollision(i) {
  let w = walls[i];

  let inX = ballX + ballSize / 2 > w.x && ballX - ballSize / 2 < w.x + w.w;

  if (inX) {
    if (ballY - ballSize / 2 < w.y) decreaseHealth();
    if (ballY + ballSize / 2 > w.y + w.h) decreaseHealth();
  }

  if (ballX > w.x + w.w && w.scored === 0) {
    score++;
    w.scored = 1;
  }
}


// ==========================================
// HEALTH BAR
// ==========================================
function drawHealthBar() {
  noStroke();
  fill(236, 240, 241);
  rectMode(CORNER);
  rect(ballX - healthBarWidth / 2, ballY - 30, healthBarWidth, 6, 3);

  if (health > 60) fill(46, 204, 113);
  else if (health > 30) fill(230, 126, 34);
  else fill(231, 76, 60);

  rect(ballX - healthBarWidth / 2, ballY - 30, healthBarWidth * (health / maxHealth), 6, 3);
}

function decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) {
    health = 0;
    gameScreen = 2;
  }
}


// ==========================================
// SCORE DISPLAY
// ==========================================
function printScore() {
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(0);
  text(score, width / 2, 50);
}


// ==========================================
// INPUT
// ==========================================
function mousePressed() {
  if (gameScreen === 0) {
    gameScreen = 1;
    ballSpeedVert = 0;
    ballSpeedHorizon = 0;
    lastAddTime = millis();
  } 
  else if (gameScreen === 2) restart();
}