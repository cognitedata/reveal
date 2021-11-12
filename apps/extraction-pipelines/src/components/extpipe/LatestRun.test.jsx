import { LATEST_RUN_HINT, LatestRun } from 'components/extpipe/LatestRun';
import { render } from 'utils/test';
import { getMockResponse } from 'utils/mockResponse';
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { RunStatusUI } from 'model/Status';

describe('LatestRun', () => {
  test('Interacting with component', () => {
    const mockExtpipe = getMockResponse()[2];
    render(<LatestRun extpipe={mockExtpipe} />);
    expect(screen.getByText(LATEST_RUN_HINT)).toBeInTheDocument();
    expect(screen.getByText(RunStatusUI.FAILURE)).toBeInTheDocument();
    const latestMessagePart = mockExtpipe.lastMessage?.substring(0, 50);
    // click to see full message
    fireEvent.click(screen.getByText(new RegExp(latestMessagePart, 'i')));
    expect(screen.getByText(mockExtpipe.lastMessage)).toBeInTheDocument();
  });
});
