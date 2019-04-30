import React from 'react';
import { connect } from 'react-redux'

import {setActiveGame} from '../actions';

import InviteTile from './InviteTile';
import LocalGameTile from './LocalGameTile';

class GameList extends React.Component {
  render() {
    return (
      <div className="game-list">
        <InviteTile/>
        <LocalGameTile/>
        <LocalGameTile/>
        <LocalGameTile/>
        <LocalGameTile/>
        <LocalGameTile/>
        <LocalGameTile/>
        <LocalGameTile/>
        {/* { this.props.gameList.map((game) => {
          <GameBox game={game}/>
        })} */}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  gameData: state.gameData,
  gameList: []
})

const mapDispatchToProps = dispatch => ({
  setActiveGame: (game) => dispatch(setActiveGame(game))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GameList)