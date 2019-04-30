import React from 'react';
import { connect } from 'react-redux'

import {setActiveGame, setLocalGame} from '../actions';

import GameBoard from './GameBoard';

class LocalGameTile extends React.Component {
  newLocalGame() {
    this.props.setLocalGame({ history: [] })
  }
  registerClick() {
    if (this.props.localGame) {
      this.props.setActiveGame(this.props.localGame)
    } else {
      this.newLocalGame();
    }
  }
  render() {
    return (
      <div className="game-list-tile local-game-tile" onClick={() => this.registerClick()}>
        <div className="game-list-tile-header"> 
          { this.props.localGame ? "Resume local game" : "Start local game" }
        </div>
        <div className="game-list-tile-content">
          { 
            this.props.localGame ? 
              <div className='game-list-tile-board-wrapper'>
                <GameBoard size='small' state={this.props.localGame} />
              </div>
            :
              <div 
                className="local-game-tile-new"
              > New</div>
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  localGame: state.localGame
})

const mapDispatchToProps = dispatch => ({
  setActiveGame: (game) => dispatch(setActiveGame(game)),
  setLocalGame: (game) => dispatch(setLocalGame(game))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LocalGameTile)