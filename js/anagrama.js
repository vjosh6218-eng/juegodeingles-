// ===== Word Data =====
const WORDS = [
  // Fruits
  { word: 'APPLE',      emoji: '🍎', hint: 'Manzana',    category: 'fruit'  },
  { word: 'BANANA',     emoji: '🍌', hint: 'Plátano',    category: 'fruit'  },
  { word: 'GRAPES',     emoji: '🍇', hint: 'Uvas',       category: 'fruit'  },
  { word: 'ORANGE',     emoji: '🍊', hint: 'Naranja',    category: 'fruit'  },
  { word: 'MANGO',      emoji: '🥭', hint: 'Mango',      category: 'fruit'  },
  { word: 'CHERRY',     emoji: '🍒', hint: 'Cereza',     category: 'fruit'  },
  { word: 'PINEAPPLE',  emoji: '🍍', hint: 'Piña',       category: 'fruit'  },
  { word: 'STRAWBERRY', emoji: '🍓', hint: 'Fresa',      category: 'fruit'  },
  { word: 'MELON',      emoji: '🍈', hint: 'Melón',      category: 'fruit'  },
  { word: 'LEMON',      emoji: '🍋', hint: 'Limón',      category: 'fruit'  },
  { word: 'PEACH',      emoji: '🍑', hint: 'Durazno',    category: 'fruit'  },
  { word: 'PEAR',       emoji: '🍐', hint: 'Pera',       category: 'fruit'  },
  // Vegetables
  { word: 'CARROT',     emoji: '🥕', hint: 'Zanahoria',  category: 'veggie' },
  { word: 'TOMATO',     emoji: '🍅', hint: 'Tomate',     category: 'veggie' },
  { word: 'CORN',       emoji: '🌽', hint: 'Maíz',       category: 'veggie' },
  { word: 'BROCCOLI',   emoji: '🥦', hint: 'Brócoli',    category: 'veggie' },
  { word: 'POTATO',     emoji: '🥔', hint: 'Papa',       category: 'veggie' },
  { word: 'ONION',      emoji: '🧅', hint: 'Cebolla',    category: 'veggie' },
  { word: 'GARLIC',     emoji: '🧄', hint: 'Ajo',        category: 'veggie' },
  { word: 'PEPPER',     emoji: '🫑', hint: 'Pimiento',   category: 'veggie' },
  { word: 'CUCUMBER',   emoji: '🥒', hint: 'Pepino',     category: 'veggie' },
  { word: 'LETTUCE',    emoji: '🥬', hint: 'Lechuga',    category: 'veggie' },
  { word: 'MUSHROOM',   emoji: '🍄', hint: 'Hongo',      category: 'veggie' },
  { word: 'EGGPLANT',   emoji: '🍆', hint: 'Berenjena',  category: 'veggie' },
];
 
// ===== State =====
let deck       = [];     // shuffled word list
let wordIndex  = 0;      // current position in deck
let score      = 0;
let hintUsed   = false;
let currentWord = null;
let scrambled   = [];    // scrambled letters array
let placed      = [];    // placed letter objects { letter, tileIdx } or null per slot
let tileUsed    = [];    // bool per tile
 
// ===== DOM =====
const emojiEl       = document.getElementById('emoji-display');
const hintEl        = document.getElementById('hint-text');
const badgeEl       = document.getElementById('category-badge');
const slotsEl       = document.getElementById('answer-slots');
const tilesEl       = document.getElementById('letter-tiles');
const feedbackEl    = document.getElementById('feedback');
const scoreEl       = document.getElementById('score-val');
const wordNumEl     = document.getElementById('word-num');
const totalWordsEl  = document.getElementById('total-words');
const progressBar   = document.getElementById('progress-bar');
const winOverlay    = document.getElementById('win-overlay');
const winScoreEl    = document.getElementById('win-score');
const winMaxEl      = document.getElementById('win-max');
 
// ===== Helpers =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
 
function scrambleWord(word) {
  let s;
  do { s = shuffle(word.split('')); }
  while (s.join('') === word && word.length > 2);
  return s;
}
 
// ===== Init / Reset =====
function newGame() {
  deck      = shuffle([...WORDS]);
  wordIndex = 0;
  score     = 0;
  winOverlay.classList.remove('show');
  scoreEl.textContent    = 0;
  totalWordsEl.textContent = deck.length;
  loadWord();
}
 
// ===== Load Word =====
function loadWord() {
  if (wordIndex >= deck.length) { showWin(); return; }
 
  currentWord = deck[wordIndex];
  hintUsed    = false;
  scrambled   = scrambleWord(currentWord.word);
  placed      = Array(currentWord.word.length).fill(null);
  tileUsed    = Array(scrambled.length).fill(false);
 
  // Update HUD
  wordNumEl.textContent = wordIndex + 1;
  progressBar.style.width = (wordIndex / deck.length * 100) + '%';
 
  // Category badge
  badgeEl.className = 'category-badge ' + currentWord.category;
  badgeEl.textContent = currentWord.category === 'fruit' ? '🍎 Fruta' : '🥦 Verdura';
 
  // Emoji
  emojiEl.textContent = currentWord.emoji;
 
  // Hint
  hintEl.innerHTML = `En español: <span>${currentWord.hint}</span>`;
 
  // Feedback clear
  feedbackEl.textContent = '';
  feedbackEl.className = '';
 
  renderSlots();
  renderTiles();
}
 
// ===== Render Slots =====
function renderSlots() {
  slotsEl.innerHTML = '';
  for (let i = 0; i < currentWord.word.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.idx = i;
    if (placed[i]) {
      slot.textContent = placed[i].letter;
    }
    slot.addEventListener('click', () => removeFromSlot(i));
    slotsEl.appendChild(slot);
  }
}
 
// ===== Render Tiles =====
function renderTiles() {
  tilesEl.innerHTML = '';
  scrambled.forEach((letter, i) => {
    const tile = document.createElement('div');
    tile.className = `tile tile-color-${i % 10}${tileUsed[i] ? ' used' : ''}`;
    tile.textContent = letter;
    tile.dataset.idx = i;
    tile.addEventListener('click', () => placeLetter(i));
    tilesEl.appendChild(tile);
  });
}
 
// ===== Place Letter =====
function placeLetter(tileIdx) {
  if (tileUsed[tileIdx]) return;
 
  // Find first empty slot
  const slotIdx = placed.findIndex(p => p === null);
  if (slotIdx === -1) return;
 
  placed[slotIdx]   = { letter: scrambled[tileIdx], tileIdx };
  tileUsed[tileIdx] = true;
 
  renderSlots();
  renderTiles();
 
  // Auto-check when all slots filled
  if (placed.every(p => p !== null)) {
    setTimeout(checkAnswer, 200);
  }
}
 
// ===== Remove From Slot =====
function removeFromSlot(slotIdx) {
  if (!placed[slotIdx]) return;
  const { tileIdx } = placed[slotIdx];
  tileUsed[tileIdx] = false;
  placed[slotIdx]   = null;
  renderSlots();
  renderTiles();
  feedbackEl.textContent = '';
}
 
// ===== Check Answer =====
function checkAnswer() {
  const answer = placed.map(p => p ? p.letter : '').join('');
 
  if (answer === currentWord.word) {
    // Correct!
    const points = hintUsed ? 5 : 10;
    score += points;
    scoreEl.textContent = score;
 
    // Color slots green
    slotsEl.querySelectorAll('.slot').forEach(s => s.classList.add('correct'));
 
    setFeedback(hintUsed ? `¡Bien! +${points} pts 🌟` : `¡Excelente! +${points} pts 🎉`, 'correct');
 
    setTimeout(() => {
      wordIndex++;
      loadWord();
    }, 1200);
 
  } else {
    // Wrong
    slotsEl.querySelectorAll('.slot').forEach(s => s.classList.add('wrong'));
    setFeedback('¡Inténtalo de nuevo! 💪', 'wrong');
 
    setTimeout(() => {
      slotsEl.querySelectorAll('.slot').forEach(s => s.classList.remove('wrong'));
      clearSlots();
    }, 700);
  }
}
 
function clearSlots() {
  placed   = Array(currentWord.word.length).fill(null);
  tileUsed = Array(scrambled.length).fill(false);
  renderSlots();
  renderTiles();
}
 
// ===== Clear button =====
function clearAll() {
  clearSlots();
  feedbackEl.textContent = '';
}
 
// ===== Hint =====
function showHint() {
  hintUsed = true;
  // Reveal first unfilled correct letter
  const firstEmpty = placed.findIndex(p => p === null);
  if (firstEmpty === -1) return;
 
  const correctLetter = currentWord.word[firstEmpty];
 
  // Find a tile with that letter that's not yet used
  const tileIdx = scrambled.findIndex((l, i) => l === correctLetter && !tileUsed[i]);
  if (tileIdx === -1) return;
 
  placed[firstEmpty]  = { letter: correctLetter, tileIdx };
  tileUsed[tileIdx]   = true;
 
  renderSlots();
  renderTiles();
  setFeedback(`Pista: la letra "${correctLetter}" 💡`, 'hint');
 
  if (placed.every(p => p !== null)) {
    setTimeout(checkAnswer, 200);
  }
}
 
// ===== Skip =====
function skipWord() {
  setFeedback(`Era: ${currentWord.word} 😅`, 'wrong');
  setTimeout(() => {
    wordIndex++;
    loadWord();
  }, 1000);
}
 
// ===== Feedback =====
function setFeedback(msg, type) {
  feedbackEl.textContent = msg;
  feedbackEl.className   = `feedback-${type}`;
}
 
// ===== Win =====
function showWin() {
  progressBar.style.width = '100%';
  winScoreEl.textContent  = score;
  winMaxEl.textContent    = deck.length * 10;
  winOverlay.classList.add('show');
}
 
// ===== Event Listeners =====
document.getElementById('btn-clear').addEventListener('click', clearAll);
document.getElementById('btn-hint').addEventListener('click', showHint);
document.getElementById('btn-skip').addEventListener('click', skipWord);
document.getElementById('btn-reset').addEventListener('click', newGame);
 
// ===== Start =====
newGame();