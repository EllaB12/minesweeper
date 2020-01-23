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
var gLives;
var gLivesCount;
var gkeyName;
var gSafeCount;

var gLevel = {
    SIZE: 0,
    MINES: 0
};

//This is called when page loads
function initGame(size) {
    if (gInterval) {
        gInterval = clearInterval(gInterval);
    }
    gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }
    var mines;
    if (size === 4) {
        gkeyName = 'bestScoreBeginner';
        mines = 2;
    } else if (size === 8) {
        gkeyName = 'bestScoreMedium';
        mines = 12;
    } else {
        mines = 30;
        gkeyName = 'bestScoreExpert';
    }

    gLevel = {
        SIZE: size,
        MINES: mines
    };

    if (localStorage.getItem(gkeyName) === null) {
        document.querySelector('.bestTime-container').innerText = 'Best score is: ';
    } else {
        document.querySelector('.bestTime-container').innerText = 'Best score is: ' + localStorage.getItem(gkeyName);
    }

    gFirstCliked = false;
    gFirstClikedRow;
    gFirstClikedCol;
    gHint = false;
    inHintTime = false;
    gLives = 3;
    gLivesCount = 0;
    document.querySelector('.lives-conter').innerText = gLives;
    gSafeCount = 3;
    document.querySelector('.clicks span').innerText = gSafeCount;


    seconds = 0;
    elSeconds = document.querySelector('.seconds-counter');
    document.querySelector('.seconds-counter').innerText = 0;

    gBoard = buildBoard();
    renderBoard(gBoard);
    gGame.isOn = true;
    document.querySelector('.mood-container').innerText = NORMAL;

    document.querySelector('.hint1').classList.remove('disabled');
    document.querySelector('.hint2').classList.remove('disabled');
    document.querySelector('.hint3').classList.remove('disabled');
    document.querySelector('.hint1').classList.remove('remove');
    document.querySelector('.hint1').classList.remove('remove');
    document.querySelector('.hint2').classList.remove('remove');
    document.querySelector('.hint3').classList.remove('remove');

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

    //first click
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

    if (!cell.isShown && !cell.isMarked && !gHint && gGame.isOn) {
        if (cell.isMine) elCell.innerText = MINE;
        else if (cell.minesAroundCount === 0) expandShown(gBoard, elCell, i, j);
        else elCell.innerText = cell.minesAroundCount;

        elCell.classList.add('mark-cell');
        cell.isShown = true;
        gGame.shownCount++;
        console.log(gGame.shownCount);
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
                if (!gBoard[row][col].isMarked) renderCell(row, col, elCurrCell);
            } else {
                if (!gBoard[row][col].isShown && !gBoard[row][col].isMarked) {
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

//Randomly locate mines on the board
function locateMine(board) {
    var count = 0;
    while (count < gLevel.MINES) {
        var row = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var col = getRandomIntInclusive(0, gLevel.SIZE - 1);
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
    var classStr = elCell.classList[1]
    var row = classStr.substring(4, classStr.indexOf('-'));
    var col = classStr.substring(classStr.indexOf('-') + 1);
    var cell = gBoard[row][col];

    if (gGame.isOn && !cell.isShown || cell.isShown && cell.isMine) {
        if (!gBoard[row][col].isMarked) {
            elCell.innerText = FLAG;
            elCell.classList.add('mark-cell');
            gBoard[row][col].isMarked = true;
            gGame.markedCount++;
            checkGameOver(document.querySelector(`.cell${row}-${col}`));
        } else {
            elCell.innerText = '';
            elCell.classList.remove('mark-cell');
            gBoard[row][col].isMarked = false;
            gGame.markedCount--;
        }
    }

}

//Game ends when all mines are marked and all the other cells are shown
function checkGameOver(cell) {
    if (cell.isMine) {
        if (gLivesCount <= gLives) {
            gLives--;
            gLivesCount++;
            document.querySelector('.lives-conter').innerText = gLives;
        } else {
            gGame.isOn = false;
            gLives--;
            document.querySelector('.mood-container').innerText = LOSE;
            document.querySelector('.lives-conter').innerText = gLives;
            gInterval = clearInterval(gInterval);
            return;
        }
    }

    if (gGame.markedCount === gLevel.MINES && gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {
        gGame.isOn = false;
        document.querySelector('.mood-container').innerText = WIN;
        gInterval = clearInterval(gInterval);

        setLocalStorage();
    }
}


function setLocalStorage() {
    var localScore = localStorage.getItem(gkeyName);

    if (localScore !== null) {
        if (seconds < localScore) {
            localStorage.setItem(gkeyName, seconds);
            localScore = localStorage.getItem(gkeyName);
        }
    } else {
        localStorage.setItem(gkeyName, seconds);
        localScore = localStorage.getItem(gkeyName);
    }

    document.querySelector('.bestTime-container').innerText = 'Best score is: ' + localScore;
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
                elCellCurr.classList.add('mark-cell');
            }
        }
    }
}

//When a hint is clicked, there is an indication to the user that he can safely click one
//(unrevealed) cell and reveal it and its neighbors for a second
function getHint(elHint) {
    if (elHint.classList.contains('disabled') || !gGame.isOn) gHint = false;
    else gHint = true;

    elHint.classList.add('remove');
    elHint.classList.add('disabled');
}

//Return a random number
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Restart the game in the same level
function restartGame() {
    initGame(gLevel.SIZE);
}


function incrementSeconds() {
    seconds += 1;
    elSeconds.innerText = seconds;
}

//mark a cell (for a few seconds) that doesn’t contain a MINE 
//and has not been revealed yet
function markSafeCell() {
    if (gSafeCount > 0 && gSafeCount <= 3) {
        var row = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var col = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var cell = gBoard[row][col];

        while (cell.isShown || cell.isMine) {
            var row = getRandomIntInclusive(0, gLevel.SIZE - 1);
            var col = getRandomIntInclusive(0, gLevel.SIZE - 1);
            var cell = gBoard[row][col];
        }

        var elCell = document.querySelector(`.cell${row}-${col}`);
        elCell.classList.add('safe');

        gSafeCount--;
        document.querySelector('.clicks span').innerText = gSafeCount;

        setTimeout(function () {
            elCell.classList.remove('safe');
        }, 2000);
    }
}

//NOTE: The recursion works but the count is not good so there is no victory. I'll fix it on Saturday
// function fullExpand(elCell, i, j) {
//     if (gBoard[i][j].minesAroundCount !== 0 || gBoard[i][j].isShown) return;

//     elCell.innerText = gBoard[i][j].minesAroundCount;
//     gBoard[i][j].isShown = true;

//     if (gBoard[i][j].minesAroundCount === 0) {

//         for (var row = i - 1; row <= i + 1; row++) {
//             if (row < 0 || row >= gBoard.length) continue;

//             for (var col = j - 1; col <= j + 1; col++) {
//                 if (col < 0 || col >= gBoard.length) continue;
//                 if (row === i && col === j) continue;

//                 var elCellCurr = document.querySelector(`.cell${row}-${col}`);

//                 fullExpand(elCellCurr, row, col);

//                 var cell = gBoard[row][col];
//                 if (!cell.isShown) gGame.shownCount++;
//                 console.log(gGame.shownCount);
//                 cell.isShown = true;

//                 if (!cell.isMarked) {
//                     elCellCurr.innerText = cell.minesAroundCount;
//                     elCellCurr.classList.add('mark-cell');
//                 }
//             }
//         }
//     } else return false;
// }











