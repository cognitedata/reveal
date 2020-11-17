import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import StatusMarker from './StatusMarker';
import { Status } from '../../../model/Status';

describe('StatusMarker', () => {
  const cases = [
    { desc: 'Render and display ok', status: Status.OK },
    { desc: 'Render and display fail', status: Status.FAIL },
    { desc: 'Render and display not activated', status: Status.NOT_ACTIVATED },
    { desc: 'Render and display seen', status: Status.SEEN },
  ];
  cases.forEach(({ desc, status }) => {
    test(`${desc}`, () => {
      render(<StatusMarker status={status} />);
      const marker = screen.getByLabelText(`Status ${status}`);
      expect(marker).toBeInTheDocument();
    });
  });
});
