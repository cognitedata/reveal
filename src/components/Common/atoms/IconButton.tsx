import styled from 'styled-components';
import { Button, ButtonProps as CogsButtonProps } from '@cognite/cogs.js';

interface IconButtonProps extends CogsButtonProps {
  $bigIcon?: boolean;
  $square?: boolean;
}

export const IconButton = styled(Button).attrs((props: IconButtonProps) => {
  const { $bigIcon, $square } = props;
  const style: any = {};
  if ($bigIcon) {
    style.paddingLeft = '5px';
  }
  if ($square) {
    style.justifyContent = 'center';
    style.alignItems = 'center';
    style.width = '36px';
    style.padding = 0;
  }
  return { style };
})<IconButtonProps>`
  height: 36px;
  border-radius: 5px;
  box-shadow: none;
  white-space: nowrap;
  display: flex;
  align-items: center;

  .cogs-icon {
    margin: ${(props) => (props.$square ? 0 : '0 4px')};

    svg {
      width: ${(props) => (props.$bigIcon ? '32px' : '16px')};
      height: ${(props) => (props.$bigIcon ? '32px' : '16px')};
    }
  }
`;
