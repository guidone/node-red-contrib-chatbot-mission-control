import React, { useState } from 'react';
import { AutoComplete, InputGroup } from 'rsuite';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import { useQuery, useMutation } from 'react-apollo';

import Language from '../../components/language';
import { content } from '../../../plugins/content/models';


import withoutParams from '../../../src/helpers/without-params';

const SEARCH = gql`
query($title: String, $id: Int, $slug: String) {
	contents(title: $title, id: $id, slug: $slug) {
    id,
    title,
    language,
    slug
  }
}`;

const CONTENT = gql`
query($id: Int) {
  categories {
    id,
    name
  }
  content(id: $id) {
    id,
    slug,
    title,
    body,
    categoryId,
    language,
    createdAt,
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

const EDIT_CONTENT = gql`
mutation($id: Int!, $content: NewContent!) {
  editContent(id: $id, content: $content) {
    id,
    slug,
    title,
    body,
    language,
    fields {
      id,
      name,
      value,
      type
    }
  }
}
`;


const ContentIcon = ({ language, disabled = false, title, onClick = () => {} }) => {
  return (
    <a 
      style={{ display: 'inline-block', marginLeft: '3px', opacity: disabled ? '0.2' : '1' }}
      href="#" 
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
    >
      <Language tooltip={title}>{language}</Language>
    </a>
  );
};

// TODO move this in a common component
import ModalContent from '../../../plugins/content/views/modal-content';

const ContentPreview = ({ contentId, onCancel = () => {}, onSubmit = () => {} }) => {

  const { loading, error, data, refetch } = useQuery(CONTENT, {
    fetchPolicy: 'network-only',
    variables: { 
      id: contentId
    }
  });


  const [editContent, { loading: editLoading, error: editError }] = useMutation(EDIT_CONTENT, { 
    onCompleted: () => {
      console.log('saved correctly')
      onSubmit();
    }
  });

  const edit = withoutParams(editContent, ['id', 'updatedAt', 'createdAt', '__typename', 'cid', 'category'])

  if (error) {
    return <div>error</div>
  }
  if (loading) {
    return null;
  }

  // TODO set error in the modal

  return (
    <ModalContent
      content={data.content}
      disabled={editLoading}    
      categories={data.categories}
      onCancel={onCancel}
      onSubmit={content => {
        edit({ variables: { id: content.id, content }})

        //edit(content);
      }}

    />
  );

}


const ContentAutocomplete = ({ value, onChange = () => {}, style, useSlug = false }) => {

  const [search, setSearch] = useState(null);
  const [items, setItems] = useState(null);
  const [content, setContent] = useState(null);    

  const { loading, error, data, refetch, client } = useQuery(SEARCH, {
    fetchPolicy: 'network-only',
    variables: { 
      title: search != null ? search : undefined,
      id: search == null && !useSlug ? value || 0 : undefined,
      slug: search == null && useSlug ? value || 'invalid-slug' : undefined
    },
    onCompleted: data => setItems(data.contents)
  }); 

  let current;
  if (search != null) {
    current = search;
  } else {
    if (!_.isEmpty(items)) {
      current = useSlug ? items[0].slug : items[0].title;
    } else {
      current = '';
    }
  }

  return (
    <div className="ui-content-autocomplete">
      <InputGroup inside style={style}>
        <AutoComplete 
          value={current}
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
      {content != null && (
        <ContentPreview 
          contentId={content}
          onCancel={() => setContent(null)}
          onSubmit={async () => {
            setContent(null);            
            const { data } = await client.query({
              query: SEARCH,
              fetchPolicy: 'network-only',
              variables: { 
                title: search != null ? search : undefined,
                id: search == null && !useSlug ? value || 0 : undefined,
                slug: search == null && useSlug ? value || 'invalid-slug' : undefined
              }
            });
            setItems(data.contents);
          }}
        />
      )}
    </div>
  );
};
ContentAutocomplete.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  useSlug: PropTypes.bool,
  onChange: PropTypes.func,
  style: PropTypes.object
};


export default ContentAutocomplete;