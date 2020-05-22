import React, { useState, useCallback, Fragment, useContext, useReducer } from 'react';
import { Modal, Button } from 'rsuite';
import _ from 'lodash';
import classNames from 'classnames';

const ModalContext = React.createContext({});

/**
 * useModal
 * @param {Object} props
 * @param {React.View} props.view
 * @param {String} props.title Title of the modal
 * @param {String} props.labelSubmit Submit button
 * @param {String} props.labelCancel Cancel button
 * @param {String} props.className
 * @param {String} props.size Size of the modal
 * @return {Object}
 * @return {Function} return.open Open the modal with
 */
const useModal = props => {
   const context = useContext(ModalContext);
   const { appendView, removeView, setErrorView, dispatch } = context;

   const [id, setId] = useState(_.uniqueId('modal_'));

  return {
    open: modalProps => {
      return appendView(id, { initialValue: modalProps, ...props })
    },
    close: () => {
      removeView(id)
    },
    error: error => dispatch({ type: 'mergeModalProps', id, props: { error } }),
    disable: () => dispatch({ type: 'mergeModalProps', id, props: { disabled: true } }),
    enable: () => dispatch({ type: 'mergeModalProps', id, props: { disabled: false } })
  };


}

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
  error
}) => {
  const [value, setValue] = useState(initialValue);


  return (
    <Modal
      backdrop
      show
      onHide={() => handleCancel()}
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
        />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => onCancel()} appearance="subtle">
          {labelCancel}
        </Button>
        <Button
          disabled={disabled}
          appearance="primary"
          onClick={() => onSubmit(value)}
        >
          {labelSubmit}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/*

<ModalWrapper
            key={id}
            onSubmit={function(value) {
              resolve(value);
            }}
            onCancel={() => resolve()}
            {...rest}
          />
*/

const reducer = (state, action) => {
  if (action.type === 'appendView') {
    const { id, resolve, type, view, ...rest } = action;
    const newModals = [
      ...state.modals,
      {
        id,
        view,
        props: {
          ...rest,
          onSubmit: value => resolve(value),
          onCancel: () => resolve()
        }
      }
    ];
    return { ...state, modals: newModals };
  } else if (action.type === 'mergeModalProps') {
    const newModals = state.modals.map(modal => {
      if (modal.id === action.id) {
        return {
          ...modal,
          props: {
            ...modal.props,
            ...action.props
          }
        };
      }
      return modal;
    });
    return { ...state, modals: newModals };
  } else if (action.type === 'setError') {
    const { id, view, props, resolve, error } = action;
    const newModals = state.modals.map(modal => {
      if (modal.id === id) {
        return {
          ...modal,
          props: {
            ...modal.props,
            error,
            onSubmit: value => resolve(value),
            onCancel: () => resolve()
          }
        };
      }
      return modal;
    });
    return { ...state, modals: newModals };
  } else if (action.type === 'removeView') {
    return {
      ...state,
      modals: state.modals.filter(modal => modal.id !== action.id)
    };
  }


};


const ModalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { modals: [] });
  const { modals } = state;






  return (
    <ModalContext.Provider value={{
      dispatch,
      removeView: function(id) {
        //console.log('remove view')
        //setModals(modals.filter(modal => modal.id !== id))
        // TODO move up
        dispatch({ type: 'removeView', id });
      },
      /*setErrorView: function(id, error) {
        return new Promise(resolve => dispatch({ type: 'setError', error, id, resolve }));
      },*/
      appendView: function(id, props) {
        return new Promise(resolve => dispatch({ type: 'appendView', id, resolve, ...props }));
      }
    }}>
      {!_.isEmpty(modals) && (
        <Fragment>
          {modals.map(({ id, view, props }) => <ModalWrapper view={view} key={id} {...props} />)}
        </Fragment>
      )}
      {children}
    </ModalContext.Provider>
  );
};


export { ModalProvider, useModal };