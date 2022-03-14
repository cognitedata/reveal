import styled from 'styled-components/macro';

import { Tooltip } from '@cognite/cogs.js';

import { TimeseriesChart } from 'components/charts/TimeseriesChart';
import HighlightMatch from 'components/shared/HighlightMatch';

import type { TimeseriesOption } from './types';

interface TimeseriesSelectorOptionProps {
  option: TimeseriesOption;
  inputValue?: string;
}

function TimeseriesSelectorOption({
  option,
  inputValue,
}: TimeseriesSelectorOptionProps) {
  if (!option.data || !option.value) {
    return null;
  }
  const { name = '', description = '', unit } = option.data.timeseries;
  return (
    <TimeseriesSelectorOptionContainer>
      <div className="metadata">
        <div className="name">
          <Tooltip content={name}>
            <HighlightMatch searchString={inputValue} text={name} />
          </Tooltip>
        </div>
        <div className="description">
          <HighlightMatch searchString={inputValue} text={description} />
        </div>
      </div>

      <TimeseriesChart
        data={option.data.datapoints}
        height={70}
        width={120}
        yAxisLabel={unit}
      />
    </TimeseriesSelectorOptionContainer>
  );
}

const TimeseriesSelectorOptionContainer = styled.div`
  display: flex;
  gap: 6px;
  width: 100%;
  overflow: auto;
  align-items: center;
  .metadata {
    flex: 1 1 0;
    display: flex;
    flex-flow: column nowrap;
    gap: 3px;
    overflow: hidden;
    white-space: normal;
    .name,
    .description {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .name {
      font-weight: bold;
      font-size: 14px;
      white-space: nowrap;
    }
    .description {
      line-clamp: 2;
    }
  }
  svg {
    display: block;
  }
`;

export default TimeseriesSelectorOption;
