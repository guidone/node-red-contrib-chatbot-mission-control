import React, { useState } from 'react';
import { Modal, Button, Form, FormGroup, ControlLabel, FormControl, FlexboxGrid, HelpBlock, SelectPicker, Schema } from 'rsuite';

import JoditEditor from 'jodit-react';

const { StringType, ArrayType, ObjectType } = Schema.Types;

const contentModel = Schema.Model({
  title: StringType()
    .isRequired('Title is required'),
  slug: StringType()
  .addRule(
    value => {
      console.log('verific', value)
      return value.match(/^[A-Za-z0-9-_]*$/) != null
    }, 
    'Invalid slug, just letter, numbers or ("-", "_") and no spaces'
  )
    .isRequired('Slug is required')
    ,  
  fields: ArrayType().of(ObjectType().shape({
    name: StringType().isRequired('Name of field is required')
  }))  

});

// TODO: validate name of field

import FieldsEditor from '../../../src/components/fields-editor';

const EditorConfig = {
  sourceEditor: 'area',
  buttons: [
    'bold',
    'strikethrough',
    'underline',
    'italic',
    '|',
    'superscript',
    'subscript',
    '|',
    'ul',
    'ol',
    '|',
    'outdent',
    'indent',
    '|',
    'font',
    'fontsize',
    'brush',
    'paragraph',
    'eraser',
    '|',
    'table',
    'link',
    '|',
    'align',
    'hr',
    'symbol'
  ]
};


let theform; // TODO: fix this

const VisualEditor = props => {
  return (
  <JoditEditor {...props} value={props.value || ''}/>
)};


const ModalContent = ({ content, onCancel = () => {}, onSubmit = () => {}, disabled = false }) => {
  const [formValue, setFormValue] = useState(content);
  const [formError, setFormError] = useState(null);

  // TODO: flag for edit or new 

  return (
    <Modal backdrop show onHide={onCancel} className="modal-content" size="lg">
      <Modal.Header>
        <Modal.Title>Edit Content</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form 
          model={contentModel}
          ref={ref => theform = ref}
          checkTrigger="none"
          formValue={formValue} 
          formError={formError} 
          onChange={formValue => {
            setFormValue(formValue);
            setFormError(null);
          }} 
          onCheck={errors => {
            console.log('errors', errors)
            setFormError(errors);
          }}
          fluid autoComplete="off"
        >
          <FormGroup>
            <ControlLabel>Title</ControlLabel>
            <FormControl name="title"/>                      
          </FormGroup>
          <FlexboxGrid justify="space-between" style={{ marginBottom: '20px' }}>      
            <FlexboxGrid.Item colspan={11}>
              <FormGroup>
                <ControlLabel>Slug</ControlLabel>
                <FormControl autoComplete="off" readOnly={disabled} name="slug" />
              </FormGroup>
            </FlexboxGrid.Item>            
            <FlexboxGrid.Item colspan={11}>
              empty
            </FlexboxGrid.Item>
          </FlexboxGrid>                
          <FormGroup>
            <ControlLabel>Body</ControlLabel>
            <FormControl readOnly={disabled} name="body" accepter={VisualEditor} config={EditorConfig}/>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Fields</ControlLabel>
            <FormControl readOnly={disabled} name="fields" accepter={FieldsEditor}/>
          </FormGroup>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          appearance="primary"
          disabled={disabled} 
          appearance="primary" 
          onClick={() => {   
            const errors = theform.check();
            if (!errors) {
              console.log('errors', errors);
              return;
            }         
            onSubmit(formValue);
          }}
        >
          Save
        </Button>
        <Button onClick={onCancel} appearance="subtle">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>

  );
};

export default ModalContent;

