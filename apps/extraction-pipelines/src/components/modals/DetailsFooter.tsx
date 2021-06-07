import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  flex: 1;
`;

interface OwnProps {
  primaryText: string;
  onPrimaryClick?: (update: boolean) => void;
}

const DetailsFooter: FunctionComponent<OwnProps> = ({
  primaryText,
  onPrimaryClick,
}: PropsWithoutRef<OwnProps>) => {
  const onClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick(true);
    }
  };

  return (
    <Wrapper>
      <Button
        onClick={onClick}
        data-testid="footer-modal-close-btn"
        type="primary"
      >
        {primaryText}
      </Button>
    </Wrapper>
  );
};

export default DetailsFooter;
