import React, { useState, Fragment, useRef } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
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
import useCanCloseModal from '../../../../src/hooks/modal-can-close';
import useCurrentUser from '../../../../src/hooks/current-user';

import { content as contentModel } from '../models';
import '../styles/modal-content.scss';

const LABELS = {
  saveContent: 'Save content',
  deleteContent: 'Delete'
};

const CATEGORIES = gql`
query($namespace: String) {
  categories(namespace: $namespace) {
    id,
    name
  }
}
`;

const ModalContent = ({
  content,
  onCancel = () => {},
  onSubmit = () => {},
  onDelete = () => {},
  disabled = false,
  hasDelete = false,
  error,
  labels = {},
  disabledLanguages,
  customFieldsSchema,
  namespace
}) => {
  const { can } = useCurrentUser();
  const { isChanged, setIsChanged, handleCancel } = useCanCloseModal({ onCancel });
  const [formValue, setFormValue] = useState(content);
  const [formError, setFormError] = useState(null);
  const [jsonValue, setJsonValue] = useState({
    json: !_.isEmpty(content.payload) ? JSON.stringify(content.payload, null, 2) : ''
  });
  const [tab, setTab] = useState('content');
  const { loading, error: errorCategory, data } = useQuery(CATEGORIES, {
    fetchPolicy: 'network-only',
    variables: { namespace }
  });

  const categories = !loading ? data.categories : [];
  const form = useRef(null);

  const isNew = content.id == null;

  labels = { ...LABELS, ...labels };

  return (
    <Modal backdrop show onHide={handleCancel} className="modal-content" overflow={false} size="md">
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
                json: !_.isEmpty(formValue.payload) ? JSON.stringify(formValue.payload, null, 2) : ''
              });
            }
            setTab(tab);
          }}
          activeKey={tab}
        >
          <Nav.Item eventKey="content">Content</Nav.Item>
          <Nav.Item eventKey="custom_fields">Custom Fields</Nav.Item>
          <Views region="content-tabs">
            {(View, { label, id, permission }) => {
              if (_.isEmpty(permission) || can(permission)) {
                return (
                  <Nav.Item key={id} active={id === tab} eventKey={id} onSelect={() => setTab(id)}>{label}</Nav.Item>
                );
              }
            }}
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
            setIsChanged(true);
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
                      disabledItemValues={disabledLanguages}
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
              <FormControl
                readOnly={disabled}
                name="fields"
                accepter={FieldsEditor}
                schema={customFieldsSchema}
              />
            </FormGroup>
          )}
          <Views region="content-tabs">
            {(View, { id }) => {
              if (id === tab) {
                return (
                  <View
                    key={id}
                    formValue={formValue.payload}
                    onChange={payload => {
                      setIsChanged(true);
                      setFormValue({ ...formValue, payload });
                    }}
                  />
                );
              }
              return <div key={id}/>;
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
                style={{ marginBottom: '20px' }}
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
                    setIsChanged(true);
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
        {hasDelete && (
          <Button
            className="btn-delete"
            appearance="default"
            color="orange"
            disabled={disabled}
            onClick={() => {
              if (confirm(`Delete "${formValue.title}" ?`)) {
                onDelete(formValue)
              }
            }}
          >
            {labels.deleteContent}
          </Button>
        )}
        <Button onClick={handleCancel} appearance="subtle">
          Cancel
        </Button>
        <Button
          appearance="primary"
          disabled={disabled || !isChanged}
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
      </Modal.Footer>
    </Modal>
  );
};
ModalContent.propTypes = {
  error: PropTypes.object,
  category: PropTypes.array,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onDelete: PropTypes.func,
  disabled: PropTypes.bool,
  hasDelete: PropTypes.bool,
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
    saveContent: PropTypes.string,
    deleteContent: PropTypes.string
  }),
  customFieldsSchema: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    defaultValue: PropTypes.string,
    color: PropTypes.oneOf(['red','orange', 'yellow', 'green', 'cyan', 'blue', 'violet'])
  }))
};

export default ModalContent;
