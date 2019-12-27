import _ from 'lodash';

export default (data, { percentile = false }) => {
  const sorted = data.events.sort((a, b) => a.count < b.count ? 1 : -1);
  return {
    nodes:  
      [
        { id: 'Start' },
        ...sorted.map(event => ({ id: _.capitalize(event.name) }))
      ],
    links: sorted.map((event, idx) => {
      let value = event.count;
      if (percentile) {
        if (idx !== 0) {
          value = Math.round((event.count / sorted[0].count) * 100);
        } else {
          value = 100;
        }
        
      }
      return {
        source: idx > 0 ? _.capitalize(sorted[idx - 1].name) : 'Start',
        target: _.capitalize(event.name),
        value
      };
    })
  };
}