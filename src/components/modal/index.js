import React, { useState, useCallback, Fragment, useContext, useReducer } from 'react';
import { Modal, Button } from 'rsuite';
import _ from 'lodash';

const ModalContext = React.createContext({});

/**
 * useModal
 * @param {React.View} props.view
 * @param {String} props.title Title of the modal
 *
 */
const useModal = props => {
   const context = useContext(ModalContext);
   const { appendView, removeView, setErrorView } = context;

   const [id, setId] = useState(_.uniqueId('modal_'));

  return {
    open: modalProps => {
      console.log('open', props)
      return appendView(id, { initialValue: modalProps, ...props })
    },
    close: () => {
      removeView(id)
    },
    error: error => {
      return setErrorView(id, error)
    }
  };


}

const ModalWrapper = ({
  view: InnerView,
  initialValue,
  disabled = false,
  title,
  onSubmit = () => {},
  onCancel = () => {},
  error
}) => {
  const [value, setValue] = useState(initialValue);


  return (
    <Modal backdrop show onHide={() => handleCancel()} size="md" overflow={false} className="modal-admin">
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
          Cancel
        </Button>
        <Button
          disabled={disabled}
          appearance="primary"
          onClick={() => onSubmit(value)}
        >
          Save admin
        </Button>
      </Modal.Footer>
    </Modal>
  );

}


const reducer = (state, action) => {
  if (action.type === 'appendView') {
    const { id, resolve, type, ...rest } = action;
    const newModals = [

      ...state.modals,
      {
        id,
        view: (
          <ModalWrapper
            key={id}
            onSubmit={function(value) {
              resolve(value);
            }}
            onCancel={() => resolve()}
            {...rest}
          />
        )
      }
    ];
    return { ...state, modals: newModals };
  } else if (action.type === 'setError') {
    const { id, view, props, resolve, error } = action;
    const newModals = state.modals.map(modal => {
      if (modal.id === id) {
        return {
          ...modal,
          view: React.cloneElement(modal.view, {
            error,
            onSubmit: value => resolve(value),
            onCancel: () => resolve()
          })
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
      modals,
      removeView: function(id) {
        //console.log('remove view')
        //setModals(modals.filter(modal => modal.id !== id))
        dispatch({ type: 'removeView', id });
      },
      setErrorView: function(id, error) {
        return new Promise(resolve => dispatch({ type: 'setError', error, id, resolve }));
      },
      appendView: function(id, props) {
        return new Promise(resolve => dispatch({ type: 'appendView', id, resolve, ...props }));
      }
    }}>
      {!_.isEmpty(modals) && (
        <Fragment>
          {modals.map(modal => modal.view)}
        </Fragment>
      )}
      {children}
    </ModalContext.Provider>
  );
};


export { ModalProvider, useModal };