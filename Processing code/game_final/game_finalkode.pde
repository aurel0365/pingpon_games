// Silahkan Copy Paste kode dibawah ini untuk dimainkan di processing

// 0: Initial Screen
// 1: Game Screen
// 2: Game-over Screen
int gameScreen = 0;

// Ball
float ballX, ballY;
int ballSize = 20;
color ballColor = color(0);
float gravity = 1;
float ballSpeedVert = 0;
float airfriction = 0.0001;
float friction = 0.1;
float ballSpeedHorizon = 0;

// Racket
color racketColor = color(0);
float racketWidth = 100;
float racketHeight = 10;

// Walls (pipes)
int wallSpeed = 2;
int wallInterval = 1500; // ms
float lastAddTime = 0;
int minGapHeight = 120;
int maxGapHeight = 200;
int wallWidth = 80;
// ArrayList menyimpan int[] = {x, y, width, gapHeight, scoredFlag, topColor, bottomColor}
ArrayList<int[]> walls = new ArrayList<int[]>();

// Health
int maxHealth = 100;
float health = 100;
float healthDecrease = 15;
int healthBarWidth = 60;

// Score
int score = 0;

void setup() {
  size(500, 500);
  resetBallAndState();
  textFont(createFont("Arial", 14));
}

void draw() {
  if (gameScreen == 0) {
    initScreen();
  } else if (gameScreen == 1) {
    gameScreenLoop();
  } else if (gameScreen == 2) {
    gameOverScreen();
  }
}

// ---------- SCREENS ----------
void initScreen() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("Klik untuk memulai", width/2, height/2);
  textSize(12);
  text("Gerakkan mouse untuk memantulkan bola", width/2, height/2 + 30);
}

void gameScreenLoop() {
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

void gameOverScreen() {
  background(0);
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(32);
  text("Game Over", width/2, height/2 - 20);
  textSize(18);
  text("Score: " + score, width/2, height/2 + 10);
  textSize(14);
  text("Klik untuk restart", width/2, height/2 + 40);
}

// ---------- BALL ----------
void drawBall() {
  fill(ballColor);
  noStroke();
  ellipse(ballX, ballY, ballSize, ballSize);
}

void applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= (ballSpeedVert * airfriction);
}

void applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= (ballSpeedHorizon * airfriction);
}

void makeBounceBottom(float surface) {
  ballY = surface - (ballSize/2);
  ballSpeedVert *= -1;
  ballSpeedVert -= (ballSpeedVert * friction);
}

void makeBounceTop(float surface) {
  ballY = surface + (ballSize/2);
  ballSpeedVert *= -1;
  ballSpeedVert -= (ballSpeedVert * friction);
}

void makeBounceLeft(float surface) {
  ballX = surface + (ballSize/2);
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= (ballSpeedHorizon * friction);
}

void makeBounceRight(float surface) {
  ballX = surface - (ballSize/2);
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= (ballSpeedHorizon * friction);
}

void keepInScreen() {
  if (ballY + (ballSize/2) > height) makeBounceBottom(height);
  if (ballY - (ballSize/2) < 0) makeBounceTop(0);
  if (ballX - (ballSize/2) < 0) makeBounceLeft(0);
  if (ballX + (ballSize/2) > width) makeBounceRight(width);
}

// ---------- RACKET ----------
void drawRacket() {
  fill(racketColor);
  rectMode(CENTER);
  noStroke();
  rect(mouseX, mouseY, racketWidth, racketHeight);
}

void watchRacketBounce() {
  float overhead = mouseY - pmouseY;
  if ((ballX + ballSize/2 > mouseX - racketWidth/2) &&
      (ballX - ballSize/2 < mouseX + racketWidth/2)) {

    float verticalDist = abs(ballY - mouseY);
    if (verticalDist <= (ballSize/2) + abs(overhead) + (racketHeight/2)) {

      makeBounceBottom(mouseY - (racketHeight/2));

      ballSpeedHorizon = (ballX - mouseX) / 5.0;

      if (overhead < 0) {
        ballY += overhead;
        ballSpeedVert += overhead;
      }
    }
  }
}

// ---------- HEALTH ----------
void drawHealthBar() {
  noStroke();
  rectMode(CENTER);
  fill(230);
  rect(ballX, ballY - 30, healthBarWidth, 6);

  if (health > 60) fill(46, 204, 113);
  else if (health > 30) fill(230, 126, 34);
  else fill(231, 76, 60);

  float w = healthBarWidth * (health / (float)maxHealth);
  rectMode(CORNER);
  rect(ballX - (healthBarWidth/2), ballY - 33, w, 6);
}

void decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) {
    health = 0;
    gameover();
  }
}

// ---------- WALLS ----------
void wallAdder() {
  if (millis() - lastAddTime > wallInterval) {
    int randHeight = round(random(minGapHeight, maxGapHeight));
    int randY = round(random(0, height - randHeight));

    color topCol = color(random(255), random(255), random(255));
    color bottomCol = color(random(255), random(255), random(255));

    int[] randWall = {
      width, randY, wallWidth, randHeight, 0,
      topCol, bottomCol
    };

    walls.add(randWall);
    lastAddTime = millis();
  }
}

void wallHandler() {
  for (int i = walls.size() - 1; i >= 0; i--) {
    wallMover(i);
    wallDrawer(i);
    watchWallCollision(i);
    wallRemover(i);
  }
}

void wallMover(int index) {
  walls.get(index)[0] -= wallSpeed;
}

void wallRemover(int index) {
  int[] wall = walls.get(index);
  if (wall[0] + wall[2] <= 0) walls.remove(index);
}

void wallDrawer(int index) {
  int[] wall = walls.get(index);

  int x = wall[0];
  int y = wall[1];
  int w = wall[2];
  int gapH = wall[3];

  color topCol = wall[5];
  color bottomCol = wall[6];

  rectMode(CORNER);
  noStroke();

  fill(topCol);
  rect(x, 0, w, y);

  fill(bottomCol);
  rect(x, y + gapH, w, height - (y + gapH));
}

void watchWallCollision(int index) {
  int[] wall = walls.get(index);

  int x = wall[0];
  int y = wall[1];
  int w = wall[2];
  int gapH = wall[3];

  if (ballX > x + w/2 && wall[4] == 0) {
    wall[4] = 1;
    score();
  }

  boolean hitTop =
    (ballX + ballSize/2 > x) &&
    (ballX - ballSize/2 < x + w) &&
    (ballY - ballSize/2 < y);

  if (hitTop && y > 0) {
    decreaseHealth();
    ballX = x - ballSize/2 - 1;
    ballSpeedHorizon = -abs(ballSpeedHorizon) - 2;
  }

  boolean hitBottom =
    (ballX + ballSize/2 > x) &&
    (ballX - ballSize/2 < x + w) &&
    (ballY + ballSize/2 > y + gapH);

  if (hitBottom && (y + gapH < height)) {
    decreaseHealth();
    ballX = x - ballSize/2 - 1;
    ballSpeedHorizon = -abs(ballSpeedHorizon) - 2;
  }
}

// ---------- SCORE ----------
void score() {
  score++;
}

void printScore() {
  fill(0);
  textAlign(LEFT, CENTER);
  textSize(18);
  text("Score: " + score, 10, 20);
  textSize(12);
  text("Health: " + int(health), 10, 40);
}

// ---------- INPUT ----------
public void mousePressed() {
  if (gameScreen == 0) startGame();
  else if (gameScreen == 2) restart();
}

void startGame() {
  score = 0;
  health = maxHealth;
  walls.clear();
  lastAddTime = millis();
  resetBallAndState();
  gameScreen = 1;
}

void restart() {
  score = 0;
  health = maxHealth;
  walls.clear();
  lastAddTime = 0;
  resetBallAndState();
  gameScreen = 0;
}

void gameover() {
  gameScreen = 2;
}

void resetBallAndState() {
  ballX = width/4;
  ballY = height/5;
  ballSpeedVert = 2;
  ballSpeedHorizon = 2;

  ballColor = color(0);
  racketColor = color(0);
}
