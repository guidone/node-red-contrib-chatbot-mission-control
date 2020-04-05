import React, { useState } from 'react';
import { AutoComplete, InputGroup } from 'rsuite';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo';
import _ from 'lodash';

import { SEARCH } from './queries';
import './style.scss';

const renderItem = ({ id, username, userId, first_name, last_name }) => {
  if (!_.isEmpty(first_name) || !_.isEmpty(last_name)) {
    return (
      <div className="ui-autocomplete-render-item">
        <b>{[first_name, last_name].filter(s => !_.isEmpty(s)).join(' ')}</b>
        {!_.isEmpty(username) && <span>&nbsp;-&nbsp;{username}</span>}
        &nbsp;
        <span className="id">(id: {id})</span>
      </div>
    );
  } else if (!_.isEmpty(username)) {
    return (
      <div className="ui-autocomplete-render-item">
        <b>{username}</b>
        &nbsp;
        <span className="id">(id: {id})</span>
      </div>
    );
  } else {
    return (
      <div className="ui-autocomplete-render-item">
        <b>Anonymous</b>
        &nbsp;
        <span className="id">(id: {id})</span>
      </div>
    );
  };
};

const renderUserAsString = ({ id, username, userId, first_name, last_name }) => {
  if (!_.isEmpty(first_name) || !_.isEmpty(last_name)) {
    return (
      [first_name, last_name].filter(s => !_.isEmpty(s)).join(' ')
      + (!_.isEmpty(username) ? ` - ${username}` : '')
      + ` (id: ${id})`
    );
  } else if (!_.isEmpty(username)) {
    return `${username} (id: ${id})`;
  } else {
    return `Anonymous (id: ${id})`;
  }
};


const UserAutocomplete = ({
  value,
  onChange = () => {},
  style,
  excludeIds = null,
  placeholder = null
}) => {
  const [search, setSearch] = useState(null);
  const [items, setItems] = useState(null);

  const variables = {
    search: search != null ? search : undefined,
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
      current = renderUserAsString(items[0]);
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
          renderItem={renderItem}
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
          data={(items || [])
            .filter(item => excludeIds == null || !excludeIds.includes(item.id))
            .map(item => ({
              key: item.id,
              value: item.id,
              label: `${item.username} ${item.first_name} ${item.last_name}`,
              ...item
              }))
          }
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
  style: PropTypes.object,
  // exclude some user id from the drop down
  excludeIds: PropTypes.arrayOf(PropTypes.number)
};

export default UserAutocomplete;