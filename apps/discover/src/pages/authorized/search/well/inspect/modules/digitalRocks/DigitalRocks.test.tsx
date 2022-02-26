import { screen } from '@testing-library/react';

import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { LOADING_TEXT } from 'components/loading/constants';
import { useSelectedWellBoresDigitalRocks } from 'modules/wellSearch/selectors/asset/digitalRocks';

import DigitalRocks from './DigitalRocks';

jest.mock('modules/wellSearch/selectors/asset/digitalRocks', () => ({
  useSelectedWellBoresDigitalRocks: jest.fn(),
}));

describe('DigitalRocks', () => {
  const testInit = async () =>
    testRenderer(
      DigitalRocks,
      getMockedStore({ ...mockedWellStateWithSelectedWells })
    );

  it('should display loader on digital rocks loading', async () => {
    (useSelectedWellBoresDigitalRocks as jest.Mock).mockImplementation(() => ({
      isLoading: true,
      digitalRocks: [],
    }));

    await testInit();

    expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
  });
});
