import React, { useState, useRef } from 'react';
import { Table, Icon, ButtonGroup, Button } from 'rsuite';
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import GoogleMapReact from 'google-map-react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
  useParams
} from 'react-router-dom';

const { Column, HeaderCell, Cell } = Table;

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import SmartDate from '../../../src/components/smart-date';
import CustomTable from '../../../src/components/table';
import { Input } from '../../../src/components/table-filters';
import confirm from '../../../src/components/confirm';

// import '../styles/admins.scss';

import PinPoint from '../views/pin-point';

const DEVICE = gql`
query ($id: Int!) {
  device(id: $id) {
    id,
    name,
    payload,
    createdAt,
    updatedAt,
    status,
    lat,
    lon
  }
}
`;





const Device = () => {
  const { id } = useParams();



  const { data: { device } = {}, loading, error } = useQuery(DEVICE, {
    fetchPolicy: 'network-only',
    variables: { id: parseInt(id, 10) },
    onCompleted: (data) => {
      console.log('data', data);
    }
  });

  let breadcrumbs = [
    { title: 'Devices', url: '/devices' },
  ];
  if (!loading && device != null) {
    breadcrumbs = [...breadcrumbs, device.name];
  }


  return (
    <PageContainer className="page-users">
      <Breadcrumbs pages={breadcrumbs}/>


    </PageContainer>
  );
};

export default Device;
