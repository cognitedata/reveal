import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

import { translationKeys } from '../../../app/common/i18n/translationKeys';
import { useTranslation } from '../../hooks/useTranslation';
import { useGetAssetCentricDataExplorerUrl } from '../../hooks/useUrl';

export const DataExplorerLink = () => {
  const { t } = useTranslation();
  const assetCentricDataExplorerUrl = useGetAssetCentricDataExplorerUrl();

  return (
    <StyledLink
      href={assetCentricDataExplorerUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>{t(translationKeys.openIn, 'Open in')} Data Explorer</span>
      <Icon type="ExternalLink" />
    </StyledLink>
  );
};

const StyledLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
      269.53deg,
      rgba(109, 135, 191, 0.8) 0.32%,
      rgba(19, 28, 66, 0.8) 99.67%
    ),
    rgba(250, 250, 250, 0.8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;

  .cogs-icon {
    margin-left: 7px;
    color: #6d87bfcc;
  }
`;
