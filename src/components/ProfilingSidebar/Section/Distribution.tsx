import React from 'react';
import { zip } from 'lodash';

import { Graph } from 'containers/Profiling/Distribution';
import { Section } from '.';

type Props = {
  histogram?: [number[], number[]];
  max?: number;
  title?: string;
};
export const Distribution = ({ histogram, max, title }: Props): JSX.Element => {
  const distribution = zip(...(histogram ?? [])).map(([length, count]) => ({
    value: length?.toString() as string,
    count: count as number,
  }));

  if (histogram)
    return (
      <Section title={title ?? 'Distribution'}>
        <Graph
          distribution={distribution}
          isBottomAxisDisplayed
          isGridDisplayed
          isTooltipDisplayed
          rangeEnd={max}
          height={200}
          width={270}
          fill="#2972E1"
        />
      </Section>
    );
  return <span />;
};
