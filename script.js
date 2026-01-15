// ===== GAME STATE =====
let gameState = 'start'; // start, playing, won, lost
let currentLevel = 1;
let playerScore = 0;
let aiScore = 0;
const POINTS_TO_WIN = 5;

// ===== CANVAS =====
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Dynamic size (set in resizeCanvas)
let width;
let height;

// ===== PADDLE VARIABLES ===== (now dynamic)
let paddleWidth;
let paddleHeight;
let playerY;
let aiY;
let mouseY;
let paddleSpeed;

// ===== BALL VARIABLES =====
let ballX;
let ballY;
let ballRadius;
let ballSpeed = 4; // base speed, increases per level
let ballVelX = ballSpeed;
let ballVelY = ballSpeed;

// ===== CONTROLS =====
let upPressed = false;
let downPressed = false;

// ===== RESIZE CANVAS (fits any screen, mobile-friendly) =====
function resizeCanvas() {
  const marginX = 40;
  const marginY = 120; // leaves room for scores, modals, etc.

  let targetWidth = window.innerWidth - marginX;
  let targetHeight = window.innerHeight - marginY;

  const aspect = 800 / 500; // original aspect ratio

  if (targetWidth / targetHeight > aspect) {
    targetWidth = targetHeight * aspect;
  } else {
    targetHeight = targetWidth / aspect;
  }

  targetWidth = Math.floor(targetWidth);
  targetHeight = Math.floor(targetHeight);

  const isFirst = width === undefined;

  let oldWidth = width || 800;
  let oldHeight = height || 500;

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  canvas.style.width = `${targetWidth}px`;
  canvas.style.height = `${targetHeight}px`;

  // Scale existing positions/velocities if not first load
  if (!isFirst) {
    const scaleX = targetWidth / oldWidth;
    const scaleY = targetHeight / oldHeight;
    playerY *= scaleY;
    aiY *= scaleY;
    mouseY *= scaleY;
    ballX *= scaleX;
    ballY *= scaleY;
    ballVelX *= scaleX;
    ballVelY *= scaleY;
  }

  width = targetWidth;
  height = targetHeight;

  // Scale game elements based on new height
  paddleWidth = width * (15 / 800);
  paddleHeight = height * (90 / 500);
  ballRadius = height * (7 / 500);
  paddleSpeed = height * (6 / 500);

  // Set/center positions
  if (isFirst) {
    playerY = height / 2 - paddleHeight / 2;
    aiY = playerY;
    mouseY = playerY;
    ballX = width / 2;
    ballY = height / 2;
    ballVelX = 0;
    ballVelY = 0;
  }

  // Always clamp after resize
  playerY = Math.max(0, Math.min(height - paddleHeight, playerY));
  aiY = Math.max(0, Math.min(height - paddleHeight, aiY));
  mouseY = Math.max(0, Math.min(height - paddleHeight, mouseY));
}

// ===== CREATE STARFIELD ===== (unchanged)
function createStars() {
  const starfield = document.getElementById('starfield');
  starfield.innerHTML = '';
  
  for (let i = 0; i < 200; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    const size = Math.random();
    if (size < 0.5) star.classList.add('small');
    else if (size < 0.8) star.classList.add('medium');
    else star.classList.add('large');
    
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 4 + 's';
    
    starfield.appendChild(star);
  }
}

// ===== PAGE MANAGEMENT ===== (unchanged)
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

// ===== BUTTON EVENTS ===== (unchanged)
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('next-btn').addEventListener('click', nextLevel);
document.getElementById('retry-btn').addEventListener('click', retryLevel);
document.getElementById('menu-btn-win').addEventListener('click', backToMenu);
document.getElementById('menu-btn-lose').addEventListener('click', backToMenu);

function startGame() {
  // Increase ball speed with level for harder difficulty
  ballSpeed = 4 + (currentLevel - 1) * 0.6;
  
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
  playerY = height / 2 - paddleHeight / 2;
  aiY = playerY;
  mouseY = playerY;
  ballX = width / 2;
  ballY = height / 2;
  resetBall();
}

function resetBall() {
  ballX = width / 2;
  ballY = height / 2;
  ballVelX = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
  ballVelY = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
}

// ===== DRAWING ===== (unchanged, works with dynamic size)
function draw() {
  ctx.fillStyle = 'rgba(15, 40, 68, 0.2)';
  ctx.fillRect(0, 0, width, height);

  // Player paddle (yellow)
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(20, playerY, paddleWidth, paddleHeight);
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, playerY, paddleWidth, paddleHeight);
  
  // AI paddle (cyan)
  ctx.fillStyle = '#00d4ff';
  ctx.fillRect(width - paddleWidth - 20, aiY, paddleWidth, paddleHeight);
  ctx.strokeStyle = '#0099cc';
  ctx.lineWidth = 2;
  ctx.strokeRect(width - paddleWidth - 20, aiY, paddleWidth, paddleHeight);

  // Ball
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center line
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

  // Player paddle: direct mouse/touch follow (instant response) + keyboard support
  playerY = mouseY;
  if (upPressed) playerY -= paddleSpeed;
  if (downPressed) playerY += paddleSpeed;
  playerY = Math.max(0, Math.min(height - paddleHeight, playerY));

  // AI paddle
  let aiCenter = aiY + paddleHeight / 2;
  let aiDifficulty = 3.5 + currentLevel * 0.3;
  
  if (aiCenter < ballY - 20) aiY += aiDifficulty;
  if (aiCenter > ballY + 20) aiY -= aiDifficulty;
  aiY = Math.max(0, Math.min(height - paddleHeight, aiY));

  // Ball movement
  ballX += ballVelX;
  ballY += ballVelY;

  // Top/bottom walls
  if (ballY - ballRadius < 0) {
    ballY = ballRadius;
    ballVelY = -ballVelY;
  }
  if (ballY + ballRadius > height) {
    ballY = height - ballRadius;
    ballVelY = -ballVelY;
  }

  // Left paddle collision (improved for dynamic paddle size)
  if (
    ballX - ballRadius < 20 + paddleWidth &&
    ballX > 20 &&
    ballY > playerY && 
    ballY < playerY + paddleHeight
  ) {
    ballX = 20 + paddleWidth + ballRadius;
    ballVelX = Math.abs(ballVelX) * 1.05;
    ballVelY += (ballY - (playerY + paddleHeight / 2)) * 0.15;
  }

  // Right paddle collision
  if (
    ballX + ballRadius > width - 20 - paddleWidth &&
    ballX < width - 20 &&
    ballY > aiY && 
    ballY < aiY + paddleHeight
  ) {
    ballX = width - 20 - paddleWidth - ballRadius;
    ballVelX = -Math.abs(ballVelX) * 1.05;
    ballVelY += (ballY - (aiY + paddleHeight / 2)) * 0.15;
  }

  // Scoring
  if (ballX > width) {
    playerScore++;
    resetBall();
    checkWinCondition();
  }
  if (ballX < 0) {
    aiScore++;
    resetBall();
    checkWinCondition();
  }

  // Update scores
  document.getElementById('player-score').textContent = playerScore;
  document.getElementById('ai-score').textContent = aiScore;
}

function checkWinCondition() {
  if (playerScore >= POINTS_TO_WIN) {
    gameState = 'won';
    document.getElementById('win-text').textContent = `Great job! You won Level ${currentLevel}!`;
    showModal('win-modal');
  } else if (aiScore >= POINTS_TO_WIN) {
    gameState = 'lost';
    document.getElementById('lose-text').textContent = `AI won ${aiScore} - ${playerScore}. Try Level ${currentLevel} again!`;
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

// ===== CONTROLS ===== (touch + mouse + keyboard)
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseY = e.clientY - rect.top - paddleHeight / 2;
  mouseY = Math.max(0, Math.min(height - paddleHeight, mouseY));
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  mouseY = e.touches[0].clientY - rect.top - paddleHeight / 2;
  mouseY = Math.max(0, Math.min(height - paddleHeight, mouseY));
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
resizeCanvas(); // First resize
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

console.log('✅ Moon Pong by Francis Mburu - Ready to play!');
