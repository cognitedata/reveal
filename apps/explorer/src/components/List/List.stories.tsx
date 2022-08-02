import { withKnobs } from '@storybook/addon-knobs';

import { ListItem as ListItemComponent, ListItemProps } from './ListItem';
import { List as ListComponent } from './List';
import { ListProps } from '.';

export default {
  title: 'List',
  decorators: [withKnobs],
};

const ListItemStory = ({
  mainText,
  subText,
  selected,
  handleClick,
}: ListItemProps) => (
  <ListItemComponent
    iconSrc="Boards"
    mainText={mainText}
    subText={subText}
    selected={selected}
    handleClick={handleClick}
  />
);

export const ListItem = ListItemStory.bind({});
ListItem.args = {
  mainText: 'Test',
  subText: 'Test2',
  selected: false,
  handleClick: () => {
    // eslint-disable-next-line no-alert
    alert('clicked!');
  },
};

const ListStory = ({ items }: ListProps) => (
  <ListComponent items={items} onClick={() => null} />
);

export const List = ListStory.bind({});
List.args = {
  items: {
    section: [
      {
        externalId: 'id-1',
        name: 'Very cool item',
        description: 'Not a hot item',
        iconSrc: '',
        nodeId: 123,
      },
    ],
    food: [
      {
        externalId: 'id-2',
        name: 'Ramen',
        description: 'A type of noodle',
        iconSrc: 'CubeBottom',
        nodeId: 125,
      },
    ],
  },
};
