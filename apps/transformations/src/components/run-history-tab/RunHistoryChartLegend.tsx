import { Dispatch, SetStateAction } from 'react';

import styled from 'styled-components';

import { JobMetricsGroup } from '@transformations/hooks';
import {
  getRunHistoryChartCategoryColor,
  RunHistoryChartCategoryColor,
} from '@transformations/utils';

import { Colors, Detail, Overline } from '@cognite/cogs.js';

type RunHistoryChartLegendProps = {
  hiddenCategories: string[];
  setHiddenCategories: Dispatch<SetStateAction<string[]>>;
  groupedJobMetrics: JobMetricsGroup[];
};

const RunHistoryChartLegend = ({
  groupedJobMetrics,
  hiddenCategories,
  setHiddenCategories,
}: RunHistoryChartLegendProps): JSX.Element => {
  if (!groupedJobMetrics.length) {
    return <></>;
  }

  return (
    <StyledContainer>
      {groupedJobMetrics.map(({ action, metrics, name }, index) => {
        const count = Math.max(...metrics.map(({ count }) => count));
        const color = hiddenCategories.includes(name)
          ? 'grayscale'
          : getRunHistoryChartCategoryColor(index);
        return (
          <StyledItemContainer
            $color={color}
            key={name}
            onClick={() => {
              setHiddenCategories((prevState) => {
                if (prevState.includes(name)) {
                  return prevState.filter((c) => c !== name);
                }
                return prevState.concat(name);
              });
            }}
          >
            <StyledActionContainer $color={color}>
              <StyledOverline level={3}>{action}</StyledOverline>
            </StyledActionContainer>
            <StyledContent>
              <Detail strong>{name}</Detail>
              <StyledDetail $color={color} strong>
                ({new Intl.NumberFormat().format(count)})
              </StyledDetail>
            </StyledContent>
          </StyledItemContainer>
        );
      })}
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
`;

const StyledActionContainer = styled.div<{
  $color: RunHistoryChartCategoryColor;
}>`
  align-items: center;
  background-color: ${({ $color }) => Colors[`decorative--${$color}--600`]};
  border-radius: 4px 0 0 4px;
  display: flex;
  height: 24px;
  padding: 0 6px 0 8px;
`;

const StyledItemContainer = styled.div<{
  $color: RunHistoryChartCategoryColor;
}>`
  align-items: center;
  background: ${({ $color }) => Colors[`decorative--${$color}--100`]};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  height: 24px;

  :hover {
    background-color: ${({ $color }) => Colors[`decorative--${$color}--200`]};

    ${StyledActionContainer} {
      background-color: ${({ $color }) => Colors[`decorative--${$color}--700`]};
    }
  }
`;

const StyledOverline = styled(Overline)`
  color: ${Colors['text-icon--strong--inverted']};
`;

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  gap: 4px;
  padding: 0 8px;
`;

const StyledDetail = styled(Detail)<{ $color: RunHistoryChartCategoryColor }>`
  color: ${({ $color }) => Colors[`decorative--${$color}--700`]};
`;

export default RunHistoryChartLegend;
