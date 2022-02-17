import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import Log, { Props } from '../Log';

describe('Logs', () => {
  const defaultTestInit = async (props: Props) =>
    testRenderer(Log, undefined, props);

  it(`should display wrapper item`, async () => {
    await defaultTestInit({
      logData: {
        TVD: {
          measurementType: 'true vertical depth',
          values: [[0, 1]],
          unit: 'm',
          domain: [0, 1000],
        },
        MD: {
          measurementType: 'measured depth',
          values: [0, 15096],
          unit: 'ft',
          domain: [0, 15096],
        },
      },
      displayTracks: [],
      eventsData: [],
      selectedMarkers: [],
      depthIndexColumnExternalId: 'MD',
      depthIndexType: 'measured depth',
    });

    const singleItem = screen.queryByTestId('log-controller-wrapper');
    expect(singleItem).toBeInTheDocument();
  });
});
