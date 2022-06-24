import { IconType } from '@cognite/cogs.js';
import React from 'react';
import { Link } from 'react-router-dom';

import { ListStyles, SectionWrapper, SectionTitle } from './elements';
import { ListItem } from './ListItem';

export interface ListData {
  id: string;
  name: string;
  iconSrc?: IconType;
  description?: string;
  handleClick?: () => void;
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
            <Link key={item.name} to={`/home?toType=${section}&to=${item.id}`}>
              <ListItem
                iconSrc={item.iconSrc ? item.iconSrc : defaultIcons[section]}
                mainText={item.name}
                subText={item.description ? item.description : ''}
                handleClick={item.handleClick}
              />
            </Link>
          ))}
        </SectionWrapper>
      ))}
    </ListStyles>
  );
};
