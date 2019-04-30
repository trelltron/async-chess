import React from 'react';
import { connect } from 'react-redux'

import GameBoard from './GameBoard';

import { generateBoard } from './utils';
import { setLocalGame, setActiveGame } from '../actions';

const otherSide = (side) => (side === 'w') ? 'b' : 'w';
const sideIdToText = (side) => (side === 'w') ? 'White' : 'Black';

const getTurnInfo = (history) => {
  let side = (history.length % 2) ? 'b' : 'w';
  let turn = Math.floor(history.length / 2) + 1
  return  { side, turn }
};

class ActiveGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMove: null,
      selected: null,
      finished: null
    }
  }
  componentDidMount() {
    const gameState = generateBoard(this.props.activeGame);
    this.check_for_finished(gameState);
  }
  check_for_finished(gameState) {
    if (!gameState.game_over()) return this.setState({ finished: null });

    if (gameState.in_draw() || gameState.in_stalemate()) {
       return this.setState({ finished: { state: 'draw' } })
    }

    if (gameState.in_checkmate()) {
      let winner = gameState.turn();
      this.setState({ finished: { state: 'checkmate', winner} });
    }
  }
  tileClick(tileID) {
    if (this.state.currentMove) return;
    const gameState = generateBoard(this.props.activeGame);
    const tile = gameState.get(tileID);

    if (this.state.selected) {
      let move = {from: this.state.selected, to: tileID};
      let verified = gameState.move(move);
      if (verified) {
        this.setState({ currentMove: move, selected: null });
        return;
      }
    }
    if (tile && tile.color === gameState.turn()) {
      this.setState({ selected: tileID });
    }
  }
  onConfirm() {
    let updated = Object.assign({}, this.props.activeGame, {
      history: this.props.activeGame.history.map((move) => {
        return Object.assign({}, move)
      })
    });
    updated.history.push(this.state.currentMove);
    this.props.setActiveGame(updated);
    this.props.setLocalGame(updated);
    this.setState({ currentMove: null });
    const gameState = generateBoard(updated);
    this.check_for_finished(gameState);
  }
  onUndo() {
    this.setState({ currentMove: null });
  }
  onBack() {
    this.props.setActiveGame(null);
  }
  onDelete() {
    this.props.setLocalGame(null);
    this.props.setActiveGame(null);
  }
  getStateText() {
    if (this.state.finished) {
      if (this.state.finished.state === 'draw') {
        return 'Game ended in a draw.'
      }
      if (this.state.finished.state === 'checkmate') {
      
        return `Game Over! ${sideIdToText(this.state.finished.winner)} side won! `
      }
      return 'Game Over!!!'
    }
    const turnInfo = getTurnInfo(this.props.activeGame.history);
    return `Turn: ${turnInfo.turn} - ${sideIdToText(turnInfo.side)} to move `

  }
  render() {
    return (
      <div className='active-game'>
        <div>
          {this.getStateText()}
        </div>
        <div className="active-game-board-wrapper">
          <GameBoard 
            allowInput={true} 
            state={this.props.activeGame}
            tileClick={(tileID) => this.tileClick(tileID)}
            selected={this.state.selected}
            currentMove={this.state.currentMove}
            />
        </div>
        <div className='active-game-controls'>
          <button 
            disabled={!this.state.currentMove}
            onClick={() => this.onConfirm()}> Confirm </button>
          <button 
            disabled={!this.state.currentMove}
            onClick={() => this.onUndo()}> Undo </button>
          <button 
            onClick={() => this.onBack()}> Back </button>
          <button 
            onClick={() => this.onDelete()}> Delete </button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  activeGame: state.activeGame
})

const mapDispatchToProps = dispatch => ({
  setActiveGame: (game) => dispatch(setActiveGame(game)),
  setLocalGame: (game) => dispatch(setLocalGame(game))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActiveGame)