import { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';

import withoutParams from '../../../src/helpers/without-params';

const DELETE_ADMIN = gql`
mutation($id: Int!) {
  deleteAdmin(id: $id) {
    id
  }
}`;

const EDIT_ADMIN = gql`
mutation($id: Int!, $user: NewAdmin!) {
  editAdmin(id:$id, admin: $admin) {
    id,
    username,
    first_name,
    last_name,
    username,
    language,
    payload,
    permissions,
    createdAt,
    email
  }
}`;

export default ({ onCompleted = () => {} } = {}) => {
  const [
    deleteAdmin,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(DELETE_ADMIN, { onCompleted });
  const [
    editAdmin,
    { loading: editLoading, error: editError },
  ] = useMutation(EDIT_ADMIN, { onCompleted });

  return {
    saving: mutationLoading || mutationLoading,
    error: mutationError || editError,
    deleteAdmin,
    editAdmin: withoutParams(editAdmin, ['id', 'updatedAt', 'createdAt', '__typename'])
  };
};