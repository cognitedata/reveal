import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
import render, {
  renderWithReQueryCacheSelectedExtpipeContext,
} from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { useSDK } from '@cognite/sdk-provider';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import {
  DocumentationSection,
  TEST_ID_BTN_SAVE,
} from 'components/extpipe/DocumentationSection';
import { DetailFieldNames } from 'model/Extpipe';

describe('DocumentationSection', () => {
  const mock = getMockResponse()[0];
  const mockDataSet = mockDataSetResponse()[0];
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedExtpipeContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mock,
      '/'
    );
  });
  test.skip('Interacts with documentation', async () => {
    const newDocumentation = 'new documentation';
    useSDK.mockReturnValue({
      post: () => Promise.resolve({ data: { items: [mock] } }),
      get: jest
        .fn()
        .mockResolvedValueOnce({ data: mock })
        .mockResolvedValueOnce({
          data: {
            ...mock,
            documentation: newDocumentation,
          },
        }),
      datasets: {
        retrieve: () => Promise.resolve([mockDataSet]),
      },
    });
    render(<DocumentationSection canEdit />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(DetailFieldNames.DOCUMENTATION);
    });

    const documentation = screen.getByText(mock.documentation);
    expect(documentation).toBeInTheDocument();
    const editBtn = screen.getAllByText('Edit')[0];
    fireEvent.click(editBtn);
    await waitFor(() => {
      screen.getByTestId('documentation-textarea');
    });

    fireEvent.change(screen.getByTestId('documentation-textarea'), {
      target: { value: newDocumentation },
    });
    fireEvent.click(screen.getByTestId(`${TEST_ID_BTN_SAVE}documentation`));
    await waitFor(() => {
      screen.getByText(newDocumentation);
    });
    fireEvent.click(editBtn);
    expect(screen.getByRole('textbox').textContent).toEqual(newDocumentation);
  });

  test('Render when no documentation is set', async () => {
    const noDescriptionMock = {
      name: mock.name,
      id: mock.id,
      dataSetId: mock.dataSetId,
    };
    useSDK.mockReturnValue({
      post: jest.fn().mockResolvedValueOnce({ data: { items: [mock] } }),
      get: jest.fn().mockResolvedValueOnce({ data: noDescriptionMock }),
      datasets: {
        retrieve: jest.fn().mockResolvedValue([mockDataSet]),
      },
    });
    render(<DocumentationSection canEdit />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(DetailFieldNames.DOCUMENTATION);
    });
    expect(screen.getByText(/add documentation/i)).toBeInTheDocument();
  });
});
