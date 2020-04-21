import React, { useState } from 'react';

import UserAutocomplete from '../../../../src/components/user-autocomplete';


const FilterUserAutocomplete = ({ value, onChange, ...rest }) => {

  const [user, setUser] = useState();
  // TODO fix at startup
  console.log('at startup', value)


  return (
    <UserAutocomplete
      {...rest}
      value={user}
      onChange={value => {
        setUser(value);
        onChange(value != null ? value.userId : undefined);
      }}
    />
  );
};

export default FilterUserAutocomplete;