// ===== GAME DATA =====
const CATEGORIES = [
    {
        name: "SHADES OF PINK",
        words: ["BLUSH", "ROSE", "MAUVE", "FUCHSIA"],
        color: "yellow",
        difficulty: 1
    },
    {
        name: "BIRTHDAY THINGS",
        words: ["CAKE", "CANDLES", "BALLOONS", "GIFTS"],
        color: "green",
        difficulty: 2
    },
    {
        name: 'WORDS THAT PRECEDE "PINK"',
        words: ["HOT", "THINK", "TICKLED", "INK"],
        color: "blue",
        difficulty: 3
    },
    {
        name: "TERMS OF ENDEARMENT",
        words: ["BABE", "LOVE", "DEAR", "ANGEL"],
        color: "purple",
        difficulty: 4
    }
];

// ===== GAME STATE =====
let gameState = {
    words: [],
    selectedWords: [],
    foundCategories: [],
    mistakesRemaining: 4,
    isGameOver: false
};

// ===== DOM ELEMENTS =====
const wordGrid = document.getElementById('word-grid');
const resultsDiv = document.getElementById('results');
const submitBtn = document.getElementById('submit-btn');
const deselectBtn = document.getElementById('deselect-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const gameOverModal = document.getElementById('game-over-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const playAgainBtn = document.getElementById('play-again-btn');
const confettiCanvas = document.getElementById('confetti-canvas');

// ===== INITIALIZATION =====
function initGame() {
    // Reset game state
    gameState = {
        words: [],
        selectedWords: [],
        foundCategories: [],
        mistakesRemaining: 4,
        isGameOver: false
    };
    
    // Collect all words and shuffle
    const allWords = CATEGORIES.flatMap(cat => cat.words);
    gameState.words = shuffleArray([...allWords]);
    
    // Reset UI
    resultsDiv.innerHTML = '';
    updateMistakeDots();
    renderWordGrid();
    updateSubmitButton();
    gameOverModal.classList.add('hidden');
}

// ===== SHUFFLE ALGORITHM (Fisher-Yates) =====
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ===== RENDER WORD GRID =====
function renderWordGrid() {
    wordGrid.innerHTML = '';
    
    gameState.words.forEach(word => {
        const tile = document.createElement('div');
        tile.className = 'word-tile';
        tile.textContent = word;
        tile.dataset.word = word;
        
        // Check if word is selected
        if (gameState.selectedWords.includes(word)) {
            tile.classList.add('selected');
        }
        
        // Add click handler
        tile.addEventListener('click', () => handleWordClick(word));
        
        wordGrid.appendChild(tile);
    });
}

// ===== WORD SELECTION =====
function handleWordClick(word) {
    if (gameState.isGameOver) return;
    
    const index = gameState.selectedWords.indexOf(word);
    
    if (index > -1) {
        // Deselect word
        gameState.selectedWords.splice(index, 1);
    } else {
        // Select word (max 4)
        if (gameState.selectedWords.length < 4) {
            gameState.selectedWords.push(word);
        }
    }
    
    renderWordGrid();
    updateSubmitButton();
}

// ===== UPDATE SUBMIT BUTTON =====
function updateSubmitButton() {
    submitBtn.disabled = gameState.selectedWords.length !== 4;
}

// ===== DESELECT ALL =====
function deselectAll() {
    gameState.selectedWords = [];
    renderWordGrid();
    updateSubmitButton();
}

// ===== SHUFFLE WORDS =====
function shuffleWords() {
    gameState.words = shuffleArray(gameState.words);
    renderWordGrid();
}

// ===== SUBMIT ANSWER =====
function submitAnswer() {
    if (gameState.selectedWords.length !== 4 || gameState.isGameOver) return;
    
    // Check if selection matches a category
    const matchedCategory = CATEGORIES.find(category => {
        // Check if already found
        if (gameState.foundCategories.includes(category.name)) return false;
        
        // Check if all selected words are in this category
        return gameState.selectedWords.every(word => category.words.includes(word)) &&
               gameState.selectedWords.length === 4;
    });
    
    if (matchedCategory) {
        // Correct answer!
        handleCorrectAnswer(matchedCategory);
    } else {
        // Wrong answer
        handleWrongAnswer();
    }
}

// ===== HANDLE CORRECT ANSWER =====
function handleCorrectAnswer(category) {
    // Add to found categories
    gameState.foundCategories.push(category.name);
    
    // Remove words from grid
    gameState.words = gameState.words.filter(word => !category.words.includes(word));
    gameState.selectedWords = [];
    
    // Show category result
    displayCategoryResult(category);
    
    // Trigger confetti
    triggerConfetti();
    
    // Update UI
    renderWordGrid();
    updateSubmitButton();
    
    // Check if won
    if (gameState.foundCategories.length === CATEGORIES.length) {
        setTimeout(() => showGameOver(true), 1000);
    }
}

// ===== HANDLE WRONG ANSWER =====
function handleWrongAnswer() {
    // Decrease mistakes
    gameState.mistakesRemaining--;
    updateMistakeDots();
    
    // Shake animation
    const selectedTiles = document.querySelectorAll('.word-tile.selected');
    selectedTiles.forEach(tile => {
        tile.classList.add('shake');
        setTimeout(() => tile.classList.remove('shake'), 500);
    });
    
    // Deselect after animation
    setTimeout(() => {
        gameState.selectedWords = [];
        renderWordGrid();
        updateSubmitButton();
    }, 500);
    
    // Check if lost
    if (gameState.mistakesRemaining === 0) {
        setTimeout(() => showGameOver(false), 600);
    }
}

// ===== DISPLAY CATEGORY RESULT =====
function displayCategoryResult(category) {
    const resultDiv = document.createElement('div');
    resultDiv.className = `result-category ${category.color}`;
    resultDiv.innerHTML = `
        <h3>${category.name}</h3>
        <p>${category.words.join(', ')}</p>
    `;
    resultsDiv.appendChild(resultDiv);
}

// ===== UPDATE MISTAKE DOTS =====
function updateMistakeDots() {
    const dots = document.querySelectorAll('.mistake-dots .dot');
    dots.forEach((dot, index) => {
        if (index < gameState.mistakesRemaining) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

// ===== SHOW GAME OVER =====
function showGameOver(won) {
    gameState.isGameOver = true;
    
    if (won) {
        modalTitle.textContent = '🎉 Congratulations! 🎉';
        modalMessage.textContent = 'You found all the connections!';
        triggerConfetti();
    } else {
        modalTitle.textContent = '😔 Game Over';
        modalMessage.textContent = 'Better luck next time!';
        
        // Show remaining categories
        const remainingCategories = CATEGORIES.filter(cat => 
            !gameState.foundCategories.includes(cat.name)
        );
        
        remainingCategories.forEach(cat => displayCategoryResult(cat));
    }
    
    gameOverModal.classList.remove('hidden');
}

// ===== CONFETTI EFFECT =====
function triggerConfetti() {
    const canvas = confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    const colors = ['#f9df6d', '#a0c35a', '#b0c4ef', '#ba81c5', '#ff6b9d', '#ffffff'];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 2,
            d: Math.random() * particleCount,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }
    
    let animationFrame;
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, i) => {
            ctx.beginPath();
            ctx.lineWidth = p.r / 2;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();
            
            // Update
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;
            
            // Reset if out of view
            if (p.y > canvas.height) {
                particles[i] = {
                    ...p,
                    x: Math.random() * canvas.width,
                    y: -10
                };
            }
        });
        
        animationFrame = requestAnimationFrame(draw);
    }
    
    draw();
    
    // Stop after 3 seconds
    setTimeout(() => {
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 3000);
}

// ===== EVENT LISTENERS =====
submitBtn.addEventListener('click', submitAnswer);
deselectBtn.addEventListener('click', deselectAll);
shuffleBtn.addEventListener('click', shuffleWords);
playAgainBtn.addEventListener('click', initGame);

// Handle window resize for confetti
window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
});

// ===== START GAME =====
initGame();
