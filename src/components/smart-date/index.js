import React from 'react';
import moment from 'moment';

import './smart-date.scss';

export default ({ date }) => {
  const now = moment();
  const m = moment(date);

  let day;
  if (m.year() === now.year() && m.month() === now.month() && m.date() === now.date()) {
    day = null;
  } else if (m.year() === now.year() && m.month() === now.month() && now.diff(m, 'days') < 7) {
    day = m.format('dddd');
  } else if (m.year() === now.year()) {
    day = m.format('DD MMM');
  } else {
    day = m.format('DD/MM/YYYY');
  }

  return (
    <span className="ui-smart-date">
      <span className="time">{m.format('HH:mm:ss')}</span>
      {day != null && <span className="day">, {day}</span>}
    </span>
  );
}