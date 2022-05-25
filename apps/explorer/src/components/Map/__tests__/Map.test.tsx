import '__mocks/mockContainerAuth';
import '__mocks/mockCognite3DViewer';
import { screen } from '@testing-library/react';
import { render } from 'utils/test';

import { Base } from '../Map.stories';

describe('<Home />', () => {
  test('Select a room', async () => {
    render(<Base />);
    expect(await screen.findByText(/Select a room/i)).toBeInTheDocument();
  });
});
