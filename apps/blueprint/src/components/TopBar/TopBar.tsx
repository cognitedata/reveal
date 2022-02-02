import { Avatar, Icon, TopBar } from '@cognite/cogs.js';
import { AuthContext } from 'providers/AuthProvider';
import { CSSProperties, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { LogoWrapper } from './elements';

const TopBarWrapper = styled.div`
  .blueprint-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-left: 1px solid var(--cogs-greyscale-grey4);
    margin-left: 16px;
    padding-left: 16px;

    h3,
    h5 {
      margin-bottom: 0;
    }
  }

  .cogs-topbar .cogs-topbar--left {
    -webkit-user-select: auto;
    user-select: auto;
  }
`;

type TopBarComponentProps = {
  title?: string;
  subtitle?: string;
  style?: CSSProperties;
  onTitleChange?: (nextTitle: string) => void;
};

const TopBarComponent = ({
  title,
  subtitle,
  style,
  onTitleChange,
}: TopBarComponentProps) => {
  const history = useHistory();
  const { authState } = useContext(AuthContext);

  return (
    <TopBarWrapper style={style}>
      <TopBar>
        <TopBar.Left>
          <TopBar.Logo
            title="Cognite Blueprint"
            subtitle={authState?.project || authState?.tenant}
            onLogoClick={() => {
              history.push('/');
            }}
            logo={
              <LogoWrapper
                style={{ marginRight: 16, marginLeft: 16, cursor: 'pointer' }}
              >
                <Icon type="Image" style={{ width: 24 }} />
              </LogoWrapper>
            }
          />
          <header className="blueprint-header">
            {title ? (
              <h3
                tabIndex={0}
                contentEditable
                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                role="button"
                onBlur={(e) => {
                  if (!onTitleChange) return;
                  onTitleChange(
                    e.currentTarget.textContent || 'Untitled Blueprint'
                  );
                }}
                onKeyDown={(e) => {
                  if (!onTitleChange) return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                suppressContentEditableWarning
              >
                {title}
              </h3>
            ) : null}
            {subtitle ? <h5>{subtitle}</h5> : null}
          </header>
        </TopBar.Left>

        <TopBar.Right>
          <TopBar.Actions
            actions={[
              {
                key: 'user',
                component: <Avatar text="John Doe" />,
              },
            ]}
          />
        </TopBar.Right>
      </TopBar>
    </TopBarWrapper>
  );
};

export default TopBarComponent;
