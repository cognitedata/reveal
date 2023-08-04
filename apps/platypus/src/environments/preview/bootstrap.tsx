import React from 'react';

import ReactDOMClient from 'react-dom/client';

import AppWrapper from '../../AppWrapper';

const container = document.getElementById('root');
const root = ReactDOMClient.createRoot(container!);
root.render(<AppWrapper />);
