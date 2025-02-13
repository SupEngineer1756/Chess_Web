var board = null;
var game = new Chess();

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

board = Chessboard("board", {
    draggable: true,
    position: "start",
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
});
