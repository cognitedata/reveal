import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import StatusMarker from 'components/integrations/cols/StatusMarker';
import { RunStatusUI } from 'model/Status';

describe('StatusMarker', () => {
  const cases = [
    { desc: 'Render and display ok', status: RunStatusUI.SUCCESS },
    { desc: 'Render and display fail', status: RunStatusUI.FAILURE },
    {
      desc: 'Render and display not activated',
      status: RunStatusUI.NOT_ACTIVATED,
    },
    { desc: 'Render and display seen', status: RunStatusUI.SEEN },
  ];
  cases.forEach(({ desc, status }) => {
    test(`${desc}`, () => {
      render(<StatusMarker status={status} />);
      const marker = screen.getByLabelText(`Status ${status}`);
      expect(marker).toBeInTheDocument();
    });
  });
});
