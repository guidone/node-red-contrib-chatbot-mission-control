import React, { useState, Fragment, useContext, useReducer, useCallback } from 'react';
import _ from 'lodash';

import reducer from './reducer';
import ModalWrapper from './model-wrapper';

const isValid = validation => Object.values(validation).every(item => !item.hasError);

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
 * @return {Function} return.validate Sets the validation info for the form
 */
const useModal = props => {
  const context = useContext(ModalContext);
  const { dispatch } = context;

  const [id] = useState(_.uniqueId('modal_'));

  const open = useCallback(modalProps => new Promise(resolve => dispatch({ type: 'appendView', id, resolve, initialValue: modalProps, ...props })));
  const validate = useCallback(validation => dispatch({ type: 'mergeModalProps', id, props: { validation } }));
  const close = useCallback(() => dispatch({ type: 'removeView', id }));

  return {
    open,
    close,
    error: error => dispatch({ type: 'mergeModalProps', id, props: { error } }),
    validate,
    disable: () => dispatch({ type: 'mergeModalProps', id, props: { disabled: true } }),
    enable: () => dispatch({ type: 'mergeModalProps', id, props: { disabled: false } }),
    openForModel: async (modalProps, model) => {
      let validation = null;
      let value = { ...modalProps };
      do {
        value = await open(value);
        if (value != null) {
          validation = model.check(value);
          if (!isValid(validation)) {
            // translate validation object
            const errors = {};
            Object.keys(validation)
              .forEach(field => {
                if (validation[field].hasError) {
                  errors[field] = validation[field].errorMessage;
                }
              })
            validate(errors);
          } else {
            validate(null);
          }
        }
      } while (value != null && !isValid(validation));
      close();
      return value;
    }
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