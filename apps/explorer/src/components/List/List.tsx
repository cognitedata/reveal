import { IconType } from '@cognite/cogs.js';
import { Scalars } from 'graphql/generated';
import { DATA_TYPES } from 'pages/MapOverlay/MapOverlayRouter';
import React from 'react';

import { ListStyles, SectionWrapper, SectionTitle } from './elements';
import { ListItem } from './ListItem';
import { ListLink } from './ListLink';

export interface ListData {
  externalId: string;
  name: string;
  iconSrc?: IconType;
  nodeId: Scalars['Int64'];
  description?: string;
}

export interface Props {
  items: Record<string, NonEmptyArr<ListData>>;
  onClick: () => void;
}

const defaultIcons: Record<string, IconType> = {
  rooms: 'Cube',
  people: 'User',
};

export const List: React.FC<Props> = ({ items, onClick }) => {
  const sections = Object.keys(items);

  return (
    <ListStyles>
      {sections.map((section) => (
        <SectionWrapper key={section}>
          <SectionTitle level={2}>{section}</SectionTitle>
          {items[section].map((item) => (
            <ListLink
              key={item.externalId}
              id={section === DATA_TYPES.ROOM ? item.nodeId : item.externalId}
              type={section}
            >
              <ListItem
                iconSrc={item.iconSrc ? item.iconSrc : defaultIcons[section]}
                mainText={item.name}
                subText={item.description ? item.description : ''}
                handleClick={onClick}
              />
            </ListLink>
          ))}
        </SectionWrapper>
      ))}
    </ListStyles>
  );
};
