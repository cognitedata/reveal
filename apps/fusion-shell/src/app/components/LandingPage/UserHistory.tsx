import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { useCdfUserHistoryService } from '@user-history';

import { formatTime } from '@cognite/cdf-utilities';
import {
  Body,
  Flex,
  Title,
  Divider,
  Colors,
  SegmentedControl,
  Chip,
  Tooltip,
} from '@cognite/cogs.js';

import { TranslationKeys, useTranslation } from '../../../i18n';
import { rawAppsData } from '../../sections/sections';
import { trackUsage } from '../../utils/metrics';

import UserHistoryEmptyState from './UserHistoryEmptyState';
import UserHistoryExpandButton from './UserHistoryExpandButton';
import UserHistoryLoadingSkeleton from './UserHistoryLoadingSkeleton';
import UserHistoryResourceIcon from './UserHistoryResourceIcon';

type UserHistoryResource = 'editedResources' | 'viewedResources';

export type UserHistoryProps = { isRockwellDomains: boolean };

export default function UserHistory(props: UserHistoryProps) {
  const { t } = useTranslation();
  const userHistoryService = useCdfUserHistoryService();

  const [isUserHistoryTableExpanded, setUserHistoryTableExpandStatus] =
    useState<boolean>(false);
  const [displayResourceType, setDisplayResourceType] =
    useState<UserHistoryResource>('viewedResources');

  const {
    isResourcesLoading,
    isResourcesEmpty,
    isViewedResourcesEmpty,
    isEditedResourcesEmpty,
    getCdfUserHistoryResources,
  } = useMemo(() => {
    if (userHistoryService) {
      return {
        isResourcesLoading: false,
        isResourcesEmpty: userHistoryService.isResourcesEmpty(),
        getCdfUserHistoryResources:
          userHistoryService.getCdfUserHistoryResources(),
        isViewedResourcesEmpty: userHistoryService.isViewedResourcesEmpty(),
        isEditedResourcesEmpty: userHistoryService.isEditedResourcesEmpty(),
      };
    }

    return {
      isResourcesLoading: true,
    };
  }, [userHistoryService]);

  useEffect(() => {
    if (getCdfUserHistoryResources) {
      const defaultResourceType = getCdfUserHistoryResources?.editedResources
        ?.length
        ? 'editedResources'
        : 'viewedResources';
      setDisplayResourceType(defaultResourceType);
    }
  }, [getCdfUserHistoryResources]);

  const toggleExpandUserHistoryHandler = () =>
    setUserHistoryTableExpandStatus(!isUserHistoryTableExpanded);

  const toggleResourceView = (resourceType: UserHistoryResource) => {
    setDisplayResourceType(resourceType);
    setUserHistoryTableExpandStatus(!isUserHistoryTableExpanded);
  };

  const displayResources =
    userHistoryService.getCdfUserHistoryResources()[displayResourceType];

  return (
    <UserHistoryWrapper
      justifyContent="flex-start"
      direction="column"
      gap={24}
      data-testid="user-history-section"
    >
      <Flex direction="row" justifyContent="space-between" alignItems="center">
        <Flex direction="row" alignItems="center" gap={8}>
          <Title level={5}>{t('title-resume-your-activity')}</Title>
          <Tooltip
            content={t('label-limited-functionality-desc')}
            position="bottom"
          >
            <Chip
              icon="Info"
              iconPlacement="left"
              label={t('label-limited-functionality')}
              size="small"
              type="neutral"
              hideTooltip
            />
          </Tooltip>
        </Flex>
        {!(isEditedResourcesEmpty || isViewedResourcesEmpty) && (
          <SegmentedControl
            onButtonClicked={(resourceKey) =>
              toggleResourceView(resourceKey as UserHistoryResource)
            }
            currentKey={displayResourceType}
          >
            <SegmentedControl.Button key="editedResources">
              {t('label-edited')}
            </SegmentedControl.Button>
            <SegmentedControl.Button key="viewedResources">
              {t('label-viewed')}
            </SegmentedControl.Button>
          </SegmentedControl>
        )}
      </Flex>
      {isResourcesLoading && <UserHistoryLoadingSkeleton />}
      {!isResourcesLoading && getCdfUserHistoryResources && isResourcesEmpty ? (
        <UserHistoryEmptyState {...props} />
      ) : (
        <UserHistoryTable
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <UserHistoryContainer
            direction="column"
            justifyContent="flex-start"
            alignItems="center"
            className="uh-row-container"
            $isExpand={isUserHistoryTableExpanded}
          >
            {displayResources.map((item, index) => {
              const resourceApp = rawAppsData.find((appItem) => {
                let matches = `/${item?.application}` === appItem?.linkTo;
                // This doesn't match the name and url, so we need a special condition.
                if (item?.application === 'industry-canvas') {
                  matches = appItem?.linkTo === '/industrial-canvas';
                }
                return matches;
              }); // useApplications are saved as subAppPath in Navigation

              return (
                <Link
                  to={item?.path}
                  className="uh-item-link"
                  style={{ width: '100%' }}
                  key={`cdf-user-history-${index}`}
                  onClick={() =>
                    trackUsage({
                      e: 'Navigation.Recent.Activity.Click',
                      app: resourceApp?.internalId,
                    })
                  }
                >
                  <UserHistoryItem
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Flex
                      direction="row"
                      alignItems="center"
                      justifyContent="flex-start"
                      gap={16}
                      className="uh-item-container"
                    >
                      <UserHistoryResourceIcon app={resourceApp} />
                      <Flex direction="column" alignItems="flex-start">
                        <Body level={2} className="uh-title">
                          {item?.name}
                        </Body>
                        <Body level={3} muted className="uh-desc">
                          {t(
                            `app-${resourceApp?.internalId}-tagname` as TranslationKeys
                          )}
                        </Body>
                      </Flex>
                    </Flex>
                    <Body level={3}>
                      {formatTime(parseInt(item?.timestamp), true)}
                    </Body>
                  </UserHistoryItem>
                  {index < displayResources.length - 1 && <Divider />}
                </Link>
              );
            })}
          </UserHistoryContainer>
          {getCdfUserHistoryResources && displayResources?.length > 5 && (
            <UserHistoryExpandButton
              isExpand={isUserHistoryTableExpanded}
              onToggleExpand={toggleExpandUserHistoryHandler}
            />
          )}
        </UserHistoryTable>
      )}
    </UserHistoryWrapper>
  );
}

const UserHistoryWrapper = styled(Flex)`
  width: 80%;
`;

const UserHistoryTable = styled(Flex)`
  width: 100%;
  border: 1px solid ${Colors['border--muted']};
  border-radius: 9px;
`;

const UserHistoryContainer = styled(Flex)<{
  $isExpand?: boolean;
}>`
  width: 100%;
  -webkit-transition: height 0.3s ease;
  min-height: 70px;
  max-height: 355px;
  overflow: hidden;
  && {
    ${({ $isExpand }) =>
      $isExpand &&
      `
        height: 100%;
        overflow: visible;
        max-height: 100%;
      `};
  }
`;

const UserHistoryItem = styled(Flex)`
  padding: 16px;
  width: 100%;

  .uh-item-link {
    width: 100%;
  }
  .uh-item-container {
    width: 60%;
  }
  .uh-title {
    font-weight: 500;
  }
  .uh-desc {
    font-size: 12px;
  }

  :hover {
    background: ${Colors['surface--interactive--hover']};
  }
`;
