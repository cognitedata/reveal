import styled from 'styled-components';

import { Body, Flex } from '@cognite/cogs.js';

import { useLinks } from '../../hooks/useLinks';
import { useTranslation } from '../../hooks/useTranslation';

export const AIDisclaimer = () => {
  const { t } = useTranslation();
  const { classicExplorerLink } = useLinks();

  return (
    <Wrapper gap={4}>
      <Body size="small">{t('AI_DISCLAIMER')}</Body>
      <StyledLink
        href={classicExplorerLink()}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>{t('AI_LEARN_MORE')}</span>
      </StyledLink>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  .cogs-body-small {
    color: var(--text-icon-muted, rgba(0, 0, 0, 0.55));
  }
`;

const StyledLink = styled.a`
  text-decoration: underline;
  color: var(--text-icon-muted, rgba(0, 0, 0, 0.55));
`;
