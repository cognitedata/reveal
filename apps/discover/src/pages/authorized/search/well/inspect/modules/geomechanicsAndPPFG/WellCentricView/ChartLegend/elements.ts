import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Flex } from '@cognite/cogs.js';

import { FlexColumn, sizes } from 'styles/layout';

export const ChartLegendWrapper = styled(FlexColumn)`
  margin-left: ${sizes.normal};
  margin-bottom: ${sizes.normal};
  align-items: center;
`;

export const LegendsHolder = styled(Flex)`
  gap: ${sizes.normal};
  flex-wrap: wrap;
  justify-content: center;
  overflow: hidden;
  height: ${(props: { expand: boolean; height: number }) =>
    props.expand ? 'fit-content' : `${props.height}px`};
`;

export const CurveColorCodeWrapper = styled.div`
  margin-top: -1px;
  margin-right: 5px;
`;

export const CurveName = styled.span`
  font-weight: 500;
  font-size: var(--cogs-detail-font-size);
  line-height: var(--cogs-detail-line-height);
  letter-spacing: var(--cogs-micro-letter-spacing);
  color: var(--cogs-greyscale-grey7);
`;

export const ShowAllButtonWrapper = styled.div`
  width: fit-content;
  margin-top: ${sizes.normal};
`;

export const LegendCustomData = styled.span`
  font-size: 10px;
  line-height: 14px;
  letter-spacing: -0.004em;
  color: var(--cogs-greyscale-grey6);
  z-index: ${layers.TABLE_HEADER};
`;
