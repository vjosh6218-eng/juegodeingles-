const WORDS = [
  { word: "APPLE",   clue: "Red or green, keeps the doctor away 🍎",       row: 0, col: 2, dir: "across", num: 1 },
  { word: "MANGO",   clue: "Tropical yellow-orange fruit 🥭",               row: 0, col: 2, dir: "down",   num: 1 },
  { word: "CARROT",  clue: "Orange veggie rabbits love 🥕",                 row: 2, col: 0, dir: "across", num: 3 },
  { word: "ORANGE",  clue: "Citrus fruit, also a color 🍊",                 row: 4, col: 2, dir: "across", num: 5 },
  { word: "ONION",   clue: "Makes you cry when you cut it 🧅",              row: 2, col: 5, dir: "down",   num: 4 },
  { word: "GRAPE",   clue: "Grows in clusters on a vine 🍇",                row: 6, col: 0, dir: "across", num: 7 },
  { word: "LEMON",   clue: "Sour yellow citrus 🍋",                         row: 0, col: 7, dir: "down",   num: 2 },
  { word: "GARLIC",  clue: "Strong-smelling white bulb used in cooking 🧄", row: 4, col: 0, dir: "down",   num: 6 },
  { word: "PEAR",    clue: "Green or yellow, pear-shaped fruit 🍐",         row: 8, col: 4, dir: "across", num: 8 },
  { word: "CORN",    clue: "Yellow veggie on a cob 🌽",                     row: 2, col: 8, dir: "down",   num: 9 },
];

const ROWS = 11, COLS = 11;
let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let activeWord = null;

function buildGrid() {
  WORDS.forEach(w => {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.dir === 'across' ? w.row     : w.row + i;
      const c = w.dir === 'across' ? w.col + i : w.col;
      grid[r][c] = w.word[i];
    }
  });
}

function renderGrid() {
  const el = document.getElementById('crossword-grid');
  el.style.gridTemplateColumns = `repeat(${COLS}, 40px)`;
  el.style.gridTemplateRows    = `repeat(${ROWS}, 40px)`;
  el.innerHTML = '';
  const numMap = {};
  WORDS.forEach(w => { numMap[`${w.row},${w.col}`] = w.num; });
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell' + (grid[r][c] ? '' : ' black');
      cell.dataset.r = r; cell.dataset.c = c;
      if (grid[r][c]) {
        const key = `${r},${c}`;
        if (numMap[key]) {
          const num = document.createElement('div');
          num.className = 'cell-num'; num.textContent = numMap[key];
          cell.appendChild(num);
        }
        const inp = document.createElement('input');
        inp.type = 'text'; inp.maxLength = 1;
        inp.dataset.r = r; inp.dataset.c = c;
        inp.addEventListener('input',   onInput);
        inp.addEventListener('keydown', onKeyDown);
        inp.addEventListener('focus',   onFocus);
        inp.addEventListener('click',   onCellClick);
        cell.appendChild(inp);
      }
      el.appendChild(cell);
    }
  }
}

function getInput(r, c) {
  return document.querySelector(`input[data-r="${r}"][data-c="${c}"]`);
}

function onInput(e) {
  const inp = e.target;
  const r = +inp.dataset.r, c = +inp.dataset.c;
  const val = inp.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
  inp.value = val.slice(-1);
  if (val) moveNext(r, c);
  updateProgress();
}

function onKeyDown(e) {
  const inp = e.target;
  const r = +inp.dataset.r, c = +inp.dataset.c;
  if (e.key === 'Backspace'   && !inp.value) movePrev(r, c);
  if (e.key === 'ArrowRight') { e.preventDefault(); focusCell(r, c + 1); }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); focusCell(r, c - 1); }
  if (e.key === 'ArrowDown')  { e.preventDefault(); focusCell(r + 1, c); }
  if (e.key === 'ArrowUp')    { e.preventDefault(); focusCell(r - 1, c); }
}

function onFocus(e) {
  const r = +e.target.dataset.r, c = +e.target.dataset.c;
  highlightWord(r, c);
}

function onCellClick(e) {
  const r = +e.target.dataset.r, c = +e.target.dataset.c;
  const matches = WORDS.filter(w => cellInWord(r, c, w));
  if (matches.length > 1 && activeWord && matches.includes(activeWord)) {
    const other = matches.find(w => w !== activeWord);
    activeWord = other;
    highlightWordCells(activeWord);
    setActiveClue(activeWord);
  }
}

function focusCell(r, c) { const inp = getInput(r, c); if (inp) inp.focus(); }

function moveNext(r, c) {
  if (!activeWord) return;
  if (activeWord.dir === 'across') focusCell(r, c + 1);
  else focusCell(r + 1, c);
}

function movePrev(r, c) {
  if (!activeWord) return;
  if (activeWord.dir === 'across') focusCell(r, c - 1);
  else focusCell(r - 1, c);
}

function cellInWord(r, c, w) {
  if (w.dir === 'across') return r === w.row && c >= w.col && c < w.col + w.word.length;
  return c === w.col && r >= w.row && r < w.row + w.word.length;
}

function highlightWord(r, c) {
  const matches = WORDS.filter(w => cellInWord(r, c, w));
  if (!matches.length) return;
  let chosen = matches[0];
  if (matches.length > 1 && activeWord && matches.includes(activeWord)) chosen = activeWord;
  activeWord = chosen;
  highlightWordCells(chosen);
  setActiveClue(chosen);
}

function highlightWordCells(w) {
  document.querySelectorAll('input').forEach(inp => { inp.style.background = ''; });
  for (let i = 0; i < w.word.length; i++) {
    const r = w.dir === 'across' ? w.row     : w.row + i;
    const c = w.dir === 'across' ? w.col + i : w.col;
    const inp = getInput(r, c);
    if (inp && !inp.classList.contains('correct') && !inp.classList.contains('revealed'))
      inp.style.background = '#C7F2D2';
  }
  showHint(w);
}

function setActiveClue(w) {
  document.querySelectorAll('.clue-list li').forEach(li => li.classList.remove('active'));
  const li = document.querySelector(`.clue-list li[data-num="${w.num}"][data-dir="${w.dir}"]`);
  if (li) { li.classList.add('active'); li.scrollIntoView({ block: 'nearest' }); }
}

function showHint(w) {
  const bar = document.getElementById('hint-bar');
  bar.style.display = 'block';
  bar.textContent = `${w.num} ${w.dir === 'across' ? '→' : '↓'}: ${w.clue}`;
}

function renderClues() {
  const across = document.getElementById('across-clues');
  const down   = document.getElementById('down-clues');
  WORDS.filter(w => w.dir === 'across').sort((a, b) => a.num - b.num).forEach(w => across.appendChild(buildClueItem(w)));
  WORDS.filter(w => w.dir === 'down').sort((a, b) => a.num - b.num).forEach(w => down.appendChild(buildClueItem(w)));
}

function buildClueItem(w) {
  const li = document.createElement('li');
  li.dataset.num = w.num; li.dataset.dir = w.dir;
  li.innerHTML = `<span>${w.num}.</span>${w.clue}`;
  li.onclick = () => {
    activeWord = w;
    const inp = getInput(w.row, w.col);
    if (inp) inp.focus();
    highlightWordCells(w);
    setActiveClue(w);
  };
  return li;
}

function checkAll() {
  let correct = 0, total = 0;
  WORDS.forEach(w => {
    let wordCorrect = true;
    for (let i = 0; i < w.word.length; i++) {
      const r = w.dir === 'across' ? w.row     : w.row + i;
      const c = w.dir === 'across' ? w.col + i : w.col;
      const inp = getInput(r, c);
      if (!inp) continue;
      total++;
      if (inp.value.toUpperCase() === w.word[i]) {
        inp.classList.remove('wrong'); inp.classList.add('correct'); correct++;
      } else if (inp.value) {
        inp.classList.remove('correct'); inp.classList.add('wrong');
        wordCorrect = false;
        setTimeout(() => inp.classList.remove('wrong'), 1200);
      } else { wordCorrect = false; }
    }
    if (wordCorrect) markCluesSolved(w);
  });
  updateProgress();
  if (correct === countFilledCells() && correct > 0) checkWin();
}

function countFilledCells() {
  let n = 0;
  document.querySelectorAll('input').forEach(inp => { if (inp.value) n++; });
  return n;
}

function markCluesSolved(w) {
  const li = document.querySelector(`.clue-list li[data-num="${w.num}"][data-dir="${w.dir}"]`);
  if (li) li.classList.add('solved');
}

function revealSelected() {
  if (!activeWord) { alert('Click a cell first!'); return; }
  const focused = document.querySelector('input:focus');
  if (focused) {
    const r = +focused.dataset.r, c = +focused.dataset.c;
    if (cellInWord(r, c, activeWord)) {
      const idx = activeWord.dir === 'across' ? c - activeWord.col : r - activeWord.row;
      focused.value = activeWord.word[idx];
      focused.classList.add('revealed');
      updateProgress();
    }
  }
}

function updateProgress() {
  let total = 0, correct = 0;
  WORDS.forEach(w => {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.dir === 'across' ? w.row     : w.row + i;
      const c = w.dir === 'across' ? w.col + i : w.col;
      const inp = getInput(r, c);
      if (!inp) continue;
      total++;
      if (inp.value.toUpperCase() === w.word[i]) correct++;
    }
  });
  const pct = total ? Math.round(correct / total * 100) : 0;
  document.getElementById('pct').textContent           = pct;
  document.getElementById('progress-fill').style.width = pct + '%';
  if (pct === 100) setTimeout(checkWin, 300);
}

function checkWin() {
  let allCorrect = true;
  WORDS.forEach(w => {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.dir === 'across' ? w.row     : w.row + i;
      const c = w.dir === 'across' ? w.col + i : w.col;
      const inp = getInput(r, c);
      if (!inp || inp.value.toUpperCase() !== w.word[i]) allCorrect = false;
    }
  });
  if (allCorrect) document.getElementById('win-modal').classList.add('show');
}

function resetGame() {
  document.querySelectorAll('input').forEach(inp => {
    inp.value = ''; inp.className = ''; inp.style.background = '';
  });
  document.querySelectorAll('.clue-list li').forEach(li => li.classList.remove('active', 'solved'));
  document.getElementById('pct').textContent           = '0';
  document.getElementById('progress-fill').style.width = '0%';
  document.getElementById('hint-bar').style.display    = 'none';
  activeWord = null;
}

function buildBgDecor() {
  const emojis = ['🍎','🥕','🍊','🍇','🥦','🌽','🥭','🍋','🍐','🧅','🧄','🥝','🍓','🥑'];
  const el = document.getElementById('bg-decor');
  emojis.forEach(em => {
    const s = document.createElement('span');
    s.textContent = em;
    s.style.top              = Math.random() * 90 + '%';
    s.style.left             = Math.random() * 95 + '%';
    s.style.fontSize         = (1.5 + Math.random() * 2) + 'rem';
    s.style.animationDelay   = (Math.random() * 5) + 's';
    s.style.animationDuration= (6 + Math.random() * 6) + 's';
    el.appendChild(s);
  });
}

buildBgDecor();
buildGrid();
renderGrid();
renderClues();