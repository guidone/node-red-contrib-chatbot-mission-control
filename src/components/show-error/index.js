import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'rsuite';

import './index.scss';

const ShowError = ({ error }) => {
  const message = 'Something went wrong on the server, please try again.';
  return (
    <div className="ui-show-error">
      <Message
        type="error"
        title="Error"
        description={message}
      />
    </div>
  );
};
ShowError.propTypes = {
  error: PropTypes.object
};

export default ShowError;