import React from 'react';

import { SecondaryTopbar } from '@cognite/cdf-utilities';
import { Button, Dropdown, Flex, Loader, Tabs } from '@cognite/cogs.js';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { useTranslation } from 'common';
import { StyledHeadingContainer } from 'components/extpipe/ExtpipeHeading';
import { StyledPageContainer } from 'components/styled';
import { useMQTTSource } from 'hooks/hostedExtractors';

import { HostedExtractionPipelineInsight } from './HostedExtractionPipelineInsight';
import { HostedExtractionPipelineOverview } from './HostedExtractionPipelineOverview';

export const HostedExtractionPipelineDetails = (): JSX.Element => {
  const { t } = useTranslation();

  const { externalId = '' } = useParams<{
    externalId: string;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const detailsTab = searchParams.get('detailsTab') ?? 'overview';

  const { data: source, isFetched } = useMQTTSource(externalId);

  if (!isFetched) {
    return <Loader />;
  }

  if (!source) {
    return <>not found</>;
  }

  return (
    <StyledPageContainer>
      <StyledHeadingContainer>
        <SecondaryTopbar
          extraContent={
            <Flex alignItems="center" style={{ height: '100%' }}>
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
                  <Tabs.TabPane key="overview" tab={t('overview')} />
                  <Tabs.TabPane key="insight" tab={t('insight')} />
                </Tabs>
              </TabsContainer>
              <SecondaryTopbar.Divider />
              <Dropdown>
                <Button icon="EllipsisHorizontal" />
              </Dropdown>
            </Flex>
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
    </StyledPageContainer>
  );
};

const TabsContainer = styled.div`
  height: 100%;

  .rc-tabs,
  .rc-tabs-nav {
    height: 100%;
  }
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  padding: 24px;
`;
