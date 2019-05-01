import React from 'react';

class SignupForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: '',
      error: null
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

  handleSubmit() {
    fetch('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: this.props.token, nickname: this.state.nickname }),
    }).then((response) => {
      switch (response.status) {
        case 201:
          this.props.loginSuccess(response.body);
          break;
        case 403:
          this.props.tokenInvalid()
          break
        default:
          this.setState({error: 'Something went wrong'})
          break;
      }
    });
  }

  render() {
    return <div className='signup-form'>
      <div> Please enter a nickname </div>
      <input 
        value={this.state.nickname} 
        onChange={(e) => this.handleChange(e)}
        onKeyPress={(e) => this.handleKeyPress(e)}></input>
      <button className='ac-button' onClick={(e) => this.handleSubmit(e)}> Confirm </button>
      { this.state.error ? <div> {this.state.error} </div> : null}
    </div>
  }
}

export default SignupForm;