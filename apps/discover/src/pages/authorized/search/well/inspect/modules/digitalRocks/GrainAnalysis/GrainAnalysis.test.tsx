import 'modules/map/__mocks/mockMapbox';
import { screen } from '@testing-library/react';

import { Asset } from '@cognite/sdk';

import { createdAndLastUpdatedTime } from '__test-utils/fixtures/log';
import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { LOADING_TEXT } from 'components/emptyState/constants';

import { EMPTY_CHART_DATA_MESSAGE } from '../../../constants';

import GrainAnalysis, { Props } from './GrainAnalysis';

const digitalRockSamples: Asset[] = [
  {
    parentId: 1123123,
    metadata: {
      wellboreId: '75915540932499342',
    },
    id: 1,
    name: 'asset 1',
    rootId: 1123123,
    ...createdAndLastUpdatedTime,
  },
  {
    id: 122342,
    parentId: 1123123,
    metadata: {
      wellboreId: '75915540932499344',
    },
    name: 'asset 2',
    rootId: 1123123,
    ...createdAndLastUpdatedTime,
  },
];

describe('GrainAnalysis', () => {
  const testInit = async (props: Props) =>
    testRenderer(
      GrainAnalysis,
      getMockedStore({ ...mockedWellStateWithSelectedWells }),
      props
    );

  it('should display loader on grain analysis data loading', async () => {
    await testInit({
      digitalRockSample: digitalRockSamples[0],
    });
    expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
  });

  it('should display no content message on no data', async () => {
    await testInit({
      digitalRockSample: digitalRockSamples[1],
    });
    expect(screen.getByText(EMPTY_CHART_DATA_MESSAGE)).toBeInTheDocument();
  });
});
