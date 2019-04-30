import React from 'react';

const logout = () =>  {
  fetch('/api/v1/auth/logout', {method: 'POST'}).then((response) => {
    console.log(response);
    window.location.reload()
  });
}

export default () => (
  <div className='navbar'> 
    <button className='ac-button logout-button' onClick={logout}> Logout </button> 
  </div>
)