import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { OpenInFusion } from 'components/OpenInFusion/OpenInFusion';
import { authDecorator, reactQueryDecorator } from 'utils/test/storyDecorators';

export default {
  component: OpenInFusion,
  title: 'Components/Open in Fusion Button',
  decorators: [reactQueryDecorator],
} as Meta;

const Template: Story<ComponentProps<typeof OpenInFusion>> = (args) => (
  <OpenInFusion {...args} />
);

export const OnlyID = Template.bind({});
OnlyID.args = {
  cdfId: 12345,
};
OnlyID.decorators = [authDecorator()];

export const ExternalId = Template.bind({});
ExternalId.args = {
  externalId: 'someexternalid',
};
ExternalId.decorators = [authDecorator()];

export const Loading = Template.bind({});
Loading.decorators = [authDecorator('test-loading')];
