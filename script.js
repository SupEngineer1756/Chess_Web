var game = new Chess();
let history = [];


function parseFEN(fen) {
    let [position, turn, castling, enPassant, halfMove, fullMove] = fen.split(" ");

    let board = [];
    let rows = position.split("/");
    for (let row of rows) {
        let expandedRow = [];
        for (let char of row) {
            if (!isNaN(char)) {
                expandedRow.push(...Array(parseInt(char)).fill(null));
            } else {
                expandedRow.push(char);
            }
        }
        board.push(expandedRow);
    }

    return {
        board: board,
        turn: turn,
        castling: castling,
        enPassant: enPassant,
        halfMove: parseInt(halfMove),
        fullMove: parseInt(fullMove)
    };
}

function boardToFEN(gameState) {
    let fen = gameState.board.map(row => {
        return row.reduce((acc, square) => {
            if (square === null) {
                return acc + (acc.slice(-1).match(/\d/) ? (parseInt(acc.slice(-1)) + 1) : "1");
            }
            return acc + square;
        }, "");
    }).join("/");

    return `${fen} ${gameState.turn} ${gameState.castling} ${gameState.enPassant} ${gameState.halfMove} ${gameState.fullMove}`;
}

function generateMoves(gameState, x, y) {
    let board = gameState.board;
    let piece = board[y][x];
    let moves = [];

    if (!piece) return moves;

    let isWhite = piece === piece.toUpperCase();

    if (piece.toLowerCase() === "p") { // Pawn moves
        let dir = isWhite ? -1 : 1;
        if (board[y + dir][x] === null) moves.push([x, y + dir]); // Forward move
        if (x > 0 && board[y + dir][x - 1] && board[y + dir][x - 1] !== piece) moves.push([x - 1, y + dir]); // Capture left
        if (x < 7 && board[y + dir][x + 1] && board[y + dir][x + 1] !== piece) moves.push([x + 1, y + dir]); // Capture right
    }

    // More rules for knights, bishops, rooks, queens, kings to be added here...

    return moves;
}


function isLegalMove(gameState, fromX, fromY, toX, toY) {
    let possibleMoves = generateMoves(gameState, fromX, fromY);
    return possibleMoves.some(move => move[0] === toX && move[1] === toY);
}


function makeMove(gameState, fromX, fromY, toX, toY) {
    if (!isLegalMove(gameState, fromX, fromY, toX, toY)) return false; // Invalid move

    gameState.board[toY][toX] = gameState.board[fromY][fromX]; // Move piece
    gameState.board[fromY][fromX] = null; // Empty old square
    gameState.turn = gameState.turn === "w" ? "b" : "w"; // Switch turns
    gameState.fullMove++;

    return true;
}


function makeMoveWithHistory(gameState, fromX, fromY, toX, toY) {
    history.push(JSON.parse(JSON.stringify(gameState))); // Save current state
    return makeMove(gameState, fromX, fromY, toX, toY);
}

function undoMove() {
    if (history.length > 0) {
        return history.pop();
    }
    return null;
}


function isCheckmate(gameState) {
    let kingPosition = null;

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            let piece = gameState.board[y][x];
            if (piece && piece.toLowerCase() === "k" && (gameState.turn === "w" ? piece === "K" : piece === "k")) {
                kingPosition = { x, y };
            }
        }
    }

    if (!kingPosition) return false;

    let opponentMoves = [];
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            opponentMoves.push(...generateMoves(gameState, x, y));
        }
    }

    return opponentMoves.some(move => move[0] === kingPosition.x && move[1] === kingPosition.y);
}


function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false; // Prevent moving if the game is over
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop(source, target) {
    var move = game.move({
        from: source,
        to: target,
        promotion: "q"
    });

    if (move === null) return "snapback";

    updateStatus();
}

function updateStatus() {
    if (game.in_checkmate()) {
        alert("Game Over! " + (game.turn() === "w" ? "Black wins!" : "White wins!"));
    }
}

function onSnapEnd() {
    board.position(game.fen());
}

document.getElementById("resetBtn").addEventListener("click", function () {
    game.reset();
    board.position("start");
});

var board = Chessboard("board", {
    draggable: true,
    position: "start",
    pieceTheme: "pieces/{piece}.svg",
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
});