import React from 'react';
import { connect } from 'react-redux'

import './Navbar.css';

class Navbar extends React.Component {
  logout() {
    fetch('/api/v1/auth/logout', {method: 'POST'}).then((response) => {
      window.location.reload()
    });
  }
  render() {
    return (
      <div className='navbar'> 
        { this.props.user ? 
            <span className="player-nickname"> nickname: { this.props.user.nickname } </span>
          :
            null
        }
        <button className='ac-button' onClick={this.logout}> Logout </button> 
      </div>
    )
  }
}


const mapStateToProps = state => ({
  user: state.auth.user
})

export default connect(
  mapStateToProps
)(Navbar)