import React from 'react';
import { ReactLocation, Router } from 'react-location';

import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import noop from 'lodash/noop';

import { CalculationRun } from '@cognite/simconfig-api-sdk/rtk';

import { CalculationRuns } from './CalculationRuns';

const meta: Meta<typeof CalculationRuns> = {
  component: CalculationRuns,
  decorators: [
    (Story) => {
      const location = new ReactLocation();

      return (
        <Router basepath="/" location={location} routes={[]}>
          <Story />
        </Router>
      );
    },
  ],
};
export default meta;

type Story = StoryObj<typeof CalculationRuns>;

const calculationRuns: CalculationRun[] = [
  {
    dataSetId: 841335569281748,
    startTime: '2023-10-06T12:34:14Z',
    endTime: '2023-10-06T12:34:18Z',
    type: 'Simulation Calculation',
    subtype: 'Steady State Simulation',
    metadata: {
      description: '',
      simulator: 'PetroSIM',
      runType: 'scheduled',
      modelVersion: '1',
      dataType: 'Simulation Calculation',
      dataModelVersion: '1.0.2',
      statusMessage: 'Calculation ran to completion',
      modelName: 'CDU-100',
      calcTypeUserDefined: 'SteadyStateSimulation',
      calcName: 'User Defined',
      connector: 'simint-petrosim',
      calcTime: 1696593854878,
      calcConfig: 'PetroSIM-SC-UserDefined-SteadyStateSimulation-CDU-100',
      calcType: 'UserDefined',
      userEmail: 'everton.colling@cognite.com',
      status: 'success',
    },
    source: 'PetroSIM',
    id: 4433603745635081,
    lastUpdatedTime: '2023-10-06T12:34:18Z',
    createdTime: '2023-10-06T12:34:12Z',
  },
  {
    dataSetId: 2408940221847413,
    startTime: '2023-10-06T12:04:07Z',
    endTime: '2023-10-06T12:04:11Z',
    type: 'Simulation Calculation',
    subtype: 'Steady State Simulation',
    metadata: {
      description: '',
      simulator: 'Symmetry',
      runType: 'scheduled',
      modelVersion: '1',
      dataType: 'Simulation Calculation',
      dataModelVersion: '1.0.2',
      statusMessage: 'Calculation ran to completion',
      modelName: 'Sour Gas Sweetening using MEA',
      calcTypeUserDefined: 'SteadyStateSimulation',
      calcName: 'User Defined',
      connector: 'symmetry',
      calcTime: 1696592047727,
      calcConfig:
        'Symmetry-SC-UserDefined-SteadyStateSimulation-Sour_Gas_Sweetening_using_MEA',
      calcType: 'UserDefined',
      userEmail: 'everton.colling@cognite.com',
      status: 'success',
    },
    source: 'Symmetry',
    id: 8740350029200754,
    lastUpdatedTime: '2023-10-06T12:04:12Z',
    createdTime: '2023-10-06T12:04:02Z',
  },
  {
    dataSetId: 841335569281748,
    startTime: '2023-10-06T11:34:21Z',
    endTime: '2023-10-06T11:34:25Z',
    type: 'Simulation Calculation',
    subtype: 'Steady State Simulation',
    metadata: {
      description: '',
      simulator: 'PetroSIM',
      runType: 'scheduled',
      modelVersion: '1',
      dataType: 'Simulation Calculation',
      dataModelVersion: '1.0.2',
      statusMessage: 'Calculation ran to completion',
      modelName: 'CDU-100',
      calcTypeUserDefined: 'SteadyStateSimulation',
      calcName: 'User Defined',
      connector: 'simint-petrosim',
      calcTime: 1696590261942,
      calcConfig: 'PetroSIM-SC-UserDefined-SteadyStateSimulation-CDU-100',
      calcType: 'UserDefined',
      userEmail: 'everton.colling@cognite.com',
      status: 'success',
    },
    source: 'PetroSIM',
    id: 6682630806531008,
    lastUpdatedTime: '2023-10-06T11:34:26Z',
    createdTime: '2023-10-06T11:34:16Z',
  },
  {
    dataSetId: 3653383825766075,
    startTime: '2023-10-06T11:12:19Z',
    endTime: '2023-10-06T11:12:21Z',
    type: 'Simulation Calculation',
    subtype: 'ShowerMixerCalculation',
    metadata: {
      simulator: 'DWSIM',
      runType: 'manual',
      modelVersion: '1',
      dataType: 'Simulation Calculation',
      description: 'DWSIM simulation run',
      dataModelVersion: '1.0.2',
      statusMessage: 'Calculation ran to completion',
      modelName: 'ShowerMixer',
      calcTypeUserDefined: 'ShowerMixerCalculation',
      calcName: 'User Defined',
      connector: 'dwsim_conn@simint-dev-vm',
      calcTime: 1696588939347,
      calcConfig: 'DWSIM-SC-UserDefined-ShowerMixerCalculation-ShowerMixer',
      calcType: 'UserDefined',
      userEmail: 'ivan.polomanyi@cognitedata.com',
      status: 'success',
    },
    source: 'DWSIM',
    id: 1320892997306592,
    lastUpdatedTime: '2023-10-06T11:12:21Z',
    createdTime: '2023-10-06T11:12:14Z',
  },
  {
    dataSetId: 2408940221847413,
    startTime: '2023-10-06T11:04:04Z',
    endTime: '2023-10-06T11:04:09Z',
    type: 'Simulation Calculation',
    subtype: 'Steady State Simulation',
    metadata: {
      description: '',
      simulator: 'Symmetry',
      runType: 'scheduled',
      modelVersion: '1',
      dataType: 'Simulation Calculation',
      dataModelVersion: '1.0.2',
      statusMessage: 'Calculation ran to completion',
      modelName: 'Sour Gas Sweetening using MEA',
      calcTypeUserDefined: 'SteadyStateSimulation',
      calcName: 'User Defined',
      connector: 'symmetry',
      calcTime: 1696588444832,
      calcConfig:
        'Symmetry-SC-UserDefined-SteadyStateSimulation-Sour_Gas_Sweetening_using_MEA',
      calcType: 'UserDefined',
      userEmail: 'everton.colling@cognite.com',
      status: 'success',
    },
    source: 'Symmetry',
    id: 8191086841078198,
    lastUpdatedTime: '2023-10-06T11:04:09Z',
    createdTime: '2023-10-06T11:03:59Z',
  },
  {
    dataSetId: 3653383825766075,
    startTime: '2023-10-06T10:50:49Z',
    endTime: '2023-10-06T10:50:51Z',
    type: 'Simulation Calculation',
    subtype: 'ShowerMixerCalculation',
    metadata: {
      description: '',
      simulator: 'DWSIM',
      runType: 'scheduled',
      modelVersion: '1',
      dataType: 'Simulation Calculation',
      dataModelVersion: '1.0.2',
      statusMessage: 'Calculation ran to completion',
      modelName: 'ShowerMixer',
      calcTypeUserDefined: 'ShowerMixerCalculation',
      calcName: 'User Defined',
      connector: 'dwsim_conn@simint-dev-vm',
      calcTime: 1696587649968,
      calcConfig: 'DWSIM-SC-UserDefined-ShowerMixerCalculation-ShowerMixer',
      calcType: 'UserDefined',
      userEmail: 'everton.colling@cognite.com',
      status: 'success',
    },
    source: 'DWSIM',
    id: 5314088579664057,
    lastUpdatedTime: '2023-10-06T10:50:52Z',
    createdTime: '2023-10-06T10:50:46Z',
  },
  {
    dataSetId: 841335569281748,
    startTime: '2023-10-06T10:34:15Z',
    endTime: '2023-10-06T10:34:18Z',
    type: 'Simulation Calculation',
    subtype: 'Steady State Simulation',
    metadata: {
      description: '',
      simulator: 'PetroSIM',
      runType: 'scheduled',
      modelVersion: '1',
      dataType: 'Simulation Calculation',
      dataModelVersion: '1.0.2',
      statusMessage: 'Calculation ran to completion',
      modelName: 'CDU-100',
      calcTypeUserDefined: 'SteadyStateSimulation',
      calcName: 'User Defined',
      connector: 'simint-petrosim',
      calcTime: 1696586655413,
      calcConfig: 'PetroSIM-SC-UserDefined-SteadyStateSimulation-CDU-100',
      calcType: 'UserDefined',
      userEmail: 'everton.colling@cognite.com',
      status: 'success',
    },
    source: 'PetroSIM',
    id: 2881809319780922,
    lastUpdatedTime: '2023-10-06T10:34:19Z',
    createdTime: '2023-10-06T10:34:12Z',
  },
  {
    dataSetId: 4390898792238806,
    startTime: '2023-10-06T10:30:57Z',
    endTime: '2023-10-06T10:30:57Z',
    type: 'Simulation Calculation',
    subtype: 'Rate by Nodal Analysis',
    metadata: {
      description: '',
      simulator: 'PROSPER',
      runType: 'scheduled',
      modelVersion: '1',
      dataType: 'Simulation Calculation',
      dataModelVersion: '1.0.2',
      statusMessage:
        "No data points were found for time series 'PROSPER-BC-N2-Sample_Prosper_Model' in the sampling window",
      modelName: 'Sample Prosper Model',
      calcName: 'Rate by Nodal Analysis',
      connector: 'charts-demo',
      calcTime: 1696586457048,
      calcConfig: 'PROSPER-SC-IPR_VLP-Sample_Prosper_Model',
      calcType: 'IPR/VLP',
      userEmail: 'sagar.thalwar@cognitedata.com',
      status: 'failure',
    },
    source: 'PROSPER',
    id: 7299668585333303,
    lastUpdatedTime: '2023-10-06T10:30:58Z',
    createdTime: '2023-10-06T10:30:54Z',
  },
  {
    dataSetId: 2408940221847413,
    startTime: '2023-10-06T10:04:10Z',
    endTime: '2023-10-06T10:04:14Z',
    type: 'Simulation Calculation',
    subtype: 'Steady State Simulation',
    metadata: {
      description: '',
      simulator: 'Symmetry',
      runType: 'scheduled',
      modelVersion: '1',
      dataType: 'Simulation Calculation',
      dataModelVersion: '1.0.2',
      statusMessage: 'Calculation ran to completion',
      modelName: 'Sour Gas Sweetening using MEA',
      calcTypeUserDefined: 'SteadyStateSimulation',
      calcName: 'User Defined',
      connector: 'symmetry',
      calcTime: 1696584850658,
      calcConfig:
        'Symmetry-SC-UserDefined-SteadyStateSimulation-Sour_Gas_Sweetening_using_MEA',
      calcType: 'UserDefined',
      userEmail: 'everton.colling@cognite.com',
      status: 'success',
    },
    source: 'Symmetry',
    id: 5438494469041483,
    lastUpdatedTime: '2023-10-06T10:04:14Z',
    createdTime: '2023-10-06T10:04:05Z',
  },
  {
    dataSetId: 3653383825766075,
    startTime: '2023-10-06T09:50:44Z',
    endTime: '2023-10-06T09:50:45Z',
    type: 'Simulation Calculation',
    subtype: 'ShowerMixerCalculation',
    metadata: {
      description: '',
      simulator: 'DWSIM',
      runType: 'scheduled',
      modelVersion: '1',
      dataType: 'Simulation Calculation',
      dataModelVersion: '1.0.2',
      statusMessage: 'Calculation ran to completion',
      modelName: 'ShowerMixer',
      calcTypeUserDefined: 'ShowerMixerCalculation',
      calcName: 'User Defined',
      connector: 'dwsim_conn@simint-dev-vm',
      calcTime: 1696584044148,
      calcConfig: 'DWSIM-SC-UserDefined-ShowerMixerCalculation-ShowerMixer',
      calcType: 'UserDefined',
      userEmail: 'everton.colling@cognite.com',
      status: 'success',
    },
    source: 'DWSIM',
    id: 6753742798376426,
    lastUpdatedTime: '2023-10-06T09:50:46Z',
    createdTime: '2023-10-06T09:50:41Z',
  },
];

export const Default: Story = {
  args: {
    calculationNames: [
      'Steady State Simulation',
      'ShowerMixerCalculation',
      'Rate by Nodal Analysis',
      'Minimal',
      'ConstInputsCalc',
      'Test',
    ],
    calculationRuns,
    createRoutineUrl: '/calculations/new-calculation',
    cursors: [],
    hasRunsInProject: true,
    isFetching: false,
    isLoading: false,
    onDateChange: noop,
    onSearchParamsSet: noop,
    onScroll: noop,
    runStatus: ['success', 'failure'],
    runTypes: ['scheduled', 'manual'],
    searchFilters: {},
    shouldPollCalculations: false,
    simulatorKeys: {
      DWSIM: 'DWSIM',
      PetroSIM: 'Petro-SIM',
      ProcessSim: 'ProcessSim',
      PROSPER: 'PROSPER',
      Symmetry: 'Symmetry',
    },
    simulatorConfig: [],
  },
};

export const IsLoading: Story = {
  args: {
    ...Default.args,
    calculationNames: [],
    calculationRuns: [],
    isFetching: true,
    isLoading: true,
    runStatus: [],
    runTypes: [],
  },
};

export const IsFetching: Story = {
  args: {
    ...Default.args,
    calculationNames: [],
    calculationRuns: [],
    isFetching: true,
    runStatus: [],
    runTypes: [],
    searchFilters: {},
  },
};

export const FilteredResultsAreEmpty: Story = {
  args: {
    ...Default.args,
    calculationNames: [],
    calculationRuns: [],
    runStatus: [],
    runTypes: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('no-results-container')).toBeTruthy();
  },
};

export const NoRunsExistInProject: Story = {
  args: {
    ...Default.args,
    calculationNames: [],
    calculationRuns: [],
    hasRunsInProject: false,
    runStatus: [],
    runTypes: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('no-runs-container')).toBeTruthy();
  },
};
