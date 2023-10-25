import React, { useEffect } from 'react';
import { ReactLocation, Router } from 'react-location';
import { Provider as ReduxProvider } from 'react-redux';

import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { rest } from 'msw';

import { api } from '@cognite/simconfig-api-sdk/rtk';

import { store } from '../../store';
import { useAppDispatch } from '../../store/hooks';

import { SimulatorStatus } from './SimulatorStatus';

const meta: Meta<typeof SimulatorStatus> = {
  component: SimulatorStatus,
  decorators: [
    (Story) => {
      /*
      this needs to be a separate decorator from the one that renders ReduxProvider in
      order to use useAppDispatch
      */
      const dispatch = useAppDispatch();

      useEffect(() => {
        return () => {
          /*
          we need to reset the RTK Query cache after each story unloads, otherwise
          clicking a new story will reuse the cache from the previous story and not load
          fresh data, thereby making tests fail
          */
          dispatch(api.util.resetApiState());
        };
      }, [dispatch]);

      return <Story />;
    },
    (Story) => {
      const location = new ReactLocation();

      return (
        <ReduxProvider store={store}>
          <Router basepath="/" location={location} routes={[]}>
            <Story />
          </Router>
        </ReduxProvider>
      );
    },
  ],
};
export default meta;

type Story = StoryObj<typeof SimulatorStatus>;

export const HasConnectors: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: /Add connector/i })
    ).toBeInTheDocument();

    await expect(
      canvas.queryByRole('button', {
        name: /Show additional simulators/i,
      })
    ).not.toBeInTheDocument();
  },
  parameters: {
    msw: {
      handlers: [
        rest.get('*/simconfig/v2/simulators', (req, res, ctx) => {
          return res(
            ctx.json({
              simulators: [
                {
                  dataSetName: 'PetroSim',
                  dataSetWriteProtected: false,
                  dataSetId: 841335569281748,
                  heartbeat: 1698049159451,
                  connectorVersion: 'PetrosimConnector-1.0.0-alpha-005',
                  simulatorVersion: 'Petro-SIM v7.3',
                  licenseLastCheckedTime: 0,
                  licenseStatus: 'License check disabled',
                  connectorStatus: 'NONE_REPORTED',
                  connectorStatusUpdatedTime: 0,
                  connectorName: 'simint-petrosim',
                  simulator: 'PetroSIM',
                },
                {
                  dataSetName: 'SymmetryData',
                  dataSetWriteProtected: false,
                  dataSetId: 2408940221847413,
                  heartbeat: 1698049153164,
                  connectorVersion: 'SymmetryConnector-1.0.0-alpha-004',
                  simulatorVersion: 'N/A',
                  licenseLastCheckedTime: 0,
                  licenseStatus: 'License check disabled',
                  connectorStatus: 'NONE_REPORTED',
                  connectorStatusUpdatedTime: 0,
                  connectorName: 'symmetry',
                  simulator: 'Symmetry',
                },
                {
                  dataSetName: 'PROSPER',
                  dataSetWriteProtected: false,
                  dataSetId: 4390898792238806,
                  heartbeat: 1696676468935,
                  connectorVersion: '1.0.5',
                  simulatorVersion: '1.0.0',
                  licenseLastCheckedTime: 0,
                  licenseStatus: 'License check is disabled',
                  connectorStatus: 'NONE_REPORTED',
                  connectorStatusUpdatedTime: 0,
                  connectorName: 'charts-demo',
                  simulator: 'PROSPER',
                },
              ],
            })
          );
        }),
        rest.get('*/simconfig/definitions', (req, res, ctx) => {
          return res(
            ctx.json({
              simulatorsConfig: [
                {
                  key: 'PetroSIM',
                  name: 'Petro-SIM',
                },
                {
                  key: 'PROSPER',
                  name: 'PROSPER',
                },
                {
                  key: 'Symmetry',
                  name: 'Symmetry',
                },
              ],
            })
          );
        }),
      ],
    },
  },
};

export const HasConnectorsWithOverflow: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const overflowButton = await canvas.findByRole('button', {
      name: /Show additional simulators/i,
    });

    await userEvent.click(overflowButton);

    await expect(canvas.getByText(/ProcessSim/i)).toBeInTheDocument();
  },
  parameters: {
    msw: {
      handlers: [
        rest.get('*/simconfig/v2/simulators', (req, res, ctx) => {
          return res(
            ctx.json({
              simulators: [
                {
                  dataSetName: 'PetroSim',
                  dataSetWriteProtected: false,
                  dataSetId: 841335569281748,
                  heartbeat: 1698049159451,
                  connectorVersion: 'PetrosimConnector-1.0.0-alpha-005',
                  simulatorVersion: 'Petro-SIM v7.3',
                  licenseLastCheckedTime: 0,
                  licenseStatus: 'License check disabled',
                  connectorStatus: 'NONE_REPORTED',
                  connectorStatusUpdatedTime: 0,
                  connectorName: 'simint-petrosim',
                  simulator: 'PetroSIM',
                },
                {
                  dataSetName: 'SymmetryData',
                  dataSetWriteProtected: false,
                  dataSetId: 2408940221847413,
                  heartbeat: 1698049153164,
                  connectorVersion: 'SymmetryConnector-1.0.0-alpha-004',
                  simulatorVersion: 'N/A',
                  licenseLastCheckedTime: 0,
                  licenseStatus: 'License check disabled',
                  connectorStatus: 'NONE_REPORTED',
                  connectorStatusUpdatedTime: 0,
                  connectorName: 'symmetry',
                  simulator: 'Symmetry',
                },
                {
                  dataSetName: 'DWSIM',
                  dataSetWriteProtected: false,
                  dataSetId: 3653383825766075,
                  heartbeat: 1696942517958,
                  connectorVersion: '1.0.0-alpha-004',
                  simulatorVersion: '8.4.3.0',
                  licenseLastCheckedTime: 0,
                  licenseStatus: 'License check is disabled',
                  connectorStatus: 'NONE_REPORTED',
                  connectorStatusUpdatedTime: 0,
                  connectorName: 'dwsim_conn@simint-dev-vm',
                  simulator: 'DWSIM',
                },
                {
                  dataSetName: 'PROSPER',
                  dataSetWriteProtected: false,
                  dataSetId: 4390898792238806,
                  heartbeat: 1696676468935,
                  connectorVersion: '1.0.5',
                  simulatorVersion: '1.0.0',
                  licenseLastCheckedTime: 0,
                  licenseStatus: 'License check is disabled',
                  connectorStatus: 'NONE_REPORTED',
                  connectorStatusUpdatedTime: 0,
                  connectorName: 'charts-demo',
                  simulator: 'PROSPER',
                },
                {
                  dataSetName: 'ProcessSim Dataset',
                  dataSetWriteProtected: false,
                  dataSetId: 1879426855116455,
                  heartbeat: 1696676468905,
                  connectorVersion: '1.0.5',
                  simulatorVersion: '1.0.0',
                  licenseLastCheckedTime: 0,
                  licenseStatus: 'License check is disabled',
                  connectorStatus: 'NONE_REPORTED',
                  connectorStatusUpdatedTime: 0,
                  connectorName: 'charts-demo',
                  simulator: 'ProcessSim',
                },
              ],
            })
          );
        }),
        rest.get('*/simconfig/definitions', (req, res, ctx) => {
          return res(
            ctx.json({
              simulatorsConfig: [
                {
                  key: 'PetroSIM',
                  name: 'Petro-SIM',
                },
                {
                  key: 'PROSPER',
                  name: 'PROSPER',
                },
                {
                  key: 'Symmetry',
                  name: 'Symmetry',
                },
                {
                  key: 'DWSIM',
                  name: 'DWSIM',
                },
                {
                  key: 'ProcessSim',
                  name: 'ProcessSim',
                },
              ],
            })
          );
        }),
      ],
    },
  },
};

export const NoConnectors: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: /Add connector/i })
    ).toBeInTheDocument();

    await expect(
      canvas.queryByRole('button', {
        name: /Show additional simulators/i,
      })
    ).not.toBeInTheDocument();
  },
  parameters: {
    msw: {
      handlers: [
        rest.get('*/simconfig/v2/simulators', (req, res, ctx) => {
          return res(
            ctx.json({
              simulators: [],
            })
          );
        }),
        rest.get('*/simconfig/definitions', (req, res, ctx) => {
          return res(
            ctx.json({
              simulatorsConfig: [
                {
                  key: 'PetroSIM',
                  name: 'Petro-SIM',
                },
                {
                  key: 'PROSPER',
                  name: 'PROSPER',
                },
                {
                  key: 'Symmetry',
                  name: 'Symmetry',
                },
              ],
            })
          );
        }),
      ],
    },
  },
};

export const LoadingState: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('skeleton')).toBeInTheDocument();
  },
  parameters: {
    msw: {
      handlers: [
        rest.get('*/simconfig/v2/simulators', (req, res, ctx) => {
          return res(ctx.delay('infinite'));
        }),
        rest.get('*/simconfig/definitions', (req, res, ctx) => {
          return res(ctx.delay('infinite'));
        }),
      ],
    },
  },
};
