import { fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useKeyPressListener } from '../useKeyPressListener';

describe('useKeyPressListener', () => {
  it('should fire callback on any key press', async () => {
    const onKeyDown = jest.fn();

    renderHook(() =>
      useKeyPressListener({
        onKeyDown,
      })
    );

    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
    expect(onKeyDown).toBeCalledTimes(1);
  });

  it('should fire callback on specific key press', async () => {
    const onKeyDown = jest.fn();

    renderHook(() =>
      useKeyPressListener({
        onKeyDown,
        key: 'Esc',
      })
    );

    fireEvent.keyDown(document, { key: 'Esc', code: 'Esc' });
    expect(onKeyDown).toBeCalledTimes(1);
  });

  it('should not fire callback on any key press when a key is specified', async () => {
    const onKeyDown = jest.fn();

    renderHook(() =>
      useKeyPressListener({
        onKeyDown,
        key: 'Esc',
      })
    );

    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
    expect(onKeyDown).toBeCalledTimes(0);
  });
});
