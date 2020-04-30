import React, { Fragment, useContext, useEffect, useCallback, useMemo } from 'react';
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

const FormContext = React.createContext();

const useControl = ({ jsonSchema, value, onChange }) => {
  const { permissions, debug } = useContext(FormContext);
  const isAdmin = permissions.includes('*');
  const options = jsonSchema.options || {};
  const canWrite = isAdmin || _.isEmpty(options.writePermission) || (permissions || []).includes(options.writePermission);
  const canRead = isAdmin || _.isEmpty(options.readPermission) || (permissions || []).includes(options.readPermission);

  return {
    canRead,
    canWrite,
    debug,
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

const StringController = ({ jsonSchema, required = false, readOnly = undefined, ...props }) => {
  const { canWrite, log, permissions } = useControl({ jsonSchema, ...props });
  const { tooltip } = jsonSchema.options || {};

  if (!canWrite) {
    log(`is readonly, available permissions %c"${permissions.join(',')}"`);
  }


  /*if (!canRead) {
    log(`hidden, no read permission, available permissions %c"${permissions.join(',')}"`);
    return <div/>;
  }*/

  /*let hint;
  if (!_.isEmpty(help)) {
    hint = <HelpBlock>{help}</HelpBlock>
  } else if (_.isArray(jsonSchema.examples) && !_.isEmpty(jsonSchema.examples)) {
    hint = <HelpBlock>Example: {jsonSchema.examples.join(', ')}</HelpBlock>
  }*/

  return (
    <FormGroup>
      {!_.isEmpty(jsonSchema.title) && <ControlLabel required={required} tooltip={tooltip}>{jsonSchema.title}</ControlLabel>}
      <Input
        readOnly={readOnly || !canWrite}
        {..._.omit(props, RESERVED_KEYWORDS)}
      />
      <HelpBlock jsonSchema={jsonSchema}/>
    </FormGroup>

  );
}

const SelectController = ({ jsonSchema, required = false, searchable = false, readOnly = undefined, ...props }) => {
  const { canWrite } = useControl({ jsonSchema, ...props });

  return (
    <FormGroup>
      {!_.isEmpty(jsonSchema.title) && <ControlLabel required={required}>{jsonSchema.title}</ControlLabel>}
      <SelectPicker
        data={jsonSchema.enum.map(value => ({ value, label: value }))}
        block
        searchable={searchable}
        cleanable={true}
        disabled={readOnly || !canWrite}
        {..._.omit(props, RESERVED_KEYWORDS)}
      />
      <HelpBlock jsonSchema={jsonSchema}/>
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


const IntegerController = ({ jsonSchema, required = false, onChange, ...props }) => {



  return (
    <FormGroup>
      {!_.isEmpty(jsonSchema.title) && <ControlLabel required={required}>{jsonSchema.title}</ControlLabel>}
      <InputNumber
        {...props}
        onChange={value => {
          if (!isNaN(parseFloat(value))) {
            onChange(parseFloat(value));
          } else if (!isNaN(parseInt(value, 10))) {
            onChange(parseInt(value, 10));
          }
        }}
      />
      <HelpBlock jsonSchema={jsonSchema}/>
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

  return (
    <Fragment>
      {!_.isEmpty(jsonSchema.title) && <div className={classNames('title', { [`title-${level}`]: true })}>{jsonSchema.title}</div>}
      <CollectionEditor
         value={value}
         form={ArrayControllerForm}
         disabled={readOnly || !canWrite}
         onChange={onChange}
         jsonSchema={jsonSchema.items}
         {..._.omit(props, RESERVED_KEYWORDS)}
      />
    </Fragment>
  );
}

const ObjectController = ({ jsonSchema, level, value = {}, onChange }) => {
  const { permissions, canRead, canWrite, log } = useControl({ jsonSchema, value, onChange });

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
      // come ci passo il value e onChange e key
      //const Controller = generateController({ jsonSchema: schema, level: level + 1 })

      const controller = (
        <Controller
          field={field}
          jsonSchema={options.layout === 'accordion' || options.layout === 'panel' ? _.omit(schema, 'title') : schema}
          value={value[field]}
          key={makeKey(field, schema)}
          level={level + 1}
          required={requireds.includes(field)}
          readOnly={!canWrite ? true : undefined}
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

  if (jsonSchema.type === 'string' && _.isArray(jsonSchema.enum) && !_.isEmpty(jsonSchema.enum)) {
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

  return (
    <div className="ui-schema-form">
      <FormContext.Provider value={{ permissions, debug }}>
        <Controller jsonSchema={jsonSchema} value={value} onChange={onChange}/>
      </FormContext.Provider>
    </div>
  );
}

export default SchemaForm;