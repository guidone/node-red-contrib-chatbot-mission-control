import React, { useState } from 'react';
import { CheckPicker, Button, IconButton, Icon } from 'rsuite';
import _ from 'lodash';
//import { alert, confirm, prompt  } from '@rsuite/interactions';

import confirm from '../prompt';

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

  const current = _.isString(value) && !_.isEmpty(value) ? value.split(',') : [];
  const hasAll = current.includes('*');
  const data = permissions
    .filter(item => !current.includes(item.permission))
    .map(item => ({
      value: item.permission,
      label: item.name,
      ...item
  }));

  return (
    <div className="ui-permissions">
      <div className="selector">
        <div className="picker">
          <CheckPicker
            value={permission}
            size="medium  "
            placement="auto"
            placeholder="Select permission..."
            groupBy="group"
            disabled={_.isEmpty(data) || hasAll}
            data={data}
            onSelect={value => setPermission(value)}
            preventOverflow={true}
            renderMenuItem={(label, item) => (
              <div className="check-picker-item-permission">
                <span className="name">{label}</span>
                &nbsp;
                <span className="description">{item.description}</span>
              </div>
            )}
            block
            />
        </div>
        <div className="button">
          <Button
            disabled={permission == null}
            appearance="primary"
            onClick={async () => {
              const includeAll = permission.includes('*');
              if (includeAll) {
                const msg = (
                  <div>Add <b>all</b> permission and remove all other permissions?'</div>
                );
                if (await confirm(msg, { okLabel: 'Ok, add "*" permission'})) {
                  onChange('*');
                  setPermission(null);
                }
              } else {
                let newValue = _.isString(value) && !_.isEmpty(value) ? value.split(',') : [];
                console.log('mando', [...newValue, permission])
                onChange([...newValue, ...permission].join(','));
                setPermission(null);
              }
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