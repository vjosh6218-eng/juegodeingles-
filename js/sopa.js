// ===== Fruit Data =====
const FRUITS = [
  { word: 'APPLE',      emoji: '🍎' },
  { word: 'BANANA',     emoji: '🍌' },
  { word: 'GRAPES',     emoji: '🍇' },
  { word: 'ORANGE',     emoji: '🍊' },
  { word: 'MANGO',      emoji: '🥭' },
  { word: 'CHERRY',     emoji: '🍒' },
  { word: 'PINEAPPLE',  emoji: '🍍' },
  { word: 'STRAWBERRY', emoji: '🍓' },
  { word: 'MELON',      emoji: '🍈' },
];
 
const GRID_SIZE = 12;
const DIRECTIONS = [
  [0,  1],   // right
  [1,  0],   // down
  [1,  1],   // diagonal down-right
  [0, -1],   // left
  [-1, 0],   // up
  [-1,-1],   // diagonal up-left
  [1, -1],   // diagonal down-left
  [-1, 1],   // diagonal up-right
];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 
// ===== State =====
let grid        = [];       // 2D char array
let placed      = [];       // { word, cells: [{r,c}], colorIdx }
let foundSet    = new Set(); // found word strings
let selecting   = [];       // [{r,c}] currently dragging
let isDragging  = false;
let foundCount  = 0;
 
// ===== DOM =====
const gridEl     = document.getElementById('grid');
const wordListEl = document.getElementById('word-list');
const winOverlay = document.getElementById('win-overlay');
const winText    = document.getElementById('win-text');
const foundEl    = document.getElementById('found-val');
 
// ===== Generate grid =====
function buildGrid() {
  // empty grid
  grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  placed = [];
 
  // place each word
  const shuffledFruits = shuffle([...FRUITS]);
  shuffledFruits.forEach((f, idx) => {
    placeWord(f.word, idx);
  });
 
  // fill blanks
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      if (!grid[r][c]) grid[r][c] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
}
 
function placeWord(word, colorIdx) {
  const dirs = shuffle([...DIRECTIONS]);
  for (let attempt = 0; attempt < 200; attempt++) {
    const [dr, dc] = dirs[attempt % dirs.length];
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);
    const cells = [];
    let fits = true;
 
    for (let i = 0; i < word.length; i++) {
      const nr = r + dr * i;
      const nc = c + dc * i;
      if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) { fits = false; break; }
      if (grid[nr][nc] && grid[nr][nc] !== word[i]) { fits = false; break; }
      cells.push({ r: nr, c: nc });
    }
 
    if (fits) {
      cells.forEach(({ r, c }, i) => { grid[r][c] = word[i]; });
      placed.push({ word, cells, colorIdx });
      return;
    }
  }
}
 
// ===== Render =====
function renderGrid() {
  gridEl.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
  gridEl.innerHTML = '';
 
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = grid[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
 
      cell.addEventListener('mousedown',  e => startSelect(e, r, c));
      cell.addEventListener('mouseover',  e => continueSelect(e, r, c));
      cell.addEventListener('touchstart', e => { e.preventDefault(); startSelect(e, r, c); }, { passive: false });
      cell.addEventListener('touchmove',  e => {
        e.preventDefault();
        const touch = e.touches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (el && el.classList.contains('cell')) {
          continueSelect(e, +el.dataset.r, +el.dataset.c);
        }
      }, { passive: false });
 
      gridEl.appendChild(cell);
    }
  }
 
  document.addEventListener('mouseup',  endSelect);
  document.addEventListener('touchend', endSelect);
}
 
function renderWordList() {
  wordListEl.innerHTML = '<h2>🔍 Busca las frutas</h2>';
  FRUITS.forEach(f => {
    const item = document.createElement('div');
    item.className = 'word-item' + (foundSet.has(f.word) ? ' done' : '');
    item.id = 'word-' + f.word;
    item.innerHTML = `
      <span class="fruit-emoji">${f.emoji}</span>
      <span>${f.word}</span>
      <span class="check">${foundSet.has(f.word) ? '✔' : ''}</span>
    `;
    wordListEl.appendChild(item);
  });
}
 
// ===== Selection =====
function startSelect(e, r, c) {
  isDragging = true;
  selecting  = [{ r, c }];
  highlightSelecting();
}
 
function continueSelect(e, r, c) {
  if (!isDragging) return;
  const first = selecting[0];
  if (!first) return;
 
  // Allow only straight lines from the first cell
  const dr = r - first.r;
  const dc = c - first.c;
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  if (len === 0) { selecting = [first]; highlightSelecting(); return; }
 
  // Check if direction is valid (straight or diagonal)
  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
  const isDiagonal = Math.abs(dr) === Math.abs(dc);
  const isValid = dr === 0 || dc === 0 || isDiagonal;
  if (!isValid) return;
 
  const cells = [];
  for (let i = 0; i <= len; i++) {
    cells.push({ r: first.r + stepR * i, c: first.c + stepC * i });
  }
  selecting = cells;
  highlightSelecting();
}
 
function endSelect() {
  if (!isDragging) return;
  isDragging = false;
  checkSelection();
  clearSelecting();
  selecting = [];
}
 
function highlightSelecting() {
  document.querySelectorAll('.cell.selecting').forEach(el => el.classList.remove('selecting'));
  selecting.forEach(({ r, c }) => {
    const cell = getCell(r, c);
    if (cell && !cell.classList.contains('found')) cell.classList.add('selecting');
  });
}
 
function clearSelecting() {
  document.querySelectorAll('.cell.selecting').forEach(el => el.classList.remove('selecting'));
}
 
function checkSelection() {
  const word = selecting.map(({ r, c }) => grid[r][c]).join('');
  const wordRev = [...word].reverse().join('');
 
  let match = placed.find(p => p.word === word || p.word === wordRev);
  if (!match || foundSet.has(match.word)) return;
 
  foundSet.add(match.word);
  foundCount++;
  foundEl.textContent = foundCount;
 
  // Color the found cells
  match.cells.forEach(({ r, c }) => {
    const cell = getCell(r, c);
    if (cell) {
      cell.classList.add('found', `found-${match.colorIdx}`);
      cell.classList.remove('selecting');
    }
  });
 
  // Mark word list item
  const item = document.getElementById('word-' + match.word);
  if (item) {
    item.classList.add('done');
    item.querySelector('.check').textContent = '✔';
  }
 
  // Animate
  bounce(match.cells);
 
  if (foundCount === FRUITS.length) {
    setTimeout(showWin, 600);
  }
}
 
function bounce(cells) {
  cells.forEach(({ r, c }, i) => {
    const cell = getCell(r, c);
    if (!cell) return;
    setTimeout(() => {
      cell.style.transform = 'scale(1.3)';
      setTimeout(() => { cell.style.transform = ''; }, 200);
    }, i * 30);
  });
}
 
function getCell(r, c) {
  return gridEl.querySelector(`[data-r="${r}"][data-c="${c}"]`);
}
 
// ===== Win =====
function showWin() {
  winText.textContent = `¡Encontraste todas las ${FRUITS.length} frutas! 🎊`;
  winOverlay.classList.add('show');
}
 
// ===== New Game =====
function newGame() {
  foundSet.clear();
  foundCount = 0;
  selecting  = [];
  isDragging = false;
  foundEl.textContent = 0;
  winOverlay.classList.remove('show');
 
  buildGrid();
  renderGrid();
  renderWordList();
}
 
// ===== Helpers =====
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
 
// ===== Init =====
document.getElementById('btn-reset').addEventListener('click', newGame);
newGame();
 