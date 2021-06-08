import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { Example } from './LoopDetector.stories';

describe('LoopDetector', () => {
  it('does nothing without a loop', () => {
    const onLoopDetected = jest.fn();
    render(<Example onLoopDetected={onLoopDetected} />);
    expect(onLoopDetected).not.toBeCalled();
  });

  it('detects a loop', () => {
    const onLoopDetected = jest.fn();
    render(
      <Example
        onLoopDetected={onLoopDetected}
        loopThresholdCount={3}
        storageKey="unit-test"
      />
    );

    expect(onLoopDetected).not.toBeCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Remount' }));
    expect(JSON.parse(sessionStorage.getItem('unit-test') || '')).toHaveLength(
      2
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(sessionStorage.getItem('unit-test')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Remount' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remount' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remount' }));
    expect(onLoopDetected).toBeCalled();
  });
});
