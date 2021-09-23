import { screen } from '@testing-library/react';
import { render } from 'utils/test';

import { Base } from './WorkSpaceTitle.stories';

describe('<WorkSpaceTitle />', () => {
  test('renders title correctly', async () => {
    render(<Base />);
    expect(await screen.findByText(/My Workspace/i)).toBeInTheDocument();
  });
});
