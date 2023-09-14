import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

interface Props {
  onClick?: () => void;
  isPanelClosed?: boolean;
  className?: string;
}

export const SearchPanelCloseButton = ({
  onClick,
  isPanelClosed,
  className,
}: Props): JSX.Element => {
  const buttonIcon = isPanelClosed ? 'PanelRight' : 'PanelLeft';

  return (
    <ButtonBackground className={className}>
      <BiggerButton
        icon={buttonIcon}
        type="tertiary"
        onClick={() => {
          onClick?.();
        }}
      />
    </ButtonBackground>
  );
};

const BiggerButton = styled(Button)`
  width: 40px;
  height: 40px;
`;

const ButtonBackground = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 40px;
  height: 40px;
`;
