import { A } from '@cognite/cogs.js';

import { InfoDrawer } from 'components/shared/InfoDrawer';

export function SteadyStateDetectionInfoDrawer() {
  return (
    <InfoDrawer title="Steady state detection">
      <dl>
        <dt>Timeseries</dt>
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
        <dt>Min Section Size</dt>
        <dd>
          Defines the minimum allowable point wise segment size that will be
          considered in the steady state detection algorithm.
        </dd>
        <dt>Var Threshold</dt>
        <dd>
          Defines the variance threshold. If the normalized variance calculated
          for a given segment is greater than the threshold, the segment will be
          labeled as transient.
        </dd>
        <dt>Slope Treshold</dt>
        <dd>
          Specifies the slope threshold. If the slope of a line fitted to the
          data of a given segment is greater than 10 to the power of the
          threshold value, the segment will be labeled as transient.shold. If
          the normalized variance calculated for a given segment is greater than
          the threshold, the segment will be labeled as transient.
        </dd>
      </dl>
    </InfoDrawer>
  );
}
