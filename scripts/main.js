puzzles = {
  easy: [
    ".21.9.....3.......4.7.62.8...3..86..21.95.7...68.4315..8.27..63.9.4.5.17.42..1.95821594376639817524457362981573128649214956738968743152185279463396485217742631895",
  ],
}

function getPuzzle(difficulty) {
  return randomChoice(puzzles[difficulty])
}

function transpose(arr) {
  const N = arr.length - 1
  const result = arr.map((row, i) => row.map((val, j) => arr[N - j][i]))
  arr.length = 0
  arr.push(...result)
}

class Notes extends Object {
  constructor() {
    super()
    for (let i = 1; i <= 9; i++) {
      this[i] = false
    }
  }

  toggle(v) {
    if (v < 1 || v > 9) {
      throw `Index out of bounds: ${v}`
    }
    this[v] = !this[v]
  }

  toString() {
    let s = []
    for (let k in this) {
      if (this[k]) {
        s.push(k)
      }
    }
    s.sort()
    return s.join(' ')
  }

}

class Transform {
  constructor() {
    this.shift = random(0, 8)
    this.rotate = random(0, 3)
    this.flip = {
      horizontal: randomBoolean(),
      vertical: randomBoolean(),
    }
    this.shuffle = [
      new List(0, 1, 2).shuffle(),
      new List(0, 1, 2).shuffle(),
      new List(0, 1, 2).shuffle(),
    ]
  }
}

class GameBoard {
  constructor(difficulty) {
    this.autoclearnotes = true
    this.highlight = true
    this.state = 'play'
    this.difficulty = difficulty
    this.puzzle = getPuzzle(difficulty)
    this.transform = new Transform()
    this.transform.shift = 0
    this.transform.rotate = 0
    this.transform.flip.horizontal = false
    this.transform.flip.vertical = false
    this.transform.shuffle[0] = [0, 1, 2]
    this.transform.shuffle[1] = [0, 1, 2]
    this.transform.shuffle[2] = [0, 1, 2]
    this.init()
  }

  init() {
    this.board = []
    this.solution = []
    this.shift()
    this.rotate()
    this.flip()
    this.shuffle()
  }

  toggleState() {
    if (this.state === 'play') {
      this.state = 'notes'
    } else {
      this.state = 'play'
    }
  }

  shift() {
    const MIN = "1".charCodeAt(0)
    const MAX = "9".charCodeAt(0)
    const MOD = 9
    const LEN = MOD * MOD

    const ceasar = (row, i) => {
      let c = this.puzzle.charCodeAt(i)
      let entry = {
        value: "",
        notes: new Notes(),
      }
      if (c >= MIN && c <= MAX) {
        entry.value = ((c - MIN + this.transform.shift) % MOD) + 1
      }
      row.push(entry)
    }

    let j = 0
    let row, s_row
    for (let i = 0; i < LEN; i++) {
      if (j++ % MOD === 0) {
        row = []
        s_row = []
        this.board.push(row)
        this.solution.push(s_row)
      }

      ceasar(row, i)
      ceasar(s_row, LEN + i)
    }
  }

  rotate() {
    for (let r = 0; r < this.transform.rotate; r++) {
      transpose(this.board)
      transpose(this.solution)
    }
  }

  flip() {
    if (this.transform.flip.vertical) {
      for (let row = 0; row < this.board.length; row++) {
        this.board[row].reverse()
        this.solution[row].reverse()
      }
    }

    if (this.transform.flip.horizontal) {
      this.board.reverse()
      this.solution.reverse()
    }
  }

  shuffle() {
    for (let i = 0; i < this.transform.shuffle.length; i++) {
      let idx_0, idx_1, idx_2
      let row_0, row_1, row_2
      let s_row_0, s_row_1, s_row_2
      let start_idx = 3 * i

      idx_0 = this.transform.shuffle[i][0]
      idx_1 = this.transform.shuffle[i][1]
      idx_2 = this.transform.shuffle[i][2]

      row_0 = [...this.board[start_idx + idx_0]]
      row_1 = [...this.board[start_idx + idx_1]]
      row_2 = [...this.board[start_idx + idx_2]]
      s_row_0 = [...this.solution[start_idx + idx_0]]
      s_row_1 = [...this.solution[start_idx + idx_1]]
      s_row_2 = [...this.solution[start_idx + idx_2]]

      this.board[start_idx] = row_0
      this.board[start_idx + 1] = row_1
      this.board[start_idx + 2] = row_2
      this.solution[start_idx] = s_row_0
      this.solution[start_idx + 1] = s_row_1
      this.solution[start_idx + 2] = s_row_2
    }
  }

  clearNotes(r, c, v) {
    // update notes along the row
    this.board[r].forEach(
      (e, i) => e.notes[v] = false
    )

    // update notes along the col
    this.board.forEach(
      (row, i) => row[c].notes[v] = false
    )
  }

  updateNote(r, c, v, b) {
    this.board[r][c].notes.toggle(v)
  }

  placeValue(r, c, v) {
    let curr_val = this.board[r][c].value
    if (curr_val) {
      throw "Value already exists at this location"
    } else {
      if (this.solution[r][c].value != v) {
        throw "Cannot place that value here"
      } else {
        this.board[r][c].value = v
      }
    }
  }

  play(r, c, v) {
    if (this.state === 'play') {
      this.placeValue(r, c, v)
      if (this.autoclearnotes === true) {
        this.clearNotes(r, c, v)
      }
    } else {
      this.updateNote(r, c, v)
    }
  }

  isSolved() {
    for (let row = 0; row < this.board.length; row++) {
      for (let col = 0; col < this.board[row].length; col++) {
        if (this.board[row][col].value != this.solution[row][col].value)
          return false
      }

    }
    return true
  }
}

///////////////////////////////
// SUDOKU
//////////////////////////////
let board = new GameBoard('easy')
let activBtn = null;
let strikes = 0

board.autoclearnotes = false
board.highlight = true

window.onload = updateBoardView
// console.log(board.puzzle)
// console.table(board.board.map(row => row.map(c => (c.value) ? c.value : c.notes)))
// console.table(board.solution.map(row => row.map(c => c.value)))

//////////////////////////////////
// FUNCTIONS
//////////////////////////////////
function clearActive() {
  if (activBtn) {
    activBtn.classList.remove('active')
    activBtn = null
  }
}

function setActive(btn) {
  clearActive()
  activBtn = btn
  activBtn.classList.add('active')
  highlight()
}

function play(val) {
  if (!activBtn) {
    return
  }
  let row = activBtn.getAttribute("data-row")
  let col = activBtn.getAttribute("data-col")
  try {
    board.play(row, col, val)
    if (board.state === 'play') {
      clearActive()
      clearHighlight()
    }
    updateBoardView()
  } catch (e) {
    strikes++
    console.log(`Strike ${strikes} ${e}`)
  }
  isGameOver()
}

function isGameOver() {
  if (board.isSolved()) {
    let msg = (strikes > 3) ? "win streak is broken." : "You WON!"
    console.log(`Game Over, ${msg}`)
  }
}

//////////////////////////////////
// UI
//////////////////////////////////
function togglePlayFn(btn) {
  board.toggleState()
  btn.innerText = board.state[0]
}

function clearHighlight() {
  // FIXME : why do I have to do this weird thing ?
  let nodes = document.getElementsByClassName('highlight')
  while (nodes.length) {
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].classList.remove('highlight')
    }
    nodes = document.getElementsByClassName('highlight')
  }
}

function highlight() {
  clearHighlight()
  if (board.highlight === true && activBtn) {
    const r = activBtn.getAttribute('data-row')
    const c = activBtn.getAttribute('data-col')
    const b = activBtn.getAttribute('data-block')

    const hi_lite = nodes => nodes.forEach(n => n.classList.add('highlight'))

    hi_lite(document.querySelectorAll(`[data-row="${r}"]`))
    hi_lite(document.querySelectorAll(`[data-col="${c}"]`))
    hi_lite(document.querySelectorAll(`[data-block="${b}"]`))
  }
}

function updateBoardView() {
  for (let row = 0; row < board.board.length; row++) {
    for (let col = 0; col < board.board[row].length; col++) {
      let btn = document.getElementById(`${row}_${col}`)
      let value = board.board[row][col].value
      btn.innerText = (value) ? value : board.board[row][col].notes
    }
  }
  highlight()
}