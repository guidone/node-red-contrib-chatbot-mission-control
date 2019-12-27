import React, { useState } from 'react';
import { Placeholder, SelectPicker, Toggle } from 'rsuite';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { ResponsiveSankey } from '@nivo/sankey'

import { plug } from '../../lib/code-plug';
import Panel from '../../src/components/grid-panel';

import toFunnel from './helpers/to-funnel';
import './funnel.scss';

const { Paragraph } = Placeholder;

const EVENTS = gql`
query($flow: String) {
  events(flow: $flow) {
    id,
    count,
    name, 
    flow
  }
}
`;

const GROUPED_EVENTS = gql`
query {
  counters {
    events {
      events {
        flow,
        count
      }
    }
  }
}
`;


const FunnelGraph = ({ flow, percentile = false }) => {
  const { loading, error, data } = useQuery(EVENTS, {
    fetchPolicy: 'network-only',
    variables: { flow }
  });

  return (
    <div style={{ width: '100%', height: '300px' }}>
      {loading && <Paragraph rows={3} />}
      {!loading && !error && (
        <ResponsiveSankey
          data={toFunnel(data, { percentile })}
          margin={{ top: 20, right: 120, bottom: 20, left: 50 }}
          align="justify"
          colors={{ scheme: 'category10' }}
          nodeOpacity={1}
          nodeThickness={18}
          nodeInnerPadding={3}
          nodeSpacing={24}
          nodeBorderWidth={0}
          nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
          linkOpacity={0.5}
          linkHoverOthersOpacity={0.1}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="vertical"
          labelPadding={16}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
          animate={true}
          motionStiffness={140}
          motionDamping={13}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              translateX: 130,
              itemWidth: 100,
              itemHeight: 14,
              itemDirection: 'right-to-left',
              itemsSpacing: 2,
              itemTextColor: '#999',
              symbolSize: 14,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: '#000'
                  }
                }
              ]
            }
          ]}
        />
      )}
    </div>
  );

}




const FunnelWidget = () => {
  const [flow, setFlow] = useState(undefined);
  const [percentile, setPercentile] = useState(false);
  const { loading, error, data, refetch } = useQuery(GROUPED_EVENTS, { 
    onCompleted: ({ counters: { events: { events }}}) => setFlow(events.length !== 0 ? events[0].flow : null)
  });

  return (
    <Panel 
      title="Funnel" 
      className="widget-funnel"
    >
      {loading && <Paragraph rows={3}/>}
      {error && (
        <div>error</div>
      )}
      {!error && !loading && (
        <div>
          <div>
            <b>Flow</b>&nbsp;
            <SelectPicker 
              value={flow}
              data={data.counters.events.events.map(event => ({ value: event.flow, label: event.flow }))} 
              onChange={event => {
                setFlow(event)
              }} 
              cleanable={false}
              searchable={false}          
              placeholder="Select flow" 
              size="md"
            />
            <div className="perc-toggle">
              <b>%</b>&nbsp;
              <Toggle size="sm" checked={percentile} onChange={() => setPercentile(!percentile)}/>
            </div>
          </div>
          {flow != null && <FunnelGraph flow={flow} percentile={percentile}/>}
        </div>
      )}
    </Panel>
  );
};

plug('widgets', FunnelWidget, { x: 0, y: 0, w: 2, h: 8, isResizable: true, id: 'funnel-widget' });