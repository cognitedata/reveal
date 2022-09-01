import styled from 'styled-components/macro';

import { Flex, FlexColumn, sizes } from 'styles/layout';

import {
  BodyColumn,
  ColumnHeaderWrapper as DefaultColumnHeaderWrapper,
} from '../../common/Events/elements';
import { ColumnOptionsSelectorContainer } from '../components/ColumnOptionsSelector/elements';

export const WellboreStickChartWrapper = styled(FlexColumn)`
  height: 100%;
  width: fit-content;
  background: var(--cogs-bg-accent);
  border-radius: ${sizes.small};
  margin-right: ${sizes.normal} !important;

  ${BodyColumn} {
    border-radius: ${sizes.small};
    margin: ${sizes.extraSmall};
  }
`;

export const ContentWrapper = styled(Flex)`
  height: 100%;
  padding: ${sizes.extraSmall};
  justify-content: center;
  overflow: hidden;
`;

export const ColumnHeaderWrapper = styled(DefaultColumnHeaderWrapper)`
  ${ColumnOptionsSelectorContainer} {
    width: 90px;
  }
`;

export const NptEventAvatar = styled.div`
  height: 12px;
  width: 12px;
  border-radius: ${sizes.extraSmall};
  border: 2px var(--cogs-greyscale-grey2) solid;
  background-color: ${(props: { color: string }) => props.color};
  margin-top: -9px;
  margin-right: ${sizes.extraSmall};
  align-self: center;
  cursor: pointer;
`;

export const WellboreStickChartEmptyStateWrapper = styled(ContentWrapper)`
  margin-top: 25%;
`;
