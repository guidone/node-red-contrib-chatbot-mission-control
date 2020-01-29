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

import FieldsEditor from '../../../src/components/fields-editor';

const { StringType, ArrayType, ObjectType } = Schema.Types;

const categoryModel = Schema.Model({
  name: StringType()
    .isRequired('Name is required')
});


import '../styles/modal-content.scss';


let theform; // TODO: fix this


const ModalCategory = ({ category, onCancel = () => {}, onSubmit = () => {}, disabled = false }) => {
  const [formValue, setFormValue] = useState(category);
  const [formError, setFormError] = useState(null);
  
  // TODO: flag for edit or new 

  return (
    <Modal backdrop show onHide={onCancel} className="modal-content" size="sm">
      <Modal.Header>
        <Modal.Title>Edit Category</Modal.Title>
      </Modal.Header>
      <Modal.Body>            
        <Form 
          model={categoryModel}
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
          }}
          fluid autoComplete="off"
        >            
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl name="name"/>                      
          </FormGroup>          
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          appearance="primary"
          disabled={disabled} 
          appearance="primary" 
          onClick={() => {   
            if (!theform.check()) {
              return;
            }         
            onSubmit(formValue);
          }}
        >
          Save category
        </Button>
        <Button onClick={onCancel} appearance="subtle">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalCategory;

