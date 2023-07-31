import { MutableRefObject, useRef } from 'react';

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { testRenderer } from '__test-utils/renderer';
import { useClickAwayListener } from 'hooks/useClickAwayListener';

describe('useClickAwayListener hook', () => {
  const renderTestComponent = async (
    ref: MutableRefObject<HTMLHeadingElement | null>,
    clickOutside: (ev: Event) => void
  ) => {
    renderHook(() => useClickAwayListener(ref, clickOutside));

    return {
      ...testRenderer(() => <div data-testid="test-component" ref={ref} />),
    };
  };

  const clickOutside = jest.fn();

  const setupTest = () => {
    const { result } = renderHook(() =>
      useRef<HTMLHeadingElement | null>(null)
    );

    clickOutside.mockClear();
    renderTestComponent(result.current, clickOutside);
  };

  it('should not call `clickOutside` when click inside the component', async () => {
    setupTest();
    fireEvent.click(screen.getByTestId('test-component'));
    expect(clickOutside).not.toHaveBeenCalled();
  });

  it('should call `clickOutside` once when click outside of the component', async () => {
    setupTest();
    fireEvent.mouseDown(document);
    await waitFor(() => expect(clickOutside).toHaveBeenCalledTimes(1));
  });
});
