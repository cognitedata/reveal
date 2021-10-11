// @todo(PP-2044)
/* eslint-disable testing-library/await-async-utils */
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
    const { waitForNextUpdate } = renderHook(() =>
      useClickAwayListener(ref, clickOutside)
    );
    waitForNextUpdate();
    return {
      ...testRenderer(() => <div data-testid="test-component" ref={ref} />),
    };
  };

  const clickOutside = jest.fn();

  beforeEach(() => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useRef<HTMLHeadingElement | null>(null)
    );
    waitForNextUpdate();
    renderTestComponent(result.current, clickOutside);
  });

  it('should not call `clickOutside` when click inside the component', async () => {
    fireEvent.click(screen.getByTestId('test-component'));
    expect(clickOutside).not.toHaveBeenCalled();
  });

  it('should call `clickOutside` once when click outside of the component', async () => {
    fireEvent.click(document);
    waitFor(() => expect(clickOutside).toHaveBeenCalledTimes(1));
  });
});
