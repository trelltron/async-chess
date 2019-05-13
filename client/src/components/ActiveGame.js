import React from 'react';
import { connect } from 'react-redux'

import './ActiveGame.css';

import GameBoard from './GameBoard';

import { generateBoard } from './utils';
import { updateGameState, setActiveGameId, deleteLocalGame } from '../actions';

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
    if (!this.props.activeGame) return this.props.setActiveGameId(null);

    const gameState = generateBoard(this.props.activeGame);
    this.check_for_finished(gameState);
  }
  check_for_finished(gameState) {
    if (!gameState.game_over()) return this.setState({ finished: null });

    if (gameState.in_draw() || gameState.in_stalemate()) {
       return this.setState({ finished: { state: 'draw' } })
    }

    if (gameState.in_checkmate()) {
      let winner = otherSide(gameState.turn());
      this.setState({ finished: { state: 'checkmate', winner } });
    }
  }
  tileClick(tileID) {
    console.log(tileID);
    if (this.state.currentMove || this.state.finished) return;

    if (this.props.activeGame.uid !== 'local' && 
        this.props.activeGame.my_side !==  this.props.activeGame.current_side) {
      return
    }

    const gameState = generateBoard(this.props.activeGame);
    const tile = gameState.get(tileID);

    if (this.state.selected) {
      if (this.state.selected === tileID) {
        return this.setState({ selected: null });
      }
      let move = { from: this.state.selected, to: tileID };

      // if row is 8 (white) or 1 (black), and piece is pawn, promote to queen
      let piece = gameState.get(this.state.selected);
      if (piece.type === 'p' && (
        (piece.color === 'b' && tileID.charAt(1) === '1') || 
        (piece.color === 'w' && tileID.charAt(1) === '8')
      )) {
        move.promotion = 'q';
      }
      let verified = gameState.move(move);
      if (verified) {
        return this.setState({ currentMove: move, selected: null });
      }
    }
    if (tile && tile.color === gameState.turn()) {
      this.setState({ selected: tileID });
    }
  }
  resolveCurrentMove() {
    let updated = Object.assign({}, this.props.activeGame, {
      history: this.props.activeGame.history.map((move) => {
        return Object.assign({}, move)
      })
    });
    updated.history.push(this.state.currentMove);
    this.props.updateGameState(updated);
    this.setState({ currentMove: null });
    const gameState = generateBoard(updated);
    this.check_for_finished(gameState);
  }
  onConfirm() {
    if (this.props.activeGame.uid === 'local') {
      this.resolveCurrentMove();
    } else {
      fetch(`/api/v1/games/${this.props.activeGame.uid}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state.currentMove),
      }).then((response) => {
        if (response.status === 201) {
          return this.resolveCurrentMove();
        }
      });
    }
  }
  onUndo() {
    this.setState({ currentMove: null });
  }
  onBack() {
    this.props.setActiveGameId(null);
  }
  onDelete() {
    this.props.deleteLocalGame();
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
    let clickable = (
        (this.state.finished || this.state.currentMove || (
          this.props.activeGame.uid !== 'local' && 
          this.props.activeGame.my_side !==  this.props.activeGame.current_side)
        ) ? 
      'none' : (this.state.selected ? 'all' : 'own')  
    );
    return (
      <div className='active-game'>
        <div className="header">
          {this.getStateText()}
        </div>
        <div className="board-wrapper">
          <GameBoard 
            state={this.props.activeGame}
            tileClick={(tileID) => this.tileClick(tileID)}
            clickable={clickable}
            selected={this.state.selected}
            currentMove={this.state.currentMove}
            />
        </div>
        <div>
          <button 
            className='ac-button' 
            disabled={!this.state.currentMove}
            onClick={() => this.onConfirm()}> Confirm </button>
          <button 
            className='ac-button'
            disabled={!this.state.currentMove}
            onClick={() => this.onUndo()}> Undo </button>
          <button 
            className='ac-button'
            onClick={() => this.onBack()}> Back </button>
          <button 
            disabled={!(this.props.activeGame.uid === 'local')}
            className='ac-button'
            onClick={() => this.onDelete()}> Delete </button>
        </div>
      </div>
    )
  }
}

const getActiveGameFromState = (state) => {
  if (state.activeGameId === 'local') {
    return state.localGame;
  }
  return state.gameList.find((game) => {
    return game.uid === state.activeGameId
  });
}

const mapStateToProps = state => ({
  activeGame: getActiveGameFromState(state)
})

const mapDispatchToProps = dispatch => ({
  setActiveGameId: (game) => dispatch(setActiveGameId(game)),
  updateGameState: (game) => dispatch(updateGameState(game)),
  deleteLocalGame: () => dispatch(deleteLocalGame())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActiveGame)