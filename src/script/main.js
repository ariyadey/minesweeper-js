const rowNum = 9, colNum = 8, minesNum = 10;

const gameSituation = {
    field: getRandomField(rowNum, colNum, minesNum),
    situation: {
        gameStarted: false,
        gameLost: false,
        gameWon: false,
    },
};

initBoard();


function initBoard() {
    for (let i = 0; i < rowNum; i++) {
        let row = document.createElement("div");
        for (let j = 0; j < colNum; j++) {
            const square = document.createElement("button");
            square.className = "default"
            //todo HTML Element Event Map? Consider using it instead of hard coding.
            square.addEventListener("click", () => {
                handleCellClick("left", i, j);
                refresh()
            });
            square.addEventListener("contextmenu", (ev) => {
                ev.preventDefault();
                handleCellClick("right", i, j);
                refresh();
            })
            row.appendChild(square);
        }
        document.getElementById("minefield-box").appendChild(row);
    }
    // document.getElementById("info-box")
    //     .getElementsByTagName("button")[0]
    //     .addEventListener("click", () => {
    //         handleResetClick();
    //         initBoard();
    //     });
}

function refresh() {
    refreshBoard();
    refreshInfo();
}

function refreshInfo() {
    document.getElementById("remainedFlags").textContent = getRemainedFlags();
}

function refreshBoard() {
    const board = document.getElementById("minefield-box");
    const rows = board.children;
    const field = gameSituation.field;
    for (let i = 0; i < rowNum; i++) {
        for (let j = 0; j < colNum; j++) {
            const button = rows[i].children[j];
            const cell = field[i][j];
            if (cell.opened) {
                if (cell.mined) {
                    button.className = "mined";
                } else {
                    button.className = "cleared";
                    button.textContent = cell.minesAround > 0 ? cell.minesAround : null;
                }
            } else {
                button.className = cell.flagged ? "flagged" : "default";
            }
        }
    }
}

//todo: Make the game more usable by modifying conditions
//todo: Refactor it
handleCellClick = (clickType, row, column) => {
    // const field = this.state.field.slice(); //todo: WARNING! It's still a shallow copy
    const field = JSON.parse(JSON.stringify(gameSituation.field)); //todo: Test it
    const situation = {...gameSituation.situation};
    const cell = field[row][column];
    if (situation.gameWon || situation.gameLost || cell.opened) return;
    if (!situation.gameStarted) {
        //todo It's a rule! The first click shouldn't be on mine! Optimize and improve UX!
        if (clickType === "left" && cell.mined) {
            return handleResetClick();
        }
        situation.gameStarted = true;
    }
    if (clickType === "left") {
        cell.opened = true;
        cell.flagged = false;
        if (cell.mined) {
            gameOver();
        } else {
            expandAround(row, column);
        }
    } else if (clickType === "right" && this.getRemainedFlags() > 0) {
        cell.flagged = true;
    }
    if (isGameWon()) {
        situation.gameWon = true;
    } //todo: You can make it more concise


    gameSituation.situation = situation;
    gameSituation.field = field;

    function gameOver() {
        situation.gameLost = true;
        for (const row of field) {
            for (const cell of row) {
                if (cell.mined) {
                    cell.flagged = false;
                    cell.opened = true;
                }
            }
        }
    }

    function expandAround(r, c) {
        if (field[r][c].traversed) return;

        field[r][c].traversed = true;
        field[r][c].opened = true;

        if (field[r][c].minesAround === 0) {
            if (r > 0 && c > 0) expandAround(r - 1, c - 1);
            if (r > 0) expandAround(r - 1, c);
            if (r > 0 && c < field[0].length - 1) expandAround(r - 1, c + 1);
            if (c > 0) expandAround(r, c - 1);
            if (c < field[0].length - 1) expandAround(r, c + 1);
            if (r < field.length - 1 && c > 0) expandAround(r + 1, c - 1);
            if (r < field.length - 1) expandAround(r + 1, c);
            if (r < field.length - 1 && c < field[0].length - 1) expandAround(r + 1, c + 1);
        }
    }

    function isGameWon() {
        for (const row of field) {
            for (const cell of row) {
                if (!cell.opened && !cell.flagged) {
                    return false;
                }
            }
        }
        return true;
    }
}

function handleResetClick() {
    gameSituation.field = getRandomField(rowNum, colNum, minesNum);
    gameSituation.situation = {
        gameStarted: false,
        gameLost: false,
        gameWon: false,
    }
}

function getRemainedFlags() {
    let flags = 0;
    for (const row of gameSituation.field) {
        for (const element of row) {
            if (element.flagged) {
                flags++;
            }
        }
    }
    return flags <= minesNum ? minesNum - flags : 0;
}

// const squares = document.querySelectorAll("#minefield-box > div");

//todo: Optimize it
//todo: Refactor it
function getRandomField(rows, columns, mines) {
    const rowsArr = [...Array(rows)]
        .map(() => [...Array(columns)]
            .map(() => ({
                opened: false,
                flagged: false,
                mined: false,
                traversed: false,   //todo: WARNING! Watch out potential bugs
                minesAround: 0,
            }))
        );
    let minesPut = 0;
    while (minesPut < mines) {
        const row = Math.floor(Math.random() * (rows));
        const column = Math.floor(Math.random() * (columns));
        if (!rowsArr[row][column].mined) {
            rowsArr[row][column].mined = true;

            if (row > 0 && column > 0) rowsArr[row - 1][column - 1].minesAround++;
            if (row > 0) rowsArr[row - 1][column].minesAround++;
            if (row > 0 && column < rowsArr[0].length - 1) rowsArr[row - 1][column + 1].minesAround++;
            if (column > 0) rowsArr[row][column - 1].minesAround++;
            if (column < rowsArr[0].length - 1) rowsArr[row][column + 1].minesAround++;
            if (row < rowsArr.length - 1 && column > 0) rowsArr[row + 1][column - 1].minesAround++;
            if (row < rowsArr.length - 1) rowsArr[row + 1][column].minesAround++;
            if (row < rowsArr.length - 1 && column < rowsArr[0].length - 1) rowsArr[row + 1][column + 1].minesAround++;

            minesPut++;
        }
    }
    return rowsArr;
}

