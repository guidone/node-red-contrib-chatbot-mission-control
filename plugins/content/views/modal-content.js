import React, { useState, Fragment } from 'react';
import { 
  Modal, 
  Button, 
  Form, 
  FormGroup, 
  ControlLabel, 
  FormControl, 
  FlexboxGrid, 
  SelectPicker, 
  Schema, 
  Nav
} from 'rsuite';
import JoditEditor from 'jodit-react';

import FieldsEditor from '../../../src/components/fields-editor';

const { StringType, ArrayType, ObjectType } = Schema.Types;

const contentModel = Schema.Model({
  title: StringType()
    .isRequired('Title is required'),
  slug: StringType()
    .addRule(
      value => value.match(/^[A-Za-z0-9-_]*$/) != null, 
      'Invalid slug, just letter, numbers or ("-", "_") and no spaces'
    )
    .isRequired('Slug is required'),  
  fields: ArrayType().of(ObjectType().shape({
    name: StringType()
      .addRule(
        value => value.match(/^[A-Za-z0-9-_]*$/) != null, 
        'Invalid field name, just letter, numbers or ("-", "_") and no spaces'
      )
      .isRequired('Name of field is required')
  }))  

});





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

import '../styles/modal-content.scss';

let theform; // TODO: fix this

const VisualEditor = props => {
  return (
  <JoditEditor {...props} value={props.value || ''}/>
)};


const ModalContent = ({ content, onCancel = () => {}, onSubmit = () => {}, disabled = false, categories }) => {
  const [formValue, setFormValue] = useState(content);
  const [formError, setFormError] = useState(null);
  const [tab, setTab] = useState('content');

  // TODO: flag for edit or new 

  return (
    <Modal backdrop show onHide={onCancel} className="modal-content" size="lg">
      <Modal.Header>
        <Modal.Title>Edit Content</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Nav appearance="tabs" active={tab} onSelect={setTab} activeKey={tab}>
          <Nav.Item eventKey="content">Content</Nav.Item>
          <Nav.Item eventKey="custom_fields">Custom Fields</Nav.Item>
        </Nav>      
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
            setFormError(errors);
            setTab(errors.fields != null ? 'custom_fields' : 'content');
          }}
          fluid autoComplete="off"
        >
          {tab === 'content' && (
            <Fragment>
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
                  <FormGroup>
                    <ControlLabel>Category</ControlLabel>
                    <FormControl 
                      autoComplete="off" 
                      readOnly={disabled} 
                      name="categoryId"
                      block
                      cleanable={false}
                      data={categories.map(category => ({ value: category.id, label: category.name }))}
                      accepter={SelectPicker} 
                    />
                  </FormGroup>
                </FlexboxGrid.Item>
              </FlexboxGrid>                
              <FormGroup>
                <ControlLabel>Body</ControlLabel>
                <FormControl readOnly={disabled} name="body" accepter={VisualEditor} config={EditorConfig}/>
              </FormGroup>
            </Fragment>
          )}
          {tab === 'custom_fields' && (
            <FormGroup>
              <ControlLabel>Fields</ControlLabel>
              <FormControl readOnly={disabled} name="fields" accepter={FieldsEditor}/>
            </FormGroup>
          )}
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
              
             
              return;
            }         
            onSubmit(formValue);
          }}
        >
          Save Content
        </Button>
        <Button onClick={onCancel} appearance="subtle">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>

  );
};

export default ModalContent;

