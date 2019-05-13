import React from 'react';

import './SignupForm.css';

class SignupForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: '',
      error: null
    }
  }

  isFormValid() {
    return (
      this.state.nickname.length >= 5 && 
      this.state.nickname.length <= 20
    );
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
        case 200:
        case 201:
          this.props.loginSuccess(response.body);
          break;
        case 400:
          response.json().then((data) => {
            switch (data.code) {
              case 'token_invalid':
                this.props.tokenInvalid()
                break;
              case 'nickname_exists':
                this.setState({error: 'That nickname has been taken, pick something else'})
                break;
              default:
                this.setState({error: 'Something went wrong'})
            }
          });
          break;
        default:
          this.setState({error: 'Something went wrong'})
      }
    });
  }

  render() {
    return <div className='signup-form'>
      <div> Please enter a nickname </div>
      <div className="small-text"> Nickname must be between 5 and 20 characters </div>
      <input 
        value={this.state.nickname} 
        onChange={(e) => this.handleChange(e)}
        onKeyPress={(e) => this.handleKeyPress(e)}></input>
      <button disabled={!this.isFormValid()} className='ac-button' onClick={(e) => this.handleSubmit(e)}> Confirm </button>
      { this.state.error ? <div className="small-text text-error"> {this.state.error} </div> : null}
    </div>
  }
}

export default SignupForm;