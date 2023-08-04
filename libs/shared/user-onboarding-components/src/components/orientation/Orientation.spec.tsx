import React from 'react';
import '@testing-library/jest-dom';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Orientation } from './Orientation.stories';

describe('Orientation', () => {
  it('should trigger the continous flow', () => {
    render(<Orientation />);
    const triggerButton = screen.getByText('Click here to start the demo');

    userEvent.click(triggerButton);
    let orientationPopup = screen.getByTestId('orientation-0');

    let orientationPopupContent = within(orientationPopup);
    expect(orientationPopup).toBeInTheDocument();
    expect(orientationPopupContent.getByText('Step 1')).toBeInTheDocument();
    const nextButton = orientationPopupContent.getByText('Next');
    userEvent.click(nextButton);
    orientationPopup = screen.getByTestId('orientation-1');
    expect(orientationPopup).toBeInTheDocument();
    orientationPopupContent = within(orientationPopup);

    expect(orientationPopupContent.getByText('Step 2')).toBeInTheDocument();
    const backButton = orientationPopupContent.getByText('Back');
    userEvent.click(backButton);
    orientationPopup = screen.getByTestId('orientation-0');

    orientationPopupContent = within(orientationPopup);
    expect(orientationPopup).toBeInTheDocument();
    const closeButton =
      orientationPopupContent.getByLabelText('Close orientation');
    userEvent.click(closeButton);

    expect(screen.queryByTestId('orientation-0')).not.toBeInTheDocument();
  });
});
