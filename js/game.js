'use strict'
const MINE = '🧨'
var gTimerSeconds = 0
var gTimerMinuts = 0
var gTimerInterval
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
}
var gLvl = {
    size: 4,
    mines: 2
}
var gBoard

function init() {
    gBoard = bulidBoard()
    renderBoard(gBoard)
    gTimerSeconds = 0
    gTimerMinuts = 0
    var elGameBanner = document.querySelector('.gameover')
    elGameBanner.style.display = 'none'
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
    }

}



function bulidBoard() {
    var board = []
    for (var i = 0; i < gLvl.size; i++) {
        board[i] = []
        for (var j = 0; j < gLvl.size; j++) {
            board[i][j] = createCell({ i, j })
        }
    }
    addMines(board)
    setMinesNegsCount(board)
    console.table(board)
    return board
}
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            var cellId = getCellIdStr(currCell.id)
            var cellContent = currCell.minesAroundCount
            if (currCell.isMine) cellContent = MINE
            // strHTML += `<td class="cell ${cellId} hidden" onclick="cellClicked(this)" oncontextmenu="markCell(this,34)">${cellContent}</td>`
            strHTML += `<td class="cell ${cellId} hidden" onclick="cellClicked(this,{i:${i},j:${j}})" oncontextmenu="markCell(this,{i:${i},j:${j}})">${cellContent}</td>`
            // strHTML += `<td class="cell" id="${cellId}" onclick="cellClicked(this, id)" oncontextmenu="markCell(this, id)"><span class="hidden">${cellContent}<span/></td>`

        }
        strHTML += `</tr>`
    }
    // console.log(strHTML)
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}
function addMines(board) {
    var mineCount = gLvl.mines
    while (mineCount) {
        var currBoard = board[getRandomInt(0, gLvl.size)][getRandomInt(0, gLvl.size)]
        if (currBoard.isMine) continue
        currBoard.isMine = true
        mineCount--
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
    gBoard = bulidBoard()
    renderBoard(gBoard)
}


function openEmptyCells(cellIdx) {
    // debugger
    for (var i = cellIdx.i - 1; i <= cellIdx.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = cellIdx.j - 1; j <= cellIdx.j + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1 || (i === cellIdx.i && j === cellIdx.j)) continue
            // console.log(cellIdx)
            var currCell = gBoard[i][j]
            var elCell = getElCell({i, j})
            if (!currCell.isShown) cellClicked(elCell,{i,j})

            // if (!currCell.minesAroundCount) openEmptyCells({i,j})
        }
    }
}
function cellClicked(elCell,cellIdx) {
    console.log(cellIdx)
    if (!gGame.isOn && gGame.shownCount===0) {
        gTimerInterval = setInterval(startTimer, 1000)
        gGame.isOn = true
        console.log(gGame.isOn)
    }else if (!gGame.isOn) {
        console.log('boop')
        return
    }
    if (elCell.classList.contains('flag')) return
    elCell.classList.remove('hidden')
    // var cellIdx = findCellIdx(elCell)
    gGame.shownCount++
    if (gBoard[cellIdx.i][cellIdx.j].isMine) {
        gameOver()
        elCell.classList.add('clicked')
        return
    }
    gBoard[cellIdx.i][cellIdx.j].isShown = true
    if (!gBoard[cellIdx.i][cellIdx.j].minesAroundCount) openEmptyCells(cellIdx, elCell)
    checkVictory()
}

function markCell(elCell,cellIdx) {
    document.addEventListener('contextmenu', event.preventDefault());
    if (!elCell.classList.contains('hidden')) return
    elCell.classList.toggle('flag')
    if(elCell.classList.contains('flag'))gBoard[cellIdx.i][cellIdx.j].isMarked = true
    if(!elCell.classList.contains('flag'))gBoard[cellIdx.i][cellIdx.j].isMarked = false
    // console.log(gBoard[cellIdx.i][cellIdx.j].isMarked)
    checkVictory()
}



function gameOver(isVictory = false) {
    // debugger
    gGame.isOn = false
    clearInterval(gTimerInterval)
    var elGameBanner = document.querySelector('.gameover')
    elGameBanner.style.display = 'block'
    if (!isVictory) {
        showAllMines()
        elGameBanner.innerHTML = `<h1>Game Over! your time: ${gTimerMinuts}:${gTimerSeconds}.</h1><button onclick="init()">Restart Game</button>`
    }
}
function checkVictory() {
    var shownCells = gLvl.size * gLvl.size - gLvl.mines
    if (shownCells === gGame.shownCount) {
        gameOver(true)
        return
    }
}
function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                var elCell = getElCell({ i, j })
                elCell.classList.remove('hidden')
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
        isMarked: false
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