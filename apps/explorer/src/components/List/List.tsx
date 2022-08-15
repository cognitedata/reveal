import { IconType, Menu } from '@cognite/cogs.js';
import { Scalars } from 'graphql/generated';
import { DATA_TYPES } from 'pages/MapOverlay/MapOverlayRouter';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { searchSectionNameMap } from 'recoil/search/searchFiltersAtom';
import { searchItemFilteredState } from 'recoil/search/searchItemsFilteredState';

import { ListStyles } from './elements';
import { ListItem } from './ListItem';
import { ListLink } from './ListLink';

export interface ListDataPerson {
  externalId: string;
  name: string;
  nodeId: Scalars['Int64'] | null;
  description?: string;
}

export interface ListDataRoom {
  externalId: string;
  name: string;
  nodeId?: Scalars['Int64'];
  equipment?: any[];
  description?: string;
  type?: string;
}

export type ListData = ListDataPerson | ListDataRoom;

export interface Props {
  dropdownStyle?: boolean;
  onClick: () => void;
}

const defaultIcons: Record<string, IconType> = {
  rooms: 'Cube',
  people: 'User',
};

const RegularWrapper: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return <div>{children}</div>;
};

export const List: React.FC<Props> = ({ dropdownStyle, onClick }) => {
  const items = useRecoilValue(searchItemFilteredState);
  const sections = Object.keys(items);
  const numberOfSections = sections.length;

  if (numberOfSections === 0)
    return (
      <Menu>
        <Menu.Item> No items</Menu.Item>
      </Menu>
    );

  const ListWrapper = dropdownStyle ? ListStyles : RegularWrapper;

  return (
    <ListWrapper>
      {sections.map((section, index) => (
        <div key={section}>
          <Menu.Header>{searchSectionNameMap[section]}</Menu.Header>
          {items[section].map((item) => (
            <ListLink
              key={item.externalId}
              id={section === DATA_TYPES.ROOM ? item.nodeId : item.externalId}
              type={section}
            >
              <ListItem
                iconSrc={defaultIcons[section]}
                mainText={item.name}
                subText={item.description ? item.description : ''}
                handleClick={onClick}
              />
            </ListLink>
          ))}
          {index < numberOfSections - 1 && <Menu.Divider />}
        </div>
      ))}
    </ListWrapper>
  );
};
