import { getMockResponse } from 'utils/mockResponse';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import {
  DocumentationSection,
  TEST_ID_BTN_SAVE,
} from 'components/integration/DocumentationSection';
import { DOCUMENTATION_HEADING } from 'utils/constants';

describe('DocumentationSection', () => {
  const mock = getMockResponse()[0];
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mock,
      '/'
    );
  });
  test('Interacts with documentation', async () => {
    sdkv3.post.mockResolvedValue({ data: { items: [mock] } });
    sdkv3.get.mockResolvedValueOnce({ data: mock });
    render(<DocumentationSection />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(DOCUMENTATION_HEADING);
    });

    const documentation = screen.getByText(mock.metadata?.documentation);
    expect(documentation).toBeInTheDocument();
    fireEvent.click(documentation);
    const newDocumentation = 'new documentation';

    fireEvent.change(documentation, {
      target: { value: newDocumentation },
    });
    sdkv3.get.mockResolvedValueOnce({
      data: {
        ...mock,
        metadata: { ...mock.metadata, documentation: newDocumentation },
      },
    });
    fireEvent.click(screen.getByTestId(`${TEST_ID_BTN_SAVE}documentation`));
    await waitFor(() => {
      screen.getByText(newDocumentation);
    });
    fireEvent.click(screen.getByText(newDocumentation));
    expect(screen.getByRole('textbox').textContent).toEqual(newDocumentation);
  });
});
