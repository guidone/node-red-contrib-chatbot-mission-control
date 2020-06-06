import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';


import WarningBox from '../warning-box';

import './index.scss';

const ShowError = ({
  error = 'Something went wrong on the server, please try again.',
  title = 'Server error',
  subtitle
}) => {
  let message;
  if (_.isString(error)) {
    message = error;
  } else if (error.networkError != null && error.networkError.result != null && error.networkError.result.errors != null) {
    const errors = error.networkError.result.errors;
    message = (
      <span>
        {errors.map(item => <span key={item.message}>{item.message}. </span>)}
      </span>
    );
  } else if (error != null) {

    message = error;
  }

  return (
    <WarningBox
      className="ui-show-error"
      icon="exclamation-triangle"
      title={title}
    >
      {!_.isEmpty(subtitle) && <span>{subtitle}<br/></span>}
      {message}
    </WarningBox>
  );
};
ShowError.propTypes = {
  error: PropTypes.object,
  // the title of the box, generelly server error
  title: PropTypes.string,
  // something that explains better the error, it's above the automatic render of the server
  subtitle: PropTypes.string,
};

export default ShowError;