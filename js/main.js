'use strict';

const MINE = '💣';
const FLAG = '🚩';

var NORMAL = '😀';
var LOSE = '😧';
var WIN = '😎';

var gBoard;
var gLevel;
var gGame;
var gFirstCliked;
var gFirstClikedRow;
var gFirstClikedCol;
var gHint;
var inHintTime;
var gNumOfHints;
var ghintsCount;
var gInterval;
var seconds;
var elSeconds;

//This is called when page loads
function initGame() {
    gLevel = { SIZE: 4, MINES: 2 };
    gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }
    gFirstCliked = false;
    gFirstClikedRow;
    gFirstClikedCol;
    gHint = false;
    inHintTime = false;

    seconds = 0;
    elSeconds = document.querySelector('.seconds-counter');
    document.querySelector('.seconds-counter').innerText = 0;

    gBoard = buildBoard();
    renderBoard(gBoard);
    gGame.isOn = true;
    document.querySelector('.mood-container').innerText = NORMAL;

    document.querySelector('.hint1').style.display = 'inline-block';
    document.querySelector('.hint2').style.display = 'inline-block';
    document.querySelector('.hint3').style.display = 'inline-block';
}

//Builds the board and set mines at random locations
function buildBoard() {
    var SIZE = gLevel.SIZE;
    var board = [];

    for (var i = 0; i < SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < SIZE; j++) {
            board[i][j] = creatCell();
        }
    }

    console.log(board);

    return board;
}

//Creat cell objects
function creatCell() {
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    };

    return cell;
}

//Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = '<table border="1"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            cell = '';
            var className = 'cell cell' + i + '-' + j;
            strHTML += '<td class="' + className + '" onclick=cellClicked(this,' + i + ',' + j + ') oncontextmenu="cellMarked(this)"> ' + cell + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.game-container');
    elContainer.innerHTML = strHTML;
}

//Count mines around each cell by call findMinesAroundCell(board, row, col) 
//and set the cell's minesAroundCount
function setMinesNegsCount(board) {

    for (var i = 0; i < board.length; i++)
        for (var j = 0; j < board[i].length; j++) {
            var countMines = findMinesAroundCell(board, i, j);
            var cell = board[i][j];
            cell.minesAroundCount = countMines;
        }
}

//Count mines around each cell
function findMinesAroundCell(board, row, col) {
    var countMinesNeighbors = 0;

    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= board.length) continue;

        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (i === row && j === col) continue;

            if (board[i][j].isMine) {
                countMinesNeighbors++;
            }

        }
    }

    return countMinesNeighbors;
}

//Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j];

    //first 
    if (!gFirstCliked) {
        gInterval = setInterval(incrementSeconds, 1000);
        gFirstCliked = true;
        gFirstClikedRow = i;
        gFirstClikedCol = j;
        locateMine(gBoard);
        setMinesNegsCount(gBoard);
    }

    //get hint
    if (gHint && !inHintTime) {
        inHintTime = true;
        renderNeighborsByHint(i, j);
        setTimeout(function () {
            gHint = false;
            renderNeighborsByHint(i, j);
            inHintTime = false;
        }, 1000);
    }

    if (!cell.isShown && !cell.isMarked && !gHint) {
        if (cell.isMine) elCell.innerText = MINE;
        else if (cell.minesAroundCount === 0) expandShown(gBoard, elCell, i, j);
        else elCell.innerText = cell.minesAroundCount;

        cell.isShown = true;
        gGame.shownCount++;
        checkGameOver(cell);
    }
}

//Render the neighbors cell
function renderNeighborsByHint(i, j) {
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row >= gBoard.length) continue;

        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col >= gBoard.length) continue;

            var elCurrCell = document.querySelector(`.cell${row}-${col}`);
            if (gHint) {
                renderCell(row, col, elCurrCell);
            } else {
                if (!gBoard[row][col].isShown) {
                    document.querySelector(`.cell${row}-${col}`).innerText = '';
                }
            }
        }
    }
}

//Render cell
function renderCell(row, col, elCell) {
    var cell = gBoard[row][col];

    if (cell.isMine) {
        elCell.innerText = MINE;
    } else {
        elCell.innerText = cell.minesAroundCount;
    }
}

//Randomly locate the 2 mines on the board
function locateMine(board) {
    var count = 0;
    while (count < gLevel.MINES) {
        var row = getRandomIntInclusive(0, 3);
        var col = getRandomIntInclusive(0, 3);
        if (row === gFirstClikedRow && col === gFirstClikedCol) continue;
        var cell = board[row][col];
        if (!cell.isMine) {
            cell.isMine = true;
            count++;
        }
    }
}

//Called on right click to mark a cell (suspected to be a mine)
function cellMarked(elCell) {
    elCell.innerText = FLAG;

    var row = elCell.classList[1].substring(4, 5);
    var col = elCell.classList[1].substring(6);
    gBoard[row][col].isMarked = true;
    gGame.markedCount++;
    checkGameOver(document.querySelector(`.cell${row}-${col}`));
}

//Game ends when all mines are marked and all the other cells are shown
function checkGameOver(cell) {
    if (cell.isMine) {
        gGame.isOn = false;
        document.querySelector('.mood-container').innerText = LOSE;
        gInterval = clearInterval(gInterval);
    }

    if (gGame.markedCount === gLevel.MINES && gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {
        gGame.isOn = false;
        document.querySelector('.mood-container').innerText = WIN;
        gInterval = clearInterval(gInterval);
    }
}

//When user clicks a cell with no mines around, we need to open not only that cell, 
//but also its neighbors
function expandShown(board, elCell, i, j) {
    elCell.innerText = board[i][j].minesAroundCount;

    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row >= board.length) continue;

        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col >= board.length) continue;
            if (row === i && col === j) continue;

            var cell = board[row][col];
            if (!cell.isShown) gGame.shownCount++;
            cell.isShown = true;

            if (!cell.isMarked) {
                var elCellCurr = document.querySelector(`.cell${row}-${col}`);
                elCellCurr.innerText = cell.minesAroundCount;
            }
        }
    }
}

//When a hint is clicked, there is an indication to the user that he can safely click one
//(unrevealed) cell and reveal it and its neighbors for a second
function getHint(elHint) {
    gHint = true;
    elHint.style.display = 'none';
}

//Return a random number
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function incrementSeconds() {
    seconds += 1;
    elSeconds.innerText = seconds;
}











