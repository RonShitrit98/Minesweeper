'use strict'
const MINE_IMG = '<img src="img/mine.png"/>'
const FLAG = '<img src="img/flag.gif"/>'
const LIVES = ['Game Over', '<img src="img/live.gif"/>', '<img src="img/live.gif"/><img src="img/live.gif"/>', '<img src="img/live.gif"/><img src="img/live.gif"/><img src="img/live.gif"/>']
const CELL_IMGS = [' ', '<img src="img/1.png"/>', '<img src="img/2.png"/>', '<img src="img/3.png"/>', '<img src="img/4.png"/>', '<img src="img/5.png"/>', '<img src="img/6.png"/>', '<img src="img/7.png"/>', '<img src="img/8.png"/>']
const MINER = '<img class="miner" src="img/miner.png"/>'
const MINER_DEAD = '<img src="img/minerdead.png"/>'
const MINER_WIN = '<img class="miner" src="img/minerwin.png"/>'

var gTimerSeconds = 0
var gTimerMinuts = 0
var gTimerInterval
var gBoard

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    lives: 2
}
var gLvl = {
    size: 8,
    mines: 12
}

function init() {
    gBoard = createBoard()
    renderBoard(gBoard)
    gTimerSeconds = 0
    gTimerMinuts = 0
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        lives: 2
    }
    if (gLvl.size === 4) gGame.lives = 1
    if (gLvl.size === 4) gGame.lives = 1
    var elMiner = document.querySelector('.miner')
    elMiner.innerHTML = MINER
    var elVictory = document.querySelector('.victory')
    elVictory.style.visibility = 'hidden'
    var elLives = document.querySelector('.lives')
    elLives.innerHTML = LIVES[gGame.lives + 1]
    clearInterval(gTimerInterval)
}



function createBoard() {
    var board = []
    for (var i = 0; i < gLvl.size; i++) {
        board[i] = []
        for (var j = 0; j < gLvl.size; j++) {
            var cellIdx = { i, j }
            var cell = {
                id: cellIdx,
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            board[i][j] = cell
        }
    }
    console.table(board)
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < board[0].length; j++) {
            var cellId = getCellIdStr(board[i][j].id)
            strHTML += `<td class="cell ${cellId} hidden" onclick="cellClicked(this,{i:${i},j:${j}})" oncontextmenu="markCell(this,{i:${i},j:${j}})"> </td>`

        }
        strHTML += `</tr>`
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}
function cellClicked(elCell, cellIdx) {
    var currCell = gBoard[cellIdx.i][cellIdx.j]
    if (!gGame.isOn) {
        if (!gGame.shownCount) {
            gTimerInterval = setInterval(startTimer, 1000)
            gGame.isOn = true
            addMines(gBoard, currCell)
        } else return
    }
    if (currCell.isMarked) return
    elCell.classList.remove('hidden')
    if (currCell.isMine) {
        elCell.innerHTML = MINE_IMG
        elCell.classList.add('clicked')
        gGame.shownCount++
        if (gGame.lives) {
            gGame.lives--
            var elLives = document.querySelector('.lives')
            elLives.innerHTML = LIVES[gGame.lives + 1]
            gGame.shownCount++
            currCell.isShown = true
            checkVictory()
            return

        } else {
            gameOver()
            return
        }
    }
    currCell.minesAroundCount = countNegs(gBoard, cellIdx)
    gGame.shownCount++
    currCell.isShown = true
    elCell.innerHTML = CELL_IMGS[currCell.minesAroundCount]
    if (!currCell.minesAroundCount) openEmptyCells(cellIdx, elCell)
    checkVictory()
}
function markCell(elCell, cellIdx) {
    document.addEventListener('contextmenu', event.preventDefault());
    var currCell = gBoard[cellIdx.i][cellIdx.j]
    if (currCell.isShown) return
    elCell.classList.toggle('flag')
    if (!currCell.isMarked) {
        elCell.innerHTML = FLAG
        currCell.isMarked = true
        if (currCell.isMine) gGame.markedCount++
    } else {
        currCell.isMarked = false
        if (currCell.isMine) gGame.markedCount--
        elCell.innerHTML = ''
    }
    checkVictory()
}

function gameOver(isVictory = false) {
    gGame.isOn = false
    clearInterval(gTimerInterval)
    if (isVictory) {
        var elBanner = document.querySelector('.victory')
        elBanner.style.visibility = 'visible'
        var elMiner = document.querySelector('.miner')
        elMiner.innerHTML = MINER_WIN
    } else {
        var elMiner = document.querySelector('.miner')
        elMiner.innerHTML = MINER_DEAD
        gGame.lives--
        var elLives = document.querySelector('.lives')
        elLives.innerHTML = LIVES[gGame.lives + 1]
        showAllMines()
    }

}

function checkVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isMarked && !currCell.isShown) return
        }
    }
    return gameOver(true)
}

function openEmptyCells(cellIdx) {
    for (var i = cellIdx.i - 1; i <= cellIdx.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = cellIdx.j - 1; j <= cellIdx.j + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1 || (i === cellIdx.i && j === cellIdx.j)) continue
            var currCell = gBoard[i][j]
            var elCell = getElCell({ i, j })
            if (!currCell.isShown) cellClicked(elCell, { i, j })

        }
    }
}

function addMines(board, clickedcell) {
    var mineCount = gLvl.mines
    while (mineCount) {
        var currCell = board[getRandomInt(0, gLvl.size)][getRandomInt(0, gLvl.size)]
        if (currCell.isMine || currCell === clickedcell) continue
        currCell.isMine = true
        mineCount--
        // currCell.minesAroundCount = countNegs(gBoard, currCell.id)
    }

}

function countNegs(board, cellIdx) {
    var count = 0
    for (var i = cellIdx.i - 1; i <= cellIdx.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = cellIdx.j - 1; j <= cellIdx.j + 1; j++) {
            if (j < 0 || j > board[0].length - 1 || (i === cellIdx.i && j === cellIdx.j)) continue
            var currCell = board[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}

function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                var elCell = getElCell({ i, j })
                elCell.innerHTML = MINE_IMG
                elCell.classList.add('mine')
            }
        }
    }
}

function changeLvl(lvl) {
    switch (lvl) {
        case 1:
            gLvl.size = 4
            gLvl.mines = 2

            break
        case 2:
            gLvl.size = 8
            gLvl.mines = 12
            break
        case 3:
            gLvl.size = 12
            gLvl.mines = 30
            break
    }

    init()
}

function startTimer() {
    if (gTimerSeconds === 59) {
        gTimerSeconds = 0
        gTimerMinuts++
    } else gTimerSeconds++
    var elTimer = document.querySelector('.time')
    elTimer.innerText = ` ${gTimerMinuts}:${gTimerSeconds}`
}