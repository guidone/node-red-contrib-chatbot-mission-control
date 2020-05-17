import React from 'react';
import PropTypes from 'prop-types';
import { FlexboxGrid, Input } from 'rsuite';

import ContentAutocomplete from '../../../src/components/content-autocomplete';

const FormCommand = ({ value, onChange, disabled = false }) => (
  <FlexboxGrid justify="space-between">
    <FlexboxGrid.Item colspan={8}>
      <Input
        value={value.command}
        placeholder="/command"
        onChange={command => onChange({ ...value, command })}
      />
    </FlexboxGrid.Item>
    <FlexboxGrid.Item colspan={15}>
      <ContentAutocomplete
        disabled={disabled}
        useSlug={true}
        canCreate={true}
        value={value.slug}
        fluid
        onChange={slug => onChange({ ...value, slug })}
      />
    </FlexboxGrid.Item>
  </FlexboxGrid>
);
FormCommand.propTypes = {
  value: PropTypes.shape({
    slug: PropTypes.string,
    command: PropTypes.string
  }),
  onChange: PropTypes.func,
  disabled: PropTypes.bool
};

export default FormCommand;