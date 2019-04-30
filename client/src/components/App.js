import React from 'react';
import { connect } from 'react-redux'

import AuthModal from './AuthModal';
import Navbar from './Navbar';
import ActiveGame from './ActiveGame';
import GameList from './GameList';

class App extends React.Component {
  render() {
    return <div className='app-root'>
      <Navbar/>
      { 
        this.props.user ? 
          <div className="app-content-wrapper">
            { this.props.activeGame ? <ActiveGame/> : <GameList/>}
          </div> 
        : 
          <AuthModal/> 
      }
    </div>
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  activeGame: state.activeGame
})

export default connect(
  mapStateToProps
)(App)