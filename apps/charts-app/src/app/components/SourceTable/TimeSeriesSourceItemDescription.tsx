import React from 'react';
import { Tooltip } from '@cognite/cogs.js';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { SourceDescription } from './elements';

type Props = {
  id: number;
};

const TimeSeriesSourceItemDescription = ({ id }: Props) => {
  const { data } = useCdfItem<Timeseries>(
    'timeseries',
    { id },
    { enabled: true }
  );
  return (
    <SourceDescription>
      <Tooltip content={data?.description} maxWidth={350}>
        <>{data?.description}</>
      </Tooltip>
    </SourceDescription>
  );
};

export default TimeSeriesSourceItemDescription;
