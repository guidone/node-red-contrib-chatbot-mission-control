import React from 'react';
import _ from 'lodash';

import { 
  Modal, 
  Button, 
  Form, 
  FormGroup, 
  ControlLabel, 
  FormControl, 
  FlexboxGrid, 
  IconButton, 
  Icon, 
  HelpBlock, 
  SelectPicker 
} from 'rsuite';

const FieldTypes = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' }
];

const FieldEditor = ({ field, onChange = () => {}, onRemove = () => {} }) => {

  // TODO: validate fields (name only chars)

  return (
    <div className="field-editor">
      <Form 
        layout="inline"
        formValue={field}            
        onChange={field => onChange(field)} 
          autoComplete="off"
        >
        <FlexboxGrid justify="space-between" style={{ marginBottom: '10px' }}>
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
            <FormControl name="value" placeholder="value"/>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={1}>
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


const FieldsEditor = ({ value, onChange = () => {} }) => {
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
        }}>Add Field</Button>
      </div>
    </div>
  );
};

export default FieldsEditor;

