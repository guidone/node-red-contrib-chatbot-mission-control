import React, { useState } from 'react';
import { CheckPicker, Button, IconButton, Icon } from 'rsuite';
import _ from 'lodash';

import { useCodePlug } from '../../../lib/code-plug';

import './style.scss';

const Permission = ({ permission, onRemove = () => {} }) => {

  return (
    <div className="permission">
      <div className="meta">
        <strong>{permission.name}</strong>
        <span className="description">{permission.description}</span>
      </div>
      <div className="button">
        <IconButton
          size="xs"
          icon={<Icon icon="trash"/>}
          onClick={() => onRemove(permission)}
        />
      </div>
    </div>
  );
}

const Permissions = ({ value, onChange = () => {} }) => {
  const [permission, setPermission] = useState();
  const { props: permissions } = useCodePlug('permissions');

  console.log('permissions', permission  )

  const current = _.isString(value) ? value.split(',') : [];
  const data = permissions
    .filter(item => !current.includes(item.permission))
    .map(item => ({
      value: item.permission,
      label: item.name,

      ...item
  }));

  console.log('data', current)
  return (
    <div className="ui-permissions">
      <div className="selector">
        <div className="picker">
          <CheckPicker
            value={permission}
            placement="auto"
            placeholder="Select permission..."
            groupBy="group"
            disabled={_.isEmpty(data)}
            data={data}
            onSelect={value => setPermission(value)}
            preventOverflow={false}
            block
            />
        </div>
        <div className="button">
          <Button
            disabled={permission == null}
            appearance="primary"
            onClick={() => {
              let newValue = _.isString(value) && !_.isEmpty(value) ? value.split(',') : [];
              console.log('mando', [...newValue, permission])
              onChange([...newValue, ...permission].join(','));
              setPermission(null);
            }}
          >
            Add permission{!_.isEmpty(permission) && permission.length > 1 ? 's' : ''}
          </Button>
        </div>
      </div>
      <div className="permissions">
        {current.map(permission => (
          <Permission
            key={permission}
            permission={permissions.find(item => item.permission === permission)}
            onRemove={item => {
              const newValue = value.split(',').filter(permission => permission !== item.permission);
              onChange(newValue.join(','));
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Permissions;