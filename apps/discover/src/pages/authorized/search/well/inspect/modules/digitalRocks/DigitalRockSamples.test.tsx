import 'modules/map/__mocks/mockMapbox';
import { screen } from '@testing-library/react';

import { createdAndLastUpdatedTime } from '__test-utils/fixtures/log';
import { testRenderer } from '__test-utils/renderer';
import { LOADING_TEXT } from 'components/emptyState/constants';
import { useDigitalRocksSamples } from 'modules/wellSearch/selectors/asset/digitalRocks';

import { getMockedStore } from '../../../../../../../__test-utils/store.utils';

import { DigitalRockSamplesTable, Props } from './DigitalRockSamples';

const defaultProps: Props = {
  digitalRock: {
    parentId: 7591554093249934,
    id: 1123123,
    name: 'asset 2',
    rootId: 1123123,
    ...createdAndLastUpdatedTime,
  },
};

jest.mock('modules/wellSearch/selectors/asset/digitalRocks.ts', () => ({
  useDigitalRocksSamples: jest.fn(),
}));

describe('DigitalRockSamples', () => {
  const store = getMockedStore();

  const testInit = async (props: Props) =>
    testRenderer(DigitalRockSamplesTable, store, props);

  it('should display loader on digital rock samples loading', async () => {
    (useDigitalRocksSamples as jest.Mock).mockImplementation(() => ({
      digitalRockSamples: [],
      isLoading: true,
    }));

    await testInit(defaultProps);
    expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
  });

  it('should display grain analysis button', async () => {
    (useDigitalRocksSamples as jest.Mock).mockImplementation(() => ({
      digitalRockSamples: [
        {
          asset: {
            id: 1123123,
          },
          digitalRockSamples: [
            {
              asset: {
                id: 122342,
              },
            },
          ],
        },
      ],
      isLoading: false,
    }));

    await testInit({
      digitalRock: {
        parentId: 7591554093249934,
        id: 1123123,
        name: 'asset 2',
        rootId: 1123123,
        ...createdAndLastUpdatedTime,
      },
    });

    expect(screen.getByText('Open grain analysis')).toBeInTheDocument();
  });
});
