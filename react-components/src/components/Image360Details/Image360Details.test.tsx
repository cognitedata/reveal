import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren, ReactElement } from 'react';
import { Image360Details } from './Image360Details';
import {
  defaultImage360DetailsContextDependencies,
  Image360DetailsContext
} from './Image360Details.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { viewerExit360ImageMock, viewerMock } from '#test-utils/fixtures/viewer';
import { createMockImage360Entity } from '#test-utils/fixtures/image360Station';

describe(Image360Details.name, () => {
  const defaultDependencies = getMocksByDefaultDependencies(
    defaultImage360DetailsContextDependencies
  );
  const entity = createMockImage360Entity();

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
    defaultDependencies.useImage360Entity.mockReturnValue(entity);
    defaultDependencies.useReveal.mockReturnValue(viewerMock);
  });

  it('should render nothing with empty data', () => {
    defaultDependencies.useImage360Entity.mockReturnValue(undefined);
    render(<Image360Details />, { wrapper });

    const details = screen.queryByTestId('historical-details');
    expect(details).toBeNull();
  });

  it('should render Image360HistoricalDetails with enteredEntity', () => {
    render(<Image360Details />, { wrapper });

    const element = screen.queryByTestId('historical-details');

    expect(element).toBeDefined();
    expect(mockImage360HistoricalDetails).toHaveBeenCalledTimes(1);
  });

  it('should show exit button by default and trigger exit360Image on click', async () => {
    render(<Image360Details />, { wrapper });

    const exitButton = screen.getByRole('button');
    expect(exitButton).toBeDefined();

    await userEvent.click(exitButton);
    await waitFor(() => {
      expect(viewerExit360ImageMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should not show exit button when enableExitButton is false', () => {
    render(<Image360Details enableExitButton={false} />, { wrapper });

    const exitButton = screen.queryByRole('button');
    expect(exitButton).toBeNull();
  });
});
