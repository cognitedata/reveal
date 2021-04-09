import { LATEST_RUN_HINT, LatestRun } from 'components/integration/LatestRun';
import { render } from 'utils/test';
import { getMockResponse } from 'utils/mockResponse';
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { Status } from 'model/Status';

describe('LatestRun', () => {
  test('Interacting with component', () => {
    const mockIntegration = getMockResponse()[2];
    render(<LatestRun integration={mockIntegration} />);
    expect(screen.getByText(LATEST_RUN_HINT)).toBeInTheDocument();
    expect(screen.getByText(Status.FAIL)).toBeInTheDocument();
    const latestMessagePart = mockIntegration.lastMessage?.substring(0, 50);
    // click to see full message
    fireEvent.click(screen.getByText(new RegExp(latestMessagePart, 'i')));
    expect(screen.getByText(mockIntegration.lastMessage)).toBeInTheDocument();
  });
});
