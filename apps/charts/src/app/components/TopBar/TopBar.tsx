import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import TranslatedEditableText from '@charts-app/components/EditableText/TranslatedEditableText';
import config from '@charts-app/config/config';
import { useTranslations } from '@charts-app/hooks/translations';
import { useUserInfo } from '@charts-app/hooks/useUserInfo';
import chartAtom from '@charts-app/models/chart/atom';
import dayjs from 'dayjs';
import { useRecoilState } from 'recoil';
import styled from 'styled-components/macro';

import { Avatar, Menu, Title, TopBar, Icon } from '@cognite/cogs.js';

import { ChartActions } from './ChartActions';

const TopBarWrapper = () => {
  const { data: user } = useUserInfo();
  const move = useNavigate();
  const [chart, setChart] = useRecoilState(chartAtom);
  const { t } = useTranslations(
    [
      'Cognite Charts',
      'All charts',
      'Feedback',
      'Help',
      'Privacy policy',
      'Account',
      'Profile',
      'Logout',
      'Early Adopter Group on Cognite Hub',
    ],
    'TopBar'
  );

  const handleLogout = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  return (
    <TopBarWrap>
      <TopBar>
        <TopBar.Left>
          <TopBar.Logo
            title={t['Cognite Charts']}
            onLogoClick={() => move('')}
          />
          {!chart && <TopBar.Navigation links={[]} />}
          {!!chart && (
            <>
              <AllCharts className="downloadChartHide" onClick={() => move('')}>
                ← {t['All charts']}
              </AllCharts>
              <div className="cogs-topbar--item">
                <Title level={4} style={{ marginLeft: 17 }}>
                  <TranslatedEditableText
                    value={chart?.name || ''}
                    onChange={(value) => {
                      setChart((oldChart) => ({
                        ...oldChart!,
                        name: value,
                      }));
                    }}
                  />
                </Title>
              </div>
            </>
          )}
        </TopBar.Left>
        <TopBar.Right>
          {!!chart && (
            <div className="cogs-topbar--item" style={{ borderLeft: 'none' }}>
              <ChartDetails>
                {dayjs(chart?.updatedAt).format('MMM D, YYYY')} ·{' '}
                {chart.userInfo?.displayName ||
                  chart.userInfo?.email ||
                  chart.user}
              </ChartDetails>
            </div>
          )}
          {/** Need to keep the actions component in DOM even if chart does not exist
           * to ensure update/delete callbacks are working properly */}
          <ChartActions />
          <TopBar.Actions
            actions={[
              {
                key: 'help',
                name: t.Help,
                component: (
                  <span className="downloadChartHide">
                    <Icon type="Help" />
                  </span>
                ),
                menu: (
                  <Menu>
                    <Menu.Item
                      href={config.cogniteHubGroupUrl}
                      style={{ color: 'var(--cogs-text-color)' }}
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore Cogs doesn't have correct type
                      target="_blank"
                    >
                      {t['Early Adopter Group on Cognite Hub']}
                    </Menu.Item>
                    <Menu.Item
                      href={config.privacyPolicyUrl}
                      style={{ color: 'var(--cogs-text-color)' }}
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore Cogs doesn't have correct type
                      target="_blank"
                    >
                      {t['Privacy policy']}
                    </Menu.Item>
                    <Menu.Footer>
                      v {config.version.substring(0, 7)}
                    </Menu.Footer>
                  </Menu>
                ),
              },
              {
                key: 'avatar',
                component: (
                  <Avatar text={user?.displayName || user?.mail || 'Unknown'} />
                ),
                menu: (
                  <Menu style={{ minWidth: '140px' }}>
                    <Menu.Header>{t.Account}</Menu.Header>
                    <Menu.Item
                      style={{ color: 'var(--cogs-text-color)' }}
                      onClick={() => move('/user')}
                    >
                      {t.Profile}
                    </Menu.Item>
                    <Menu.Item onClick={handleLogout}>{t.Logout}</Menu.Item>
                  </Menu>
                ),
              },
            ]}
          />
        </TopBar.Right>
      </TopBar>
    </TopBarWrap>
  );
};

const ChartDetails = styled.span`
  color: var(--cogs-greyscale-grey6);
  margin: 0 17px;
  white-space: nowrap;
`;

const TopBarWrap = styled.div`
  background-color: #fff;
`;

const AllCharts = styled.span`
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: var(--cogs-greyscale-grey9);
  font-weight: 600;
  cursor: pointer;
  border-left: 1px solid var(--cogs-border-default);
  :hover {
    background-color: var(--cogs-greyscale-grey2);
  }
`;

export default TopBarWrapper;
