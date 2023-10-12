import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { getTime } from 'date-fns/esm';

import { SimulatorInstance } from '@cognite/simconfig-api-sdk/rtk';

import { HEARTBEAT_TIMEOUT_SECONDS } from './constants';
import { SimulatorStatusLabel } from './SimulatorStatusLabel';

const meta: Meta<typeof SimulatorStatusLabel> = {
  component: SimulatorStatusLabel,
};
export default meta;

type Story = StoryObj<typeof SimulatorStatusLabel>;

// set a heartbeat to now for the available state
const availableHeartbeat = getTime(new Date());

// set a heartbeat to now minus the timeout for the unavailable state
const unavailableHeartbeat = getTime(
  new Date(Date.now() - HEARTBEAT_TIMEOUT_SECONDS)
);

const simulator: SimulatorInstance = {
  dataSetName: 'PROSPER',
  dataSetWriteProtected: false,
  dataSetId: 4390898792238806,
  heartbeat: availableHeartbeat,
  connectorVersion: '1.0.5',
  simulatorVersion: '1.0.0',
  licenseLastCheckedTime: 0,
  licenseStatus: 'License check is disabled',
  connectorStatus: 'NONE_REPORTED',
  connectorStatusUpdatedTime: 0,
  connectorName: 'charts-demo',
  simulator: 'PROSPER',
};

export const Main: Story = {
  args: {
    simulator,
    isMain: true,
    onMenuBar: true,
    title: 'PROSPER',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('PROSPER')).toBeTruthy();
  },
};

export const NotMain: Story = {
  args: {
    simulator,
    isMain: false,
    onMenuBar: true,
    title: 'PROSPER',
  },
};

export const NotOnMenuBar: Story = {
  args: {
    simulator,
    isMain: true,
    onMenuBar: false,
    title: 'PROSPER',
  },
};

export const SimulatorNotAvailableOnMenuBar: Story = {
  args: {
    simulator: {
      ...simulator,
      heartbeat: unavailableHeartbeat,
    },
    isMain: true,
    onMenuBar: true,
    title: 'PROSPER',
  },
};

export const SimulatorNotAvailableNotOnMenuBar: Story = {
  args: {
    simulator: {
      ...simulator,
      heartbeat: unavailableHeartbeat,
    },
    isMain: true,
    onMenuBar: false,
    title: 'PROSPER',
  },
};

export const LicenseNotAvailableOnMenuBar: Story = {
  args: {
    simulator: {
      ...simulator,
      licenseStatus: 'Not available',
    },
    isMain: true,
    onMenuBar: true,
    title: 'PROSPER',
  },
};

export const LicenseNotAvailableNotOnMenuBar: Story = {
  args: {
    simulator: {
      ...simulator,
      licenseStatus: 'Not available',
    },
    isMain: true,
    onMenuBar: false,
    title: 'PROSPER',
  },
};

export const RunningTask: Story = {
  args: {
    simulator: {
      ...simulator,
      connectorStatus: 'RUNNING_CALCULATION',
    },
    isMain: true,
    onMenuBar: true,
    title: 'PROSPER',
  },
};
