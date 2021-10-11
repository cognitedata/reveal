import { screen } from '@testing-library/react';

import { mockLogDataMD, mockLogDataTVD } from '__test-utils/fixtures/log';
import { testRenderer } from '__test-utils/renderer';

import Log, { Props } from '../Log';

describe('Logs', () => {
  const defaultTestInit = async (props: Props) =>
    testRenderer(Log, undefined, props);

  it(`should display wrapper item`, async () => {
    await defaultTestInit({
      logData: { ...mockLogDataTVD, ...mockLogDataMD },
      displayTracks: [],
      eventData: [],
      selectedMarkers: [],
      logFrmTopsData: {},
    });

    const singleItem = screen.queryByTestId('log-controller-wrapper');
    expect(singleItem).toBeInTheDocument();
  });
});
