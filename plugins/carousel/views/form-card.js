import React from 'react';
import { DatePicker, FlexboxGrid, SelectPicker } from 'rsuite';
import PropTypes from 'prop-types';

import ContentAutocomplete from '../../../src/components/content-autocomplete';

import SELECT_DAYS from '../helpers/days';
import isValidDate from '../../../src/helpers/is-valid-date';

const ifDate = str => {
  const temp = new Date(str);
  return isValidDate(temp) ? temp : null;
}

const FormOpening = ({ value, onChange, disabled = false }) => (
  <div>
    <ContentAutocomplete
      useSlug={true}
      canCreate={true}
      value={value.slug}
      fluid
      onChange={slug => onChange({ ...value, slug })}
    />



  </div>
);
FormOpening.propTypes = {
  value: PropTypes.shape({
    slug: PropTypes.string
  })
};

export default FormOpening;