import React, { useState } from 'react';
import { AutoComplete, InputGroup } from 'rsuite';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo';

import { SEARCH } from './queries';

const UserAutocomplete = ({ 
  value, 
  onChange = () => {}, 
  style,
  placeholder = null
}) => {
  const [search, setSearch] = useState(null);
  const [items, setItems] = useState(null);

  const variables = {
    username: search != null ? search : undefined,
    id: search == null ? (value != null ? value.id : 0) : undefined
  };
  const { client } = useQuery(SEARCH, {
    fetchPolicy: 'network-only',
    variables,
    onCompleted: data => setItems(data.users)
  }); 

  let current;
  if (search != null) {
    current = search;
  } else {
    if (!_.isEmpty(items)) {
      current = `${items[0].username} (${items[0].userId})`;
    } else {
      current = '';
    }
  }

  return (
    <div className="ui-user-autocomplete">
      <InputGroup inside style={style}>
        <AutoComplete 
          value={current}
          placeholder={placeholder} 
          renderItem={({ username, userId }) => <div>{username} <em>({userId})</em></div>}
          onChange={(current, event) => {
            const isBackspace = event.nativeEvent != null && event.nativeEvent.inputType === 'deleteContentBackward';
            if (event.keyCode === 13) {              
              const found = items.find(item => item.id === current);
              if (found != null) {
                setSearch(null);
                onChange(found);
              }
            } else if (isBackspace) {
              if (search != null) {
                setSearch(current);
              } 
              setItems(null);
              onChange(null);
            } else if (event.nativeEvent != null && event.nativeEvent.inputType === 'insertText') {
              setSearch(String(current));
            }            
          }}
          onSelect={item => {    
            if (item != null) {                          
              setSearch(null);
              onChange(item);
            }
          }}          
          data={(items || []).map(item => ({ 
            key: item.id,
            value: item.id,
            label: item.username,
            ...item 
            }))}
        />        
      </InputGroup>      
    </div>
  );
};
UserAutocomplete.propTypes = {
  value: PropTypes.shape({
    id: PropTypes.number,
    userId: PropTypes.string,
    username: PropTypes.string
  }),
  onChange: PropTypes.func,
  style: PropTypes.object
};

export default UserAutocomplete;