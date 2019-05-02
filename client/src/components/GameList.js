import React from 'react';
import { connect } from 'react-redux'

import './GameList.css';

import {setGameList} from '../actions';

import InviteTile from './InviteTile';
import GameTile from './GameTile';

class GameList extends React.Component {
  componentDidMount() {
    this.refreshGameList();
  }
  refreshGameList() {
    fetch('/api/v1/games/').then((response) => {
      console.log(response);
      if (response.status === 200) {
        response.json().then((result) => {
          this.props.setGameList(result.games);
        });
      }
    });
  }
  render() {
    return (
      <div className="game-list">
        <InviteTile inviteSuccessCallback={() => this.refreshGameList()}/>
        <GameTile game={this.props.localGame}/>
        { 
          this.props.gameList.map((game) => {
            return <GameTile key={game.uid} game={game}/>
          })
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({
  gameList: state.gameList,
  localGame: state.localGame
})

const mapDispatchToProps = dispatch => ({
  setGameList: (games) => dispatch(setGameList(games))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GameList)