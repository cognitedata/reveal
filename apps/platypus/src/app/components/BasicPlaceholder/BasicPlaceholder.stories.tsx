import React from 'react';
import { Story } from '@storybook/react';
import styled from 'styled-components/macro';

import { BasicPlaceholder } from './BasicPlaceholder';

const Wrapper = styled.div`
  padding: 50px;
`;

const BasicPlaceholderTemplate: Story<typeof BasicPlaceholder> = (
  args: any
) => (
  <BasicPlaceholder
    type="Timeseries"
    title="Timeseries is not found."
    size={250}
    {...args}
  />
);

export default {
  title: 'Basic components/BasicPlaceholder',
  component: BasicPlaceholder,
  decorators: [
    (storyFn: () => React.ReactNode) => <Wrapper>{storyFn()}</Wrapper>,
  ],
};

export const BasicPlaceholderComponent = BasicPlaceholderTemplate.bind({});
BasicPlaceholderComponent.storyName = 'Basic Placeholder';
