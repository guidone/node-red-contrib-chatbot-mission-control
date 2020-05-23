import React, { useState } from 'react';
import { Modal, Button } from 'rsuite';
import _ from 'lodash';
import classNames from 'classnames';

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
  enableSummit = () => true
}) => {
  const [value, setValue] = useState(initialValue);
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
        {error != null && (
          <div>erorr: {error}</div>
        )}
        <InnerView
          disabled={disabled}
          value={value}
          onChange={value => setValue(value)}
          onSubmit={() => onSubmit(value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => onCancel()} appearance="subtle">
          {labelCancel}
        </Button>
        <Button
          disabled={disabled || !enableSummit(value)}
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