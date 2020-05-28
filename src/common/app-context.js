import React from 'react';

console.log('Inizializzo app context')

const AppContext = React.createContext({});

window.AppContext = AppContext;

export default AppContext;