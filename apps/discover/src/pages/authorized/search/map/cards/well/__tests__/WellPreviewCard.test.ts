import { screen, cleanup, fireEvent } from '@testing-library/react';

import {
  getMockWell,
  mockedWellStateWithSelectedWells,
} from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { clearSelectedWell } from 'modules/map/actions';
import { useWellById } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';

import { WellPreviewCard } from '../WellPreviewCard';

jest.mock('modules/wellSearch/service', () => ({
  getWellByWellId: jest.fn(() =>
    Promise.resolve(() => mockedWellStateWithSelectedWells.wellSearch.wells[0])
  ),
  getWellboresByWellIds: jest.fn(() =>
    Promise.resolve(
      () => mockedWellStateWithSelectedWells.wellSearch.wells[0].wellbores
    )
  ),
}));

jest.mock('modules/wellSearch/hooks/useWellsCacheQuerySelectors', () => ({
  useWellboresOfWellById: jest.fn(),
  useWellById: jest.fn(),
}));

const store = getMockedStore(mockedWellStateWithSelectedWells);

describe('Well Preview Card', () => {
  afterEach(cleanup);

  const getWellPreviewCard = (props: any) => {
    return testRenderer(WellPreviewCard, store, props);
  };

  it('should render Well Preview Card with well when wellId is provided', async () => {
    const selectedWell = getMockWell();

    (useWellById as jest.Mock).mockImplementation(() => selectedWell);

    getWellPreviewCard({
      wellId: selectedWell.id,
    });

    await Promise.resolve();

    expect(screen.getByTestId('title').innerHTML).toBe(selectedWell.name);
    expect(screen.getByText('23.52')).toBeInTheDocument();
  });

  it('should not render Well Preview Card with well when wellId is not provided', async () => {
    getWellPreviewCard({});

    await Promise.resolve();

    expect(screen.getByTestId('title')).toBeEmptyDOMElement();
  });

  it('should close preview on clicking close icon', async () => {
    getWellPreviewCard({});

    fireEvent.click(screen.getByTestId('preview-card-close-button'));

    expect(store.getActions()).toEqual(
      expect.arrayContaining([clearSelectedWell()])
    );
  });

  it('should dispatch a resize event', async () => {
    const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
    getWellPreviewCard({});

    // 2 as once after rendering suspsense fallback & another after rendering actual preview
    expect(mockDispatchEvent).toHaveBeenCalledTimes(2);
    mockDispatchEvent.mockClear();
  });
});
