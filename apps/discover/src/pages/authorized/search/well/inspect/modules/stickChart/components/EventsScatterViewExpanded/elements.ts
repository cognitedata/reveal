import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

import {
  BaseDetailCardWrapper,
  DetailCardBlockWrapper,
} from '../DetailCard/elements';

export const ExpandedViewWrapper = styled(BaseDetailCardWrapper)`
  position: absolute;
  top: -53px;
  &:after {
    content: ' ';
    position: absolute;
    top: 57px;
    right: 100%;
    margin-left: -${sizes.small};
    border-width: ${sizes.small};
    border-style: solid;
    border-color: transparent var(--cogs-white) transparent transparent;
  }
`;

export const CollapseIconButtonWrapper = styled.div`
  position: absolute;
  right: ${sizes.small};
  top: ${sizes.small};
`;

export const ScattersWrapper = styled(DetailCardBlockWrapper)`
  padding: ${sizes.small};
  min-width: 360px;
  width: 100%;
  height: ${(props: { height: number }) => props.height}px;
`;
