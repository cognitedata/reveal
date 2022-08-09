import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
import render, {
  renderWithReQueryCacheSelectedExtpipeContext,
} from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { useSDK } from '@cognite/sdk-provider';
import { ExtpipeHeading } from 'components/extpipe/ExtpipeHeading';
// eslint-disable-next-line
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import { EXTRACTION_PIPELINES_ACL } from 'model/AclAction';

describe('ExtpipeHeading', () => {
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
    useCapabilities.mockReturnValue({
      isLoading: false,
      data: [{ acl: EXTRACTION_PIPELINES_ACL, actions: ['READ', 'WRITE'] }],
    });
  });
  test.skip('Render with minimal info', async () => {
    const mockExtpipe = {
      name: mock.name,
      id: mock.id,
      dataSetId: mock.dataSetId,
    };
    useSDK.mockReturnValue({
      post: jest.fn().mockResolvedValue({ data: { items: [mockExtpipe] } }),
      get: jest.fn().mockResolvedValueOnce({ data: mockExtpipe }),
      datasets: {
        retrieve: jest.fn().mockResolvedValue([mockDataSet]),
      },
    });
    render(<ExtpipeHeading />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(mockExtpipe.name);
    });
    expect(screen.getByText(mockExtpipe.name)).toBeInTheDocument();
  });
});
