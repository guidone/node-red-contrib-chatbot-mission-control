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
import Language from '../../../src/components/language';
import LanguagePicker from '../../../src/components/language-picker';
import useRouterQuery from '../../../src/hooks/router-query';

import useContents from '../hooks/content';
import ModalContent from '../views/modal-content';

const LABELS = {
  createContent: 'Create content',
  emptyContent: 'No Content',
  saveContent: 'Save content'
};

const Contents = ({ 
  namespace, 
  title,
  labels
 }) => {
  //const { query: { chatId: urlChatId, messageId: urlMessageId, userId: urlUserId }, setQuery } = useRouterQuery();
  const [ cursor, setCursor ] = useState({ page: 1, limit: 10, sortField: 'createdAt', sortType: 'desc' });
  const [ filters, setFilters ] = useState({ categoryId: null, language: null, slug: null });
  const [ content, setContent ] = useState(null);

  const { limit, page, sortField, sortType } = cursor;
  const { categoryId, language, slug } = filters;
  const { 
    bootstrapping,
    loading, 
    saving, 
    error, 
    data, 
    deleteContent, 
    editContent, 
    createContent, 
    refetch 
  } = useContents({ limit, page, sortField, sortType, categoryId, language, slug, namespace });
  
  labels = { ...LABELS, ...labels };

  return (
    <PageContainer className="page-contents">
      <Breadcrumbs pages={[title]}/>
      {content != null && (
        <ModalContent 
          content={content}
          error={error}
          disabled={saving}
          categories={data.categories}
          labels={labels}
          onCancel={() => setContent(null)}
          onSubmit={async content => {

            if (content.id != null) {
              await editContent({ variables: { id: content.id, content }})
            } else {
              await createContent({ variables: { content: { ...content, namespace } } });
            }
            // TODO: catch errorrs                          
            setContent(null);
            refetch();        
          }}
        />
      )}
      {!bootstrapping && (
        <div className="filters" style={{ marginBottom: '10px' }}>
          <FlexboxGrid justify="space-between" style={{ marginBottom: '20px' }}>      
            <FlexboxGrid.Item colspan={18}>
              <SelectPicker           
                readOnly={loading || saving} 
                value={categoryId}
                cleanable
                placeholder="Filter by category"
                onChange={categoryId => {
                  setFilters({ ...filters, categoryId });
                  setCursor({ ...cursor, page: 1 });
                }}
                data={data.categories.map(category => ({ value: category.id, label: category.name }))}
              />
              &nbsp;
              <LanguagePicker
                readOnly={loading || saving} 
                value={language}
                cleanable
                placeholder="Filter by language"
                onChange={language => {
                  setFilters({ ...filters, language });
                  setCursor({ ...cursor, page: 1 });
                }}
              />
              &nbsp;
              <Input
                defaultValue={slug}
                style={{ width: '150px', display: 'inline-block' }}
                placeholder="slug"
                onKeyUp={e => {
                  if (e.keyCode === 13) {
                    setFilters({ ...filters, slug: !_.isEmpty(e.target.value) ? e.target.value : undefined });
                    setCursor({ ...cursor, page: 1 });                                          
                  }
                }}
              />  
            </FlexboxGrid.Item>            
            <FlexboxGrid.Item colspan={6} align="right">
              <Button 
                appearance="primary"
                disabled={loading || saving} 
                onClick={() => setContent({ title: '', body: '', fields: [] })}>{labels.createContent}
              </Button>
            </FlexboxGrid.Item>
          </FlexboxGrid>          
        </div>
      )}
      {bootstrapping && <Grid columns={9} rows={3} />}      
      {!bootstrapping && (
        <Table
          height={600}
          data={data.contents || []}
          loading={loading}
          sortColumn={sortField}
          sortType={sortType}
          renderEmpty={() => <div style={{ textAlign: 'center', padding: 80}}>{labels.emptyContent}</div>}
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

          <Column width={50} resizable>
            <HeaderCell>Language</HeaderCell>
            <Cell>
              {({ language }) => <Language>{language}</Language>}
            </Cell>
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
      {!error && !bootstrapping && (
        <Pagination
          activePage={page}
          displayLength={limit}
          disabled={loading}
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

