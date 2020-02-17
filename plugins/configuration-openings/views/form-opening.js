import React from 'react';
import {Form, FormControl, DatePicker, FlexboxGrid, SelectPicker } from 'rsuite';
import PropTypes from 'prop-types';

import SELECT_DAYS from '../helpers/days';

const FormOpening = ({ value, onChange, disabled = false }) => (
  <Form 
    formValue={value} 
    onChange={onChange}     
    fluid
  >
    <FlexboxGrid justify="space-between">
      <FlexboxGrid.Item colspan={7}>
        <FormControl 
          name="start"
          readOnly={disabled}
          accepter={DatePicker}
          format="HH:mm" 
          style={{ width: '100%' }}
        />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={7}>
        <FormControl 
          name="end"
          readOnly={disabled}
          accepter={DatePicker}
          format="HH:mm" 
          style={{ width: '100%' }}
        />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={8}>
        <FormControl 
          name="range"
          accepter={SelectPicker}
          readOnly={disabled}
          format="HH:mm" 
          block
          data={SELECT_DAYS}
          style={{ width: '100%' }}
        />
      </FlexboxGrid.Item>
    </FlexboxGrid>
  </Form>
);
FormOpening.propTypes = {
  value: PropTypes.shape({
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
    range: PropTypes.oneOf(['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su', 'mo-fr', 'mo-sa', 'mo-su', 'sa-su'])
  })
};

export default FormOpening;