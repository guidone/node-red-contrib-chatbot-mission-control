import { useLocation } from 'react-router-dom';
import _ from 'lodash';

export default () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const values = {};
  for (const [key, value] of query.entries()) {
    values[key] = !_.isEmpty(value) ? value : undefined;
  }
  return values;
}