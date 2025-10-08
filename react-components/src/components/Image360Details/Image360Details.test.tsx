import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren, ReactElement } from 'react';
import { type ClassicDataSourceType, type Image360 } from '@cognite/reveal';
import { Image360Details } from './Image360Details';
import {
  defaultImage360DetailsContextDependencies,
  Image360DetailsContext
} from './Image360Details.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { createImage360DmMock } from '#test-utils/fixtures/image360';

describe(Image360Details.name, () => {
  const defaultDependencies = getMocksByDefaultDependencies(
    defaultImage360DetailsContextDependencies
  );
  const mockImage360 = createImage360DmMock();
  const entity = {
    id: 'test-id',
    label: 'test-label',
    getRevisions: () => []
  } as unknown as Image360<ClassicDataSourceType>;

  const mockImage360HistoricalDetails = vi.fn((_props) => (
    <div data-testid="historical-details">Details</div>
  ));

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <Image360DetailsContext.Provider value={defaultDependencies}>
      {children}
    </Image360DetailsContext.Provider>
  );

  beforeEach(() => {
    defaultDependencies.Image360HistoricalDetails = mockImage360HistoricalDetails;
    defaultDependencies.useImage360Collections.mockReturnValue([mockImage360 as any]);
    defaultDependencies.useReveal.mockReturnValue({
      exit360Image: vi.fn()
    } as any);
  });

  it('should render nothing with empty data', () => {
    render(<Image360Details />, { wrapper });

    const details = screen.queryByTestId('historical-details');
    expect(details).toBeNull();
  });

  it('should render Image360HistoricalDetails with enteredEntity', () => {
    render(<Image360Details />, { wrapper });

    expect(mockImage360.on).toHaveBeenCalledTimes(2);

    const [onEnteredEventType, enteredCallback] = vi.mocked(mockImage360.on).mock.calls[0] as [
      string,
      (entity: Image360<ClassicDataSourceType>) => void
    ];
    const [onExitedEventType] = vi.mocked(mockImage360.on).mock.calls[1];

    expect(onEnteredEventType).toBe('image360Entered');
    expect(onExitedEventType).toBe('image360Exited');

    act(() => {
      enteredCallback(entity);
    });

    const element = screen.queryByTestId('historical-details');
    expect(element).toBeDefined();
    expect(mockImage360HistoricalDetails).toHaveBeenCalledTimes(1);
  });

  it('should clear enteredEntity data on exit', () => {
    render(<Image360Details />, { wrapper });

    expect(mockImage360.on).toHaveBeenCalledTimes(2);

    const [onEnteredEventType, enteredCallback] = vi.mocked(mockImage360.on).mock.calls[0] as [
      string,
      (entity: Image360<ClassicDataSourceType>) => void
    ];
    const [onExitedEventType, exitedCallback1] = vi.mocked(mockImage360.on).mock.calls[1];

    expect(onEnteredEventType).toBe('image360Entered');
    expect(onExitedEventType).toBe('image360Exited');

    act(() => {
      enteredCallback(entity);
    });
    expect(mockImage360HistoricalDetails).toHaveBeenCalledTimes(1);

    act(() => {
      exitedCallback1();
    });
    const element = screen.queryByTestId('historical-details');
    expect(element).toBeNull();
  });

  it('should show exit button by default and trigger exit360Image on click', async () => {
    const mockExit360Image = vi.fn();
    defaultDependencies.useReveal.mockReturnValue({
      exit360Image: mockExit360Image
    } as any);

    render(<Image360Details />, { wrapper });

    expect(mockImage360.on).toHaveBeenCalledTimes(2);

    const enteredCallback = vi.mocked(mockImage360.on).mock.calls[0][1] as (
      entity: Image360<ClassicDataSourceType>
    ) => void;
    act(() => {
      enteredCallback(entity);
    });

    const exitButton = screen.getByTestId('image-360-details-exit-button');
    expect(exitButton).toBeDefined();

    act(() => {
      exitButton.click();
    });

    await waitFor(() => {
      expect(mockExit360Image).toHaveBeenCalledTimes(1);
    });
  });

  it('should not show exit button when enableExitButton is false', () => {
    render(<Image360Details enableExitButton={false} />, { wrapper });

    expect(mockImage360.on).toHaveBeenCalledTimes(2);

    const enteredCallback = vi.mocked(mockImage360.on).mock.calls[0][1] as (
      entity: Image360<ClassicDataSourceType>
    ) => void;
    act(() => {
      enteredCallback(entity);
    });

    const exitButton = screen.queryByTestId('image-360-details-exit-button');
    expect(exitButton).toBeNull();
  });
});
