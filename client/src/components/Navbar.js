import React from 'react';

import './Navbar.css';

const logout = () =>  {
  fetch('/api/v1/auth/logout', {method: 'POST'}).then((response) => {
    console.log(response);
    window.location.reload()
  });
}

export default () => (
  <div className='navbar'> 
    <button className='ac-button' onClick={logout}> Logout </button> 
  </div>
)