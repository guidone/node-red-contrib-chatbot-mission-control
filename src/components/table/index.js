import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Table, Placeholder, FlexboxGrid } from 'rsuite';
import PropTypes from 'prop-types';

const { Pagination } = Table;
const { Grid } = Placeholder;

import TableFilters from '../table-filters';
import useTable from './hooks/table';

const LABELS = {
  empty: 'No Content'
};

const CustomTable = ({
  children,
  query,
  namespace = 'content',
  initialSortField = 'createdAt',
  initialSortDirection = 'desc',
  labels,
  filtersSchema,
  toolbar,
  onFilters = () => {},
  ...rest
}, ref) => {
  const [ filters, setFilters ] = useState({});
  const [ cursor, setCursor ] = useState({
    page: 1,
    limit: 10,
    sortField: initialSortField,
    sortType: initialSortDirection
  });
  const { limit, page, sortField, sortType } = cursor;

  useEffect(() => {
    // reset cursor everytime filter changes
    setCursor({ ...cursor, page: 1, limit: 10 });
  }, [filters, sortField, sortType ]);

  const {
    bootstrapping,
    loading,
    error,
    data,
    refetch
  } = useTable({ query, limit, page, sortField, sortType, filters, namespace });

  useImperativeHandle(ref, () => ({
    refetch: () => refetch()
  }));

  labels = { ...LABELS, ...labels };

  let schema;
  if (!bootstrapping) {
    schema = _.isFunction(filtersSchema) ? filtersSchema(data) : filtersSchema;
  }

  return (
    <div className="ui-custom-table">
      {bootstrapping && <Grid columns={9} rows={3} />}
      {!bootstrapping && schema != null && (
        <div className="filters" style={{ marginBottom: '10px' }}>
          <FlexboxGrid justify="space-between" style={{ marginBottom: '20px' }}>
            <FlexboxGrid.Item colspan={18}>
              <TableFilters
                filters={filters}
                onChange={filters => {
                  setFilters(filters);
                  onFilters(filters);
                }}
                schema={schema}
              />
            </FlexboxGrid.Item>
            {toolbar != null &&(
              <FlexboxGrid.Item colspan={6} align="right">
                {toolbar}
              </FlexboxGrid.Item>
            )}
          </FlexboxGrid>
        </div>
      )}
      {!bootstrapping && (
        <Table
          data={data.rows || []}
          loading={loading}
          sortColumn={sortField}
          sortType={sortType}
          renderEmpty={() => <div style={{ textAlign: 'center', padding: 80}}>{labels.empty}</div>}
          onSortColumn={(sortField, sortType) => setCursor({ ...cursor, sortField, sortType })}
          {...rest}
        >
          {children}
        </Table>
      )}
      {!error && !bootstrapping && (
        <Pagination
          activePage={page}
          displayLength={limit}
          disabled={loading}
          onChangePage={page => setCursor({ ...cursor, page })}
          lengthMenu={[{ label: '10', value: 10 }, { label: '20', value: 20 }, { label: '30', value: 30 } ]}
          onChangeLength={limit => setCursor({ ...cursor, limit, page: 1 })}
          total={data.counters.rows.count}
      />
      )}
    </div>
  );
}
/*CustomTable.propTypes = {
  query: PropTypes.string,
  // the subset of content to display
  namespace: PropTypes.string,
  initialSortField: PropTypes.string,
  initialSortDirection: PropTypes.oneOf(['desc', 'asc']),
  // string labels of the component
  labels: PropTypes.shape({
    empty: PropTypes.string
  }),
  filtersSchema: PropTypes.arrayOf(PropTypes.oneOf([
    PropTypes.func,
    PropTypes.shape({
      name: PropTypes.string,
      label: PropTypes.string,
      control: PropTypes.any
    })
  ])),
  // callback when filters changes
  onFilters: PropTypes.func
};*/

export default forwardRef(CustomTable);