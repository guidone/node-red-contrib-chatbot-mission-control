import React from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from 'react-apollo';

import { ModalContent } from '../../content';
import withoutParams from '../../../../src/helpers/without-params';

import { CATEGORIES, CREATE_CONTENT } from '../queries';

const CreateContent = ({ content, onCancel = () => {}, onSubmit = () => {} }) => {
  const [createContent, { loading: createLoading, error: editError }] = useMutation(CREATE_CONTENT, { 
    onCompleted: onSubmit
  });
  const { loading, error, data } = useQuery(CATEGORIES, {
    fetchPolicy: 'network-only'
  });

  const create = withoutParams(createContent, ['id', 'updatedAt', 'createdAt', '__typename', 'cid', 'category'])

  return (
    <ModalContent
      content={content}
      categories={data != null ? data.categories : []}
      error={editError || error}
      disabled={createLoading || loading}          
      onCancel={onCancel}
      onSubmit={content => create({ variables: { content }})}
    />
  );
};

export default CreateContent;