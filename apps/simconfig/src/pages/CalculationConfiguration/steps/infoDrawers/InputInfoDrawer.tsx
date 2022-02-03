import { A } from '@cognite/cogs.js';

import { InfoDrawer } from 'components/shared/InfoDrawer';

export function InputInfoDrawer() {
  return (
    <InfoDrawer title="Input configuration">
      <dl>
        <dt>Time Series</dt>
        <dd>Defines the time series to be used to sample data.</dd>
        <dt>Unit</dt>
        <dd>Defines the unit of measurement for the selected time series.</dd>
        <dt>Sampling Method</dt>
        <dd>
          Defines the sampling method to retrieve data within the sampling
          window.
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
      </dl>
    </InfoDrawer>
  );
}
