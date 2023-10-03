/**
 * Data Profiling Sidebar Story
 */

import { Meta, Story } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot, useRecoilState } from 'recoil';

import chartAtom from '../../models/chart/atom';

import DataProfilingSidebar from './DataProfilingSidebar';

type Props = React.ComponentProps<typeof DataProfilingSidebar>;

const queryClient = new QueryClient();

export default {
  component: DataProfilingSidebar,
  title: 'Components/DataProfiling/Sidebar',
  decorators: [
    (story) => (
      <QueryClientProvider client={queryClient}>{story()}</QueryClientProvider>
    ),
  ],
} as Meta;

const MockedDataProfilingSidebar = (args: any) => {
  const [, setChart] = useRecoilState(chartAtom);
  const handleUpdateChart = () => {
    setChart({
      ...args?.chart,
    });
  };
  return <DataProfilingSidebar {...args} updateChart={handleUpdateChart} />;
};

const Template: Story<Props> = (args) => {
  return (
    <div style={{ width: '400px' }}>
      <RecoilRoot>
        <MockedDataProfilingSidebar {...args} />
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
    name: 'Mahdi Zerara',
    createdAt: 1668088721515,
    user: 'mahdi.zerara@cognite.com',
    dateTo: '2022-10-21T10:01:19.817Z',
    updatedAt: 1651753181691,
    id: '72cafd41-240e-4f48-92dc-74e6549edcb4',
    version: 1,
    sourceCollection: [
      {
        type: 'timeseries',
        id: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
      },
    ],
    timeSeriesCollection: [
      {
        range: [2642.965545350128, 2885.739607911155],
        originalUnit: 'PSI',
        unit: 'c',
        interpolation: 'linear',
        tsExternalId: 'VAL_RESERVOIR_PT_well12',
        tsId: 8697968775845427,
        lineStyle: 'solid',
        type: 'timeseries',
        createdAt: 1651580369616,
        description: 'Reservoir Pressure Well 12',
        id: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
        lineWeight: 1,
        name: 'RESERVOIR_PT_well12',
        displayMode: 'lines',
        preferredUnit: 'f',
        color: '#fa4d56',
        enabled: true,
      },
    ],
  },
};
