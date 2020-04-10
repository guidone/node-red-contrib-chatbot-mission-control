import React from 'react';
import PropTypes from 'prop-types';

import './style.scss';

import FilterInput from './components/input';

const TableFilters = ({
  filters,
  schema,
  disabled = false,
  width = 150,
  onChange = () => {}
}) => {
  return (
    <div className="ui-table-filters">
      {schema.map(({ name, label, control: Control, ...rest }) => {

        return (
          <div key={name} className="control" style={{ width: `${width}px` }}>
            <Control
              defaultValue={filters[name]}
              disabled={disabled}
              placeholder={label}
              onChange={value => onChange({ ...filters, [name]: value })}
              {...rest}
            />
          </div>
        );
      })}
    </div>
  );
};
TableFilters.propTypes = {
  disabled: PropTypes.bool
};

export { TableFilters as default, FilterInput as Input };