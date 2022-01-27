'use strict'
const MINE = '🧨'
const MINE_IMG = '<img src="img/mine.png"/>'
const FLAG = '<img src="img/flag.gif"/>'
const LIVES = ['Game Over', '<img src="img/live.gif"/>', '<img src="img/live.gif"/><img src="img/live.gif"/>', '<img src="img/live.gif"/><img src="img/live.gif"/><img src="img/live.gif"/>']
const CELL_IMG = [' ', '<img src="img/1.png"/>', '<img src="img/2.png"/>', '<img src="img/3.png"/>', '<img src="img/4.png"/>', '<img src="img/5.png"/>', '<img src="img/6.png"/>', '<img src="img/7.png"/>', '<img src="img/8.png"/>']
const MINER = '<img class="miner" src="img/miner.png"/>'
const MINER_DEAD = '<img src="img/minerdead.png"/>'
const MINER_WIN = '<img class="miner" src="img/minerwin.png"/>'
var gTimerSeconds = 0
var gTimerMinuts = 0
var gTimerInterval
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
var gBoard

function init() {
    gBoard = bulidBoard()
    renderBoard(gBoard)
    gTimerSeconds = 0
    gTimerMinuts = 0
    // var elGameBanner = document.querySelector('.gameover')
    // elGameBanner.style.display = 'none'
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        lives: 2
    }
    if (gLvl.size === 4) gGame.lives = 1
    var elMiner = document.querySelector('.miner')
    elMiner.innerHTML = MINER
    var elVictory = document.querySelector('.victory')
    elVictory.style.visibility = 'hidden'
    var elLives = document.querySelector('.lives')
    elLives.innerHTML = LIVES[gGame.lives + 1]
    console.log(elLives)
    clearInterval(gTimerInterval)

}


function bulidBoard() {
    var board = []
    for (var i = 0; i < gLvl.size; i++) {
        board[i] = []
        for (var j = 0; j < gLvl.size; j++) {
            board[i][j] = createCell({ i, j })
        }
    }

    return board
}
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            var cellId = getCellIdStr(currCell.id)
            // var cellContent = CELL_IMG[currCell.minesAroundCount]
            if (currCell.isMine) cellContent = MINE
            strHTML += `<td class="cell ${cellId} hidden" onclick="cellClicked(this,{i:${i},j:${j}})" oncontextmenu="markCell(this,{i:${i},j:${j}})"> </td>`
            // strHTML += `<td class="cell ${cellId} hidden" onclick="cellClicked(this,{i:${i},j:${j}})" oncontextmenu="markCell(this,{i:${i},j:${j}})">${cellContent}</td>`

        }
        strHTML += `</tr>`
    }
    // console.log(strHTML)
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}
function addMines(board, clickedcell) {
    var mineCount = gLvl.mines
    while (mineCount) {
        var currCell = board[getRandomInt(0, gLvl.size)][getRandomInt(0, gLvl.size)]
        if (currCell.isMine || currCell === clickedcell) continue
        currCell.isMine = true
        mineCount--
    }
    setMinesNegsCount(board)
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
function cellClicked(elCell, cellIdx) {
    var currCell = gBoard[cellIdx.i][cellIdx.j]
    if (!gGame.isOn && gGame.shownCount === 0) {
        addMines(gBoard, currCell)
        gTimerInterval = setInterval(startTimer, 1000)
        gGame.isOn = true
        console.log(gGame.isOn)
    } else if (!gGame.isOn) {
        return
    }
    if (elCell.classList.contains('flag')) return
    elCell.classList.remove('hidden')
    if (currCell.isMine) {
        elCell.innerHTML = MINE_IMG
        elCell.classList.add('clicked')
        gGame.shownCount++
        gameOver()
        return
    }
    gGame.shownCount++
    currCell.isShown = true
    elCell.innerHTML = CELL_IMG[currCell.minesAroundCount]
    if (!currCell.minesAroundCount) openEmptyCells(cellIdx, elCell)
    checkVictory()
}


function markCell(elCell, cellIdx) {
    document.addEventListener('contextmenu', event.preventDefault());
    if (!elCell.classList.contains('hidden')) return
    elCell.classList.toggle('flag')
    if (elCell.classList.contains('flag')) {
        elCell.innerHTML = FLAG
        gBoard[cellIdx.i][cellIdx.j].isMarked = true
        if (gBoard[cellIdx.i][cellIdx.j].isMine) {
            gGame.markedCount++
        }
    }
    if (!elCell.classList.contains('flag')) {
        gBoard[cellIdx.i][cellIdx.j].isMarked = false
        if (gBoard[cellIdx.i][cellIdx.j].isMine) gGame.markedCount--
        elCell.innerHTML = ''
    }
    // console.log(gBoard[cellIdx.i][cellIdx.j].isMarked)
    checkVictory()

}



function gameOver(isVictory = false) {
    if (!isVictory && gGame.lives) {
        gGame.lives--
        var elLives = document.querySelector('.lives')
        elLives.innerHTML = LIVES[gGame.lives + 1]
        return
    }
    gGame.isOn = false
    clearInterval(gTimerInterval)
    // var elGameBanner = document.querySelector('.gameover')
    // elGameBanner.style.display = 'block'
    if (!isVictory) {
        var elMiner = document.querySelector('.miner')
        elMiner.innerHTML = MINER_DEAD
        console.log(elMiner)
        gGame.lives--
        var elLives = document.querySelector('.lives')
        elLives.innerHTML = LIVES[gGame.lives + 1]
        showAllMines()
        // elGameBanner.innerHTML = `<h1>Game Over! your time: ${gTimerMinuts}:${gTimerSeconds}.</h1><button onclick="init()">Restart Game</button>`
    } else {
        var elBanner = document.querySelector('.victory')
        elBanner.style.visibility = 'visible'
        var elMiner = document.querySelector('.miner')
        elMiner.innerHTML = MINER_WIN
        // elGameBanner.innerHTML = `<h1>You Won! your time: ${gTimerMinuts}:${gTimerSeconds}.</h1><button onclick="init()">Restart Game</button>`
    }
}
// function checkVictory(){
//     for(var i=0;i<gBoard.length;i++){
//         for(var j=0;j<gBoard[0].length;j++){
//             if(!gBoard[i][j].isMarked && !gBoard[i][j].isShown){
//                 console.log('check victory')
//                 return
//             }
//         }
//     }
//     gameOver(true)
// }
function checkVictory() {
    var shownCells = gLvl.size * gLvl.size
    if (shownCells === gGame.shownCount + gGame.markedCount) {
        gameOver(true)
        return
    }
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
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = countNegs(board, board[i][j].id)
        }
    }
}


function getCellIdStr(cellIdx) {
    var cellId = `cell${cellIdx.i}-${cellIdx.j}`
    return cellId
}
function getElCell(cellIdx) {
    var elCell = document.querySelector(`.${getCellIdStr(cellIdx)}`)
    return elCell
}
function createCell(cellIdx, isMine = false) {
    var cell = {
        id: cellIdx,
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
    }
    if (isMine) cell.isMine = true
    return cell
}

function startTimer() {
    if (gTimerSeconds === 59) {
        gTimerSeconds = 0
        gTimerMinuts++
    } else gTimerSeconds++
    var elTimer = document.querySelector('.time')
    elTimer.innerText = ` ${gTimerMinuts}:${gTimerSeconds}`
}