import { Icon, Title, TopBar } from '@cognite/cogs.js';
import { Meta, Story } from '@storybook/react';
import EditableText from 'components/EditableText/EditableText';
import dayjs from 'dayjs';
import React from 'react';
import AppBar from './AppBar';
import AppBarLeft from './AppBarLeft';
import AppBarRight from './AppBarRight';

type Props = React.ComponentProps<typeof AppBar>;

export default {
  component: AppBar,
  title: 'Components/App Bar',
  argTypes: {
    onLogoClick: { action: 'Clicked on the logo' },
    onFeedbackClick: { action: 'Clicked on the feedback button' },
    onProfileClick: { action: 'Clicked on the profile link' },
    onLogoutClick: { action: 'Clicked to logout' },
  },
} as Meta;

const Template: Story<Props> = (args) => <AppBar {...args} />;

export const Default = Template.bind({});

Default.args = {
  userName: 'Rhuan Barreto',
};

export const UsageWithPortals = () => {
  return (
    <>
      <AppBar
        onLogoClick={() => {}}
        onFeedbackClick={() => {}}
        onLogoutClick={() => {}}
        onProfileClick={() => {}}
        userName="Rhuan Barreto"
      />
      <AppBarLeft>
        <div className="downloadChartHide">
          <TopBar.Action text="← All charts" />
        </div>
        <div className="cogs-topbar--item" style={{ paddingLeft: 16 }}>
          <Title level={4}>
            <EditableText value="Chart Name" onChange={() => {}} />
          </Title>
        </div>
      </AppBarLeft>
      <AppBarRight>
        <div
          className="cogs-topbar--item"
          style={{
            borderLeft: 'none',
            color: 'var(--cogs-greyscale-grey6)',
            whiteSpace: 'nowrap',
            marginRight: 17,
          }}
        >
          {dayjs('2022-12-22T10:00:00Z').format('MMMM D, YYYY')} · John Doe
        </div>
        <TopBar.Actions
          className="downloadChartHide"
          actions={[
            {
              key: 'help',
              name: 'Help',
              component: (
                <span className="downloadChartHide">
                  <Icon type="Help" />
                </span>
              ),
            },
          ]}
        />
      </AppBarRight>
    </>
  );
};
