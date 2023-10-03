import React from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { Button, Colors, Flex } from '@cognite/cogs.js';

import { useTranslations } from '../../hooks/translations';
import { createInternalLink } from '../../utils/link';
import {
  makeDefaultTranslations,
  translationKeys,
} from '../../utils/translations';

const defaultTranslations = makeDefaultTranslations('All charts');

const SecondaryTopBar = () => {
  const move = useNavigate();

  const t = {
    ...defaultTranslations,
    ...useTranslations(translationKeys(defaultTranslations), 'ChartView').t,
  };

  const handleGoBackClick = () => move(createInternalLink());

  return (
    <>
      <StyledContainer>
        <Flex alignItems="center" gap={8}>
          <Button icon="ArrowLeft" onClick={handleGoBackClick} type="ghost">
            {t['All charts']}
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
