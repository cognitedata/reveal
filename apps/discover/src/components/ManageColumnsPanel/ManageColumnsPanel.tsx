import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import * as Popper from '@popperjs/core';
import { TS_FIX_ME } from 'core';

import { Button, Checkbox, Dropdown, Menu, Tooltip } from '@cognite/cogs.js';

import { FlexColumn } from 'styles/layout';

import { DROPDOWN_HEADER, TOOLTIP_TEXT } from './constants';
import { CustomMenu, InputContainer } from './elements';

export interface SimpleColumn {
  field: string | number;
  name: string;
  selected?: boolean;
  disabled?: boolean;
  item?: any;
  indeterminate?: boolean;
}

export interface GroupedColumn {
  label: string;
  columns: SimpleColumn[];
}

type ComplexColumns = SimpleColumn[] | GroupedColumn[];

export interface Props {
  /** Optional, used to customize the button to open the dialog. */
  //   children: PropTypes.node,
  /** An array of selectable options (NB: when using standard render, the objects needs to include a selected field.) */
  columns: ComplexColumns;
  /** This functions handles the single select click */
  handleColumnSelection: (column: TS_FIX_ME) => void;
  /** If columns are grouped(Using GroupedColumn structure) or not(Using SimpleColumn structure)  */
  groupedColumns?: boolean;
  includeSearchInput?: boolean;
  searchInputChange?: (value: string) => void;
  customRenderDropDown?: JSX.Element;
  placement?: Popper.Placement;
  visibility?: boolean;
  onVisibilityToggle?: (val: boolean) => void;
}
const ManageColumnsPanel: React.FC<Props> = ({
  columns = [],
  handleColumnSelection,
  groupedColumns = false,
  includeSearchInput = false,
  searchInputChange,
  customRenderDropDown,
  placement = 'bottom-end',
  visibility = false,
  onVisibilityToggle,
}) => {
  const { t } = useTranslation();

  const [searchValue, setSearchValue] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(visibility);

  useEffect(() => setVisible(visibility), [visibility]);

  const clearable = useMemo(() => {
    return {
      labelText: 'Search',
      callback: () => {
        setSearchValue('');
        if (searchInputChange) searchInputChange('');
      },
    };
  }, [searchValue]);

  const handleOnChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (searchInputChange) searchInputChange(e.target.value);
  };

  const renderCheckboxes = (simpleColumns: SimpleColumn[]) => {
    return simpleColumns.map((item) => {
      return (
        <Menu.Item key={item.field}>
          <Checkbox
            checked={item.selected}
            disabled={item.disabled || false}
            onChange={() => handleColumnSelection(item)}
            name={item.name}
            indeterminate={item.indeterminate}
          >
            <div className="item-name">{item.name} </div>
          </Checkbox>
        </Menu.Item>
      );
    });
  };

  const getKey = (label: string, index: number) => `checkbox_${label}_${index}`;
  const renderGroupedCheckboxes = (complexColumns: GroupedColumn[]) => {
    return complexColumns.map((item: GroupedColumn, index: number) => (
      <FlexColumn title="flex-menu-container" key={getKey(item.label, index)}>
        {index !== 0 && <Menu.Divider />}
        {item.label && <Menu.Header>{item.label}</Menu.Header>}
        {renderCheckboxes(item.columns)}
      </FlexColumn>
    ));
  };

  const MenuContent = React.useMemo(
    () => (
      <CustomMenu data-testid="columns-panel-open">
        {includeSearchInput && (
          <InputContainer
            data-testid="dropdown-search-input"
            key="search input"
            placeholder="Search"
            onChange={handleOnChanged}
            clearable={clearable}
            value={searchValue}
            variant="noBorder"
            icon="Search"
            iconPlacement="left"
          />
        )}
        <Menu.Header>{DROPDOWN_HEADER}</Menu.Header>
        {groupedColumns
          ? renderGroupedCheckboxes(columns as GroupedColumn[])
          : renderCheckboxes(columns as SimpleColumn[])}
      </CustomMenu>
    ),
    [groupedColumns, columns]
  );

  const renderDropDown = React.useMemo(
    () => (
      <Tooltip placement="bottom" content={t(TOOLTIP_TEXT)}>
        <Button
          icon="Columns"
          aria-label="Column setting"
          data-testid="organize-columns"
          onClick={() => {
            setVisible((current) => !current);
            if (onVisibilityToggle) onVisibilityToggle(!visible);
          }}
        />
      </Tooltip>
    ),
    []
  );

  return (
    <Dropdown
      content={MenuContent}
      placement={placement}
      appendTo={document.body}
      visible={visible}
      onClickOutside={() => {
        setVisible(false);
        if (onVisibilityToggle) onVisibilityToggle(false);
      }}
    >
      {customRenderDropDown || renderDropDown}
    </Dropdown>
  );
};

export default ManageColumnsPanel;
