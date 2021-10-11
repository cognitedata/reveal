import { screen } from '@testing-library/react';

import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { LOADING_TEXT } from 'components/emptyState/constants';

import DigitalRocks from './DigitalRocks';

describe('DigitalRocks', () => {
  const testInit = async () =>
    testRenderer(
      DigitalRocks,
      getMockedStore({ ...mockedWellStateWithSelectedWells })
    );

  it('should display loader on digital rocks loading', async () => {
    await testInit();

    expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
  });
});
