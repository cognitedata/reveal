import styled from 'styled-components/macro';

import { Center, sizes } from 'styles/layout';

import { FORMATION_COLUMN_SCALE_CORRECTION } from './constants';

type FormationLayerProps = {
  top: number;
  height: number;
  color: string;
  overflow: boolean;
};

export const FormationLayerBlock = styled(Center)`
  position: absolute;
  width: 100%;
  align-items: center;
  ${(props: FormationLayerProps) => `
    top: ${props.top + FORMATION_COLUMN_SCALE_CORRECTION}px;
    height: ${props.height}px;
    background: ${props.color};
    cursor: ${props.overflow ? 'pointer' : 'default'};
  `}
`;

export const FormationColumnEmptyStateWrapper = styled(FormationLayerBlock)`
  height: 100%;
`;

export const FormationColumnBlockText = styled.div`
  transform: rotate(-90deg);
  position: relative;
  height: fit-content;
  font-size: 12px;
  font-weight: 500;
  line-height: ${sizes.normal};
`;
