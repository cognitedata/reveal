import { Meta } from '@storybook/react';
import { useState } from 'react';
import configureStory from 'storybook/configureStory';
import { ExtendedStory } from 'utils/test/storybook';

import { InternalFilterSettings } from '../types';

import SearchBar from './index';

type Props = React.ComponentProps<typeof SearchBar>;

const meta: Meta<Props> = {
  title: 'Search / Search Bar',
  component: SearchBar,
  argTypes: {},
};

export default meta;

const Template: ExtendedStory<Props> = () => {
  const [filterValue, setFilterValue] = useState<InternalFilterSettings>({
    query: '',
    filters: [],
  });
  return (
    <div>
      <SearchBar
        value={filterValue}
        onChange={setFilterValue}
        selectors={[
          { name: 'STRING', type: 'STRING', field: ['StringField'] },
          { name: 'BOOLEAN', type: 'BOOLEAN', field: ['BooleanField'] },
          { name: 'DATE', type: 'DATE', field: ['Date'] },
          { name: 'METADATA', type: 'METADATA', field: ['metadata'] },
        ]}
      />
      <div>{JSON.stringify(filterValue)}</div>
    </div>
  );
};

export const Standard = Template.bind({});
Standard.story = configureStory({});
