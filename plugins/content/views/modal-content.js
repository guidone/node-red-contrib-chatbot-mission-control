import React, { useState, Fragment, useRef } from 'react';
import { 
  Modal, 
  Button, 
  Form, 
  FormGroup, 
  ControlLabel, 
  FormControl, 
  FlexboxGrid, 
  SelectPicker,  
  Nav
} from 'rsuite';

import FieldsEditor from '../../../src/components/fields-editor';
import MarkdownEditor from '../../../src/components/markdown-editor';

import { content as contentModel } from '../models';
import '../styles/modal-content.scss';


const ModalContent = ({ content, onCancel = () => {}, onSubmit = () => {}, disabled = false, categories }) => {
  const [formValue, setFormValue] = useState(content);
  const [formError, setFormError] = useState(null);
  const [tab, setTab] = useState('content');
  const form = useRef(null);

  const isNew = content.id == null;
  // TODO: flag for edit or new 
  // TODO prevent close if changes

  return (
    <Modal backdrop show onHide={onCancel} className="modal-content" size="md">
      <Modal.Header>
        <Modal.Title>{isNew ? 'Create content' : `Edit content "${content.title}"`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Nav appearance="tabs" active={tab} onSelect={setTab} activeKey={tab}>
          <Nav.Item eventKey="content">Content</Nav.Item>
          <Nav.Item eventKey="custom_fields">Custom Fields</Nav.Item>
        </Nav>      
        <Form 
          model={contentModel}
          ref={form}
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
                <FormControl readOnly={disabled} name="body" accepter={MarkdownEditor}/>
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
            if (!form.current.check()) {
              return;
            }         
            onSubmit(formValue);
          }}
        >
          Save content
        </Button>
        <Button onClick={onCancel} appearance="subtle">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalContent;

