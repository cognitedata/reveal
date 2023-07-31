import { screen, waitFor } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import PreviewSelector from '../PreviewSelector';

describe('Module Preview Selector', () => {
  const page = (viewProps?: any) =>
    testRenderer(
      PreviewSelector({ enableModeSelector: true }),
      undefined,
      viewProps
    );

  const defaultTestInit = async () => {
    return { ...page({ selected: [] }) };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should set defailt preview mode`, async () => {
    await defaultTestInit();
    const row = await waitFor(() => screen.findByTestId('preview-mode-button'));
    expect(row).toHaveTextContent('2D');
  });
});
