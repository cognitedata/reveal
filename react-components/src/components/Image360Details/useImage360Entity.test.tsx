import React, { type ReactElement } from 'react';
import { act, renderHook } from '@testing-library/react';
import { type Image360 } from '@cognite/reveal';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { createImage360DmMock } from '#test-utils/fixtures/image360';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { createMockImage360Entity } from '#test-utils/fixtures/image360Station';
import {
  defaultUseImage360EntityContextDependencies,
  UseImage360EntityContext
} from './useImage360Entity.context';
import { useImage360Entity } from './useImage360Entity';

describe(useImage360Entity.name, () => {
  const defaultDependencies = getMocksByDefaultDependencies(
    defaultUseImage360EntityContextDependencies
  );

  const entity = createMockImage360Entity();
  const mockEntity = { ...entity };
  const mockImage360 = createImage360DmMock();

  const wrapper = ({ children }: { children?: React.ReactNode }): ReactElement => (
    <UseImage360EntityContext.Provider value={defaultDependencies}>
      {children}
    </UseImage360EntityContext.Provider>
  );

  beforeEach(() => {
    defaultDependencies.useImage360Collections.mockReturnValue([mockImage360]);
  });

  it('should return undefined when no image360 is entered', () => {
    const { result } = renderHook(() => useImage360Entity(viewerMock), { wrapper });

    expect(result.current).toBeUndefined();
  });

  it('should return entity after image360Entered event and undefined after image360Exited', () => {
    const { result } = renderHook(() => useImage360Entity(viewerMock), { wrapper });

    expect(mockImage360.on).toHaveBeenCalledTimes(2);

    const [onEnteredEventType, enteredCallback] = vi.mocked(mockImage360.on).mock.calls[0] as [
      string,
      (entity: Image360) => void
    ];
    const [onExitedEventType, exitedCallback] = vi.mocked(mockImage360.on).mock.calls[1];

    expect(onEnteredEventType).toBe('image360Entered');
    expect(onExitedEventType).toBe('image360Exited');

    // Simulate entering the image360
    act(() => {
      enteredCallback(mockEntity);
    });
    expect(result.current).toBe(mockEntity);

    // Simulate exiting the image360
    act(() => {
      exitedCallback();
    });
    expect(result.current).toBeUndefined();
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useImage360Entity(viewerMock), { wrapper });

    expect(mockImage360.on).toHaveBeenCalledTimes(2);

    const onEnteredEventType = vi.mocked(mockImage360.on).mock.calls[0][0];
    const onExitedEventType = vi.mocked(mockImage360.on).mock.calls[1][0];

    expect(onEnteredEventType).toBe('image360Entered');
    expect(onExitedEventType).toBe('image360Exited');

    unmount();

    expect(mockImage360.off).toHaveBeenCalledTimes(2);
  });
});
