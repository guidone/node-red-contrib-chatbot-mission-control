import React from 'react';
import { Button, Container, Navbar, Dropdown, Nav, Footer, Content, Icon, Paragraph } from 'rsuite';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { Views, plug } from '../../lib/code-plug';
import withState from '../wrappers/with-state';
import withSocket from '../wrappers/with-socket';
import withDispatch from '../wrappers/with-dispatch';
import Panel from '../components/grid-panel';



const ResponsiveReactGridLayout = WidthProvider(Responsive);

import '../../node_modules/react-grid-layout/css/styles.css';
import '../../node_modules/react-resizable/css/styles.css';




const Widget1 = ({ sendMessage, stats }) => (
  <Panel>

    <h1>{stats}</h1>
    <Button onClick={() => sendMessage('send', 'bella secco!')}>Send Message</Button>
  </Panel>
);

const Widget2 = ({ count, user, dispatch }) => (
  <Panel>
    <Panel.Title>I am a title</Panel.Title>
    <span>count: {count} {user}</span>
    <Views region="items"/>
    <Button onClick={() => dispatch({ type: 'increment' })}>inc</Button>
    <Button onClick={() => dispatch({ type: 'decrement' })}>dec</Button>
    <Button onClick={() => dispatch({ type: 'user' })}>user</Button>
  </Panel>
);


plug('widgets', withState(withSocket(Widget1), ['stats']), { x: 0, y: 0, w: 2, h: 4, isResizable: false, id: 1 })
plug('widgets', withDispatch(withState(Widget2, ['count', 'user'])), { x: 0, y: 0, w: 1, h: 4, isResizable: false, id: 2 })

plug('reducers', (state, action) => {
  if (action.type === 'socket.message') {
    console.log('aggiungi stats');
    let counter = state.stats != null ? state.stats : 0;
    return { ...state, stats: counter + 1 };
  } else {
    return state;
  }
});

class HomePage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      layouts: {}
    };
  }

  onLayoutChange(layout, layouts) {
    //saveToLS("layouts", layouts);
    this.setState({ layouts });
  }


  render() {
    const { codePlug } = this.props;


    const items = codePlug.getItems('widgets');
    console.log('woidgets', items)

    const { count, dispatch, user } = this.props;

    return (
      <div className="mc-home">
        <ResponsiveReactGridLayout
          className="layout"
          cols={{ lg: 3, md: 3, sm: 2, xs: 2, xxs: 1 }}
          rowHeight={50}
          margin={[20, 20]}
          layouts={this.state.layouts}
          onLayoutChange={(layout, layouts) =>
            this.onLayoutChange(layout, layouts)
          }
        >
          {items.map(({ view: View, props }) => {
            const { x, y, h, w, isResizable } = props;
            return (
              <div key={props.id} data-grid={{x, y, w, h, isResizable }}>
                <View {...props}/>
              </div>
            );
          })}  
        </ResponsiveReactGridLayout>      
      </div>
    );
  }
}

export default withState(HomePage, ['count']);
