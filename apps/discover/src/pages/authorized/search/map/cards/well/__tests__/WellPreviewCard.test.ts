import { screen, cleanup, fireEvent } from '@testing-library/react';

import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { clearSelectedWell } from 'modules/map/actions';
import {
  getWellByWellId,
  getWellboresByWellIds,
} from 'modules/wellSearch/service';

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

const store = getMockedStore(mockedWellStateWithSelectedWells);

describe('Well Preview Card', () => {
  afterAll(() => {
    (getWellByWellId as jest.Mock).mockClear();
    (getWellboresByWellIds as jest.Mock).mockClear();
  });

  afterEach(cleanup);

  const getWellPreviewCard = (props: any) => {
    return testRenderer(WellPreviewCard, store, props);
  };

  it('should render Well Preview Card with well when wellId is provided', async () => {
    const selectedWell = mockedWellStateWithSelectedWells.wellSearch.wells[0];

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
