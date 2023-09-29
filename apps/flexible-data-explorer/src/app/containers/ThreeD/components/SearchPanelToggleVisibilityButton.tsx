import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

interface Props {
  onClick?: () => void;
  isPanelClosed?: boolean;
  className?: string;
}

export const SearchPanelToggleVisibilityButton = ({
  onClick,
  isPanelClosed,
  className,
}: Props): JSX.Element => {
  const buttonIcon = isPanelClosed ? 'PanelRight' : 'PanelLeft';

  return (
    <ButtonBackground className={className}>
      <MoreRoundButton
        icon={buttonIcon}
        type="ghost"
        onClick={() => {
          onClick?.();
        }}
      />
    </ButtonBackground>
  );
};

const MoreRoundButton = styled(Button)`
  && {
    border-radius: 8px;
  }
`;

const ButtonBackground = styled.div`
  background: var(--cogs-surface--muted);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border: 1px solid
    var(--border-interactive-default-alt, rgba(83, 88, 127, 0.24));
  box-shadow: 0px 1px 2px 0px rgba(79, 82, 104, 0.24),
    0px 1px 8px 0px rgba(79, 82, 104, 0.08),
    0px 1px 16px 4px rgba(79, 82, 104, 0.1);
  width: 48px;
  height: 48px;
`;
