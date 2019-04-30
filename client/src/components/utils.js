import Chess from 'chess.js';

export const generateBoard = (gameState) => {
  let board = Chess();
  if (gameState && gameState.history) {
    gameState.history.forEach((move) => {
      board.move(move);
    });
  }
  return board;
}