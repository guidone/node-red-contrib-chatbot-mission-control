import React from 'react';
import { Button } from 'rsuite';
import { Link } from 'react-router-dom';

import { useModal } from '../../../src/components/modal';


const MyView = props => {

  return <div>apro dentro modal {props.value.value}</div>
};


const SendMessageButton = ({ user }) => {

  const { open, close, error, dump } = useModal({
    view: MyView,
    title: 'I am a modal'
  })

  return (

    <Button
      appearance="ghost"
      onClick={async () => {
        let res = await open({ value: 42 })
        console.log('res', res)
        res = await error('sbagliato tutto')
        console.log('res2', res)
        close();

        //res = await open({ value: 43 })

      }}
    >Contact User</Button>

  );
};

export default SendMessageButton;