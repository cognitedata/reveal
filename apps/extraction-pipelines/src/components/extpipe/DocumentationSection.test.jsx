import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
import render, {
  renderWithReQueryCacheSelectedExtpipeContext,
} from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
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
  test('Interacts with documentation', async () => {
    sdkv3.post.mockResolvedValue({ data: { items: [mock] } });
    sdkv3.get.mockResolvedValueOnce({ data: mock });
    sdkv3.datasets.retrieve.mockResolvedValue([mockDataSet]);
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
    const newDocumentation = 'new documentation';

    fireEvent.change(screen.getByTestId('documentation-textarea'), {
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
    fireEvent.click(editBtn);
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
    render(<DocumentationSection canEdit />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(DetailFieldNames.DOCUMENTATION);
    });
    expect(screen.getByText(/add documentation/i)).toBeInTheDocument();
  });
});
