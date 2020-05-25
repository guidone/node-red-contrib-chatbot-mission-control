import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'rsuite';
import _ from 'lodash';
import classNames from 'classnames';

import ShowErrors from '../show-error';


const ModalWrapper = ({
  view: InnerView,
  initialValue,
  disabled = false,
  title,
  onSubmit = () => {},
  onCancel = () => {},
  labelSubmit = 'Save',
  labelCancel = 'Cancel',
  className,
  size = 'md',
  error,
  validation: validationProp,
  enableSubmit = () => true
}) => {
  const [value, setValue] = useState(initialValue);
  const [validation, setValidation] = useState(validationProp);
  useEffect(() => {
    setValidation(validationProp);
  }, [validationProp]);


  return (
    <Modal
      backdrop
      show
      onHide={() => onCancel()}
      size={size}
      overflow={false}
      className={classNames('modal-admin', className)}
    >
      {!_.isEmpty(title) && (
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      )}
      <Modal.Body>
        {error != null && <ShowErrors error={error}/>}
        <InnerView
          disabled={disabled}
          value={value}
          validation={validation}
          error={error}
          onChange={value => {
            setValue(value);
            setValidation(null)
          }}
          onSubmit={() => onSubmit(value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => onCancel()} appearance="subtle">
          {labelCancel}
        </Button>
        <Button
          disabled={disabled || !enableSubmit(value)}
          appearance="primary"
          onClick={() => onSubmit(value)}
        >
          {labelSubmit}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalWrapper;