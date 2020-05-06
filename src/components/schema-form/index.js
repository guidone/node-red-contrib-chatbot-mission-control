import React, { Fragment, useContext, useState, useLayoutEffect, useEffect, useCallback, useMemo } from 'react';
import _ from 'lodash';
import {
  FormGroup,
  ControlLabel as RawControlLabel,
  HelpBlock as RawHelpBlock,
  Input,
  InputNumber,
  SelectPicker,
  Toggle,
  PanelGroup,
  Panel,
  Icon
 } from 'rsuite';
import classNames from 'classnames';


import './style.scss';
import useControl from './helpers/use-control';
import FormContext from './context';

import HelpBlock from './views/help-block';
import ErrorBlock from './views/error-block';
import ControlLabel from './views/control-label';
import NumberControl from './controls/number';
import DateControl from './controls/date';
import IntegerControl from './controls/integer';


const setDefaults = (value, jsonSchema) => {

  if (jsonSchema.type === 'object') {
    if (value == null) {
      value = {};
    }
    Object.entries(jsonSchema.properties)
      .filter(([field, schema]) => value[field] == null)
      .forEach(([field, schema]) => {
        value[field] = setDefaults(null, schema);
      })
    return value;
  } else if (jsonSchema.type === 'array') {
    if (value == null) {
      value = [];
    }
    return value;
  } else {
    if (value == null && jsonSchema.default != null) {
      value = jsonSchema.default;
    }
    return value;
  }
}









// Reserved keywords for options in the json schema, these props are NOT passed with the spread operator
// to the component
const RESERVED_KEYWORDS = ['readPermission', 'writePermission', 'layout', 'collapsed', 'tooltip', 'readOnly'];













import pickNumber from './helpers/pick-number';










import ObjectControl from './controls/object';



import Controller from './controller';



const SchemaForm = ({
  jsonSchema,
  value,
  onChange = () => {},
  permissions = [],
  debug = true
}) => {
  const [formValue, setFormValue] = useState(setDefaults(value, jsonSchema));
  const { validate } = useControl({ jsonSchema });

  return (
    <div className="ui-schema-form">
      <FormContext.Provider value={{ permissions, debug, errors: validate(formValue) }}>
        <Controller
          jsonSchema={jsonSchema}
          value={formValue}
          onChange={value => {
            console.log('---> validation', validate(value))
            setFormValue(value);
            onChange(value);
          }}/>
      </FormContext.Provider>
    </div>
  );
};

export default SchemaForm;