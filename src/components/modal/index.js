import React, { useState, Fragment, useContext, useReducer } from 'react';
import _ from 'lodash';

import reducer from './reducer';
import ModalWrapper from './model-wrapper';

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
 * @param {String} props.enableSummit Enable or disable the submit button, takes as argument the current value of the form
 * @return {Object}
 * @return {Function} return.open Open the modal with
 */
const useModal = props => {
   const context = useContext(ModalContext);
   const { dispatch } = context;

   const [id] = useState(_.uniqueId('modal_'));

  return {
    open: modalProps => new Promise(resolve => dispatch({ type: 'appendView', id, resolve, initialValue: modalProps, ...props })),
    close: () => dispatch({ type: 'removeView', id }),
    error: error => dispatch({ type: 'mergeModalProps', id, props: { error } }),
    disable: () => dispatch({ type: 'mergeModalProps', id, props: { disabled: true } }),
    enable: () => dispatch({ type: 'mergeModalProps', id, props: { disabled: false } })
  };
};

const ModalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { modals: [] });
  const { modals } = state;

  return (
    <ModalContext.Provider value={{
      dispatch,
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