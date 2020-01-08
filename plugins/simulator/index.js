import React, { useState } from 'react';
import { Placeholder, SelectPicker, Toggle } from 'rsuite';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { ResponsiveSankey } from '@nivo/sankey'

import { plug } from '../../lib/code-plug';
import Panel from '../../src/components/grid-panel';
import withSocket from '../../src/wrappers/with-socket';
import useSocket from '../../src/hooks/socket';
import Transport from '../../src/components/transport';

import { Message, Messages, Content, Metadata, ChatWindow, MessageComposer, MessageDate, MessageUser, UserStatus, 
  MessageText,
  MessageButtons,
  MessagePhoto 
} from '../../src/components/chat';

import './simulator.scss';

const Transports = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'slack', label: 'Slack' },


]

const TransportValue = (value, item) => {

  console.log('valie', value)
  return (
    <Transport transport={value}/>
  )

} 

const MenuItem = (label, item) => {

  return (
    <Transport transport={item.value}/>
  );

} 


const PanelMenu = ({ transport, onChange }) => {
  console.log('transport in panelmenu', transport)
  return (
    <div className="simulator-transport-menu">
      <SelectPicker 
        renderValue={TransportValue}
        renderMenuItem={MenuItem}
        searchable={false}
        size="sm"
        cleanable={false}
        appearance="subtle"
        value={transport}
        onChange={onChange}
        data={Transports}
      />
      
      
    </div>
  );

};

const handleMessages = (state, action) => {
  switch(action.type) {
    case 'socket.message':
      console.log('arrivato messaggio', action);
      return state;
    default:
      return state; 
  }
};



const SimulatorWidget = ({ sendMessage }) => {
  const { state, dispatch } = useSocket(handleMessages, { messages: [] });
  const [transport, setTransport] = useState('telegram');
  
  console.log('-->', state)

  return (
    <Panel 
      title="Chat Simulator" 
      className="chat-simulator"
      menu={<PanelMenu 
        transport={transport} 
        onChange={value => {
          console.log('seletto', value)
          setTransport(value)
        }}
      />}
    >
      
      <ChatWindow>
        <Messages>

        <Message inbound>
            <Metadata>
              <MessageDate>10:10 AM, Today</MessageDate> &nbsp; &nbsp;
              <MessageUser>Olia</MessageUser> <UserStatus />
              
            </Metadata>
            <Content>
              Hi Vincent, how are you? How is the project coming along?
            </Content>
          </Message>
          <Message inbound>
            <Metadata>
              <MessageDate>10:10 AM, Today</MessageDate> &nbsp; &nbsp;
              <MessageUser>Olia</MessageUser> <UserStatus />
              
            </Metadata>
            <Content>
              Hi Vincent, how are you? How is the project coming along?
            </Content>
          </Message>
          <Message inbound>
            <Metadata>
              <MessageDate>10:10 AM, Today</MessageDate> &nbsp; &nbsp;
              <MessageUser>Olia</MessageUser> <UserStatus />
              
            </Metadata>
            <Content>
              Hi Vincent, how are you? How is the project coming along?
            </Content>
          </Message>
          <Message inbound>
            <Metadata>
              <MessageDate>10:10 AM, Today</MessageDate> &nbsp; &nbsp;
              <MessageUser>Olia</MessageUser> <UserStatus />
              
            </Metadata>
            <Content>
              Hi Vincent, how are you? How is the project coming along?
            </Content>
          </Message>
          <Message inbound>
            <Metadata>
              <MessageDate>10:10 AM, Today</MessageDate> &nbsp; &nbsp;
              <MessageUser>Olia</MessageUser> <UserStatus />
              
            </Metadata>
            <Content>
              Hi Vincent, how are you? How is the project coming along?
            </Content>
          </Message>
          <Message inbound>
            <Metadata>
              <MessageDate>10:10 AM, Today</MessageDate> &nbsp; &nbsp;
              <MessageUser>Olia</MessageUser> <UserStatus />
              
            </Metadata>
            <Content>
              Hi Vincent, how are you? How is the project coming along?
            </Content>
          </Message>
          <Message inbound>
            <Metadata>
              <MessageDate>10:10 AM, Today</MessageDate> &nbsp; &nbsp;
              <MessageUser>Olia</MessageUser> <UserStatus />
              
            </Metadata>
            <Content>
              Hi Vincent, how are you? How is the project coming along?
            </Content>
          </Message>


        </Messages>
        <MessageComposer
          onSend={message => {
            console.log('send', message);
            sendMessage('simulator', { 
              transport, 
              payload: {
                content: message, 
                type: 'message'
              }
            });
          }}
        /> 
        </ChatWindow>
    </Panel>
  );
};

plug('widgets', withSocket(SimulatorWidget), { x: 0, y: 0, w: 2, h: 8, isResizable: true, id: 'simulator-widget' });