import React from 'react';
import { connect } from 'react-redux'

import GoogleLogin from 'react-google-login';

import {setToken, setUser, setAuthRequired} from '../actions';

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
    return <div className='signup-form'>
      <div> Please enter a nickname </div>
      <input value={this.state.nickname} onChange={(e) => this.handleChange(e)}></input>
      <button onClick={(e) => this.handleSubmit(e)}> Confirm </button>
      { this.state.error ? <div> {this.state.error} </div> : null}
    </div>
  }
}

const Loading = () => (
  <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
)

class AuthModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    }
  }

  componentDidMount() {
    this.fetchUserData();
  }

  fetchUserData() {
    fetch('/api/me').then((response) => {
      console.log(response);
      if (response.status === 200) {
        response.json().then((user) => {
          this.props.setUser(user)
        })
      } else {
        this.props.setAuthRequired()
      }
    });
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
        this.fetchUserData();
        break;
      case 404:
        this.props.setToken(data.tokenId)
        break
      default:
        this.setState({error: 'Something went wrong'})
        break;
    }
  }

  fill_modal_content() {
    if (!this.props.auth.auth_required) {
      return <div className='auth-modal-loading-wrapper'>
        <Loading/>
      </div>
    }
    
    if (this.props.auth.token) {
      return (
        <SignupForm 
          token={this.props.auth.token}
          tokenInvalid={this.tokenInvalid}
          loginSuccess={() => this.fetchUserData()}
        />
      )
    }

    return (
      <div className='auth-modal-button-wrapper'>
        <GoogleLogin
          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
          buttonText="Login"
          responseType="id_token"
          onSuccess={(data) => this.attemptLogin(data)}
          onFailure={(data) => console.log(data)}
          cookiePolicy={'single_host_origin'}
        />
      </div>
    )
  }

  render() {
    return (
      <div className= 'auth-modal'>
        <div className= 'auth-modal-inner'>
          <div className='auth-modal-top-panel'>
            <div className='auth-modal-text'>
              { this.state.error ? this.state.error : 'Please Sign in. ' }
            </div>
          </div>
          <div className='auth-modal-content'>
            {this.fill_modal_content()}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
})

const mapDispatchToProps = dispatch => ({
  setToken: (token) => dispatch(setToken(token)),
  setUser: (user) => dispatch(setUser(user)),
  setAuthRequired: () => dispatch(setAuthRequired(true))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthModal)