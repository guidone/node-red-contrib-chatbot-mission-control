import React, { useState } from 'react';
import { Placeholder, SelectPicker, Toggle, Button } from 'rsuite';
import { useQuery } from 'react-apollo';

import Panel from '../../../src/components/grid-panel';

import FunnelGraph from './funnel-graph';
import '../funnel.scss';
import { GROUPED_EVENTS } from '../queries';

const { Paragraph } = Placeholder;

const FunnelWidget = () => {
  const [flow, setFlow] = useState(undefined);
  const [version, setVersion] = useState(1);
  const [percentile, setPercentile] = useState(false);
  const { loading, error, data, refetch } = useQuery(GROUPED_EVENTS, { 
    fetchPolicy: 'network-only',
    onCompleted: ({ counters: { events: { events }}}) => {
      setFlow(events.length !== 0 ? events[0].flow : null)    
    }
  });
  console.log('data', data)
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
            &nbsp;
            <Button 
              onClick ={async () => {
                const flows = await refetch();
                setVersion(version + 1);
              }}>
              Reload
            </Button>
            &nbsp;
            <Button>Clear</Button>
            <div className="perc-toggle">
              <b>%</b>&nbsp;
              <Toggle size="sm" checked={percentile} onChange={() => setPercentile(!percentile)}/>
            </div>
          </div>
          {flow != null && (
            <FunnelGraph 
              key={`${flow}_${version}`} 
              flow={flow} 
              percentile={percentile}/>
          )}
        </div>
      )}
    </Panel>
  );
};

export default FunnelWidget;