import React, { useState } from 'react';
import { Modal, Button, Form, FormGroup, ControlLabel, FormControl, FlexboxGrid, HelpBlock, SelectPicker } from 'rsuite';

import JoditEditor from 'jodit-react';

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


const VisualEditor = props => {
  console.log('--', props)
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
          formValue={formValue} 
          formError={formError} 
          onChange={formValue => {
            setFormValue(formValue);
            setFormError(null);
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          appearance="primary"
          disabled={disabled} 
          appearance="primary" 
          onClick={() => {            
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

