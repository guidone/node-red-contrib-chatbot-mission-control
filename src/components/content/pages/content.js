import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import _ from 'lodash';
import { Table, Icon, SelectPicker, ButtonGroup, Button, ButtonToolbar } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

import PageContainer from '../../../../src/components/page-container';
import Breadcrumbs from '../../../../src/components/breadcrumbs';
import SmartDate from '../../../../src/components/smart-date';
import Language from '../../../../src/components/language';
import CustomTable from '../../../../src/components/table';
import LanguagePicker from '../../../../src/components/language-picker';
import { Input } from '../../../../src/components/table-filters';

import useContents from '../hooks/content';
import ModalContent from '../views/modal-content';

const CONTENTS = gql`
query($offset: Int, $limit: Int, $order: String, $categoryId: Int, $slug: String, $language: String, $namespace: String, $search: String) {
  counters {
    rows: contents {
     count(categoryId: $categoryId, slug: $slug, language: $language, namespace: $namespace, search: $search)
    }
  }
  categories(namespace: $namespace) {
    id,
    name
  }
  rows: contents(offset: $offset, limit: $limit, order: $order, categoryId: $categoryId, slug: $slug, language: $language, namespace: $namespace, search: $search) {
    id,
    slug,
    title,
    body,
    categoryId,
    language,
    createdAt,
    payload,
    namespace,
    category {
      id,
      name
    }
    fields {
      id,
      name,
      value,
      type
    }
  }
}
`;

const LABELS = {
  createContent: 'Create content',
  emptyContent: 'No Content',
  saveContent: 'Save content'
};

const Contents = ({
  namespace,
  title,
  labels,
  breadcrumbs,
  customFieldsSchema,
  custom
 }) => {
  const [filters, setFilters] = useState(null);
  const [ content, setContent ] = useState(null);
  const table = useRef();

  const {
    error,
    saving,
    deleteContent,
    editContent,
    createContent
  } = useContents();

  labels = { ...LABELS, ...labels };

  return (
    <PageContainer className="page-contents">
      <Breadcrumbs pages={breadcrumbs != null ? breadcrumbs : [title]}/>
      {content != null && (
        <ModalContent
          content={content}
          error={error}
          disabled={saving}
          labels={labels}
          customFieldsSchema={customFieldsSchema}
          namespace={namespace}
          onCancel={() => setContent(null)}
          onSubmit={async content => {
            if (content.id != null) {
              await editContent({ variables: { id: content.id, content }})
            } else {
              await createContent({ variables: { content: { ...content, namespace } } });
            }
            setContent(null);
            table.current.refetch();
          }}
        />
      )}
      <CustomTable
        ref={table}
        query={CONTENTS}
        variables={{ namespace }}
        initialSortField="createdAt"
        initialSortDirection="desc"
        toolbar={(
          <ButtonToolbar>
            {_.isFunction(custom) ? custom() : custom}
            <Button
              appearance="primary"
              onClick={() => setContent({ title: '', body: '', fields: [], ...filters })}>{labels.createContent}
            </Button>
          </ButtonToolbar>
        )}
        onFilters={setFilters}
        filtersSchema={[
          {
            name: 'search',
            label: 'Search',
            control: Input
          },
          {
            name: 'categoryId',
            placeholder: 'Filter by category',
            cleanable: true,
            block: true,
            data: data => data.categories.map(category => ({ value: category.id, label: category.name })),
            control: SelectPicker,
            type: 'number'
          },
          {
            name: 'slug',
            label: 'Slug',
            control: Input
          },
          {
            name: 'language',
            label: 'Language',
            control: LanguagePicker,
            block: true,
            cleanable: true
          }
        ]}
        height={600}
        labels={{
          empty: labels.emptyContent
        }}
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
                      table.current.refetch();
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
      </CustomTable>
    </PageContainer>
  );
};
Contents.propTypes = {
  namespace: PropTypes.string,
  title: PropTypes.string,
  labels: PropTypes.shape({
    createContent: PropTypes.string,
    emptyContent: PropTypes.string,
    saveContent: PropTypes.string
  }),
  breadcrumbs: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string, // the title of the page or the id of the page
    PropTypes.shape({
      title: PropTypes.string,
      url: PropTypes.string
    })
  ])),
  customFieldsSchema: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    defaultValue: PropTypes.string,
    color: PropTypes.oneOf(['red','orange', 'yellow', 'green', 'cyan', 'blue', 'violet'])
  }))
};

export default Contents;
