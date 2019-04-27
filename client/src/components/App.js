import React from 'react';
import { connect } from 'react-redux'

import AuthModal from './AuthModal';
import Navbar from './Navbar';


class App extends React.Component {
  render() {
    return <div className='app-root'>
      <Navbar/>
      <div className='app-wrapper'><span className='app-placeholder'>Main App Placeholder</span></div>
      { !this.props.user ? <AuthModal/> : null }
    </div>
  }
}

const mapStateToProps = state => ({
  user: state.auth.user
})

export default connect(
  mapStateToProps
)(App)