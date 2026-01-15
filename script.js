// ===== 1. UI ELEMENT REFERENCES =====
const startPage = document.getElementById('start-page');
const gamePage = document.getElementById('game-page');
const winModal = document.getElementById('win-modal');
const loseModal = document.getElementById('lose-modal');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const retryBtn = document.getElementById('retry-btn');
const menuBtns = [document.getElementById('menu-btn-win'), document.getElementById('menu-btn-lose')];

const playerScoreEl = document.getElementById('player-score');
const aiScoreEl = document.getElementById('ai-score');
const levelNumEl = document.getElementById('level-num');

// ===== 2. GAME STATE & VARIABLES =====
let canvas, ctx;
let gameState = 'start'; 
let currentLevel = 1;
let playerScore = 0;
let aiScore = 0;
const POINTS_TO_WIN = 5;

let width = 800;
let height = 500;
const paddleWidth = 15;
let playerPaddleHeight = 90;
let playerY, aiY, ballX, ballY, ballVelX, ballVelY;
let mouseY = height / 2;
let ballSpeed = 5;

// ===== 3. INITIALIZATION =====
window.addEventListener('load', () => {
    canvas = document.getElementById('pong');
    ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;

    setupEventListeners();
    resetBall();
    gameLoop(); // Start the loop immediately (it will wait for gameState === 'playing')
});

// ===== 4. EVENT LISTENERS =====
function setupEventListeners() {
    // Start Game
    startBtn.addEventListener('click', () => {
        gameState = 'playing';
        startPage.classList.remove('active');
        gamePage.classList.add('active');
    });

    // Next Level
    nextBtn.addEventListener('click', () => {
        currentLevel++;
        levelNumEl.innerText = currentLevel;
        winModal.classList.add('hidden');
        fullReset();
    });

    // Retry Level
    retryBtn.addEventListener('click', () => {
        loseModal.classList.add('hidden');
        fullReset();
    });

    // Back to Menu
    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentLevel = 1;
            levelNumEl.innerText = "1";
            winModal.classList.add('hidden');
            loseModal.classList.add('hidden');
            gamePage.classList.remove('active');
            startPage.classList.add('active');
            gameState = 'start';
        });
    });

    // Mouse Movement
    window.addEventListener('mousemove', (e) => {
        if (canvas) {
            let rect = canvas.getBoundingClientRect();
            mouseY = e.clientY - rect.top;
        }
    });
}

// ===== 5. GAME LOGIC =====

function fullReset() {
    playerScore = 0;
    aiScore = 0;
    playerScoreEl.innerText = "0";
    aiScoreEl.innerText = "0";
    gameState = 'playing';
    resetBall();
}

function resetBall() {
    ballX = width / 2;
    ballY = height / 2;
    // Increase ball speed based on level
    let currentSpeed = ballSpeed + (currentLevel * 0.5);
    ballVelX = currentSpeed * (Math.random() > 0.5 ? 1 : -1);
    ballVelY = currentSpeed * (Math.random() > 0.5 ? 0.5 : -0.5);
    playerPaddleHeight = 90;
    playerY = height / 2 - playerPaddleHeight / 2;
    aiY = height / 2 - 45;
}

function update() {
    if (gameState !== 'playing') return;

    // Player Movement (Easing)
    let targetY = mouseY - playerPaddleHeight / 2;
    playerY += (targetY - playerY) * 0.15;
    playerY = Math.max(0, Math.min(height - playerPaddleHeight, playerY));

    // AI Movement
    let aiSpeed = 3 + (currentLevel * 0.8);
    let aiCenter = aiY + 45;
    if (aiCenter < ballY - 15) aiY += aiSpeed;
    else if (aiCenter > ballY + 15) aiY -= aiSpeed;
    aiY = Math.max(0, Math.min(height - 90, aiY));

    // Ball Movement
    ballX += ballVelX;
    ballY += ballVelY;

    // Wall Bounce
    if (ballY <= 0 || ballY >= height) ballVelY *= -1;

    // Paddle Collisions
    if (ballX < 40 && ballY > playerY && ballY < playerY + playerPaddleHeight) {
        ballVelX = Math.abs(ballVelX) * 1.05; // Speed up slightly
    }
    if (ballX > width - 40 && ballY > aiY && ballY < aiY + 90) {
        ballVelX = -Math.abs(ballVelX) * 1.05;
    }

    // Scoring
    if (ballX > width) {
        playerScore++;
        playerScoreEl.innerText = playerScore;
        if (playerScore >= POINTS_TO_WIN) {
            gameState = 'win';
            winModal.classList.remove('hidden');
        } else {
            resetBall();
        }
    }
    if (ballX < 0) {
        aiScore++;
        aiScoreEl.innerText = aiScore;
        if (aiScore >= POINTS_TO_WIN) {
            gameState = 'lose';
            loseModal.classList.remove('hidden');
        } else {
            resetBall();
        }
    }
}

function draw() {
    // Fill background with a dark space color
    ctx.fillStyle = '#0a1428';
    ctx.fillRect(0, 0, width, height);

    if (gameState === 'playing' || gameState === 'win' || gameState === 'lose') {
        // Draw Player Paddle
        ctx.fillStyle = '#ffd700'; // Gold
        ctx.fillRect(20, playerY, paddleWidth, playerPaddleHeight);

        // Draw AI Paddle
        ctx.fillStyle = '#00d4ff'; // Cyan
        ctx.fillRect(width - 35, aiY, paddleWidth, 90);

        // Draw Ball
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
