import React, { useState } from 'react';
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import { Loader, Menu, Tabs } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { useTranslation } from '../../common';
import DeleteSourceModal from '../../components/delete-source-modal/DeleteSourceModal';
import { ExtractionPipelineDetailsTopBar } from '../../components/ExtractionPiplelineDetailsTopBar';
import { StyledPageContainer } from '../../components/styled';
import { useMQTTSourceWithMetrics } from '../../hooks/hostedExtractors';
import { PAGE_WIDTH } from '../../utils/constants';
import { getContainer } from '../../utils/utils';

import { HostedExtractionPipelineInsight } from './HostedExtractionPipelineInsight';
import { HostedExtractionPipelineOverviewNew } from './HostedExtractionPipelineOverviewNew';

export const HostedExtractionPipelineDetails = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { externalId = '' } = useParams<{
    externalId: string;
  }>();

  const { isEnabled: shouldShowHostedExtractors, isClientReady } = useFlag(
    'FUSION_HOSTED_EXTRACTORS'
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const detailsTab = searchParams.get('detailsTab') ?? 'overview';

  const { data: source, isFetched } = useMQTTSourceWithMetrics(externalId);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  if (!isFetched || !isClientReady) {
    return <Loader />;
  }

  if (isClientReady && !shouldShowHostedExtractors) {
    return <Navigate replace to={createLink('/extpipes')} />;
  }

  if (!source) {
    return <>not found</>;
  }

  return (
    <StyledPageContainer>
      <ExtractionPipelineDetailsTopBar
        source={source}
        onGoBack={() => navigate(-1)}
        optionsDropdownProps={{
          appendTo: getContainer(),
          hideOnSelect: {
            hideOnContentClick: true,
            hideOnOutsideClick: true,
          },
          content: (
            <Menu>
              <Menu.Item
                destructive
                icon="Delete"
                iconPlacement="left"
                onClick={() => setIsDeleteModalVisible(true)}
              >
                {t('delete')}
              </Menu.Item>
            </Menu>
          ),
        }}
        extraContent={
          <TabsContainer>
            <Tabs
              activeKey={detailsTab}
              onTabClick={(key) => {
                setSearchParams(
                  (prev) => {
                    prev.set('detailsTab', key);
                    return prev;
                  },
                  { replace: true }
                );
              }}
            >
              <Tabs.Tab
                tabKey="overview"
                label={t('overview')}
                iconLeft="Home"
              />
              <Tabs.Tab
                tabKey="insight"
                label={t('insight')}
                iconLeft="Profiling"
              />
            </Tabs>
          </TabsContainer>
        }
        title={externalId}
      />
      <Content>
        {detailsTab === 'insight' ? (
          <HostedExtractionPipelineInsight source={source} />
        ) : (
          <HostedExtractionPipelineOverviewNew source={source} />
        )}
      </Content>
      {isDeleteModalVisible && (
        <DeleteSourceModal
          onCancel={() => setIsDeleteModalVisible(false)}
          source={source}
          visible={isDeleteModalVisible}
        />
      )}
    </StyledPageContainer>
  );
};

const TabsContainer = styled.div`
  .cogs.cogs-tabs .cogs-tabs__list > :not(:last-child) {
    margin-right: 24px;
  }
`;

const Content = styled.div`
  display: flex;
  justify-content: start;
  padding: 48px 134px;
  width: ${PAGE_WIDTH}px;
  margin: 0 auto;
  box-sizing: content-box;
`;
