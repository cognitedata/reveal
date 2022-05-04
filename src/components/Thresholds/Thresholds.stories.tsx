/**
 * Threshold Item
 */
import { Meta, Story } from '@storybook/react';
import useThresholdsResults from 'hooks/threshold-calculations';
import ThresholdsComponent from './Thresholds';

type Props = React.ComponentProps<typeof ThresholdsComponent>;

export default {
  component: ThresholdsComponent,
  title: 'Components/Thresholds/All',
} as Meta;

const useThresholdsMock: typeof useThresholdsResults = () => ({
  data: {
    error: null,
    results: {
      count: 31,
      cumulative_duration: 112000.0,
      events: [
        {
          start: 1647205254607,
          stop: 1647205257607,
        },
        {
          start: 1647208866663,
          stop: 1647208869663,
        },
        {
          start: 1647256160015,
          stop: 1647256163015,
        },
        {
          start: 1647352862516,
          stop: 1647352866516,
        },
        {
          start: 1647435655171,
          stop: 1647435659171,
        },
        {
          start: 1647500456719,
          stop: 1647500460719,
        },
        {
          start: 1647554475433,
          stop: 1647554479433,
        },
        {
          start: 1647558136420,
          stop: 1647558139420,
        },
        {
          start: 1647565249450,
          stop: 1647565252450,
        },
        {
          start: 1647594055684,
          stop: 1647594059684,
        },
        {
          start: 1647619626294,
          stop: 1647619629294,
        },
        {
          start: 1647640857170,
          stop: 1647640860170,
        },
        {
          start: 1647655275472,
          stop: 1647655279472,
        },
        {
          start: 1647658854202,
          stop: 1647658857202,
        },
        {
          start: 1647662596077,
          stop: 1647662599077,
        },
        {
          start: 1647702398269,
          stop: 1647702403269,
        },
        {
          start: 1647713219562,
          stop: 1647713224562,
        },
        {
          start: 1647748869071,
          stop: 1647748873071,
        },
        {
          start: 1647802844433,
          stop: 1647802849433,
        },
        {
          start: 1647853246973,
          stop: 1647853250973,
        },
        {
          start: 1647871255195,
          stop: 1647871258195,
        },
        {
          start: 1647910858957,
          stop: 1647910862957,
        },
        {
          start: 1647929225681,
          stop: 1647929228681,
        },
        {
          start: 1647932474917,
          stop: 1647932477917,
        },
        {
          start: 1647936055882,
          stop: 1647936059882,
        },
        {
          start: 1647972081767,
          stop: 1647972084767,
        },
        {
          start: 1647975654801,
          stop: 1647975657801,
        },
        {
          start: 1647979270361,
          stop: 1647979275361,
        },
        {
          start: 1648015276375,
          stop: 1648015280375,
        },
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
  return (
    <div style={{ width: '400px' }}>
      <ThresholdsComponent {...args} _useThresholds={useThresholdsMock} />
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
      id: '928db2a5-1528-4503-be37-54722e2173a6',
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
      id: '928db2a5-1528-4503-be37-54722e2173a6-2',
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
  onUpdateThresholdName: () => {},
  onAddThreshold: () => {},
  onTypeChange: () => {},
  onSelectSource: () => {},
};
