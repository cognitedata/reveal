import React, { useState } from 'react';

import { SecondaryTopbar, createLink } from '@cognite/cdf-utilities';
import { Loader, Menu, Tabs } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { useTranslation } from '@extraction-pipelines/common';
import { StyledHeadingContainer } from '@extraction-pipelines/components/extpipe/ExtpipeHeading';
import { StyledPageContainer } from '@extraction-pipelines/components/styled';
import { useMQTTSourceWithMetrics } from '@extraction-pipelines/hooks/hostedExtractors';

import { HostedExtractionPipelineInsight } from './HostedExtractionPipelineInsight';
import { HostedExtractionPipelineOverview } from './HostedExtractionPipelineOverview';
import { getContainer } from '@extraction-pipelines/utils/utils';
import DeleteSourceModal from '@extraction-pipelines/components/delete-source-modal/DeleteSourceModal';

export const HostedExtractionPipelineDetails = (): JSX.Element => {
  const { t } = useTranslation();

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
      <StyledHeadingContainer>
        <SecondaryTopbar
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
                <Tabs.Tab tabKey="overview" label={t('overview')} />
                <Tabs.Tab tabKey="insight" label={t('insight')} />
              </Tabs>
            </TabsContainer>
          }
          title={externalId}
        />
      </StyledHeadingContainer>
      <Content>
        {detailsTab === 'insight' ? (
          <HostedExtractionPipelineInsight source={source} />
        ) : (
          <HostedExtractionPipelineOverview source={source} />
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
  .cogs-tabs__list {
    height: 56px;
  }
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  padding: 24px;
`;
