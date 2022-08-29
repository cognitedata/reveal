import React from 'react';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { ColumnInstance, TableToggleHideAllColumnProps } from 'react-table';
import styled from 'styled-components';
import { TableData } from './Table';
import { IndeterminateCheckbox } from './IndeterminateCheckbox';

interface ColumnToggleProps<T extends TableData = any> {
  allColumns: ColumnInstance<T>[];
  getToggleHideAllColumnsProps?: (
    props?: Partial<TableToggleHideAllColumnProps>
  ) => TableToggleHideAllColumnProps;
}

export function ColumnToggle<T>(props: ColumnToggleProps<T>) {
  const { allColumns, getToggleHideAllColumnsProps = () => {} } = props;

  return (
    <Dropdown
      content={
        <StyledMenu>
          <Menu.Header>Columns</Menu.Header>
          <Menu.Item>
            <Label>
              <IndeterminateCheckbox {...getToggleHideAllColumnsProps()} />
              Select All
            </Label>
          </Menu.Item>
          {allColumns.map(column => (
            <Menu.Item key={column.id}>
              <Label>
                {/*// TODO: Replace with cogs.js checkbox when bug is fixed  */}
                <input
                  type="checkbox"
                  {...column.getToggleHiddenProps()}
                  className="cogs-checkbox__checkbox"
                />
                {column.Header}
              </Label>
            </Menu.Item>
          ))}
        </StyledMenu>
      }
    >
      <Button icon="SplitView" aria-label="Column Selection" />
    </Dropdown>
  );
}

const StyledMenu = styled(Menu)`
  min-width: 200px;
`;

const Label = styled.label`
  gap: 8px;
  display: flex;
  align-items: center;
  font: inherit;
`;
