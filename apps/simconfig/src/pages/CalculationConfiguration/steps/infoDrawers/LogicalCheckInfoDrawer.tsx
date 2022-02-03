import { A } from '@cognite/cogs.js';

import { InfoDrawer } from 'components/shared/InfoDrawer';

export function LogicalCheckInfoDrawer() {
  return (
    <InfoDrawer title="Logical check">
      <dl>
        <dt>Time Series</dt>
        <dd>Defines the time series to be used for a logical check.</dd>
        <dt>Sampling method</dt>
        <dd>
          Defines the sampling method to retrieve data for the logical check in
          the validation window using the granularity defined in the data
          sampling configuration.{' '}
        </dd>
        <dd>
          More information about sampling methods (also known as aggregation
          functions) can be found at{' '}
          <A
            href="https://docs.cognite.com/dev/concepts/aggregation/"
            target="_blank"
            isExternal
          >
            https://docs.cognite.com/dev/concepts/aggregation/
          </A>
        </dd>
        <dt>Check</dt>
        <dd>Defines the logical check to be performed.</dd>
        <dt>Value</dt>
        <dd>
          Defines the threshold value that is compared to the time series data
          points.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
