import { Avatar, Menu, Title, TopBar, Icon } from '@cognite/cogs.js';
import sidecar from 'config/sidecar';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useNavigate } from 'hooks/navigation';
import styled from 'styled-components/macro';
import dayjs from 'dayjs';
import { ChartActions } from 'components/TopBar';
import { useChat } from 'hooks/intercom';
import { useRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';
import { useTranslations } from 'hooks/translations';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';

const TopBarWrapper = () => {
  const { data: user } = useUserInfo();
  const move = useNavigate();
  const chat = useChat();
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
    ],
    'TopBar'
  );

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
                key: 'chat',
                name: t.Feedback,
                component: (
                  <span className="downloadChartHide">
                    <Icon type="Comment" />
                  </span>
                ),
                onClick: () => chat.show(),
              },
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
                      onClick={() => window.open(sidecar.privacyPolicyUrl)}
                    >
                      {t['Privacy policy']}
                    </Menu.Item>
                    <Menu.Footer>
                      v. {process.env.REACT_APP_VERSION_NAME || 'local'}
                    </Menu.Footer>
                  </Menu>
                ),
              },
              {
                key: 'avatar',
                component: (
                  <Avatar
                    text={user?.displayName || user?.email || 'Unknown'}
                  />
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
                    <Menu.Item>{t.Logout}</Menu.Item>
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
