/**
 * Calculations component Story
 */

import { Meta, Story } from '@storybook/react';
import { RecoilRoot, useRecoilState } from 'recoil';

import chartAtom from '../../models/chart/atom';

import Calculations from './Calculations';

type Props = React.ComponentProps<typeof Calculations>;

export default {
  component: Calculations,
  title: 'Components/DataProfiling/Calculations',
} as Meta;

const MockedDataProfilingCalculations = (args: any) => {
  const [, setChart] = useRecoilState(chartAtom);
  const handleUpdateChart = () => {
    setChart({
      ...args?.chart,
    });
  };
  return <Calculations {...args} updateChart={handleUpdateChart} />;
};

const Template: Story<Props> = (args) => {
  return (
    <div style={{ width: '400px' }}>
      <RecoilRoot>
        <MockedDataProfilingCalculations {...args} />
      </RecoilRoot>
    </div>
  );
};

export const All = Template.bind({});

All.args = {
  chart: {
    dateFrom: '2021-09-02T07:17:50.435Z',
    userInfo: {
      displayName: 'shekhar.sharma@cognite.com',
      id: 'shekhar.sharma@cognite.com',
      email: 'shekhar.sharma@cognite.com',
    },
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
    name: 'Final Threshold Vodoo',
    sourceCollection: [
      {
        type: 'timeseries',
        id: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
      },
    ],
    createdAt: 1651580321674,
    settings: {
      showMinMax: false,
      showGridlines: true,
      showYAxis: true,
      mergeUnits: false,
    },
    user: 'shekhar.sharma@cognite.com',
    dateTo: '2022-07-05T10:01:19.817Z',
    public: true,
    updatedAt: 1651753181691,
    id: 'f6280002-ebc7-43f4-9bc5-30bd46b2f758',
    thresholdCollection: [],
    workflowCollection: [],
    version: 1,
  },
  source: {
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
};
