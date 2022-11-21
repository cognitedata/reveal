/**
 * Toolbar Story
 */
import { Button, Tooltip } from '@cognite/cogs.js';
import { Meta, Story } from '@storybook/react';
import { Toolbar } from './SidebarElements';

type Props = React.ComponentProps<typeof Toolbar>;

export default {
  component: Toolbar,
  title: 'Components/Common/Toolbar',
} as Meta;

const ToolbarWrap = (args: any) => {
  return <Toolbar {...args} />;
};

const Template: Story<Props> = (args) => {
  return (
    <div style={{ width: '400px' }}>
      <ToolbarWrap {...args}>
        <Tooltip content="Threshold" position="left">
          <Button
            icon="Threshold"
            aria-label="Toggle threshold sidebar"
            toggled={false}
            onClick={() => {}}
          />
        </Tooltip>
        <Tooltip content="Events" position="left">
          <Button
            icon="Events"
            aria-label="Toggle events sidebar"
            toggled={false}
            onClick={() => {}}
          />
        </Tooltip>
      </ToolbarWrap>
    </div>
  );
};

export const Default = Template.bind({});

Default.args = {};
