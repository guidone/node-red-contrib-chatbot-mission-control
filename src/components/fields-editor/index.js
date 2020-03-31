import React from 'react';
import _ from 'lodash';

import {
  Button,
  Form,
  FormControl,
  FlexboxGrid,
  IconButton,
  Icon,
  SelectPicker
} from 'rsuite';

import FieldTypes from './field-types';
import BooleanField from './fields/boolean';
import DateField from './fields/date';
import NumberField from './fields/number';

const FieldEditor = ({ field, onChange = () => {}, onRemove = () => {} }) => {

  let accepter;
  if (field.type === 'boolean') {
    accepter = BooleanField;
  } else if (field.type === 'date') {
    accepter = DateField;
  } else if (field.type === 'number') {
    accepter = NumberField;
  }

  return (
    <div className="field-editor">
      <Form
        layout="inline"
        formValue={field}
        onChange={field => onChange(field)}
          autoComplete="off"
        >
        <FlexboxGrid justify="space-between" style={{ marginBottom: '10px', marginRight: '0px' }}>
          <FlexboxGrid.Item colspan={7}>
            <FormControl name="name" placeholder="Name"/>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={4}>
            <FormControl
              name="type"
              placeholder="Type"
              accepter={SelectPicker}
              data={FieldTypes}
              block
              searchable={false}
              cleanable={false}
            />
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={10}>
            <FormControl name="value" placeholder="value" accepter={accepter}/>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={1} align="right">
            <IconButton
              onClick={() => onRemove()}
              icon={<Icon icon="trash" />}
              size="sm"
            />
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Form>
    </div>
  );
};


const FieldsEditor = ({ value = [], onChange = () => {}, labelAddField = 'Add custom field' }) => {
  return (
    <div className="ui-fields-editor">
      <div>
      {(value || []).map((field, idx) => (
        <FieldEditor
          field={field}
          key={field.id || field.cid}
          onChange={field => {
            const newFields = [...value];
            newFields[idx] = field;
            onChange(newFields);
          }}
          onRemove={() => {
            let newFields = [...value];
            newFields[idx] = null;
            onChange(_.compact(newFields));
          }}
        />
      ))}
      </div>
      <div>
        <Button onClick={() => {
          onChange([...value, { name: '', type: 'string', value: '', cid: _.uniqueId('c') }]);
        }}>{labelAddField}</Button>
      </div>
    </div>
  );
};

export default FieldsEditor;
