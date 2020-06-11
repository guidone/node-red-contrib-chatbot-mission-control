import React, { useState, useRef } from 'react';
import { Table, Icon, ButtonGroup, Button } from 'rsuite';
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
import useSettings from '../../../src/hooks/settings';

// import '../styles/admins.scss';

import PinPoint from '../views/pin-point';

const DEVICES = gql`
query ($limit: Int, $offset: Int, $order: String) {
  counters {
    rows: devices {
      count
    }
  }
  rows: devices(limit: $limit, offset: $offset, order: $order) {
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


const DevicesMap = ({ devices, height = 250 }) => {
  const { googleMapsKey } = useSettings();
  let center = { lat: 45.504372, lng: 9.077766 };

  const handleMapLoaded = (google, toolbar, groupedPoints, channels) => {

  };

  let markers = devices.map(device => (
    <PinPoint
      key={device.id}
      lat={device.lat}
      lng={device.lon}
      point={{}}
      popover={device.name}
      showPopover={true}
    />
  ));

  return (
    <div className="ui-devices-map" style={{ height: `${height}px` }}>
      <GoogleMapReact
        bootstrapURLKeys={{ libraries: 'drawing', key: googleMapsKey }}
        onGoogleApiLoaded={google =>
          handleMapLoaded(
            google,
            //toolbar,
            //groupedPoints,
            //groupedChannels
          )
        }
        defaultCenter={center}
        defaultZoom={11}
      >
        {markers}
      </GoogleMapReact>
    </div>
  );



}


const Devices = () => {
  const [devices, setDevices] = useState();
  const table = useRef();
  //const [ admin, setAdmin ] = useState(null);
  //const { saving, error,  deleteAdmin, editAdmin, createAdmin } = useAdmins();


  return (
    <PageContainer className="page-devices">
      <Breadcrumbs pages={['Devices']}/>
      {devices != null && (
        <DevicesMap devices={devices} />
      )}
      <CustomTable
        ref={table}
        query={DEVICES}
        height={600}
        initialSortField="createdAt"
        initialSortDirection="desc"
        onData={devices => {
          console.log('devices', devices)
          setDevices(devices);
        }}
        /*toolbar={(
          <div>
            <Button appearance="primary" onClick={() => {
              setAdmin({});
            }}>Create admin</Button>
          </div>
        )}*/
        //filtersSchema={[
        //]}
        autoHeight
      >
        <Column width={60} align="center">
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column width={140} resizable>
          <HeaderCell>Last Update</HeaderCell>
          <Cell>
            {({ createdAt }) => <SmartDate date={createdAt} />}
          </Cell>
        </Column>

        <Column flexGrow={1}>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name">
            {({ name, id }) => <Link to={`/devices/${id}`}>{name}</Link>}
          </Cell>
        </Column>

        <Column width={200} resizable>
          <HeaderCell>Status</HeaderCell>
          <Cell dataKey="first_name"/>
        </Column>

        <Column width={80}>
          <HeaderCell>Action</HeaderCell>
          <Cell>
            {admin => (
              <ButtonGroup>
                <Button
                  size="xs"
                  onClick={async () => {

                  }}
                >
                  <Icon icon="trash" />
                </Button>
                <Button
                  size="xs"
                  onClick={() => {

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

export default Devices;
