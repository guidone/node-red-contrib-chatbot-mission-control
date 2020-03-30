import React, { useState } from 'react';
import { AutoComplete, InputGroup, Button, FlexboxGrid, ButtonGroup, IconButton, Icon } from 'rsuite';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useQuery } from 'react-apollo';

import Language from '../../components/language';

import ContentPreview from './views/content-preview';
import ContentIcon from './views/content-icon';
import useCreateContent from './hooks/create-content';
import { SEARCH } from './queries';
import './style.scss';

const ContentAutocomplete = ({
  value,
  onChange = () => {},
  style,
  useSlug = false,
  canCreate = true,
  fluid = false,
  namespace = 'content'
}) => {
  const [search, setSearch] = useState(null);
  const [items, setItems] = useState(null);
  const [content, setContent] = useState(null);
  const { createContent, modal } = useCreateContent({
    onComplete: content => onChange(useSlug ? content.slug : content.id)
  });

  const hasButtons = true; // TODO evaluate if has buttons

  const variables = {
    title: search != null ? search : undefined,
    id: search == null && !useSlug ? value || 0 : undefined,
    slug: search == null && useSlug ? value || 'invalid-slug' : undefined,
    namespace
  };

  const { client } = useQuery(SEARCH, {
    fetchPolicy: 'network-only',
    variables,
    onCompleted: data => setItems(data.contents)
  });

  let current;
  if (search != null) {
    current = search;
  } else {
    if (!_.isEmpty(items)) {
      current = useSlug ? `slug: ${items[0].slug}` : items[0].title;
    } else {
      current = '';
    }
  }

  return (
    <div className={classNames('ui-content-autocomplete', { fluid })}>
      <div className="autocomplete">
        <InputGroup inside style={style}>
          <AutoComplete
            value={current}
            className={classNames('autocomplete-box', { 'with-buttons': hasButtons })}
            renderItem={({ label, slug, language }) => {
              return useSlug ?
                <div><em>({slug})</em>: {label} <Language>{language}</Language></div>
                :
                <div>{label} <em>({slug})</em> <Language>{language}</Language></div>;
            }}
            onChange={(current, event) => {
              const isBackspace = event.nativeEvent != null && event.nativeEvent.inputType === 'deleteContentBackward';
              if (event.keyCode === 13) {
                const found = items.find(item => item.id === current);
                if (found != null) {
                  setSearch(null);
                  onChange(useSlug ? found.slug : found.id);
                }
              } else if (isBackspace) {
                if (search != null) {
                  setSearch(current);
                }
                setItems(null);
                onChange(null);
              } else if (useSlug && event.nativeEvent != null && event.nativeEvent.inputType === 'insertText' && current.startsWith('slug: ')) {
                setSearch(event.nativeEvent.data);
              } else if (event.nativeEvent != null && event.nativeEvent.inputType === 'insertText') {
                setSearch(String(current));
              }
            }}
            onSelect={item => {
              if (item != null) {
                setSearch(null);
                onChange(useSlug ? item.slug : item.id);
              }
            }}
            data={(items || []).map(item => ({
              key: item.id,
              value: item.id,
              label: item.title,
              ...item
              }))}
          />
          {search == null && items != null && (
            <InputGroup.Addon  style={{ marginTop: '-2px', marginRight: '-2px' }}>
              {items.map(item => (
                <ContentIcon
                  key={item.id}
                  disabled={item.id === content}
                  {...item}
                  onClick={() => setContent(item.id)}
                />
              ))}
            </InputGroup.Addon>
          )}

        </InputGroup>
      </div>
      <ButtonGroup className="content-buttons">
        {canCreate && (
          <IconButton
            appearance="default"
            icon={<Icon icon="plus-square"/>}
            size="md"
            onClick={() => createContent({
              namespace,
              slug: useSlug && value != null ? value : undefined
            }, {
              disabledLanguages: ['it']
            })}
          />
        )}
        <IconButton
          appearance="default"
          size="md"
          icon={<Icon icon="trash"/>}
          onClick={() => onChange(null)}
          disabled={value == null}
        />
      </ButtonGroup>
      {modal}
      {content != null && (
        <ContentPreview
          contentId={content}
          onCancel={() => setContent(null)}
          onSubmit={async () => {
            setContent(null);
            const { data } = await client.query({ query: SEARCH, fetchPolicy: 'network-only', variables });
            setItems(data.contents);
          }}
        />
      )}
    </div>
  );
};
ContentAutocomplete.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  // select content using the slug and not the id (slug could include a group of posts)
  useSlug: PropTypes.bool,
  canCreate: PropTypes.bool,
  fluid: PropTypes.bool,
  onChange: PropTypes.func,
  style: PropTypes.object,
  // restrict autocomplete and creation to this namespace
  namespace: PropTypes.string
};


export default ContentAutocomplete;