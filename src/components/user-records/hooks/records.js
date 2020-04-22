import { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';

import withoutParams from '../../../../src/helpers/without-params';

const DELETE_RECORD = gql`
mutation($id: Int!) {
  deleteRecord(id: $id) {
    id
  }
}`;

const EDIT_CONTENT = gql`
mutation($id: Int!, $content: NewContent!) {
  editContent(id: $id, content: $content) {
    id,
    slug,
    title,
    body,
    language,
    payload,
    fields {
      id,
      name,
      value,
      type
    }
  }
}
`;




export default ({ onCompleted = () => {}, namespace } = {}) => {
  const [
    deleteRecord,
    { loading: deleteLoading, error: deleteError },
  ] = useMutation(DELETE_RECORD, { onCompleted });
  /*const [
    createContent,
    { loading: createLoading, error: createError },
  ] = useMutation(CREATE_CONTENT, { onCompleted });
  const [
    editContent,
    { loading: editLoading, error: editError },
  ] = useMutation(EDIT_CONTENT, { onCompleted });*/

  return {
    //bootstrapping,
    //loading: loading,
    saving: deleteLoading /*|| createLoading || editLoading*/,
    error: deleteError /*|| editError || createError*/,
    //data,
    deleteRecord,
    //createContent: withoutParams(createContent, ['id', 'updatedAt', 'createdAt', '__typename', 'cid', 'category']),
    //editContent: withoutParams(editContent, ['id', 'updatedAt', 'createdAt', '__typename', 'cid', 'category']),
    //refetch
  };
};