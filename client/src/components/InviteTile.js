import React from 'react';

class InviteTile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: '',
      error: null,
      success: false
    }
  }

  handleChange(event) {
    this.setState({ nickname: event.target.value });
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.handleSubmit();
    }
  }

  async handleSubmit() {
    const response = await fetch('/api/v1/games/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname: this.state.nickname }),
    });

    switch (response.status) {
      case 201:
        // Refresh game list
        this.setState({ error : null, success: true });
        this.props.inviteSuccessCallback();
        break;
      case 404:
        this.setState({ error : 'No user has that nickname', success: false });
        break
      default:
        this.setState({ error: 'Something went wrong', success: false })
        break;
    }
  }

  getMessage() {
    if (this.state.error) {
      return (
        <span className='text-error'>
          {this.state.error}
        </span>
      );
    }
    if (this.state.success) {
      return (
        <span className='text-success'>
          Invite Sent!
        </span>
      );
    }
    return null;
  }

  render() {
    return (
      <div className="game-list-tile">
        <div className="game-list-tile-header"> Invite a User to a game by their username </div>
        <div className="game-list-tile-header"> {this.getMessage()} </div>
        <div className="game-list-invite-input">
          <input 
            value={this.state.nickname} 
            onChange={(e) => this.handleChange(e)}
            onKeyPress={(e) => this.handleKeyPress(e)}></input>
        </div>
        <div className="game-list-invite-button">
          <button className='ac-button' onClick={(e) => this.handleSubmit(e)}> Confirm </button>
        </div>
      </div>
    )
  }
}

export default InviteTile