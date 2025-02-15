var board = null;
var game = new Chess();

// Configuration for the chessboard
var boardConfig = {
  draggable: true,
  position: "start",
  onDragStart: handleDragStart,
  onDrop: handleMove,
  onSnapEnd: function () {
    board.position(game.fen());
  }
};

// Initialize the board using chessboard.js
board = Chessboard("board", boardConfig);

// Handle drag start to highlight legal moves
function handleDragStart(source, piece, position, orientation) {
  // Do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // Only allow moving pieces for the side whose turn it is
  if ((game.turn() === "w" && piece.search(/^b/) !== -1) ||
      (game.turn() === "b" && piece.search(/^w/) !== -1)) {
    return false;
  }

  // Remove previous highlights
  $(".square-55d63").removeClass("highlight");

  // Highlight legal moves for the selected piece
  var moves = game.moves({ square: source, verbose: true });
  moves.forEach(function (move) {
    var squareEl = $(".square-" + move.to);
    squareEl.addClass("highlight");
  });
}

// Handle move drop event
function handleMove(source, target) {
  // Remove move highlights
  $(".square-55d63").removeClass("highlight");

  // Attempt to make the move
  var move = game.move({
    from: source,
    to: target,
    promotion: "q" // Always promote to queen for simplicity
  });

  // If move is illegal, snap back the piece
  if (move === null) return "snapback";

  updateMoveHistory();
  updateStatus();
}

// Update move history display
function updateMoveHistory() {
  var history = game.history();
  document.getElementById("moveHistory").innerText = history.join(", ");
}

// Update game status
function updateStatus() {
  var status = "";
  if (game.in_checkmate()) {
    status = "Game over, " + (game.turn() === "w" ? "Black wins!" : "White wins!");
  } else if (game.in_draw()) {
    status = "Game over, it's a draw!";
  } else {
    status = "Next move: " + (game.turn() === "w" ? "White" : "Black");
  }
  // Optionally, you could display status somewhere on the page
  console.log(status);
}

// Reset game button functionality
document.getElementById("resetBtn").addEventListener("click", function () {
  game.reset();
  board.start();
  updateMoveHistory();
  updateStatus();
});

// Undo move button functionality
document.getElementById("undoBtn").addEventListener("click", function () {
  game.undo();
  board.position(game.fen());
  updateMoveHistory();
  updateStatus();
});

// Flip board button functionality
document.getElementById("flipBtn").addEventListener("click", function () {
  board.flip();
});

board = Chessboard("board", {
    draggable: true,
    position: "start",
    pieceTheme: "pieces/{piece}.svg", // Loads custom pieces from the 'pieces' folder
    onDragStart: handleDragStart,
    onDrop: handleMove,
    onSnapEnd: function () {
      board.position(game.fen());
    }
  });
  
// Initialize move history and status on page load
updateMoveHistory();
updateStatus();
