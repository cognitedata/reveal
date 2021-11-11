import React /** , { useContext } */ from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button, Colors, Flex, Icon, Tabs, Title } from '@cognite/cogs.js';
// import { RawExplorerContext } from 'contexts';

export const Header = (): JSX.Element => {
  // const { isSidePanelOpen, setIsSidePanelOpen } = useContext(
  //   RawExplorerContext
  // );

  const onMenuButtonClick = () => {}; // setIsSidePanelOpen(!isSidePanelOpen);
  const { database, table } = useParams<{
    table?: string;
    database?: string;
  }>();

  const tableHeaderTitle = `${database}${table ? ` > ${table}` : ''}`;

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
