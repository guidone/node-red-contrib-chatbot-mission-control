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





import '../../../node_modules/simplemde/dist/simplemde.min.css';
import '../styles/modal-content.scss';


import SimpleMDE from 'simplemde';

let theform; // TODO: fix this

class VisualEditor extends React.Component {

  componentDidMount() {
    const { value, onChange } = this.props;

    this.simplemde = new SimpleMDE({ 
      element: this.textarea,
      initialValue: value,
      spellChecker: false
    });
    this.simplemde.codemirror.on('change', () => onChange(this.simplemde.value()));

  }

  componentWillUnmount() {
    this.simplemde.toTextArea();
    this.simplemde = null;  
  }

  render() {
    return (
      <textarea ref={ref => this.textarea = ref}/>
    );
  }
}


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
                <FormControl readOnly={disabled} name="body" accepter={VisualEditor}/>
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
            if (!theform.check()) {
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

