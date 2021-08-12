import React from 'react';
import { Checkbox, Menu } from '@cognite/cogs.js';
import config from 'configs/datatransfer.config';
import { getMappedColumnName } from 'utils/columns';
import { MappedColumnNames } from 'pages/DataTransfers/types';
import isArray from 'lodash/isArray';

interface Props {
  columnNames: MappedColumnNames[];
  selectedColumnNames: string[];
  onChange: (name: string, nextState: boolean) => void;
}

export const SelectColumnsMenu: React.FC<Props> = ({
  columnNames,
  selectedColumnNames,
  onChange,
}) => {
  const renderMenuItem = (name: string, parent?: string) => {
    const key = parent ? `${parent}.${name}` : name;

    if (config.ignoreColumns.includes(key)) {
      return null;
    }

    return (
      <Menu.Item key={key}>
        <Checkbox
          name={key}
          onChange={(nextState: boolean) => onChange(key, nextState)}
          checked={selectedColumnNames.includes(key)}
          disabled={config.mandatoryColumns.includes(key)}
        >
          {name === 'status' ? 'Status' : getMappedColumnName(name)}
        </Checkbox>
      </Menu.Item>
    );
  };

  return (
    <Menu>
      {columnNames.map(({ name, parent }) => {
        if (isArray(name)) {
          return (
            <React.Fragment key={parent}>
              <Menu.Header>{parent}</Menu.Header>
              {name.map((item) => {
                return renderMenuItem(item, parent);
              })}
              <Menu.Divider />
            </React.Fragment>
          );
        }

        return renderMenuItem(name);
      })}
    </Menu>
  );
};
