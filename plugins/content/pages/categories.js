import React, { useState } from 'react';
import _ from 'lodash';
import { Table, Icon, Placeholder, ButtonGroup, Button, FlexboxGrid } from 'rsuite';

const { Column, HeaderCell, Cell, Pagination } = Table;
const { Grid } = Placeholder

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import SmartDate from '../../../src/components/smart-date';

import useCategories from '../hooks/category';
import ModalCategory from '../views/modal-category';



const Categories = () => {
  const [ cursor, setCursor ] = useState({ page: 1, limit: 10, sortField: 'createdAt', sortType: 'desc' });  
  const [ category, setCategory ] = useState(null);

  const { limit, page, sortField, sortType } = cursor;
  const { loading, saving, error, data, deleteCategory, editCategory, createCategory, refetch } = useCategories({ limit, page, sortField, sortType });
  
  return (
    <PageContainer className="page-contents">
      <Breadcrumbs pages={['Categories']}/>
      {category != null && (
        <ModalCategory 
          category={category}
          disabled={saving}          
          onCancel={() => setCategory(null)}
          onSubmit={async category => {
            if (category.id != null) {
              await editCategory({ variables: { id: category.id, category }})
            } else {
              await createCategory({ variables: { category } });
            }
            // TODO: catch errorrs                          
            setCategory(null);
            refetch();        
          }}
        />)}

      {!error && !loading && (
        <div className="filters" style={{ marginBottom: '10px' }}>
          <FlexboxGrid justify="space-between" style={{ marginBottom: '20px' }}>      
            <FlexboxGrid.Item colspan={18}>
              &nbsp;  
            </FlexboxGrid.Item>            
            <FlexboxGrid.Item colspan={6} align="right">
              <Button 
                appearance="primary"
                disabled={loading || saving} 
                onClick={() => setCategory({ name: '' })}>Create category
              </Button>
            </FlexboxGrid.Item>
          </FlexboxGrid>          
        </div>
      )}

      {loading && <Grid columns={9} rows={3} />}
      {error && <div>error</div>}
      {!error && !loading && (
        <Table
          height={600}
          data={data.categories}
          loading={loading}
          sortColumn={sortField}
          sortType={sortType}
          renderEmpty={() => <div style={{ textAlign: 'center', padding: 80}}>No Content</div>}
          onSortColumn={(sortField, sortType) => setCursor({ ...cursor, sortField, sortType })}
          autoHeight
        >
          <Column width={60} align="center">
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={140} resizable sortable>
            <HeaderCell>Date</HeaderCell>            
            <Cell dataKey="createdAt">
              {({ createdAt }) => <SmartDate date={createdAt} />}
            </Cell>
          </Column>

          <Column width={300} flexGrow={1}>
            <HeaderCell>Name</HeaderCell>
            <Cell dataKey="name" />
          </Column>

          <Column width={80}>
            <HeaderCell>Action</HeaderCell>
            <Cell>
              {category => (
                <ButtonGroup>
                  <Button 
                    disabled={saving} 
                    size="xs"
                    onClick={async () => {
                      if (confirm(`Delete "${category.name}"?`)) {
                        await deleteCategory({ variables: { id: category.id }})
                        refetch();  
                      }
                    }}
                  >
                    <Icon icon="trash" />
                  </Button>
                  <Button 
                    disabled={saving} 
                    size="xs"
                    onClick={() => {
                      setCategory(category)  
                    }}
                  >
                    <Icon icon="edit2" />
                  </Button>
              </ButtonGroup>
              )}
            </Cell>
          </Column>

        </Table>
      )}
      {!error && !loading && (
        <Pagination
          activePage={page}
          displayLength={limit}
          onChangePage={page => setCursor({ ...cursor, page })}
          lengthMenu={[{ label: '10', value: 10 }, { label: '20', value: 20 }, { label: '30', value: 30 } ]}
          onChangeLength={limit => setCursor({ limit, page: 1 })}
          total={data.counters.categories.count}
      />
      )}
    </PageContainer>
  );
};

export default Categories;

