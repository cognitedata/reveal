import { screen, render } from '@testing-library/react';
import * as mocks from '@cognite/react-i18n/dist/mocks';

import { Version } from './index';

jest.mock('react-i18next', () => mocks);

jest.mock('./fetch', () => {
  return {
    fetchGet: (_origin: string, options: any) => {
      options.handleRawResponse({
        headers: {
          get: () => '1.1.2',
        },
      });
    },
  };
});

describe('index', () => {
  describe('Version', () => {
    it('does the right thing', () => {
      render(<Version />);

      expect(screen.getByText('Version 1.1.2')).toBeInTheDocument();
    });
  });
});
