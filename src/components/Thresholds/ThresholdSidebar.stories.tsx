/**
 * Threshold Sidebar
 */
import { Meta, Story } from '@storybook/react';
import useThresholdsResults from 'hooks/threshold-calculations';
import chartAtom from 'models/chart/atom';
import { RecoilRoot, useRecoilState } from 'recoil';
import ThresholdSidebar from './ThresholdSidebar';

type Props = React.ComponentProps<typeof ThresholdSidebar>;

export default {
  component: ThresholdSidebar,
  title: 'Components/Thresholds/Sidebar',
} as Meta;

const useThresholdsMock: typeof useThresholdsResults = () => {
  return {
    data: {
      error: null,
      results: {
        count: 2,
        cumulative_duration: 112000.0,
        events: [
          {
            start: 1647205254607,
            stop: 1647205257607,
          },
          {
            start: 1648051601041,
            stop: 1648051604041,
          },
        ],
      },
      warnings: null,
    },
  };
};

const MockedThresholdSidebar = (args: any) => {
  const [, setChart] = useRecoilState(chartAtom);
  const handleUpdateChart = () => {
    setChart({
      ...args?.chart,
    });
  };

  return (
    <ThresholdSidebar
      {...args}
      updateChart={handleUpdateChart}
      _useThresholds={useThresholdsMock}
    />
  );
};

const Template: Story<Props> = (args) => {
  return (
    <div style={{ width: '400px' }}>
      <RecoilRoot>
        <MockedThresholdSidebar {...args} />
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
        type: 'workflow',
        id: '02d0d6a0-3851-4574-b8a7-1f7f2ee15b59',
      },
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
    thresholdCollection: [
      {
        type: 'between',
        lowerLimit: 1,
        id: 'be46b5f4-d866-4074-922c-da6e5f710112',
        visible: true,
        name: 'New threshold ',
        upperLimit: 2,
        filter: {
          maxUnit: 'hours',
          minUnit: 'seconds',
        },
        sourceId: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
        calls: [
          {
            callDate: 1651759971230,
            callId: '6e6b2d74-aa39-418e-a1ca-e723deeb6854',
            hash: -1612920375,
          },
        ],
      },
      {
        filter: {
          minValue: 100,
          maxValue: 91,
          minUnit: 'seconds',
          maxUnit: 'hours',
        },
        id: '52c1808d-76f2-4e2e-8a14-e25f4f5dd3a1',
        lowerLimit: 1510,
        visible: false,
        calls: [
          {
            callId: 'e46f85ef-5af4-4951-9db4-a441b45f3a4e',
            callDate: 1651668838322,
            hash: -1883862181,
          },
        ],
        name: 'New threshold ',
        upperLimit: 1530,
        type: 'between',
        sourceId: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
      },
    ],
    workflowCollection: [
      {
        enabled: true,
        flow: {
          elements: [
            {
              id: '0506c681-00b6-4894-8fe0-54d7a6f4f35f',
              position: {
                y: 107,
                x: 1069,
              },
              type: 'CalculationOutput',
            },
            {
              id: 'b76fe62b-1874-4f28-a7f9-164de82ff310',
              data: {
                type: 'timeseries',
                selectedSourceId: 'fe1d9ab0-26f1-42a7-9f79-e75b11a0a715',
              },
              type: 'CalculationInput',
              position: {
                y: 93.00608351714595,
                x: 112.60369398053646,
              },
            },
            {
              data: {
                selectedOperation: {
                  version: '1.0',
                  op: 'wavelet_filter',
                },
                parameterValues: {
                  level: 35,
                  wavelet: 'db6',
                },
              },
              type: 'ToolboxFunction',
              id: '87c997ff-cae5-4278-8cdf-e282d8b1cd31',
              position: {
                y: 66.00608351714595,
                x: 603.6036939805365,
              },
            },
            {
              source: '87c997ff-cae5-4278-8cdf-e282d8b1cd31',
              id: 'reactflow__edge-87c997ff-cae5-4278-8cdf-e282d8b1cd31out-result-0-0506c681-00b6-4894-8fe0-54d7a6f4f35fdatapoints',
              targetHandle: 'datapoints',
              sourceHandle: 'out-result-0',
              target: '0506c681-00b6-4894-8fe0-54d7a6f4f35f',
            },
            {
              id: 'reactflow__edge-b76fe62b-1874-4f28-a7f9-164de82ff310result-87c997ff-cae5-4278-8cdf-e282d8b1cd31data',
              source: 'b76fe62b-1874-4f28-a7f9-164de82ff310',
              sourceHandle: 'result',
              targetHandle: 'data',
              target: '87c997ff-cae5-4278-8cdf-e282d8b1cd31',
            },
          ],
          zoom: 1.184271611853635,
          position: [-101.13099564640527, 58.32911560974496],
        },
        unit: '',
        calls: [],
        id: '02d0d6a0-3851-4574-b8a7-1f7f2ee15b59',
        lineWeight: 1,
        range: [10.935424853673801, 11.188267881790496],
        version: 'v2',
        preferredUnit: '',
        createdAt: 1651580391855,
        type: 'workflow',
        settings: {
          autoAlign: true,
        },
        color: '#1192e8',
        name: 'Smooth Green',
        lineStyle: 'solid',
      },
    ],
    version: 1,
  },
  visible: true,
  onClose: () => {},
};
