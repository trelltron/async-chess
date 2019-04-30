import React from 'react';

import { generateBoard } from './utils';

const row = [8, 7, 6, 5, 4, 3, 2, 1];
const col = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];


const getSymbol = (content) => {
  if (!content) return null;
  switch (content.type) {
    case 'k':
      return content.color === 'w' ? 'k' : 'l'
    case 'q':
      return content.color === 'w' ? 'q' : 'w'
    case 'n':
      return content.color === 'w' ? 'n' : 'm'
    case 'b':
      return content.color === 'w' ? 'b' : 'v'
    case 'r':
      return content.color === 'w' ? 'r' : 't'
    case 'p':
      return content.color === 'w' ? 'p' : 'o'
  }
};


class GameBoard extends React.Component {
  render() {
    let highlighted = this.props.selected ? [this.props.selected] : [];
    let gameState = generateBoard(this.props.state);

    if (this.props.currentMove) {
      highlighted.push(this.props.currentMove.to);
      highlighted.push(this.props.currentMove.from);
      gameState.move(this.props.currentMove);
    }
    return (
      <table className={'game-board ' + this.props.size}>
        <tbody>
        {
          row.map((rowCoord) => {
            return <tr key={"board-row-" + rowCoord} className="game-board-row">
              {
                col.map((colCoord) => {
                  const tileID = colCoord + rowCoord;
                  const content = gameState.get(tileID);
                  let css = 'game-board-col';
                  {/* if (this.props.allowInput && content && content.color === gameState.turn()) {
                    css = css + ' clickable';
                  } */}
                  if (highlighted.indexOf(tileID) > -1) {
                    css = css + ' selected';
                  }
                  return (
                    <td 
                        key={"board-row-" + rowCoord + "-col-" + colCoord} 
                        className={css}
                        onClick={this.props.tileClick ? () => this.props.tileClick(tileID) : null}>
                      { getSymbol(content) }
                    </td>
                  )
                })
              }
            </tr>
          })
        }
        </tbody>
      </table>
    )
  }
}

export default GameBoard;