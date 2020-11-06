import React, { useState } from 'react';
import { Button, TopBar, Menu, Avatar, toast } from '@cognite/cogs.js';
import logoSvg from 'assets/logo.svg';

import { Header } from './elements';
import { Container } from '../elements';

const Home = () => {
  const [crashing, setCrashing] = useState(false);

  const onCrash = () => {
    setCrashing(true);
    if (!crashing) {
      throw new Error('Synthetic error');
    }
  };

  return (
    <Container>
      <TopBar>
        <TopBar.Left>
          <TopBar.Logo
            title="Cognite Charts"
            logo={
              <img
                src={logoSvg}
                alt="Cognite Charts Logo"
                style={{ margin: '0 12px 0 16px' }}
              />
            }
          />
          <TopBar.Navigation links={[]} />
        </TopBar.Left>
        <TopBar.Right>
          <TopBar.Actions
            actions={[
              {
                key: 'crash',
                icon: 'ErrorStroked',
                onClick: onCrash,
                name: 'Crash the app',
              },
              {
                key: 'help',
                icon: 'Help',
                name: 'Help',
                menu: (
                  <Menu>
                    <Menu.Item>Menu item 1</Menu.Item>
                    <Menu.Item>Menu item 2</Menu.Item>
                    <Menu.Item>Menu item 3</Menu.Item>
                    <Menu.Item
                      onClick={() =>
                        window.open('https://www.cognite.com/en/policy')
                      }
                    >
                      Privacy policy
                    </Menu.Item>
                    <Menu.Footer>
                      v. {process.env.REACT_APP_VERSION_NAME || 'local'}
                    </Menu.Footer>
                  </Menu>
                ),
              },
              { key: 'avatar', component: <Avatar text="Anon User" /> },
            ]}
          />
        </TopBar.Right>
      </TopBar>

      <Header>
        <hgroup>
          <h1>11-ESDV-90020 Chart</h1>
          <h4>by Anon User</h4>
        </hgroup>
        <section className="actions">
          <Button
            icon="Checkmark"
            type="primary"
            onClick={() => {
              toast.success('Successfully saved nothing!');
            }}
          >
            Save
          </Button>
          <Button icon="Share" variant="ghost">
            Share
          </Button>
          <Button icon="Download" variant="ghost">
            Export
          </Button>
        </section>
      </Header>
    </Container>
  );
};

export default Home;
