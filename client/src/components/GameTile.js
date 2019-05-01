import React from 'react';
import { connect } from 'react-redux'

import {setActiveGameId, updateGameState, createLocalGame} from '../actions';

import GameBoard from './GameBoard';

class GameTile extends React.Component {
  registerClick() {
    if (this.props.game) {
      this.props.setActiveGameId(this.props.game.uid)
    } else {
      this.props.createLocalGame();
    }
  }
  getHeaderText() {
    if (!this.props.game) return  "Start local game";

    if (this.props.game.uid === 'local') {
      return 'Resume local game'
    }

    if (this.props.game.finished) {
      if (!this.props.game.winner) {
        return <span>
          Draw.
        </span>
      }
      if (this.props.game.winner == this.props.game.my_side) {
        return <span className="text-success">
          You Won!
        </span>
      } else {
        return <span className="text-loss">
          You Lost!
        </span>
      }
    }

    let myTurn = (this.props.game.my_side ===  this.props.game.current_side);
    if (myTurn) {
      return <span className="text-flash">
        Your Turn!
      </span>
    }
    return `Waiting for player: ${this.props.game.opponent_nickname}`
  }
  render() {
    return (
      <div className="game-list-tile clickable" onClick={() => this.registerClick()}>
        <div className="game-list-tile-header"> 
          { this.getHeaderText() }
        </div>
        <div className="game-list-tile-content">
          { 
            this.props.game ? 
              <div className='game-list-tile-board-wrapper'>
                <GameBoard size='small' state={this.props.game} />
              </div>
            :
              <div 
                className="local-game-tile-new"
              > New </div>
          }
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  setActiveGameId: (uid) => dispatch(setActiveGameId(uid)),
  updateGameState: (game) => dispatch(updateGameState(game)),
  createLocalGame: () => dispatch(createLocalGame())
})

export default connect(
  null,
  mapDispatchToProps
)(GameTile)