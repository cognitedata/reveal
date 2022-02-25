import { Meta } from '@storybook/react';
import { useState } from 'react';
import configureStory from 'storybook/configureStory';
import { ExtendedStory } from 'utils/test/storybook';

import { SearchFilter } from '../types';

import FilterSelector from './index';

type Props = React.ComponentProps<typeof FilterSelector>;

const meta: Meta<Props> = {
  title: 'Search / Filter Selector',
  component: FilterSelector,
  argTypes: {},
};

export default meta;

const Template: ExtendedStory<Props> = () => {
  const [filterValue, setFilterValue] = useState<SearchFilter[]>([]);
  return (
    <div>
      <FilterSelector
        filters={filterValue}
        onFiltersChange={setFilterValue}
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
