import styled from 'styled-components';

import { useLinks } from '@fdx/shared/hooks/useLinks';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Body, Flex } from '@cognite/cogs.js';

export const AIDisclaimer = () => {
  const { t } = useTranslation();
  const { cogniteSearchDocs } = useLinks();

  return (
    <Wrapper gap={4}>
      <Body size="small">{t('AI_DISCLAIMER')}</Body>
      <StyledLink
        href={cogniteSearchDocs()}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Body size="small">{t('AI_LEARN_MORE')}</Body>
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
