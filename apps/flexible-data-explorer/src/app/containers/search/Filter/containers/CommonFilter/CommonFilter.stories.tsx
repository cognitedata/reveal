import { ComponentStory } from '@storybook/react';

import { Operator } from '../../types';
import { CommonFilter } from './CommonFilter';

export default {
  title:
    'FlexibleDataExplorer/Containers/Search/Filter/Containers/CommonFilter',
  component: CommonFilter,
};

export const Example: ComponentStory<typeof CommonFilter> = (args) => (
  <CommonFilter {...args} />
);
Example.args = {
  config: {
    [Operator.STARTS_WITH]: 'string',
    [Operator.EQUALS]: 'number',
    [Operator.BETWEEN]: 'numeric-range',
    [Operator.ON]: 'date',
    [Operator.NOT_BETWEEN]: 'date-range',
    [Operator.IS_TRUE]: 'boolean',
    [Operator.IS_SET]: 'no-input',
  },
  name: 'Filter name',
};
