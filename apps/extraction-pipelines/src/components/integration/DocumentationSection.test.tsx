import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
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
  const mockDataSet = mockDataSetResponse()[0];
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
    sdkv3.datasets.retrieve.mockResolvedValue([mockDataSet]);
    render(<DocumentationSection />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(DOCUMENTATION_HEADING);
    });

    const documentation = screen.getByText(mock.documentation);
    expect(documentation).toBeInTheDocument();
    fireEvent.click(documentation);
    await waitFor(() => {
      screen.getByLabelText(DOCUMENTATION_HEADING);
    });
    const newDocumentation = 'new documentation';

    fireEvent.change(screen.getByLabelText(DOCUMENTATION_HEADING), {
      target: { value: newDocumentation },
    });
    sdkv3.get.mockResolvedValueOnce({
      data: {
        ...mock,
        documentation: newDocumentation,
      },
    });
    fireEvent.click(screen.getByTestId(`${TEST_ID_BTN_SAVE}documentation`));
    await waitFor(() => {
      screen.getByText(newDocumentation);
    });
    fireEvent.click(screen.getByText(newDocumentation));
    expect(screen.getByRole('textbox').textContent).toEqual(newDocumentation);
  });

  test('Render when no documentation is set', async () => {
    const noDescriptionMock = {
      name: mock.name,
      id: mock.id,
      dataSetId: mock.dataSetId,
    };
    sdkv3.post.mockResolvedValue({ data: { items: [mock] } });
    sdkv3.get.mockResolvedValueOnce({ data: noDescriptionMock });
    sdkv3.datasets.retrieve.mockResolvedValue([mockDataSet]);
    render(<DocumentationSection />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(DOCUMENTATION_HEADING);
    });
    expect(screen.getByText(/add documentation/i)).toBeInTheDocument();
  });
});
