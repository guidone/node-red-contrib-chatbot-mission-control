import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import _ from 'lodash';

const extractValues = location => {
  const { search } = location;
  const query = new URLSearchParams(search);
  const values = {};
  for (const [key, value] of query.entries()) {
    values[key] = !_.isEmpty(value) ? value : undefined;
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
        if (!_.isEmpty(obj[key])) {
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