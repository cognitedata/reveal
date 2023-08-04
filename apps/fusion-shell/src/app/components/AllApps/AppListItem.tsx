import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import {
  Body,
  Chip,
  Colors,
  Elevations,
  Flex,
  Icon,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { TranslationKeys, useTranslation } from '../../../i18n';
import { AppItem } from '../../types';
import { useExperimentalFeatures } from '../../utils/hooks';
import { trackUsage } from '../../utils/metrics';
import { StyledAppResourceIconContainer } from '../LandingPage/UserHistoryResourceIcon';

import { ItemWithSection } from './types';

type AppListItemProps = {
  app: ItemWithSection;
  section: string;
};

const AppListItem = ({ app, section }: AppListItemProps) => {
  const { t } = useTranslation();

  const { isEnabled: shouldHideTags } = useFlag('HIDE_EXPERIMENTAL_TAGS', {
    fallback: false,
    forceRerender: true,
  });
  const experimentalFeatures = useExperimentalFeatures();
  let isTagEnabled = false;

  if (
    window.location.hostname !== 'localhost:8080' &&
    experimentalFeatures[app.internalId] &&
    !shouldHideTags
  ) {
    isTagEnabled = true;
  }

  return (
    <ItemWrapper
      item={app}
      onClick={() =>
        trackUsage({
          e: 'Navigation.AllApps.Navigate.App.Click',
          app: app?.internalId,
        })
      }
    >
      <StyledWrapper>
        <StyledContent>
          <StyledAppResourceIconContainer
            $backgroundColor={app.colors.secondary}
          >
            <Icon type={app.icon} />
          </StyledAppResourceIconContainer>
          <Flex direction="column" gap={4}>
            <StyledTitle level={6}>{app.title}</StyledTitle>
            <StyledSubTitle level={3} muted>
              {app.subtitle}
            </StyledSubTitle>
          </Flex>
          <StyledTagContainer>
            <StyledAppTag
              label={t(`section-navtitle-${section}` as TranslationKeys)}
              selectable
              size="small"
              hideTooltip
            />
            {isTagEnabled && (
              <Tooltip content={t('label-experimental-desc')}>
                <StyledPreviewTag
                  label={t('label-experimental-title')}
                  size="small"
                  hideTooltip
                />
              </Tooltip>
            )}
          </StyledTagContainer>
        </StyledContent>
      </StyledWrapper>
    </ItemWrapper>
  );
};

type ItemWrapperProps = {
  item: AppItem;
  onClick?: () => void;
};

const ItemWrapper = ({
  children,
  item,
  onClick,
}: PropsWithChildren<ItemWrapperProps>) => {
  if (item.linkTo) {
    return (
      <Link to={createLink(item.linkTo)} onClick={onClick}>
        {children}
      </Link>
    );
  }
  if (item.externalLinkTo) {
    return (
      <a
        href={item.externalLinkTo}
        target={item.sameWindow ? '_self' : '_blank'}
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  return <>{children}</>;
};

const StyledWrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  cursor: pointer;
  transition: box-shadow 500ms ease;
  min-height: 232px;
  width: 100%;

  &:hover {
    background-color: white;
    box-shadow: ${Elevations['elevation--surface--interactive--hover']};
    transition: box-shadow 500ms ease;
  }

  && {
    padding: 20px;
  }
`;
const StyledTitle = styled(Title)`
  margin: 0 0 6px 2px;
`;
const StyledSubTitle = styled(Body)`
  font-size: 12px;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 12px;
`;

const StyledTagContainer = styled(Flex)`
  margin-top: auto;
  gap: 8px;
`;

const StyledAppTag = styled(Chip)``;

export const StyledPreviewTag = styled(Chip)`
  background-color: ${Colors['decorative--yellow--300']} !important;
`;

export default AppListItem;
