import { ReactElement } from 'react';

import { render } from '@testing-library/react';

const customRender = (ui: ReactElement) => render(ui);

export { customRender as render };
