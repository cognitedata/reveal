import React from 'react';

import { getProject } from '@cognite/cdf-utilities';
import { fetchPublicCharts } from '@cognite/charts-lib';

type ChartsProps = any;

// TODO: Just included for testing purposes, will be deleted once we have an actual use of the SDK in place.
const Charts: React.FC<ChartsProps> = () => {
  (async () => {
    console.log(await fetchPublicCharts(getProject()));
  })();
  return <div>test page</div>;
};

export default Charts;
