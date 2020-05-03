import React, { useState, Fragment } from 'react';
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

import Controller from '../controller';

import isValidDate from '../../../../src/helpers/is-valid-date';

import useControl from '../helpers/use-control';
import ControlLabel from '../views/control-label';
import HelpBlock from '../views/help-block';
import ErrorBlock from '../views/error-block';


const makeKey = (name, jsonSchema) => {
  if (!_.isEmpty(jsonSchema['$id'])) {
    return jsonSchema['$id'];
  } else if (!_.isEmpty(jsonSchema.id)) {
    return jsonSchema.id;
  } else {
    return `${name}-${jsonSchema.type}`;
  }
}

const ObjectControl = props => {
  const { jsonSchema, level, value = {}, onChange } = props;
  const { permissions, canRead, canWrite, log, error } = useControl(props);

  if (!canRead) {
    log('is hidden, no read permission');
    return <div />;
  }

  const isAdmin = permissions.includes('*');
  // TODO implement also dependencies
  let requireds = jsonSchema.required || [];
  const options = jsonSchema.options || {};
  let properties = jsonSchema.properties;
  const { layout = 'vertical' } = options;

  // add all required field from dependencies
  Object.entries(jsonSchema.dependencies || {})
    .forEach(([field, fields]) => {
      // if the key of the dependencies is present
      if (value[field] != null && value[field] !== '') {
        // if it's an array, just add the fields to the requireds array, if it's an object
        // then merge properties and requireds array (that allows some fields to appear in some conditions)
        if (_.isArray(fields)) {
          requireds = _.uniq([...requireds, ...fields]);
        } else {
          requireds = _.uniq([...requireds, ...fields.required]);
          properties = { ...properties, ...fields.properties };
        }
      }
    });

  if (!canWrite) {
    log(`whole object and children are read only, no write permission, available permissions %c"${permissions.join(',')}"`)
  }

  const { collapsed = false } = options;

  const items = Object.entries(properties)
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

export default ObjectControl;