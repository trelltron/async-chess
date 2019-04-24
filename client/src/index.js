import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import GoogleLogin from 'react-google-login';

class SignupForm extends Component {
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

  async handleSubmit() {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: this.props.token, nickname: this.state.nickname }),
    });

    console.log(response);

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
  }

  render() {
    return <div>
      <span> Please enter a nickname</span>
      <input value={this.state.nickname} onChange={(e) => this.handleChange(e)}></input>
      <button onClick={(e) => this.handleSubmit(e)}> Confirm </button>
    </div>
  }
}

class AuthModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      token: null
    }
  }
  async attemptLogin(data) {
    console.log(data);
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: data.tokenId }),
    });

    console.log(response);

    switch (response.status) {
      case 200:
        this.props.loginSuccess(response.body);
        break;
      case 404:
        this.setState({token: data.tokenId})
        break
      default:
        this.setState({error: 'Something went wrong'})
        break;
    }
  }

  render() {
    return (
      <div className= 'auth-modal'>
        { this.state.error ? this.state.error : 'Please Sign in. '}
        { this.state.token ?
          <SignupForm 
            token={this.state.token}
            tokenInvalid={this.tokenInvalid}
            loginSuccess={this.props.loginSuccess}
          /> :
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText="Login"
            responseType="id_token"
            onSuccess={(data) => this.attemptLogin(data)}
            onFailure={(data) => console.log(data)}
            cookiePolicy={'single_host_origin'}
          />
        }
      </div>
    );
  }
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      auth_required: false
    }
  }
  componentDidMount() {
    this.fetchUserData();
  }
  render() {
    return <div className='app-root'>
      <span>Main App Placeholder</span>
      { this.state.auth_required ? <AuthModal loginSuccess={(user) => this.loginSuccess(user)}/> : null }
    </div>
  }
  fetchUserData() {
    fetch('/api/me').then((response) => {
      console.log(response);
      if (response.status === 200) {
        response.json().then((user) => {
          this.setState({ user })
        })
      } else {
        this.setState({ auth_required: true })
      }
    });
  }
  loginSuccess(user) {
    this.setState({ auth_required: false });
    this.fetchUserData();
  }
}

ReactDOM.render(
  <Main/>,
  document.getElementById('root')
);