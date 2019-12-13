import Sockette from 'sockette';

const ws = new Sockette('ws://localhost:1942', {
  timeout: 5e3,
  maxAttempts: 10,
  onopen: e => console.log('Connected!', e),
  onmessage: e => console.log('Received:', e),
  onreconnect: e => console.log('Reconnecting...', e),
  onmaximum: e => console.log('Stop Attempting!', e),
  onclose: e => console.log('Closed!', e),
  onerror: e => console.log('Error:', e)
});


export default Component => {

  return props => (
    <Component {...props} >{props.children}</Component>
  );
};