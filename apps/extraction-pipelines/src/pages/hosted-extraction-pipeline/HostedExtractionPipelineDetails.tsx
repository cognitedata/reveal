import React from 'react';

import { SecondaryTopbar } from '@cognite/cdf-utilities';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { StyledHeadingContainer } from 'components/extpipe/ExtpipeHeading';
import { PageWrapperColumn, StyledPageContainer } from 'components/styled';
import { useMQTTSource } from 'hooks/hostedExtractors';
import { Button, Dropdown, Flex, Tabs } from '@cognite/cogs.js';
import { useTranslation } from 'common';

export const HostedExtractionPipelineDetails = (): JSX.Element => {
  const { t } = useTranslation();

  const { externalId = '' } = useParams<{
    externalId: string;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const detailsTab = searchParams.get('detailsTab') ?? 'overview';

  const { data: source } = useMQTTSource(externalId);

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
      <PageWrapperColumn>{source?.externalId}</PageWrapperColumn>
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
