import styled from 'styled-components';

import { Body, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../hooks/useTranslation';
import { useGetAssetCentricDataExplorerUrl } from '../../hooks/useUrl';

export const AIDisclaimer = () => {
  const { t } = useTranslation();
  const assetCentricDataExplorerUrl = useGetAssetCentricDataExplorerUrl();

  return (
    <Wrapper gap={4}>
      <Body size="small">{t('AI_DISCLAIMER')}</Body>
      <StyledLink
        href={assetCentricDataExplorerUrl}
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
