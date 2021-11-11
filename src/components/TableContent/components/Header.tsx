import React from 'react';
import styled from 'styled-components';
import { Button, Colors, Flex, Icon, Tabs, Title } from '@cognite/cogs.js';

export const Header = (): JSX.Element => {
  const onMenuButtonClick = () => {};
  const tableHeaderTitle = 'Database';

  return (
    <Bar justifyContent="space-between" alignItems="center">
      <Flex justifyContent="center" alignItems="center">
        <Button
          icon="HamburgerMenu"
          variant="ghost"
          onClick={onMenuButtonClick}
          style={{ marginRight: '8px' }}
        />
        <Title level={3} style={{ fontWeight: 700 }}>
          {tableHeaderTitle}
        </Title>
      </Flex>
      <Flex justifyContent="center" alignItems="center">
        <Tabs>
          <Tabs.TabPane
            key="1"
            tab={
              <span>
                <Icon type="DataTable" />
                Data
              </span>
            }
          />
          <Tabs.TabPane
            key="2"
            tab={
              <span>
                <Icon type="Profiling" />
                Profile
              </span>
            }
          />
        </Tabs>
      </Flex>
    </Bar>
  );
};

const Bar = styled(Flex)`
  padding-left: 8px;
  border-bottom: 1px solid ${Colors['greyscale-grey4'].hex()};
`;
