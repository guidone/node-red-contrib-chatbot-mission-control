import React, { useState, Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Modal, 
  Button, 
  Form, 
  FormGroup, 
  ControlLabel, 
  FormControl, 
  FlexboxGrid, 
  SelectPicker,
  HelpBlock,  
  Nav
} from 'rsuite';

import FieldsEditor from '../../../../src/components/fields-editor';
import MarkdownEditor from '../../../../src/components/markdown-editor';
import ShowError from '../../../../src/components/show-error';
import LanguagePicker from '../../../../src/components/language-picker';
import JSONEditor from '../../../../src/components/json-editor';
import { Views } from '../../../../lib/code-plug';

import { content as contentModel } from '../models';
import '../styles/modal-content.scss';

const LABELS = {  
  saveContent: 'Save content'
};

const ModalContent = ({ 
  content, 
  onCancel = () => {}, 
  onSubmit = () => {}, 
  disabled = false, 
  categories, 
  error,
  labels = {}
}) => {
  const [formValue, setFormValue] = useState(content);
  const [formError, setFormError] = useState(null);
  const [jsonValue, setJsonValue] = useState({
    json: !_.isEmpty(content.payload) ? JSON.stringify(content.payload) : ''
  });
  const [tab, setTab] = useState('content');
  const form = useRef(null);

  const isNew = content.id == null;

  labels = { ...LABELS, ...labels };
  // TODO prevent close if changes

  return (
    <Modal backdrop show onHide={onCancel} className="modal-content" overflow={false} size="md">
      <Modal.Header>
        <Modal.Title>{isNew ? 'Create content' : `Edit content "${content.title}"`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error != null && <ShowError error={error}/>}
        <Nav 
          appearance="tabs" 
          active={tab} 
          onSelect={tab => {
            // tab is switched to manual edit of payload, make sure the current payload field is serialized
            // in serialized payload in order to show the updated one
            if (tab === 'content-payload') {
              setJsonValue({                  
                json: !_.isEmpty(formValue.payload) ? JSON.stringify(formValue.payload) : ''
              });
            }
            setTab(tab);
          }}  
          activeKey={tab}
        >
          <Nav.Item eventKey="content">Content</Nav.Item>
          <Nav.Item eventKey="custom_fields">Custom Fields</Nav.Item>
          <Views region="content-tabs">
            {(View, { label, id}) => <Nav.Item active={id === tab} eventKey={id} onSelect={() => setTab(id)}>{label}</Nav.Item>}
          </Views>
          <Nav.Item eventKey="content-payload">Content payload</Nav.Item>
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
                <FlexboxGrid.Item colspan={7}>
                  <FormGroup>
                    <ControlLabel>
                      Slug
                      <HelpBlock tooltip>
                        The <em>slug</em> is a shortcut for a content or a group of contents 
                        (for example the same article translated in different languages)
                      </HelpBlock>
                    </ControlLabel>
                    <FormControl autoComplete="off" readOnly={disabled} name="slug" />
                  </FormGroup>
                </FlexboxGrid.Item>            
                <FlexboxGrid.Item colspan={7}>
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
                <FlexboxGrid.Item colspan={7}>
                  <FormGroup>
                    <ControlLabel>Language</ControlLabel>
                    <FormControl 
                      readOnly={disabled} 
                      name="language" 
                      cleanable={false}
                      block
                      accepter={LanguagePicker}
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
          <Views region="content-tabs">
            {(View, { id }) => {        
              if (id === tab) {
                return (
                  <View 
                    key={id} 
                    formValue={formValue.payload}
                    onChange={payload => setFormValue({ ...formValue, payload })}
                  />
                );
              }
              return <div/>;
            }}
          </Views>
          {tab === 'content-payload' && (
          <Form 
            formValue={jsonValue} 
            formError={formError}              
            fluid autoComplete="off"
          >
            <FormGroup>
              <ControlLabel>Payload</ControlLabel>
              <FormControl 
                readOnly={disabled} 
                name="json" 
                accepter={JSONEditor}
                onChange={json => {
                  if (!_.isEmpty(json)) {
                    let payload;
                    setJsonValue({ json });
                    try {
                      payload = JSON.parse(json);
                    } catch(e) {    
                      // error do nothing                
                      return;
                    }                    
                    setFormValue({ ...formValue, payload });
                  }
                }}
              />
            </FormGroup>
          </Form>
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
          {labels.saveContent}
        </Button>
        <Button onClick={onCancel} appearance="subtle">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
ModalContent.propTypes = {
  error: PropTypes.object,
  category: PropTypes.array,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  disabled: PropTypes.bool,
  content: PropTypes.shape({
    title: PropTypes.string,
    language: PropTypes.string,
    slug: PropTypes.string,
    categoryId: PropTypes.number,
    fields: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      type: PropTypes.string,
      value: PropTypes.any
    }))
  }),
  labels: PropTypes.shape({    
    saveContent: PropTypes.string
  })
};

export default ModalContent;

