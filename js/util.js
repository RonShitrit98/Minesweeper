'use strict'

function createMat(rows, cols, cellContent) {
    var mat = []
    for (var i = 0; i < rows; i++) {
        mat[i] = []
        for (var j = 0; j < cols; j++) {
            mat[i][j] = ''
        }
    }
    return mat
}


function getCellIdStr(cellIdx){
    var cellId= `${cellIdx.i}-${cellIdx.j}`
    return cellId
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }


  function findCellIdx(elCell){
     var cellId = elCell.className.substring(9,12).split('-')
     var cellIdx = {i:+cellId[0],j:+cellId[1]}
    //  console.log(cellIdx)
     return cellIdx
  }

  function getCellIdStr(cellIdx) {
    var cellId = `cell${cellIdx.i}-${cellIdx.j}`
    return cellId
}
function getElCell(cellIdx) {
    var elCell = document.querySelector(`.${getCellIdStr(cellIdx)}`)
    return elCell
}