import React from 'react';
import { Avatar, Menu, Title, TopBar } from '@cognite/cogs.js';
import sidecar from 'config/sidecar';

import { useHistory, useParams } from 'react-router-dom';
import { useLoginStatus } from 'hooks';
import { useChart, useUpdateChart } from 'hooks/firebase';
import styled from 'styled-components/macro';
import dayjs from 'dayjs';
import { ChartActions } from 'components/TopBar';
import EditableText from 'components/EditableText';

const TopBarWrapper = () => {
  const { data: user } = useLoginStatus();
  const history = useHistory();

  const { chartId } = useParams<{ chartId: string }>();
  const { data: chart } = useChart(chartId);
  const { mutate: updateChart } = useUpdateChart();

  return (
    <TopBar>
      <TopBar.Left>
        <TopBar.Logo
          title="Cognite Charts"
          onLogoClick={() =>
            history.location.pathname !== '/' && history.push('/')
          }
        />
        {!chart && <TopBar.Navigation links={[]} />}
        {!!chart && (
          <>
            <TopBar.Actions
              actions={[
                {
                  key: 'backToCharts',
                  component: (
                    <span style={{ color: 'var(--cogs-greyscale-grey9)' }}>
                      ← All charts
                    </span>
                  ),
                  onClick: () => history.push('/'),
                },
              ]}
            />
            <TopBar.Item>
              <Title level={4} style={{ marginLeft: 17 }}>
                <EditableText
                  value={chart?.name || ''}
                  onChange={(value) => {
                    if (chart) {
                      updateChart({ chart: { ...chart, name: value } });
                    }
                  }}
                />
              </Title>
            </TopBar.Item>
          </>
        )}
      </TopBar.Left>
      <TopBar.Right>
        {!!chart && (
          <>
            <TopBar.Item style={{ borderLeft: 'none' }}>
              <ChartDetails>
                {dayjs(chart?.updatedAt).format('YYYY-MM-DD')} · {chart?.user}
              </ChartDetails>
            </TopBar.Item>
          </>
        )}
        {/** Need to keep the actions component in DOM even if chart does not exist
         * to ensure update/delete callbacks are working properly */}
        <ChartActions />
        <TopBar.Actions
          actions={[
            {
              key: 'help',
              icon: 'Help',
              name: 'Help',
              menu: (
                <Menu>
                  <Menu.Item
                    onClick={() => window.open(sidecar.privacyPolicyUrl)}
                  >
                    Privacy policy
                  </Menu.Item>
                  <Menu.Footer>
                    v. {process.env.REACT_APP_VERSION_NAME || 'local'}
                  </Menu.Footer>
                </Menu>
              ),
            },
            {
              key: 'avatar',
              component: <Avatar text={user?.user || 'Unknown'} />,
            },
          ]}
        />
      </TopBar.Right>
    </TopBar>
  );
};

const ChartDetails = styled.span`
  color: var(--cogs-greyscale-grey6);
  margin: 0 17px;
`;

export default TopBarWrapper;
