import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import classNames from 'classnames';
import _ from 'lodash';
import { Table, Icon, SelectPicker, Placeholder, Input, ButtonGroup, Button, FlexboxGrid } from 'rsuite';

import { useHistory } from 'react-router-dom';

const { Column, HeaderCell, Cell, Pagination } = Table;
const { Grid } = Placeholder

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import SmartDate from '../../../src/components/smart-date';
import useRouterQuery from '../../../src/hooks/router-query';

import useContents from '../hooks/content';
import ModalContent from '../views/modal-content';



const Contents = ({ messageTypes, platforms }) => {
  const { query: { chatId: urlChatId, messageId: urlMessageId, userId: urlUserId }, setQuery } = useRouterQuery();
  const [ cursor, setCursor ] = useState({ page: 1, limit: 10, sortField: 'createdAt', sortType: 'desc' });
  const [ filters, setFilters ] = useState({ categoryId: null });
  const [ content, setContent ] = useState(null);

  const { limit, page, sortField, sortType } = cursor;
  const { categoryId } = filters;
  const { loading, saving, error, data, deleteContent, editContent, createContent, refetch } = useContents({ limit, page, sortField, sortType, categoryId });
  

  

  return (
    <PageContainer className="page-contents">
      <Breadcrumbs pages={['Contents']}/>
      {content != null && (
        <ModalContent 
          content={content}
          disabled={saving}
          categories={data.categories}
          onCancel={() => setContent(null)}
          onSubmit={async content => {
            if (content.id != null) {
              await editContent({ variables: { id: content.id, content }})
            } else {
              await createContent({ variables: { content } });
            }
            // TODO: catch errorrs                          
            setContent(null);
            refetch();        
          }}
        />)}

      {!error && !loading && (
        <div className="filters" style={{ marginBottom: '10px' }}>
          <FlexboxGrid justify="space-between" style={{ marginBottom: '20px' }}>      
            <FlexboxGrid.Item colspan={18}>
              <SelectPicker           
                readOnly={loading || saving} 
                value={categoryId}
                cleanable
                placeholder="Filter by category"
                onChange={categoryId => setFilters({ ...filters, categoryId })}
                data={data.categories.map(category => ({ value: category.id, label: category.name }))}
              />  
            </FlexboxGrid.Item>            
            <FlexboxGrid.Item colspan={6} align="right">
              <Button 
                appearance="primary"
                disabled={loading || saving} 
                onClick={() => setContent({ title: '', body: '', fields: [] })}>Create Content
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
          data={data.contents}
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

          <Column width={260} align="left" sortable resizable>
            <HeaderCell>Title</HeaderCell>
            <Cell dataKey="title" />
          </Column>

          <Column width={80} align="left" sortable resizable>
            <HeaderCell>Slug</HeaderCell>
            <Cell dataKey="slug" />
          </Column>

          <Column width={80} align="left" resizable>
            <HeaderCell>Category</HeaderCell>
            <Cell dataKey="category">
              {({ category }) => <span>{category != null ? category.name : ''}</span>}
            </Cell>
          </Column>

          <Column width={300} flexGrow={1}>
            <HeaderCell>Body</HeaderCell>
            <Cell dataKey="body" />
          </Column>

          <Column width={80}>
            <HeaderCell>Action</HeaderCell>
            <Cell>
              {content => (
                <ButtonGroup>
                  <Button 
                    disabled={saving} 
                    size="xs"
                    onClick={async () => {
                      if (confirm(`Delete "${content.title}"?`)) {
                        await deleteContent({ variables: { id: content.id }})
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
                      setContent(content)  
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
          total={data.counters.contents.count}
      />
      )}
    </PageContainer>
  );


};

export default Contents;

