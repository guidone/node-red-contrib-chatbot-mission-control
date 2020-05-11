import React, { useState, useRef, Fragment, useCallback } from 'react';
import { Table, Icon, ButtonGroup, Button, FlexboxGrid } from 'rsuite';
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

import { useCodePlug, Views } from '../../../lib/code-plug';

import PageContainer from '../../../src/components/page-container';
import Breadcrumbs from '../../../src/components/breadcrumbs';
import SmallTag from '../../../src/components/small-tag';
import CustomTable from '../../../src/components/table';
import { Input } from '../../../src/components/table-filters';
import confirm from '../../../src/components/confirm';
import useSettings from '../../../src/hooks/settings';

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
    lon,
    jsonSchema,
    version,
    lastUpdate
  }
}
`;


const EDIT_DEVICE = gql`
mutation($id: Int!, $device: NewDevice!) {
  editDevice(id: $id, device: $device) {
    id,
    name,
    payload,
    createdAt,
    updatedAt,
    status,
    lat,
    lon,
    jsonSchema,
    version,
    lastUpdate
  }
}
`;


import { Modal, Tooltip, Whisper } from 'rsuite';
import SchemaForm, { validate } from '../../../src/components/schema-form';
import ShowError from '../../../src/components/show-error';
import modalCanClose from '../../../src/hooks/modal-can-close';


const EditSchema = ({
  jsonSchema,
  value,
  path,
  children,
  tooltip,
  title
}) => {
  const [state, setState] = useState({ editing: false, value: null });
  const onCancel = useCallback(() => setState({ editing: false, value: null }));
  const { handleCancel, setIsChanged } = modalCanClose({ onCancel });

  const [
    editDevice,
    { loading, error },
  ] = useMutation(EDIT_DEVICE, {
    onCompleted: () => setState({ editing: false, value: null })
  });

  if (state.editing) {
    return (
      <Modal backdrop show onHide={handleCancel} size="sm" overflow={false} className="modal-edit-schema">
      <Modal.Header>
        <Modal.Title>{!_.isEmpty(title) ? title : 'Edit'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error != null && <ShowError error={error}/>}
        <SchemaForm
          value={state.value}
          jsonSchema={jsonSchema}
          path={path}
          errors={state.errors}
          disabled={loading}
          hideTitles={true}
          onChange={value => {
            setState({ ...state, value, errors: undefined });
            setIsChanged(true);
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={handleCancel}
          appearance="subtle"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          appearance="primary"
          disabled={loading}
          appearance="primary"
          onClick={() => {
            const errors = validate(state.value, jsonSchema, path);
            console.log('errors', errors);
            if (!_.isEmpty(errors)) {
              setState({ ...state, errors });
            } else {
              editDevice({ variables: { id: value.id, device: { payload: state.value } } });
            }
          }}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
    );
  } else {
    const link = (
      <a
        style={{ display: 'inline-block' }}
        className="ui-edit-schema-button"
        href="#"
        onClick={e => {
          e.preventDefault();
          setState({ editing: true, value: value.payload });
        }}
      >
        <Icon icon="edit2"/>
      </a>
    );

    if (!_.isEmpty(tooltip)) {
      return (
        <Whisper trigger="hover" placement="top" speaker={<Tooltip>{tooltip}</Tooltip>}>
          <span>{link}</span>
        </Whisper>
      );
    }
    return link;
  }
}



const DeviceHeader = ({ device }) => {
  const { items } = useCodePlug('device-header');


  return (
    <div className="device-header">
      <div className="header-group">
        <FlexboxGrid>
          <FlexboxGrid.Item colspan={6} className="header-label">
            ID
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={18}  className="header-value">
            {device.id} <SmallTag capitalize={false} color="#2685DB">v{device.version}</SmallTag>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </div>
      {items.map(({ view: View, props }) => {

        return (
          <div className="header-group">
            <FlexboxGrid key={props.id}>
              <FlexboxGrid.Item colspan={6} className="header-label">
                {props.label}
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={18}  className="header-value">
                <View {...props} device={device}/>
                {props.edit != null && (
                  <Fragment>
                    &nbsp;
                    <EditSchema
                      path={props.edit}
                      jsonSchema={device.jsonSchema}
                      value={device}
                      tooltip={props.tooltip}
                      title={props.tooltip}
                    />
                  </Fragment>
                )}
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </div>
        );
      })}
    </div>
  );

}



const Device = () => {
  const { id } = useParams();
  const { googleMapsKey } = useSettings();

  console.log('googleMapsKey', googleMapsKey)

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

  console.log('DEVICE', device)

  return (
    <PageContainer className="page-device">
      <Breadcrumbs pages={breadcrumbs}/>
      {!loading && (
        <Fragment>
          <div className="device-name">

            <h3 className="device-id">{device.id}</h3>
            &nbsp;
            <h3>/</h3>
            &nbsp;&nbsp;
            <h3>{device.name}</h3>
          </div>
          <FlexboxGrid>
            <FlexboxGrid.Item colspan={14}>

              <DeviceHeader device={device}/>


            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={10}>




              <div style={{ height: '200px '}}>
                <GoogleMapReact
                  bootstrapURLKeys={{ libraries: 'drawing', key: googleMapsKey }}
                  defaultCenter={{ lat: device.lat, lng: device.lon }}
                  defaultZoom={11}
                >
                  <PinPoint
                    key={device.id}
                    lat={device.lat}
                    lng={device.lon}
                    point={{}}
                    popover={device.name}
                    showPopover={false}
                  />
                </GoogleMapReact>
              </div>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Fragment>
      )}


    </PageContainer>
  );
};

export default Device;
