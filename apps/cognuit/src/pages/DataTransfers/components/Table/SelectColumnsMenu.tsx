import React from 'react';
import { Checkbox, Menu } from '@cognite/cogs.js';
import config from 'configs/datatransfer.config';
import { DataTransfersTableKeys } from 'pages/DataTransfers/types';
import { getMappedColumnName } from 'utils/columns';

interface Props {
  columnNames: DataTransfersTableKeys[];
  selectedColumnNames: string[];
  onChange: (name: string, nextState: boolean) => void;
}
export const SelectColumnsMenu: React.FC<Props> = ({
  columnNames,
  selectedColumnNames,
  onChange,
}) => (
  <Menu>
    {columnNames.sort().map((name) => {
      if (config.ignoreColumns.includes(name)) {
        return null;
      }
      return (
        <Menu.Item key={name}>
          <Checkbox
            name={name}
            onChange={(nextState: boolean) => onChange(name, nextState)}
            checked={selectedColumnNames.includes(name)}
            disabled={config.mandatoryColumns.includes(name)}
          >
            {name === 'status' ? 'Status' : getMappedColumnName(name)}
          </Checkbox>
        </Menu.Item>
      );
    })}
  </Menu>
);
