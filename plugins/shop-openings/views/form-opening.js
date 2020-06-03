import React from 'react';
import { DatePicker, FlexboxGrid, SelectPicker } from 'rsuite';
import PropTypes from 'prop-types';

import SELECT_DAYS from '../helpers/days';
import isValidDate from '../../../src/helpers/is-valid-date';

const ifDate = str => {
  const temp = new Date(str);
  return isValidDate(temp) ? temp : null;
}

const FormOpening = ({ value, onChange, disabled = false }) => (
  <div>
    <FlexboxGrid justify="space-between">
      <FlexboxGrid.Item colspan={7}>
        <DatePicker 
          readOnly={disabled}
          format="HH:mm"
          value={ifDate(value.start)} 
          style={{ width: '100%' }}
          onChange={start => onChange({ ...value, start })}
        />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={7}>
        <DatePicker 
          readOnly={disabled}
          value={ifDate(value.end)} 
          format="HH:mm" 
          style={{ width: '100%' }}
          onChange={end => onChange({ ...value, end })}
        />
      </FlexboxGrid.Item>
      <FlexboxGrid.Item colspan={8}>
        <SelectPicker 
          readOnly={disabled}
          format="HH:mm" 
          block
          value={value.range}
          data={SELECT_DAYS}
          style={{ width: '100%' }}
          onChange={range => onChange({ ...value, range })}
        />
      </FlexboxGrid.Item>
    </FlexboxGrid>
  </div>
);
FormOpening.propTypes = {
  value: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string,
    range: PropTypes.oneOf(['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su', 'mo-fr', 'mo-sa', 'mo-su', 'sa-su'])
  })
};

export default FormOpening;