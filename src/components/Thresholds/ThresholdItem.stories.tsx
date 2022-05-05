/**
 * Threshold Item
 */
import { Meta, Story } from '@storybook/react';
import useThresholdsResults from 'hooks/threshold-calculations';
import ThresholdItem from './ThresholdItem';

type Props = React.ComponentProps<typeof ThresholdItem>;

export default {
  component: ThresholdItem,
  title: 'Components/Thresholds/Item',
} as Meta;

const storyStyles = {
  width: '400px',
  padding: '1rem',
  borderRadius: '0.75rem',
  backgroundColor: '#fafafa',
};

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

const useThresholdsEmptyMock: typeof useThresholdsResults = () => {
  return {
    data: {
      error: null,
      results: {
        count: 0,
        cumulative_duration: 0,
        events: [],
      },
      warnings: null,
    },
  };
};

const DefaultTemplate: Story<Props> = (args) => {
  return (
    <div style={{ ...storyStyles }}>
      <ThresholdItem {...args} _useThresholds={useThresholdsMock} />
    </div>
  );
};

const BetweenTemplate: Story<Props> = (args) => {
  return (
    <div style={{ ...storyStyles }}>
      <ThresholdItem {...args} _useThresholds={useThresholdsEmptyMock} />
    </div>
  );
};

const UnderTemplate: Story<Props> = (args) => {
  return (
    <div style={{ ...storyStyles }}>
      <ThresholdItem {...args} _useThresholds={useThresholdsEmptyMock} />
    </div>
  );
};

const OverTemplate: Story<Props> = (args) => {
  return (
    <div style={{ ...storyStyles }}>
      <ThresholdItem {...args} _useThresholds={useThresholdsEmptyMock} />
    </div>
  );
};

export const Threshold = DefaultTemplate.bind({});
export const Between = BetweenTemplate.bind({});
export const Under = UnderTemplate.bind({});
export const Over = OverTemplate.bind({});

Threshold.args = {
  expandFilters: true,
  sources: [
    {
      type: 'workflow',
      enabled: true,
      unit: '',
      calls: [],
      id: '02d0d6a0-3851-4574-b8a7-1f7f2ee15b59',
      lineWeight: 1,
      range: [10.935424853673801, 11.188267881790496],
      version: 'v2',
      preferredUnit: '',
      createdAt: 1651580391855,
      settings: {
        autoAlign: true,
      },
      color: '#1192e8',
      name: 'Smooth Green',
      lineStyle: 'solid',
    },
    {
      type: 'timeseries',
      range: [1450.5364140834045, 1585.410893283975],
      interpolation: 'linear',
      tsExternalId: 'VAL_RESERVOIR_PT_well12',
      tsId: 8697968775845427,
      lineStyle: 'solid',
      createdAt: 1651580369616,
      description: 'Reservoir Pressure Well 12',
      id: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
      lineWeight: 1,
      name: 'RESERVOIR_PT_well12',
      displayMode: 'lines',
      preferredUnit: 'f',
      originalUnit: 'PSI',
      unit: 'c',
      color: '#fa4d56',
      enabled: true,
    },
  ],
  threshold: {
    id: '928db2a5-1528-4503-be37-54722e2173a6',
    name: 'New threshold',
    sourceId: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
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
  onRemoveThreshold: () => {},
  onToggleThreshold: () => {},
  onSelectSource: () => {},
  onTypeChange: () => {},
  onLowerLimitChange: () => {},
  onUpperLimitChange: () => {},
};

Between.args = {
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
      id: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
      color: '#6929c4',
      lineStyle: 'solid',
      enabled: true,
      tsExternalId: 'LOR_ARENDAL_WELL_01_PRESSURE_MEASUREMENT_4',
      range: [7.498322697290687, 18.224716505618417],
      originalUnit: '*',
      createdAt: 1647255972898,
    },
    {
      type: 'workflow',
      enabled: true,
      unit: '',
      calls: [],
      id: '02d0d6a0-3851-4574-b8a7-1f7f2ee15b59',
      lineWeight: 1,
      range: [10.935424853673801, 11.188267881790496],
      version: 'v2',
      preferredUnit: '',
      createdAt: 1651580391855,
      settings: {
        autoAlign: true,
      },
      color: '#1192e8',
      name: 'Smooth Green',
      lineStyle: 'solid',
    },
  ],
  threshold: {
    id: '928db2a5-1528-4503-be37-54722e2173a6',
    sourceId: '02d0d6a0-3851-4574-b8a7-1f7f2ee15b59',
    name: 'New threshold 1',
    type: 'between',
    filter: {
      minUnit: 'seconds',
      maxUnit: 'hours',
    },
    visible: false,
  },
  onRemoveThreshold: () => {},
  onToggleThreshold: () => {},
  onSelectSource: () => {},
  onTypeChange: () => {},
  onLowerLimitChange: () => {},
  onUpperLimitChange: () => {},
};

Under.args = {
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
      id: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
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
  threshold: {
    id: '928db2a5-1528-4503-be37-54722e2173s6',
    name: 'New threshold 1',
    type: 'under',
    filter: {
      minUnit: 'seconds',
      maxUnit: 'hours',
    },
    visible: false,
  },
  onRemoveThreshold: () => {},
  onToggleThreshold: () => {},
  onSelectSource: () => {},
  onTypeChange: () => {},
  onLowerLimitChange: () => {},
  onUpperLimitChange: () => {},
};

Over.args = {
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
      id: '512169ce-2782-4b97-a13e-e4c8eb0c0e01',
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
  threshold: {
    id: '928db2a5-1528-4503-be37-54722e2173f6',
    name: 'New threshold 1',
    type: 'over',
    filter: {
      minUnit: 'seconds',
      maxUnit: 'hours',
    },
    visible: false,
  },
  onRemoveThreshold: () => {},
  onToggleThreshold: () => {},
  onSelectSource: () => {},
  onTypeChange: () => {},
  onLowerLimitChange: () => {},
  onUpperLimitChange: () => {},
};
