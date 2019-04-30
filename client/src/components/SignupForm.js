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

  async handleSubmit() {
    const response = await fetch('/api/v1/auth/signup', {
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

export default SignupForm;