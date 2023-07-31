import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import {
  Center,
  FlexColumn,
  FlexRow,
  FlexRowFullWidth,
  sizes,
} from 'styles/layout';

import {
  Container,
  ChartWrapper as CommonChartWrapper,
} from '../../../common/ChartV2/elements';
import {
  BodyColumnBody,
  BodyColumnHeaderWrapper,
  BodyColumnMainHeader,
} from '../../../common/Events/elements';

export const ChartWrapper = styled(BodyColumnBody)`
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${BodyColumnHeaderWrapper} {
    display: none;
  }
`;

export const ChartHeader = styled(BodyColumnMainHeader)`
  position: absolute;
  top: 0;
  margin: 12px;
  margin-bottom: -28px;
`;

export const ChartColumnContent = styled(FlexRowFullWidth)`
  height: 100%;
  font-weight: 500;
  font-size: 12px;
  color: var(--cogs-greyscale-grey6);
`;

export const ChartContentWrapper = styled.div`
  > ${Container} {
    border: none;

    > ${CommonChartWrapper} {
      background-color: transparent;
      margin-top: -14px;
      margin-left: -50px;
      margin-right: -10px;
    }
  }
  > * .ytitle {
    display: none;
  }
  & > div {
    width: ${(props: { width: number }) => `calc(${props.width}px)`};
  }
`;

export const ChartNativeScaleContainer = styled(FlexRow)`
  background: var(--cogs-bg-accent);
  z-index: ${layers.MAIN_LAYER};
  margin-bottom: ${sizes.small};
`;

export const ChartYTitle = styled(Center)`
  transform: rotate(-90deg);
  align-self: center;
  width: ${sizes.small};
  margin-left: ${sizes.small};
`;

export const NativeScaleWrapper = styled(FlexColumn)`
  width: fit-content;
  align-items: flex-end;
`;
