import React from 'react';


const Header = ({ record }) => {

  return (
    <div className="user-record-header">
      <h1>{record.title}</h1>
    </div>
  );


}

export default Header;