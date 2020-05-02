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
import djv from 'djv';

import './style.scss';
import useControl from './helpers/use-control';

import FormContext from './context';



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

const makeKey = (name, jsonSchema) => {
  if (!_.isEmpty(jsonSchema['$id'])) {
    return jsonSchema['$id'];
  } else if (!_.isEmpty(jsonSchema.id)) {
    return jsonSchema.id;
  } else {
    return `${name}-${jsonSchema.type}`;
  }
}

const ControlLabel = ({ children, required = false, tooltip }) => (
  <RawControlLabel>
    {children}
    {!_.isEmpty(tooltip) && <HelpBlock tooltip>{tooltip}</HelpBlock>}
    {required && <span className="asterisk">&nbsp;<Icon style={{ color: '#FF3932' }} icon="asterisk"/></span>}
  </RawControlLabel>
);


const HelpBlock = ({ jsonSchema = {} }) => {
  const { help } = jsonSchema.options || {};

  let hint;
  if (!_.isEmpty(help)) {
    return <RawHelpBlock>{help}</RawHelpBlock>
  } else if (_.isArray(jsonSchema.examples) && !_.isEmpty(jsonSchema.examples)) {
    return <RawHelpBlock>Example: {jsonSchema.examples.join(', ')}</RawHelpBlock>
  }
  return null;
}

const ErrorBlock = ({ error }) => {

  if (error == null) {
    return <Fragment/>;
  }
  let msg;
  if (!_.isEmpty(error.error)) {
    msg = error.error;
  } else if (_.isArray(error.errors) && !_.isEmpty(error.errors)) {
    msg = error.errors[0].error;
  }

  return (
    <div className="error-msg">{msg}</div>
  );
}


const StringController = props => {
  const { jsonSchema, required = false, readOnly = undefined } = props;
  const { canWrite, log, permissions, error } = useControl(props);
  const { tooltip } = jsonSchema.options || {};

  if (!canWrite) {
    log(`is readonly, available permissions %c"${permissions.join(',')}"`);
  }

  return (
    <FormGroup>
      {!_.isEmpty(jsonSchema.title) && <ControlLabel required={required} tooltip={tooltip}>{jsonSchema.title}</ControlLabel>}
      <Input
        className={classNames({ 'whit-error': error != null})}
        readOnly={readOnly || !canWrite}
        {..._.omit(props, RESERVED_KEYWORDS)}
      />
      <HelpBlock jsonSchema={jsonSchema}/>
      <ErrorBlock error={error}/>
    </FormGroup>

  );
}

const SelectController = props => {
  const { jsonSchema, required = false, searchable = false, readOnly = undefined } = props;
  const { canWrite, error } = useControl(props);

  return (
    <FormGroup>
      {!_.isEmpty(jsonSchema.title) && <ControlLabel required={required}>{jsonSchema.title}</ControlLabel>}
      <SelectPicker
        className={classNames({ 'whit-error': error != null})}
        data={jsonSchema.enum.map(value => ({ value, label: value }))}
        block
        searchable={searchable}
        cleanable={true}
        disabled={readOnly || !canWrite}
        {..._.omit(props, RESERVED_KEYWORDS)}
      />
      <HelpBlock jsonSchema={jsonSchema}/>
      <ErrorBlock error={error}/>
    </FormGroup>

  );
};

const BooleanController = ({ jsonSchema, required = false, value, ...props }) => {

  return (
    <FormGroup>
      {!_.isEmpty(jsonSchema.title) && <ControlLabel required={required}>{jsonSchema.title}</ControlLabel>}
      <Toggle checked={value === true} {...props}/>
    </FormGroup>

  );
};


const pickNumber = function() {
  const list = Array.from(arguments);
  return list.find(_.isNumber);
}


const IntegerController = props => {
  const { jsonSchema, required = false, onChange } = props;
  const { error } = useControl(props);
  const { minimum , exclusiveMinimum, maximum, exclusiveMaximum } = jsonSchema || {};

  return (
    <FormGroup>
      {!_.isEmpty(jsonSchema.title) && <ControlLabel required={required}>{jsonSchema.title}</ControlLabel>}
      <InputNumber
        {...props}
        className={classNames({ 'whit-error': error != null})}
        max={pickNumber(maximum, exclusiveMaximum)}
        min={pickNumber(minimum, exclusiveMinimum)}
        onChange={value => {
          if (!isNaN(parseFloat(value))) {
            onChange(parseFloat(value));
          } else if (!isNaN(parseInt(value, 10))) {
            onChange(parseInt(value, 10));
          }
        }}
      />
      <HelpBlock jsonSchema={jsonSchema}/>
      <ErrorBlock error={error}/>
    </FormGroup>
  );
}

import CollectionEditor from '../collection-editor';

const ArrayControllerForm = ({ jsonSchema, value, onChange, disabled }) => {
  return (
    <Controller
      jsonSchema={jsonSchema}
      value={value}
      readOnly={disabled}
      onChange={onChange}

    />
  );
} ;

const ArrayController = ({ jsonSchema, level, value = [], onChange, readOnly = false, ...props }) => {
  const { canWrite, canRead, log, permissions } = useControl({ jsonSchema, value, onChange });

  if (!canWrite) {
    log(`is readonly, available permissions %c"${permissions.join(',')}"`);
  }
  const { maxItems, minItems } = jsonSchema;

  return (
    <Fragment>
      {!_.isEmpty(jsonSchema.title) && <div className={classNames('title', { [`title-${level}`]: true })}>{jsonSchema.title}</div>}
      <CollectionEditor
         value={value}
         form={ArrayControllerForm}
         disabled={readOnly || !canWrite}
         maxItems={_.isNumber(maxItems) ? maxItems : null}
         minItems={_.isNumber(minItems) ? minItems : null}
         onChange={onChange}
         jsonSchema={jsonSchema.items}
         {..._.omit(props, RESERVED_KEYWORDS)}
      />
    </Fragment>
  );
}

const ObjectController = ({ jsonSchema, level, value = {}, onChange }) => {
  const { permissions, canRead, canWrite, log, error } = useControl({ jsonSchema, value, onChange });

  if (!canRead) {
    log('is hidden, no read permission');
    return <div />;
  }

  const isAdmin = permissions.includes('*');
  const requireds = jsonSchema.required || [];
  const options = jsonSchema.options || {};

  const { layout = 'vertical' } = options;

  if (!canWrite) {
    log(`whole object and children are read only, no write permission, available permissions %c"${permissions.join(',')}"`)
  }

  const { collapsed = false } = options;



  const items = Object.entries(jsonSchema.properties)
    .filter(([field, schema]) => {
      const { options = { }} = schema;
      // filter out elements without view permission
      const canRead = isAdmin || _.isEmpty(options.readPermission) || permissions.includes(options.readPermission);
      if (!canRead) {
        log(`hidden field %c"${field}"%c, no read permission`);
      }
      return canRead;
    })
    .map(([field, schema]) => {
      let fieldError;
      if (error && !_.isEmpty(error.errors)) {
        fieldError = error.errors.find(error => error.id === schema['$id']);
      }
      const controller = (
        <Controller
          field={field}
          jsonSchema={options.layout === 'accordion' || options.layout === 'panel' ? _.omit(schema, 'title') : schema}
          value={value[field]}
          key={makeKey(field, schema)}
          level={level + 1}
          required={requireds.includes(field)}
          readOnly={!canWrite ? true : undefined}
          error={fieldError}
          onChange={newValue => {
            onChange({ ...value, [field]: newValue });
          }}
        />
      );

      if (layout === 'accordion' || layout === 'panel') {
        return (
          <Panel key={makeKey(field, schema)} header={!_.isEmpty(schema.title) ? schema.title : 'No title'} collapsible defaultExpanded={!collapsed}>
            {controller}
          </Panel>
        )
      } else {
        return controller;
      }
    });

  if (layout === 'accordion' || layout === 'panel') {
    return (
      <Fragment>
        {!_.isEmpty(jsonSchema.title) && <div className={classNames('title', { [`title-${level}`]: true })}>{jsonSchema.title}</div>}
        <PanelGroup accordion={layout === 'accordion'} defaultActiveKey={1}>
          {items}
        </PanelGroup>
      </Fragment>
    )
  } else {
    return (
      <div className={classNames('rs-form rs-form-vertical rs-form-fluid', { [layout]: true })}>
        {!_.isEmpty(jsonSchema.title) && <div className={classNames('title', { [`title-${level}`]: true })}>{jsonSchema.title}</div>}
        {items}
      </div>
    );
  }


}







const Controller = ({ value, field, jsonSchema, level = 0, onChange, ...props }) => {

  const common = {
    field,
    jsonSchema,
    value: value,
    level,
    onChange: newValue => {
      onChange(newValue);
    },
    ...(_.isObject(jsonSchema.options) ? _.omit(jsonSchema.options, RESERVED_KEYWORDS) : {}),
    ...props
  }

  if (['string', 'integer', 'number'].includes(jsonSchema.type) && _.isArray(jsonSchema.enum) && !_.isEmpty(jsonSchema.enum)) {
    return <SelectController {...common}/>;
  } else if (jsonSchema.type === 'boolean') {
    return (<BooleanController {...common}/>)

  } else if (jsonSchema.type === 'string') {
    return (<StringController {...common}/>)

  } else if (jsonSchema.type === 'integer') {
    return (<IntegerController {...common}/>)
  } else if (jsonSchema.type === 'object') {
    return (<ObjectController {...common}/>)
  } else if (jsonSchema.type === 'array') {
    return (<ArrayController {...common}/>)
  }




  return (
    <div>Control type {jsonSchema.type} doesn't exist</div>
  );
}



const SchemaForm = ({
  jsonSchema,
  value,
  onChange = () => {},
  permissions = ['read', 'write', 'global-read', 'global-write'],
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
}

export default SchemaForm;