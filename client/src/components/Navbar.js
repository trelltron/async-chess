import React from 'react';

const logout = () =>  {
  fetch('/api/logout', {method: 'POST'}).then((response) => {
    console.log(response);
    window.location.reload()
  });
}

export default () => (
  <div className='navbar'> 
    <button className='logout-button' onClick={logout}> Logout </button> 
  </div>
)