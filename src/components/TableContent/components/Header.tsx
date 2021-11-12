import React from 'react';
import styled from 'styled-components';
import { Colors, Detail, Flex, Icon, Tabs, Title } from '@cognite/cogs.js';
import { useActiveTable } from 'hooks/table-tabs';

export const Header = (): JSX.Element => {
  const [[database, table] = [undefined, undefined]] = useActiveTable();

  return (
    <Bar justifyContent="space-between" alignItems="center">
      <TitleSection direction="column">
        <Detail className="detail--db-name" strong>
          {database}
        </Detail>
        <Title level={5} style={{ fontWeight: 700 }}>
          {table}.csv
        </Title>
      </TitleSection>
      <TabsSection justifyContent="center" alignItems="center">
        <StyledTabs>
          <Tabs.TabPane
            key="1"
            tab={
              <span>
                <Icon type="DataTable" />
                Table
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
        </StyledTabs>
      </TabsSection>
    </Bar>
  );
};

const Bar = styled(Flex)`
  height: 64px;
  box-sizing: border-box;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
`;

const TitleSection = styled(Flex)`
  margin-left: 16px;
  .detail--db-name {
    color: ${Colors['greyscale-grey6'].hex()};
  }
`;
const TabsSection = styled(Flex)`
  height: 100%;
`;

const StyledTabs = styled(Tabs)`
  height: 100%;
  .rc-tabs-nav {
    height: 100%;
  }
`;
