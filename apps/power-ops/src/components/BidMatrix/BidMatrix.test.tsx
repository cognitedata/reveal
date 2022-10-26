import { screen } from '@testing-library/react';
import dayjs from 'dayjs';
import React from 'react';
import { testRenderer, getTestCogniteClient } from 'utils/test';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

import { BidMatrix } from './BidMatrix';
import {
  mockBidMatrixTableData,
  mockMainScenarioTableData,
} from './BidMatrix.mock';

jest.mock('@cognite/react-container', () => {
  return {
    ...jest.requireActual('@cognite/react-container'),
    useAuthenticatedAuthContext: jest.fn(),
  };
});

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({
    setQueryData: jest.fn(),
  }),
  useQuery: () => ({ isLoading: false, error: {}, data: [] }),
}));

const MockBidMatrix: React.FC = () => {
  return (
    <BidMatrix
      bidDate={dayjs()}
      bidMatrixTitle="Total"
      bidMatrixExternalId="total_bidmatrix_externalid"
      bidMatrixTableData={mockBidMatrixTableData}
      mainScenarioTableData={mockMainScenarioTableData}
      onBidMatrixCopyClick={jest.fn()}
    />
  );
};

describe('Bid Matrix tests', () => {
  beforeEach(() => {
    (useAuthenticatedAuthContext as jest.Mock).mockImplementation(() => ({
      client: getTestCogniteClient(),
    }));
  });

  it('Should render the bid matrix on load', () => {
    testRenderer(<MockBidMatrix />);

    expect(
      screen.getByText('Bid matrix:', { exact: false })
    ).toBeInTheDocument();
  });
});
