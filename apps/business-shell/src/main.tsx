// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppWrapper } from './AppWrapper';

window.global ||= window;

const root = createRoot(document.getElementById('root')!);
root.render(<AppWrapper />);
