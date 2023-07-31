import { screen } from '@testing-library/react';
import { mockSidecar } from '@cognite/sidecar';

import { render } from '../utils/test';
import { TenantSelector } from '../TenantSelector';

// eslint-disable-next-line react/display-name
jest.mock('../components/CardContainer', () => () => <div>test-container</div>);

const props = {
  sidecar: mockSidecar(),
};

describe('<TenantSelector />', () => {
  it('Should show container content', async () => {
    render(<TenantSelector {...props} />);

    await screen.findByText('test-container');
  });
});
