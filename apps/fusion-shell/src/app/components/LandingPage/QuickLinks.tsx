import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useCdfUserHistoryService } from '@user-history';

import { createLink, CdfApplicationUsage } from '@cognite/cdf-utilities';
import { Button, Flex, Title, Body, Colors, Tooltip } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { TranslationKeys, useTranslation } from '../../../i18n';
import {
  QuickLinkApp,
  QuickLinks as TypeQuickLinks,
  getAllAppsData,
  getQuickLinks,
  getQuickLinksFilter,
  rawAppsData,
} from '../../sections/sections';
import { AppItem } from '../../types';
import { useExperimentalFeatures } from '../../utils/hooks';
import { trackUsage } from '../../utils/metrics';
import { StyledPreviewTag } from '../AllApps/AppListItem';
import Link from '../Link';

import { StyledTitle } from './LandingPage';

export default function QuickLinks(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const userHistoryService = useCdfUserHistoryService();

  // maybe later we can optimize this in sections.ts,
  // but for now implementing same solution as AppListItem to show preview tag here
  const { isEnabled: shouldHideTags } = useFlag('HIDE_EXPERIMENTAL_TAGS', {
    fallback: false,
    forceRerender: true,
  });
  const experimentalFeatures = useExperimentalFeatures();

  const [appliedQuickLinkFilter, setAppliedQuickLinkFilter] =
    useState('suggestions');
  const [activeLink, setActiveLink] = useState<string | undefined>(undefined);

  const { appsData } = getAllAppsData(t);
  const { quickLinks } = getQuickLinks(experimentalFeatures);
  const quickLinksFilters = getQuickLinksFilter();

  const [displayQuickLinks, setDisplayQuickLinks] =
    useState<TypeQuickLinks>(quickLinks);
  const [filterType, setFilterType] =
    useState<keyof typeof quickLinksFilters>('defaultFilter');

  const {
    isResourcesLoading,
    hasRecentlyUsedApplications,
    recentlyUsedApplications,
  } = useMemo(() => {
    if (userHistoryService) {
      return {
        isResourcesLoading: false,
        hasRecentlyUsedApplications:
          userHistoryService.hasRecentlyUsedApplications(),
        recentlyUsedApplications:
          userHistoryService.getRecentlyUsedApplications(),
      };
    }

    return {
      isResourcesLoading: true,
    };
  }, [userHistoryService]);

  useEffect(() => {
    if (
      !isResourcesLoading &&
      hasRecentlyUsedApplications &&
      recentlyUsedApplications?.length
    ) {
      // Update quick links and filters as per users' recently used apps
      setFilterType('customFilter');
      setDisplayQuickLinks((prevValue) => ({
        ...prevValue,
        recent: recentlyUsedApplications.reduce(
          (acc: any[], app: CdfApplicationUsage) => {
            const resourceApp = rawAppsData.find(
              (appItem) => app?.name === appItem?.linkTo // useApplications are saved as subAppPath in Navigation and quick links are saved with reference of app internalId in sections.ts
            );
            if (resourceApp?.internalId) {
              acc.push(resourceApp.internalId);
            }
            return acc;
          },
          []
        ),
      }));
      setAppliedQuickLinkFilter('recent');
    }
  }, [
    isResourcesLoading,
    hasRecentlyUsedApplications,
    recentlyUsedApplications,
  ]);

  const quickLinkFilterHandler = (filterKey: string) =>
    setAppliedQuickLinkFilter(filterKey);

  const onMouseHoverLinkHandler = (isHover: boolean, linkKey: string) =>
    setActiveLink(isHover ? linkKey : undefined);

  const findAppItem = (app?: QuickLinkApp): AppItem | undefined => {
    if (!app) {
      return undefined;
    }
    if (app.preview === false || app.visible) {
      return appsData.find((item) => app.id === item.internalId);
    }
    return findAppItem(app.alternative);
  };

  return (
    <QuickLinksWrapper direction="column" gap={24}>
      <StyledTitle level={4}>{t('title-quick-access')}</StyledTitle>
      <Flex justifyContent="space-between">
        <Flex
          justifyContent="flex-start"
          gap={8}
          data-testid="landing-quick-access-btn-wrapper"
        >
          {quickLinksFilters[filterType as keyof typeof quickLinksFilters].map(
            (filterKey) => {
              return (
                <QuickLinksFilter
                  type={
                    appliedQuickLinkFilter === filterKey
                      ? 'primary'
                      : 'tertiary'
                  }
                  inverted
                  key={filterKey}
                  data-testid={filterKey}
                  onClick={() => quickLinkFilterHandler(filterKey)}
                >
                  {t(`label-${filterKey}` as TranslationKeys)}
                </QuickLinksFilter>
              );
            }
          )}
        </Flex>
        <Button
          type="ghost"
          inverted
          icon="ChevronRight"
          iconPlacement="right"
          onClick={() => {
            trackUsage({ e: 'Navigation.Quick.ViewAll.Click' });
            navigate(createLink('/apps'));
          }}
        >
          {t('label-view-all')}
        </Button>
      </Flex>
      <Flex
        justifyContent="space-between"
        gap={16}
        data-testid="quick-link-card-container"
      >
        {displayQuickLinks[
          appliedQuickLinkFilter as keyof typeof quickLinks
        ].map((linkApp) => {
          const appItem = findAppItem(linkApp);

          if (!appItem) {
            return undefined;
          }

          const isActiveLink = activeLink === appItem?.internalId;
          let isPreviewTagEnabled = false;

          if (
            window.location.hostname !== 'localhost:8080' &&
            experimentalFeatures[
              appItem?.internalId as keyof typeof experimentalFeatures
            ] &&
            !shouldHideTags
          ) {
            isPreviewTagEnabled = true;
          }

          return (
            <CardContainer
              data-testid={appItem?.linkTo}
              key={`quick-access-to-${appItem?.internalId}`}
              onMouseOver={() =>
                onMouseHoverLinkHandler(true, appItem?.internalId || '')
              }
              onMouseOut={() =>
                onMouseHoverLinkHandler(false, appItem?.internalId || '')
              }
              onClick={() =>
                trackUsage({
                  e: 'Navigation.Quick.Link.Click',
                  link: appItem?.linkTo,
                })
              }
            >
              <Link to={appItem?.linkTo || ''}>
                <Flex
                  className="quick-link-main"
                  direction="column"
                  justifyContent="flex-start"
                  gap={10}
                >
                  <Flex direction="row" alignItems="center" gap={8}>
                    <Title className="quick-link-title" level={6}>
                      {appItem?.title}
                    </Title>
                    {isPreviewTagEnabled && (
                      <Tooltip content={t('label-experimental-desc')} inverted>
                        <StyledPreviewTag
                          label={t('label-experimental-title')}
                          size="x-small"
                          hideTooltip
                        />
                      </Tooltip>
                    )}
                  </Flex>
                  <Flex>
                    <>
                      <img
                        src={appItem?.img}
                        alt={appItem?.ariaLabel}
                        height={182}
                        width={246}
                      />
                      <AppImageOverlay>
                        <Body level={2} className="quick-link-desc">
                          {appItem?.subtitle}
                        </Body>
                      </AppImageOverlay>
                    </>
                    <StyledRedirectButton
                      aria-label={appItem?.ariaLabel}
                      icon="ArrowRight"
                      type={isActiveLink ? 'primary' : 'tertiary'}
                      inverted
                      style={
                        !isActiveLink
                          ? {
                              background: Colors['surface--strong--inverted'],
                            }
                          : {
                              background:
                                Colors[
                                  'surface--status-neutral--strong--default--inverted'
                                ],
                            }
                      }
                    />
                  </Flex>
                </Flex>
              </Link>
            </CardContainer>
          );
        })}
      </Flex>
    </QuickLinksWrapper>
  );
}

const QuickLinksWrapper = styled(Flex)`
  padding-top: 40px;
  width: 100%;

  img {
    display: block;
    width: 100%;
    height: auto;
    transition: transform 0.2s ease-in-out;
  }
`;

const QuickLinksFilter = styled(Button)`
  border-radius: 27px !important;
`;

const StyledRedirectButton = styled(Button)`
  height: 36px;
  border: 1px solid ${Colors['border--interactive--default--inverted']};
  margin: 3px 0 0 16px;
`;

const CardContainer = styled.div`
  min-width: 320px;
  height: 160px;
  overflow: hidden;
  background: ${Colors['surface--strong--inverted']};
  border-radius: 9px;

  .quick-link-main {
    margin: 23px 34px;

    .quick-link-title {
      color: ${Colors['text-icon--strong--inverted']};
    }

    .quick-link-desc {
      position: absolute;
      width: 239px;
      left: 36px;
      top: 58px;
      color: ${Colors['text-icon--muted--inverted']};
      visibility: hidden;
      opacity: 0;
      transition: visibility 0s, opacity 0.3s linear;
    }
  }

  :hover {
    opacity: 1;
    transform: translateY(0);

    img {
      transform: translateY(110px);
    }

    .quick-link-desc {
      visibility: visible;
      opacity: 1;
    }
  }
`;

const AppImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  color: ${Colors['text-icon--strong--inverted']};
  transition: opacity 0.1s ease-in-out, transform 0.1s ease-in-out;
  opacity: 1;
  transform: translateY(0);
`;
