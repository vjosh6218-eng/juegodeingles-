// ===== Fruit Data =====
const FRUITS = [
  { id: 'apple',      emoji: '🍎', word: 'Apple' },
  { id: 'banana',     emoji: '🍌', word: 'Banana' },
  { id: 'grapes',     emoji: '🍇', word: 'Grapes' },
  { id: 'strawberry', emoji: '🍓', word: 'Strawberry' },
  { id: 'orange',     emoji: '🍊', word: 'Orange' },
  { id: 'watermelon', emoji: '🍉', word: 'Watermelon' },
  { id: 'pineapple',  emoji: '🍍', word: 'Pineapple' },
  { id: 'cherry',     emoji: '🍒', word: 'Cherry' },
  { id: 'mango',      emoji: '🥭', word: 'Mango' }
];
 
// ===== Game State =====
let moves  = 0;
let pairs  = 0;
let flipped = [];
let locked  = false;
 
// ===== DOM References =====
const grid       = document.getElementById('grid');
const movesEl    = document.getElementById('moves-val');
const pairsEl    = document.getElementById('pairs-val');
const winOverlay = document.getElementById('win-overlay');
const winText    = document.getElementById('win-text');
const legend     = document.getElementById('legend');
 
// ===== Build Legend =====
function buildLegend() {
  legend.innerHTML = '';
  FRUITS.forEach(f => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span>${f.emoji}</span>${f.word}`;
    legend.appendChild(item);
  });
}
 
// ===== Shuffle Array (Fisher-Yates) =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
 
// ===== Build Deck (18 cards: 9 emoji + 9 word) =====
function buildDeck() {
  const cards = [];
  FRUITS.forEach(f => {
    cards.push({ fruitId: f.id, type: 'emoji', emoji: f.emoji, word: f.word });
    cards.push({ fruitId: f.id, type: 'word',  emoji: f.emoji, word: f.word });
  });
  return shuffle(cards);
}
 
// ===== Create a Single Card Element =====
function makeCard(data, idx) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.fruit = data.fruitId;
  card.dataset.type  = data.type;
  card.dataset.idx   = idx;
 
  const inner = document.createElement('div');
  inner.className = 'card-inner';
 
  // Front face (face-down)
  const front = document.createElement('div');
  front.className = 'card-front';
  front.innerHTML = `<span>🌿</span>`;
 
  // Back face (face-up)
  const back = document.createElement('div');
  back.className = `card-back ${data.type}`;
 
  if (data.type === 'emoji') {
    back.innerHTML = `${data.emoji}<span class="emoji-label">image</span>`;
  } else {
    back.innerHTML = `<span class="word-icon">🔤</span><span class="word-text">${data.word}</span>`;
  }
 
  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);
 
  card.addEventListener('click', () => onFlip(card));
  return card;
}
 
// ===== Start / Reset Game =====
function newGame() {
  moves  = 0;
  pairs  = 0;
  flipped = [];
  locked  = false;
 
  movesEl.textContent = 0;
  pairsEl.textContent = 0;
  winOverlay.classList.remove('show');
  grid.innerHTML = '';
 
  buildDeck().forEach((data, idx) => {
    grid.appendChild(makeCard(data, idx));
  });
}
 
// ===== Flip Logic =====
function onFlip(card) {
  if (locked) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (flipped.length >= 2) return;
 
  card.classList.add('flipped');
  flipped.push(card);
 
  if (flipped.length === 2) {
    moves++;
    movesEl.textContent = moves;
    locked = true;
 
    const [a, b] = flipped;
    const isMatch = (
      a.dataset.fruit === b.dataset.fruit &&
      a.dataset.type  !== b.dataset.type
    );
 
    if (isMatch) {
      // Correct pair
      a.classList.add('matched');
      b.classList.add('matched');
      pairs++;
      pairsEl.textContent = pairs;
      flipped = [];
      locked  = false;
 
      if (pairs === FRUITS.length) {
        setTimeout(showWin, 500);
      }
    } else {
      // Wrong pair — shake then flip back
      setTimeout(() => {
        a.classList.add('wrong');
        b.classList.add('wrong');
        setTimeout(() => {
          a.classList.remove('flipped', 'wrong');
          b.classList.remove('flipped', 'wrong');
          flipped = [];
          locked  = false;
        }, 420);
      }, 700);
    }
  }
}
 
// ===== Show Win Screen =====
function showWin() {
  winText.textContent = `¡Lo lograste en ${moves} movimiento${moves !== 1 ? 's' : ''}! 🏆`;
  winOverlay.classList.add('show');
}
 
// ===== Event Listeners =====
document.getElementById('btn-reset').addEventListener('click', newGame);
 
// newGame() also called from the overlay button (inline onclick in HTML)
 
// ===== Init =====
buildLegend();
newGame();
 