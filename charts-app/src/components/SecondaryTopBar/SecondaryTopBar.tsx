import React from 'react';
import { Button, Colors, Flex } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { createInternalLink } from 'utils/link';

const SecondaryTopBar = () => {
  const move = useNavigate();

  const handleGoBackClick = () => move(createInternalLink());

  return (
    <>
      <StyledContainer>
        <Flex alignItems="center" gap={8}>
          <Button icon="ArrowLeft" onClick={handleGoBackClick} type="ghost">
            All charts
          </Button>
          <Divider />
        </Flex>

        <div id="secondary-topbar-left" style={{ flexGrow: 1 }} />
      </StyledContainer>
    </>
  );
};

const Divider = styled.div`
  border-left: 1px solid var(--cogs-greyscale-grey3);
  height: 24px;
`;

const StyledContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--muted']};
  display: flex;
  height: 56px;
  justify-content: space-between;
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  padding-left: 4px;
`;

export default SecondaryTopBar;
