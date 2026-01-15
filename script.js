// ===== GAME STATE =====
let gameState = 'start'; // start, playing, won, lost
let currentLevel = 1;
let playerScore = 0;
let aiScore = 0;
const POINTS_TO_WIN = 5;

// ===== CANVAS =====
const canvas = document. getElementById('pong');
const ctx = canvas.getContext('2d');

// Canvas size
let width = 800;
let height = 500;

// Set canvas size
canvas.width = width;
canvas.height = height;

// ===== PADDLE VARIABLES =====
const paddleWidth = 15;
const paddleHeight = 90;
let playerY = height / 2 - paddleHeight / 2;
let aiY = height / 2 - paddleHeight / 2;
let mouseY = playerY;
const paddleSpeed = 6;

// ===== BALL VARIABLES =====
let ballX = width / 2;
let ballY = height / 2;
let ballRadius = 7;
let ballSpeed = 4;
let ballVelX = ballSpeed;
let ballVelY = ballSpeed;

// ===== CONTROLS =====
let upPressed = false;
let downPressed = false;

// ===== CREATE STARFIELD =====
function createStars() {
  const starfield = document.getElementById('starfield');
  starfield.innerHTML = '';
  
  for (let i = 0; i < 200; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    const size = Math.random();
    if (size < 0.5) star.classList.add('small');
    else if (size < 0.8) star.classList.add('medium');
    else star.classList. add('large');
    
    star.style.left = Math. random() * 100 + '%';
    star. style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 4 + 's';
    
    starfield.appendChild(star);
  }
}

// ===== PAGE MANAGEMENT =====
function showPage(pageName) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageName).classList.add('active');
}

function showModal(modalName) {
  document.getElementById(modalName).classList.remove('hidden');
}

function hideAllModals() {
  document.getElementById('win-modal').classList.add('hidden');
  document.getElementById('lose-modal').classList.add('hidden');
}

// ===== BUTTON EVENTS =====
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('next-btn').addEventListener('click', nextLevel);
document.getElementById('retry-btn').addEventListener('click', retryLevel);
document.getElementById('menu-btn-win').addEventListener('click', backToMenu);
document.getElementById('menu-btn-lose').addEventListener('click', backToMenu);

function startGame() {
  resetGameState();
  showPage('game-page');
  hideAllModals();
  document.getElementById('level-num').textContent = currentLevel;
  gameState = 'playing';
  gameLoop();
}

function nextLevel() {
  currentLevel++;
  startGame();
}

function retryLevel() {
  startGame();
}

function backToMenu() {
  currentLevel = 1;
  gameState = 'start';
  showPage('start-page');
  hideAllModals();
}

// ===== RESET GAME =====
function resetGameState() {
  playerScore = 0;
  aiScore = 0;
  ballX = width / 2;
  ballY = height / 2;
  playerY = height / 2 - paddleHeight / 2;
  aiY = height / 2 - paddleHeight / 2;
  ballVelX = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
  ballVelY = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
  mouseY = playerY;
}

// ===== DRAWING =====
function draw() {
  // Clear canvas with semi-transparent color
  ctx.fillStyle = 'rgba(15, 40, 68, 0.2)';
  ctx.fillRect(0, 0, width, height);

  // Draw left paddle (YELLOW - Player)
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(20, playerY, paddleWidth, paddleHeight);
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, playerY, paddleWidth, paddleHeight);
  
  // Draw right paddle (CYAN - AI)
  ctx.fillStyle = '#00d4ff';
  ctx.fillRect(width - paddleWidth - 20, aiY, paddleWidth, paddleHeight);
  ctx.strokeStyle = '#0099cc';
  ctx.lineWidth = 2;
  ctx.strokeRect(width - paddleWidth - 20, aiY, paddleWidth, paddleHeight);

  // Draw ball (YELLOW)
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw center dotted line
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ===== UPDATE LOGIC =====
function update() {
  if (gameState !== 'playing') return;

  // Player paddle movement with mouse
  if (Math.abs(playerY - mouseY) > 1) {
    playerY += (mouseY - playerY) * 0.2;
  }
  
  // Player paddle movement with keyboard
  if (upPressed) playerY -= paddleSpeed;
  if (downPressed) playerY += paddleSpeed;
  playerY = Math.max(0, Math.min(height - paddleHeight, playerY));

  // AI paddle movement
  let aiCenter = aiY + paddleHeight / 2;
  let aiDifficulty = 3. 5 + currentLevel * 0.3;
  
  if (aiCenter < ballY - 20) {
    aiY += aiDifficulty;
  }
  if (aiCenter > ballY + 20) {
    aiY -= aiDifficulty;
  }
  aiY = Math.max(0, Math.min(height - paddleHeight, aiY));

  // Move ball
  ballX += ballVelX;
  ballY += ballVelY;

  // Ball collision with top/bottom walls
  if (ballY - ballRadius < 0) {
    ballY = ballRadius;
    ballVelY = -ballVelY;
  }
  if (ballY + ballRadius > height) {
    ballY = height - ballRadius;
    ballVelY = -ballVelY;
  }

  // Ball collision with left paddle (PLAYER)
  if (
    ballX - ballRadius < 40 &&
    ballX > 20 &&
    ballY > playerY && 
    ballY < playerY + paddleHeight
  ) {
    ballX = 40; // Prevent ball from getting stuck
    ballVelX = Math.abs(ballVelX) * 1.05;
    ballVelY += (ballY - (playerY + paddleHeight / 2)) * 0.15;
  }

  // Ball collision with right paddle (AI)
  if (
    ballX + ballRadius > width - 40 &&
    ballX < width - 20 &&
    ballY > aiY && 
    ballY < aiY + paddleHeight
  ) {
    ballX = width - 40; // Prevent ball from getting stuck
    ballVelX = -Math.abs(ballVelX) * 1.05;
    ballVelY += (ballY - (aiY + paddleHeight / 2)) * 0.15;
  }

  // Check scoring - PLAYER SCORES (ball goes off right side)
  if (ballX > width) {
    playerScore++;
    resetBall();
    checkWinCondition();
  }
  
  // Check scoring - AI SCORES (ball goes off left side)
  if (ballX < 0) {
    aiScore++;
    resetBall();
    checkWinCondition();
  }

  // Update score display
  document.getElementById('player-score').textContent = playerScore;
  document.getElementById('ai-score').textContent = aiScore;
}

function resetBall() {
  ballX = width / 2;
  ballY = height / 2;
  ballVelX = ballSpeed * (Math.random() > 0.5 ? 1 :  -1);
  ballVelY = ballSpeed * (Math. random() > 0.5 ? 1 : -1);
}

function checkWinCondition() {
  if (playerScore >= POINTS_TO_WIN) {
    gameState = 'won';
    document.getElementById('win-text').textContent = `Great job! You won Level ${currentLevel}!`;
    showModal('win-modal');
  } else if (aiScore >= POINTS_TO_WIN) {
    gameState = 'lost';
    document.getElementById('lose-text').textContent = `AI won ${aiScore} - ${playerScore}.  Try Level ${currentLevel} again!`;
    showModal('lose-modal');
  }
}

// ===== GAME LOOP =====
function gameLoop() {
  update();
  draw();
  
  if (gameState === 'playing') {
    requestAnimationFrame(gameLoop);
  }
}

// ===== CONTROLS =====
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseY = e.clientY - rect.top - paddleHeight / 2;
  mouseY = Math.max(0, Math.min(height - paddleHeight, mouseY));
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  mouseY = e.touches[0].clientY - rect. top - paddleHeight / 2;
  mouseY = Math. max(0, Math.min(height - paddleHeight, mouseY));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') upPressed = true;
  if (e.key === 'ArrowDown') downPressed = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp') upPressed = false;
  if (e.key === 'ArrowDown') downPressed = false;
});

// ===== INITIALIZE =====
createStars();
console.log('✅ Moon Pong by Francis Mburu - Ready to play!');
