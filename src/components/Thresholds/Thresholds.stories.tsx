/**
 * Threshold Item
 */
import { Meta, Story } from '@storybook/react';
import { useArgs } from '@storybook/client-api';
import useThresholdsResults from 'hooks/threshold-calculations';
import { ChartThreshold } from 'models/charts/charts/types/types';
import { v4 as uuidv4 } from 'uuid';
import ThresholdsComponent from './Thresholds';

type Props = React.ComponentProps<typeof ThresholdsComponent>;

export default {
  component: ThresholdsComponent,
  title: 'Components/Thresholds/Collapse',
} as Meta;

const useThresholdsMock: typeof useThresholdsResults = () => ({
  data: {
    error: null,
    results: {
      count: 2,
      cumulative_duration: 112000.0,
      events: [
        {
          start: 1648022458569,
          stop: 1648022461569,
        },
        {
          start: 1648051601041,
          stop: 1648051604041,
        },
      ],
    },
    warnings: null,
  },
});

const Template: Story<Props> = (args) => {
  const [_, updateArgs] = useArgs();

  const handleAddThreshold = () => {
    const emptyThreshold: ChartThreshold = {
      id: uuidv4(),
      name: 'New threshold',
      type: 'under',
      visible: true,
      filter: {
        minUnit: 'seconds',
        maxUnit: 'hours',
      },
    };

    updateArgs({
      ...args,
      thresholds: [emptyThreshold, ...args.thresholds],
    });
  };

  const handleUpdateName = (id: string, name: string) => {
    updateArgs({
      ...args,
      thresholds: args.thresholds.map((th: { id: string; name: string }) => {
        if (th.id === id) {
          th.name = name;
        }
        return th;
      }),
    });
  };

  return (
    <div style={{ width: '400px' }}>
      <ThresholdsComponent
        {...args}
        _useThresholds={useThresholdsMock}
        onAddThreshold={handleAddThreshold}
        onUpdateThresholdName={handleUpdateName}
      />
    </div>
  );
};

export const All = Template.bind({});

All.args = {
  sources: [
    {
      type: 'timeseries',
      statisticsCalls: [
        {
          callDate: 1648118093045,
          callId: '5285ce22-0d38-475b-91c2-073c218f078e',
          hash: -534872150,
        },
      ],
      description: '-',
      lineWeight: 1,
      tsId: 4264725416439334,
      name: 'Pressure 4',
      preferredUnit: 'psi',
      displayMode: 'lines',
      unit: 'psi',
      id: 'oEymyO7nSTTZ0iVo31OgK',
      color: '#6929c4',
      lineStyle: 'solid',
      enabled: true,
      tsExternalId: 'LOR_ARENDAL_WELL_01_PRESSURE_MEASUREMENT_4',
      range: [7.498322697290687, 18.224716505618417],
      originalUnit: '*',
      createdAt: 1647255972898,
    },
    {
      type: 'timeseries',
      name: 'Pressure 2',
      id: 's61u4QKmDnhSetdLbLi94',
      color: '#1192e8',
      lineWeight: 1,
      tsExternalId: 'LOR_ARENDAL_WELL_01_PRESSURE_MEASUREMENT_2',
      unit: '*',
      enabled: true,
      preferredUnit: '*',
      statisticsCalls: [
        {
          callDate: 1648118094881,
          callId: 'bd1995a8-7d89-4e5b-88ef-c011fd953812',
          hash: -534874072,
        },
      ],
      description: '-',
      tsId: 5751619428826040,
      originalUnit: '*',
      displayMode: 'lines',
      range: [-60.28450732756954, 10.163939922779289],
      lineStyle: 'solid',
      createdAt: 1647255972898,
    },
  ],
  thresholds: [
    {
      id: '128db2a5-1528-4503-be37-54722e2173a6',
      name: 'New threshold',
      sourceId: 'oEymyO7nSTTZ0iVo31OgK', // timeseridID || workflowID
      type: 'between',
      lowerLimit: 1,
      upperLimit: 2,
      filter: {
        minValue: 10,
        maxValue: 1000,
        minUnit: 'seconds',
        maxUnit: 'hours',
      },
      visible: true,
    },
    {
      id: '228db2a5-1528-4503-be37-54722e2173a6-2',
      name: 'New threshold',
      sourceId: 's61u4QKmDnhSetdLbLi94', // timeseridID || workflowID
      type: 'between',
      lowerLimit: 3,
      upperLimit: 4,
      filter: {
        minValue: 20,
        maxValue: 2000,
        minUnit: 'seconds',
        maxUnit: 'hours',
      },
      visible: true,
    },
  ],
  onRemoveThreshold: () => {},
  onToggleThreshold: () => {},
  onLowerLimitChange: () => {},
  onUpperLimitChange: () => {},
  onEventFilterChange: () => {},
  onTypeChange: () => {},
  onSelectSource: () => {},
};
