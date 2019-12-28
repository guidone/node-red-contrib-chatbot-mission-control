import { useLocation, useHistory } from 'react-router-dom';
import _ from 'lodash';

export default () => {
  const { search } = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(search);
  const values = {};
  for (const [key, value] of query.entries()) {
    values[key] = !_.isEmpty(value) ? value : undefined;
  }
  
  return { 
    query: values,
    setQuery(obj) {
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
}