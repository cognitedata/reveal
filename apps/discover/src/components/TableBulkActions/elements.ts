import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { FlexRow, sizes } from 'styles/layout';
import { DURATION } from 'styles/transition';

interface BarProps {
  visible: boolean;
}

export const Wrapper = styled.div`
  position: absolute;
  bottom: 0;
  width: calc(100% - 32px);
  padding: 0;
  transition: transform ${DURATION.MEDIUM};
  transform: translateY(
    ${(props: BarProps) => (props.visible ? '0px' : '88px')}
  );
  margin: ${sizes.normal};
  z-index: ${layers.TABLE_ROW_HOVER}; // needed in favorite wells page
`;

export const Bar = styled(FlexRow)`
  padding: 0 ${sizes.normal};

  justify-content: space-between;
  align-items: center;
  height: 56px;
  background: var(--cogs-primary);
  border-radius: 8px;
`;

export const Title = styled(FlexRow)`
  color: var(--cogs-white);
  font-size: 16px;
  font-weight: 600;
`;

export const Subtitle = styled(FlexRow)`
  color: var(--cogs-white);
  font-size: 12px;
  font-weight: 500;
  opacity: 0.5;
`;

export const Separator = styled.div`
  height: 28px;
  width: 0;
  border-left: 1px solid var(--cogs-color-strokes-default);
  margin-left: ${sizes.small};
  margin-right: ${sizes.small};
`;
