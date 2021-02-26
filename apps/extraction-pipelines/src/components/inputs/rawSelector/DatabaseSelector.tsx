import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { DatabaseWithTablesItem } from './RawSelector';
import { CheckboxLabel } from '../CheckboxWithRef';

export const StyledMenu = styled(Menu)`
  height: 10rem;
  overflow-y: auto;
`;
interface DatabaseSelectorProps {
  databaseList: DatabaseWithTablesItem[];
  search: string;
  selectedDb: string;
  setSelectedDb: (dbName: string) => void;
  anyDbTableSelected: (dbName: string) => boolean;
  handleDatabaseChecked: (item: DatabaseWithTablesItem) => void;
}

export const DatabaseSelector: FunctionComponent<DatabaseSelectorProps> = ({
  databaseList,
  search,
  selectedDb,
  setSelectedDb,
  anyDbTableSelected,
  handleDatabaseChecked,
}: PropsWithChildren<DatabaseSelectorProps>) => {
  const [filteredList, setFilteredList] = useState<DatabaseWithTablesItem[]>(
    databaseList
  );
  useEffect(() => {
    if (databaseList.length > 0) {
      setFilteredList(databaseList);
    }
  }, [databaseList]);
  useEffect(() => {
    if (search !== '') {
      const filtered = databaseList.filter((db) => {
        return db.database.name.toUpperCase().search(search.toUpperCase()) >= 0;
      });
      setFilteredList(filtered);
    } else {
      setFilteredList(databaseList);
    }
  }, [search, databaseList, setFilteredList]);

  const clickMenuItem = (item: DatabaseWithTablesItem) => {
    setSelectedDb(item.database.name);
  };
  return (
    <StyledMenu>
      {filteredList.map((item) => {
        const selected = selectedDb === item.database.name;
        return (
          <Menu.Item
            key={item.database.name}
            onClick={() => clickMenuItem(item)}
            selected={selected}
            aria-selected={selected}
          >
            <CheckboxLabel
              className="cogs-checkbox"
              htmlFor={item.database.name}
            >
              <input
                id={item.database.name}
                className="visible-input"
                type="checkbox"
                checked={anyDbTableSelected(item.database.name)}
                name={item.database.name}
                onChange={() => handleDatabaseChecked(item)}
              />
              <div className="checkbox-ui" />
              {item.database.name}
            </CheckboxLabel>
          </Menu.Item>
        );
      })}
    </StyledMenu>
  );
};
