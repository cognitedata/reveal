import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { Checkbox, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import { DatabaseWithTablesItem } from 'components/inputs/rawSelector/RawSelector';

export const StyledMenu = styled(Menu)`
  height: 10rem;
  overflow-y: auto;
  label.cogs-checkbox {
    width: fit-content;
    margin-bottom: 0;
  }
  .cogs-menu-item {
    margin-bottom: 0.1rem;
  }
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
    []
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
            <Checkbox
              name={item.database.name}
              checked={anyDbTableSelected(item.database.name)}
              onChange={() => handleDatabaseChecked(item)}
            >
              {item.database.name}
            </Checkbox>
          </Menu.Item>
        );
      })}
    </StyledMenu>
  );
};
