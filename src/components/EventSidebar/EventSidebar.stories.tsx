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

export const Empty = Template.bind({});
export const WithResults = Template.bind({});

Empty.args = {
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
  eventData: [
    {
      id: 'ebc7-43f4-9bc5-30bd46b2f758',
      name: `Event Filter Storybook`,
      visible: true,
      filters: { metadata: {} },
      results: [],
    },
  ],
};

WithResults.args = {
  visible: true,
  onClose: () => {},
  chart: {
    dateFrom: '2022-01-01T07:17:50.435Z',
    userInfo: {
      displayName: 'shekhar.sharma@cognite.com',
      id: 'shekhar.sharma@cognite.com',
      email: 'shekhar.sharma@cognite.com',
    },
    name: 'EventFilters Results',
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
        filters: {
          metadata: {
            type: 'deferment',
          },
        },
      },
    ],
  },
  eventData: [
    {
      id: 'ebc7-43f4-9bc5-30bd46b2f758',
      name: `Event Filter Storybook`,
      visible: true,
      filters: {
        metadata: {
          type: 'deferment',
        },
      },
      results: [
        {
          externalId: 'LOR_ARENDAL_WELL_10_deferment_11',
          startTime: 1652172913766,
          endTime: 1652604913766,
          type: 'deferment',
          subtype: 'future',
          description: 'a deferment for LOR_ARENDAL_WELL_10',
          metadata: {
            ASSOC_GAS: '4143.1247375725',
            NONASSOC_GAS: '',
            GAS_UNIT: 'NM3',
            OIL: '30.79237400462477',
            CONDENSATE: '',
            LIQUID_UNIT: 'TONNES',
            ADD_COMMENT: 'Not prioritised improvement',
            AREA_NAME_ABBREVIATION: 'Other problems',
            COMMENT: 'Not prioritised improvement',
            DEFERMENT_CAUSE: '',
            DEFERMENT_CHOKE: '',
            DEFERMENT_IAP: 'Planned',
            DEFERMENT_ID: '2',
            DEFERMENT_NAME: 'Other problems',
            DEFERMENT_ROOT_CAUSE: '',
            DEFERMENT_SUB_CHOKE: '',
            PRODUCTION_SYSTEM: '',
            SHUT_OFF_REASON: 'Other problems',
            SHUT_OFF_REASON_PLS: 'Not prioritised improvement',
            VERSION_ID: '1',
            asset_external_id: 'LOR_ARENDAL_WELL_10',
          },
          assetIds: [
            5656952197571796, 4034893301625666, 1505848052991708,
            4761999022100126,
          ],
          id: 4291211803154323,
          lastUpdatedTime: new Date(1668589518929),
          createdTime: new Date(1668589518929),
        },
      ],
    },
  ],
};
