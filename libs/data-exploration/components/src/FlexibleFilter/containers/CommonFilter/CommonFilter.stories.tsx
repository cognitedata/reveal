import { ComponentStory } from '@storybook/react';

import { CommonFilter } from './CommonFilter';
import { Operator } from '../../types';

export default {
  title: 'Components/FlexibleFilter/Containers/CommonFilter',
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
