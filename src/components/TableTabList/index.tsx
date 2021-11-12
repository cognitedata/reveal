import React from 'react';
import {
  useActiveTable,
  useCloseTable,
  useTableTabList,
} from 'hooks/table-tabs';
import { Icon, Tooltip } from '@cognite/cogs.js';
import { TAB_HEIGHT } from 'utils/constants';
import styled from 'styled-components';

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
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-content: center;

  align-self: auto;
  cursor: pointer;
  list-style: none;
  padding: 10px 20px;
  box-sizing: border-box;
  height: ${TAB_HEIGHT}px;
  max-width: 240px;
  min-width: 120px;
  border-right: 1px solid var(--cogs-greyscale-grey3);
  background-color: ${(props) =>
    props.$active ? 'white' : 'var(--cogs-greyscale-grey1)'};
  border-bottom: ${(props) =>
    props.$active ? '' : '1px solid var(--cogs-greyscale-grey3)'};
`;

const LeftIcon = styled(Icon)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-right: 10px;
  color: var(--cogs-green);
  vertical-align: middle;
`;
const RightIcon = styled(Icon)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 10px;
  color: var(--cogs-greyscale-grey6);
  vertical-align: middle;
`;

const TabContent = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  flex-shrink: 1;
`;

const FillerTab = styled(Tab)`
  cursor: unset;
  max-width: unset;
  flex-grow: 1;
  flex-shrink: 1;
`;

export default function TableTabList() {
  const [list = []] = useTableTabList();
  const [[activeDb, activeTable] = [undefined, undefined], setActive] =
    useActiveTable();
  const close = useCloseTable();

  return (
    <Tabs>
      {list.map(([db, table]) => (
        <Tab
          key={`${db}_${table}`}
          $active={db === activeDb && table === activeTable}
          onClick={() => {
            setActive([db, table]);
          }}
        >
          <Tooltip
            content={table}
            delay={300}
            key={`${db}_${table}`}
            placement="bottom-start"
          >
            <LeftIcon size={10} type="Table" />
          </Tooltip>
          <TabContent>{table}</TabContent>

          <RightIcon
            size={10}
            type="Close"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              close([db, table]);
            }}
          />
        </Tab>
      ))}
      <FillerTab key="filler-tab" />
    </Tabs>
  );
}
