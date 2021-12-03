import React, { useContext } from 'react';
import styled from 'styled-components';
import { Icon, Button, Tooltip } from '@cognite/cogs.js';

import {
  useActiveTable,
  useCloseTable,
  useTableTabList,
} from 'hooks/table-tabs';
import { TAB_HEIGHT } from 'utils/constants';
import { RawExplorerContext } from 'contexts';

const Tabs = styled.ul`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  align-content: flex-start;
  padding: 0;
  margin-bottom: 0;
  border-left: 1px solid var(--cogs-greyscale-grey3);
`;

const Tab = styled.li<{ $active?: boolean }>`
  align-content: center;
  align-items: center;
  align-self: auto;
  height: ${TAB_HEIGHT}px;
  background-color: ${(props) =>
    props.$active ? 'white' : 'var(--cogs-greyscale-grey1)'};
  border-bottom: ${(props) =>
    props.$active ? '' : '1px solid var(--cogs-greyscale-grey3)'};
  border-right: 1px solid var(--cogs-greyscale-grey3);
  cursor: pointer;
  display: flex;
  flex-basis: 240px;
  flex-direction: row;
  flex-shrink: ${(props) => (props.$active ? '0' : '1')};
  justify-content: space-between;
  list-style: none;
  max-width: ${(props) => (props.$active ? 'unset' : '240px')};
  min-width: 0;
  padding: 10px 20px;
  font-weight: 600;
  color: ${(props) =>
    props.$active
      ? 'var(--cogs-greyscale-grey9)'
      : 'var(--cogs-greyscale-grey7)'};
  .cogs-icon-Table {
    color: ${(props) => (props.$active ? 'var(--cogs-green)' : 'unset')};
  }
  &:hover .cogs-icon-Table {
    color: var(--cogs-green);
  }
`;

const LeftIcon = styled.span`
  flex-grow: 0;
  flex-shrink: 2;
  flex-basis: 20px;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
`;
const RightIcon = styled.span`
  flex-grow: 0;
  flex-shrink: 0;
  color: var(--cogs-greyscale-grey6);
  vertical-align: middle;
  padding-left: 10px;
`;

const TabContent = styled.span`
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FillerTab = styled(Tab)`
  cursor: unset;
  max-width: unset;
  flex-grow: 1;
  flex-shrink: 99;
  padding: 0 0;
`;

const OpenNavTab = styled(Tab)`
  flex-grow: 0;
  flex-shrink: 0;
  padding: 0 10px;
  flex-basis: auto;
  background-color: white;
`;

export default function TableTabList() {
  const list = useTableTabList() || [];
  const [[activeDb, activeTable] = [], openTab] = useActiveTable();

  const close = useCloseTable();
  const { isSidePanelOpen, setIsSidePanelOpen } =
    useContext(RawExplorerContext);
  return (
    <Tabs>
      {!isSidePanelOpen && (
        <OpenNavTab>
          <Button
            size="small"
            icon="PanelRight"
            onClick={() => setIsSidePanelOpen(true)}
          />
        </OpenNavTab>
      )}
      {list.map(([db, table]) => (
        <Tab
          key={`${db}_${table}`}
          $active={db === activeDb && table === activeTable}
          onMouseDown={(event) => event.button === 1 && close([db, table])}
          onClick={() => {
            openTab([db, table]);
          }}
        >
          <LeftIcon>
            <Icon size={10} type="TableViewSmall" />
          </LeftIcon>

          <TabContent>{table}</TabContent>

          <RightIcon>
            <Tooltip
              content={table}
              delay={300}
              key={`${db}_${table}`}
              placement="bottom"
            >
              <Icon
                size={10}
                type="Close"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  close([db, table]);
                }}
              />
            </Tooltip>
          </RightIcon>
        </Tab>
      ))}
      <FillerTab key="filler-tab" />
    </Tabs>
  );
}
