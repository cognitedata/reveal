/**
 * Event Sidebar Story
 */
import { Meta, Story } from '@storybook/react';
import chartAtom from 'models/chart/atom';
import { RecoilRoot, useRecoilState } from 'recoil';
import { QueryClient, QueryClientProvider } from 'react-query';

import EventSidebar from './EventSidebar';

type Props = React.ComponentProps<typeof EventSidebar>;

const queryClient = new QueryClient();

export default {
  component: EventSidebar,
  title: 'Components/Events/Sidebar',
  decorators: [
    (story) => (
      <QueryClientProvider client={queryClient}>{story()}</QueryClientProvider>
    ),
  ],
} as Meta;

const MockedEventSidebar = (args: any) => {
  const [, setChart] = useRecoilState(chartAtom);
  const handleUpdateChart = () => {
    setChart({
      ...args?.chart,
    });
  };
  return <EventSidebar {...args} updateChart={handleUpdateChart} />;
};

const Template: Story<Props> = (args) => {
  return (
    <div style={{ width: '400px' }}>
      <RecoilRoot>
        <MockedEventSidebar {...args} />
      </RecoilRoot>
    </div>
  );
};

export const All = Template.bind({});

All.args = {
  visible: true,
  onClose: () => {},
  chart: {
    dateFrom: '2022-01-01T07:17:50.435Z',
    userInfo: {
      displayName: 'shekhar.sharma@cognite.com',
      id: 'shekhar.sharma@cognite.com',
      email: 'shekhar.sharma@cognite.com',
    },
    name: 'EventFilters WIP',
    createdAt: 1651580321674,
    settings: {
      showMinMax: false,
      showGridlines: true,
      showYAxis: true,
      mergeUnits: false,
    },
    user: 'shekhar.sharma@cognite.com',
    dateTo: '2022-10-21T10:01:19.817Z',
    updatedAt: 1651753181691,
    id: 'f6280002-ebc7-43f4-9bc5-30bd46b2f758',
    version: 1,
    eventFilters: [
      {
        id: 'ebc7-43f4-9bc5-30bd46b2f758',
        name: `Event Filter Storybook`,
        visible: true,
        filters: {},
      },
    ],
  },
};
