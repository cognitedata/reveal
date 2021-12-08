import React from 'react';
import { Story } from '@storybook/react';
import styled from 'styled-components/macro';

import { InfoMessage } from './InfoMessage';

const Wrapper = styled.div`
  padding: 50px;
`;

const InfoMessageTemplate: Story<typeof InfoMessage> = (args: any) => (
  <InfoMessage
    type="Timeseries"
    title="Timeserie is not found."
    size={250}
    {...args}
  />
);

export default {
  title: 'Platypus',
  component: InfoMessage,
  decorators: [
    (storyFn: () => React.ReactNode) => <Wrapper>{storyFn()}</Wrapper>,
  ],
};

export const InfoMessageComponent = InfoMessageTemplate.bind({});
InfoMessageComponent.storyName = 'Info message';
