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
mutation($id: Int!, $admin: NewAdmin!) {
  editAdmin(id:$id, admin: $admin) {
    id,
    username,
    first_name,
    last_name,
    username,
    payload,
    permissions,
    createdAt,
    email
  }
}`;

const CREATE_ADMIN = gql`
mutation($admin: NewAdmin!) {
  createAdmin(admin: $admin) {
    id,
    username,
    first_name,
    last_name,
    username,
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
    createAdmin,
    { loading: mutationCreateLoading, error: mutationCreateError },
  ] = useMutation(CREATE_ADMIN, { onCompleted });
  const [
    editAdmin,
    { loading: editLoading, error: editError },
  ] = useMutation(EDIT_ADMIN, { onCompleted });

  return {
    saving: mutationLoading || mutationLoading || mutationCreateLoading,
    error: mutationError || editError || mutationCreateError,
    deleteAdmin,
    createAdmin,
    editAdmin: withoutParams(editAdmin, ['id', 'updatedAt', 'createdAt', '__typename'])
  };
};