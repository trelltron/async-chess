import React from 'react';
import { connect } from 'react-redux'

import AuthModal from './AuthModal';
import Navbar from './Navbar';
import ActiveGame from './ActiveGame';
import GameList from './GameList';

class App extends React.Component {
  render() {
    return <div>
      <Navbar/>
      { 
        this.props.user ? 
          this.props.activeGameId ? <ActiveGame/> : <GameList/>
        : 
          <AuthModal/> 
      }
    </div>
  }
}

const mapStateToProps = state => ({
  user: state.auth.user,
  activeGameId: state.activeGameId
})

export default connect(
  mapStateToProps
)(App)