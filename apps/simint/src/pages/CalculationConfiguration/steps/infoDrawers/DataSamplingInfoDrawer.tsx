import { Link } from '@cognite/cogs.js';

import { InfoDrawer } from '../../../../components/shared/InfoDrawer';

export function DataSamplingInfoDrawer() {
  return (
    <InfoDrawer title="Data sampling">
      <dl>
        <dt>Validation window</dt>
        <dd>
          Defines the time range that the algorithm should look for valid
          process conditions. This range cannot be larger than the schedule
          frequency.
        </dd>
        <dt>Sampling window</dt>
        <dd>
          Defines the time range that the algorithm should use to sample the
          input values. This range cannot be larger than validation window.
        </dd>
        <dt>Granularity</dt>
        <dd>
          Defines the minimum frequency that should be used to sample data for
          validation.
        </dd>
        <dd>
          More information about granularity can be found at{' '}
          <Link
            href="https://docs.cognite.com/dev/concepts/aggregation/"
            target="_blank"
          >
            https://docs.cognite.com/dev/concepts/aggregation/
          </Link>
        </dd>
        <dt>Validation offset</dt>
        <dd>
          Defines a time offset for the the validation window. The validation
          window is then moved back in time according to this offset. With the
          default value (0 minutes), the end of validation window is set to the
          current time (now).
        </dd>
      </dl>
    </InfoDrawer>
  );
}