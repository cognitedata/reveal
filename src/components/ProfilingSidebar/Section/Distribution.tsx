import React from 'react';
import { zip } from 'lodash';

import { Graph } from 'containers/Profiling/Distribution';
import { Section } from '.';

export const Distribution = ({
  histogram,
}: {
  histogram?: [number[], number[]];
}): JSX.Element => {
  const distribution = zip(...(histogram ?? [])).map(([length, count]) => ({
    value: length?.toString() as string,
    count: count as number,
  }));

  if (histogram)
    return (
      <Section title="Distribution">
        <Graph
          distribution={distribution}
          height={200}
          width={270}
          fill="#2972E1"
        />
      </Section>
    );
  return <span />;
};
