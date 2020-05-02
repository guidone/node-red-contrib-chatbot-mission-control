import { useContext } from 'react';
import _ from 'lodash';

import validate from './validate';
import FormContext from '../context';

const useControl = ({ jsonSchema, error }) => {
  const { permissions, debug, errors } = useContext(FormContext);
  const isAdmin = permissions.includes('*');
  const options = jsonSchema.options || {};
  const canWrite = isAdmin || _.isEmpty(options.writePermission) || (permissions || []).includes(options.writePermission);
  const canRead = isAdmin || _.isEmpty(options.readPermission) || (permissions || []).includes(options.readPermission);
  const contextError = (errors || []).find(error => error.id === jsonSchema['$id']);

  return {
    canRead,
    canWrite,
    debug,
    error: error || contextError,
    validate: value => validate(value, jsonSchema),
    permissions: permissions || [],
    log: function(str) {
      if (!debug) {
        return;
      }

      //const args = Array.from(arguments);
      console.log(
        `%cFORM-SCHEMA%c id:${jsonSchema['$id']} %c${str}`,
        'background-color:#2258F8;color:#ffffff',
        'font-size:11px;color:#999999',
        'color: #000000',
        'color:#1B6BB3',
        'color: #000000'
        );
    }
   };
};

export default useControl;