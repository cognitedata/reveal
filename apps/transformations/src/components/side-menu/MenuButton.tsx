import styled from 'styled-components';

import { TOOLTIP_DELAY_IN_MS } from '@transformations/common';

import { Button, ButtonProps, Colors, Tooltip } from '@cognite/cogs.js';

type MenuButtonProps = ButtonProps & {
  tooltip?: string;
  isActive?: boolean;
};

export const MenuButton = (props: MenuButtonProps) => {
  const { tooltip, isActive, ...buttonProps } = props;

  return (
    <Tooltip content={tooltip} delay={TOOLTIP_DELAY_IN_MS} placement="right">
      <ButtonWrapper>
        <Button type="ghost" toggled={isActive} {...buttonProps} />
      </ButtonWrapper>
    </Tooltip>
  );
};

const ButtonWrapper = styled.div`
  .cogs-btn-toggled {
    background-color: ${Colors['decorative--blue--700']};
  }
`;
