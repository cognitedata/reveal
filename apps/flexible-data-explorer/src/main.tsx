import { createRoot } from 'react-dom/client';

import { AppWrapper } from './AppWrapper';

const root = createRoot(document.getElementById('root')!);
root.render(<AppWrapper />);
