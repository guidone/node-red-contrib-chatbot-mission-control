import React from 'react';
import _ from 'lodash';

import { JsonEditor } from '../../../src/components';

const DefaultConfiguration = ({ formValue = {}, onChange = () => {} }) => {

  const { initial_configuration } = formValue || {};

  return (
    <div style={{ paddingBottom: '15px' }}>
      <JsonEditor
        value={!_.isEmpty(initial_configuration) ? initial_configuration : ''}
        height="55vh"
        onChange={value => {
          onChange({
            ...formValue,
            initial_configuration: !_.isEmpty(value) ? value : null
          });
        }}
      />
    </div>
  );
};

export default DefaultConfiguration;