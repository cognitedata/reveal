import { screen } from '@testing-library/react';

import { DepthIndexTypeEnum } from '@cognite/sdk-wells';

import { getMockLogData } from '__test-utils/fixtures/wellLogs';
import { testRenderer } from '__test-utils/renderer';

import Log, { Props } from '../Log';

describe('Logs', () => {
  const defaultTestInit = async (props: Props) =>
    testRenderer(Log, undefined, props);

  it(`should render log viewer`, async () => {
    await defaultTestInit({
      logData: getMockLogData(),
      eventsData: [],
      depthIndexColumnExternalId: 'MD',
      depthIndexType: DepthIndexTypeEnum.MeasuredDepth,
    });

    expect(screen.getByTestId('log-viewer-wrapper')).toBeInTheDocument();
  });
});
