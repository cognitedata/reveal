import { screen, waitFor } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Header } from './Header';

describe('Inspect header', () => {
  const page = (viewProps?: any) => testRenderer(Header, undefined, viewProps);

  const defaultTestInit = async () => {
    return {
      ...page(),
    };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should render a header with a back button.`, async () => {
    await defaultTestInit();
    const row = await waitFor(() => screen.findByText('Back to search'));
    expect(row).toBeTruthy();
  });
});
