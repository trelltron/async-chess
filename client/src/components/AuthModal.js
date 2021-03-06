import React from 'react';
import { connect } from 'react-redux'

import './AuthModal.css';

import GoogleLogin from 'react-google-login';

import SignupForm from './SignupForm';
import Loading from './Loading';

import {setToken, setUser, setAuthRequired} from '../actions';

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
    fetch('/api/v1/auth/me').then((response) => {
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
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: data.tokenId }),
    });

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
      return <div className='centered'>
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
      <div className='centered'>
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
      <div className= 'modal auth-modal'>
        <div className= 'modal-inner'>
          <div className='modal-header'>
            <div className='modal-header-text centered'>
              { this.state.error ? this.state.error : 'Please Sign in. ' }
            </div>
          </div>
          <div className='modal-content'>
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