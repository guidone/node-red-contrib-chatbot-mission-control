import React, { Fragment } from 'react';
import { Icon } from 'rsuite';

import SmallTag from '../../../src/components/small-tag';
import EditDevice from '../../../src/components/edit-device';

const getName = (path) => {
  console.log('path', path)
  let isDigital = path.indexOf('digital') !== -1;
  let isInput = true; // TODO complete

  const matchIndex = path.match(/\[([0-9])*\]/);
  const index = matchIndex != null ? parseInt(matchIndex[1], 10) : '';

  return (isInput ? '#IN' : '#OU')
    + (isDigital ? 'D' : 'A')
    + '.'
    + (index < 10 ? '0' + index : index )
    + (isInput ? ' Input' : ' Output')
    + (isDigital ? ' Digital' : ' Analogico');
}


const DeviceChannel = ({ channel, path, value, device, digits = 1 }) => {

  // TODO take device from context

  console.log('value', value)
  console.log('channel', channel)

  const channelName = getName(path);

  return (
    <div className="channel-remoto">
      <div className="meta">
        <div className="top">
          <div className="info">
            <div className="name">{channel.name}</div>
            <div className="status">
              Status <Icon style={{ color: '#FF4C28' }} icon="circle" />
            </div>
          </div>
          <div className="current-value">
            {value != null && <span className="figure">{Number(value.val).toFixed(digits)}</span>}
            {value != null && channel != null && channel.unit != null && <span className="unit">{channel.unit}</span>}
          </div>

        </div>
        <div className="bottom">
          <SmallTag color="#69bb0b">{channelName}</SmallTag>
          {channel.type === '4-20 mA' && <SmallTag color="#69bb0b">4-20 mA</SmallTag>}
          {channel.alarm && <SmallTag color="#69bb0b"><Icon icon="bell"/></SmallTag>}
          {!channel.alarm && <SmallTag color="#69bb0b"><Icon icon="bell-slash"/></SmallTag>}
        </div>




      </div>

      <div className="graph">

        the graph
      </div>
      <div className="buttons">
        <EditDevice
          path={path}
          jsonSchema={device.jsonSchema}
          value={device}
          tooltip={`Edit ${channelName}`}
          title={channelName}
          placement="left"
          skipValidation={true}
        />

      </div>
    </div>
  )

};

export default DeviceChannel;