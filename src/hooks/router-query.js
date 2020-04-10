import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import _ from 'lodash';

const extractValues = location => {
  const { search } = location;
  const query = new URLSearchParams(search);
  const values = {};
  for (const [key, value] of query.entries()) {
    if (!isNaN(parseInt(value, 10))) {
      values[key] = parseInt(value, 10);
    } else if (!_.isEmpty(value)) {
      values[key] = value;
    } else {
      values[key] = undefined;
    }
  }
  return values;
}

export default ({ onChangeQuery = () => {} } = {}) => {
  const location = useLocation();
  const history = useHistory();
  useEffect(() => onChangeQuery(extractValues(location), location.key), [location]);

  return {
    query: extractValues(location),
    key: location.key,
    setQuery(obj) {
      const { search } = location;
      const query = new URLSearchParams(search);
      Object.keys(obj).forEach(key => {
        if (obj[key] != null) {
          query.set(key, obj[key]);
        } else {
          query.delete(key);
        }
      });
      const queryString = query.toString();
      history.push(history.location.pathname + (!_.isEmpty(queryString) ? `?${queryString}`: ''));
    }
  };
};