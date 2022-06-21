import { IconType } from '@cognite/cogs.js';
import React from 'react';

import { ListStyles, SectionWrapper, SectionTitle } from './elements';
import { ListItem } from './ListItem';

export interface ListData {
  id: string;
  name: string;
  iconSrc?: IconType;
  description?: string;
}

export interface Props {
  items: Record<string, NonEmptyArr<ListData>>;
}

const defaultIcons: Record<string, IconType> = {
  rooms: 'Cube',
  people: 'User',
};

export const List: React.FC<Props> = ({ items }) => {
  const sections = Object.keys(items);
  return (
    <ListStyles>
      {sections.map((section) => (
        <SectionWrapper key={section}>
          <SectionTitle level={2}>{section}</SectionTitle>
          {items[section].map((item) => (
            <ListItem
              key={item.id}
              iconSrc={item.iconSrc ? item.iconSrc : defaultIcons[section]}
              mainText={item.name}
              subText={item.description ? item.description : ''}
            />
          ))}
        </SectionWrapper>
      ))}
    </ListStyles>
  );
};
