import React from 'react';
import { plug } from '../../../lib/code-plug';


class SendPage extends React.Component {

  render() {

    return (
      <div>
        page send
      </div>
    );


  }


}

plug('sidebar', null, { id: 'send-message', label: 'Send Message', url: '/mc/send-message' })
plug('pages', SendPage, { url: '/mc/send-message' });


