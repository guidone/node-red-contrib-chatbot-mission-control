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

const CUSTOM_FIELDS = [
  {
    key: 'url',
    type: 'string',
    description: 'The url opened clicking on the card button',
    defaultValue: 'http://',
    color: 'red'
  },
  {
    key: 'labelButton',
    type: 'string',
    description: 'The label of the card button',
    defaultValue: 'Open',
    color: 'orange'
  }
];

const FormOpening = ({ value, onChange, disabled = false }) => (
  <div>
    <ContentAutocomplete
      disabled={disabled}
      useSlug={true}
      canCreate={true}
      value={value.slug}
      customFieldsSchema={CUSTOM_FIELDS}
      fluid
      onChange={slug => onChange({ ...value, slug })}
    />
  </div>
);
FormOpening.propTypes = {
  value: PropTypes.shape({
    slug: PropTypes.string
  }),
  onChange: PropTypes.func,
  disabled: PropTypes.bool
};

export default FormOpening;