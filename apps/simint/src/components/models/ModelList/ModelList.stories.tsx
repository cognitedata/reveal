import React from 'react';
import { ReactLocation, Router } from 'react-location';

import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@testing-library/react';

import { type Model, ModelList } from './ModelList';

const meta: Meta<typeof ModelList> = {
  component: ModelList,
  decorators: [
    (Story) => {
      const location = new ReactLocation();

      return (
        <Router basepath="/" location={location} routes={[]}>
          <div
            style={{
              width: '400px',
            }}
          >
            <Story />
          </div>
        </Router>
      );
    },
  ],
};
export default meta;

type Story = StoryObj<typeof ModelList>;

const modelFiles: Model[] = [
  {
    id: 3813365310539267,
    externalId: 'PetroSIM-CDU-100-1',
    name: 'CDU-100',
    metadata: {
      dataModelVersion: '1.0.2',
      dataType: 'Simulator File',
      description: 'Initial model',
      fileName: 'CDU-100.KSC',
      modelName: 'CDU-100',
      modelType: 'SteadyState',
      nextVersion: '',
      previousVersion: '',
      simulator: 'PetroSIM',
      userEmail: 'everton.colling@cognitedata.com',
      version: '1',
    },
    source: 'PetroSIM',
    dataSetId: 841335569281748,
    createdTime: '2023-05-31T12:44:16.085Z',
    lastUpdatedTime: '2023-06-27T09:23:06.739Z',
    labels: [
      {
        externalId: 'simconfig-labels-Petro-SIM',
      },
    ],
    isActive: true,
    simulatorName: 'Petro-SIM',
  },
  {
    id: 1680855899452570,
    externalId: 'PetroSIM-COGNITE_MODEL_-_TEST-_QA-5-2',
    name: 'COGNITE MODEL - TEST- QA-5',
    metadata: {
      dataModelVersion: '1.0.2',
      dataType: 'Simulator File',
      description: 'QA Test Model',
      errorMessage: 'Cannot open simulation case',
      fileName: 'CDU-100 (2).KSC',
      modelName: 'COGNITE MODEL - TEST- QA-5',
      nextVersion: '',
      previousVersion: 'PetroSIM-COGNITE_MODEL_-_TEST-_QA-5-1',
      simulator: 'PetroSIM',
      userEmail: 'sagar.thalwar@cognitedata.com',
      version: '2',
    },
    source: 'PetroSIM',
    dataSetId: 841335569281748,
    createdTime: '2023-09-06T12:30:16.846Z',
    lastUpdatedTime: '2023-10-04T12:26:27.218Z',
    labels: [
      {
        externalId: 'simconfig-labels-Symmetry',
      },
      {
        externalId: 'simconfig-labels-well',
      },
    ],
    isActive: false,
    simulatorName: 'Petro-SIM',
  },
  {
    id: 5448964073141232,
    externalId: 'PetroSIM-Crude_Distillation_Unit-3',
    name: 'Crude Distillation Unit',
    metadata: {
      dataModelVersion: '1.0.2',
      dataType: 'Simulator File',
      description: 'Fresh new version',
      fileName: 'Crude Distillation Unit.ksc',
      modelName: 'Crude Distillation Unit',
      nextVersion: '',
      previousVersion: 'PetroSIM-Crude_Distillation_Unit-2',
      simulator: 'PetroSIM',
      userEmail: 'everton.colling@cognitedata.com',
      version: '3',
    },
    source: 'PetroSIM',
    dataSetId: 841335569281748,
    createdTime: '2023-09-26T07:48:17.563Z',
    lastUpdatedTime: '2023-09-26T07:48:17.563Z',
    labels: [
      {
        externalId: 'simconfig-labels-Petro-SIM',
      },
    ],
    isActive: false,
    simulatorName: 'Petro-SIM',
  },
  {
    id: 3750601509666514,
    externalId: 'ProcessSim-LER_WELL_06-1',
    name: 'LER WELL 06',
    metadata: {
      dataModelVersion: '1.0.2',
      dataType: 'Simulator File',
      description: 'First version',
      fileName: 'LER-WELL-06-new.yml',
      modelName: 'LER WELL 06',
      modelType: 'GasWell',
      nextVersion: '',
      previousVersion: '',
      simulator: 'ProcessSim',
      unitSystem: 'OilField',
      userEmail: 'everton.colling@cognitedata.com',
      version: '1',
    },
    source: 'ProcessSim',
    dataSetId: 1879426855116455,
    createdTime: '2023-05-30T09:37:45.483Z',
    lastUpdatedTime: '2023-05-30T09:37:45.483Z',
    isActive: false,
    simulatorName: 'ProcessSim',
  },
  {
    id: 3994871561348165,
    externalId: 'Symmetry-QA_Test_-1-1',
    name: 'QA Test -1',
    metadata: {
      dataModelVersion: '1.0.2',
      dataType: 'Simulator File',
      description: 'QA Test Model',
      fileName: 'CDU1 (2).vsym',
      modelName: 'QA Test -1',
      nextVersion: '',
      previousVersion: '',
      simulator: 'Symmetry',
      userEmail: 'parami.abeysekara@cognitedata.com',
      version: '1',
    },
    source: 'Symmetry',
    dataSetId: 2408940221847413,
    createdTime: '2023-09-07T09:02:58.921Z',
    lastUpdatedTime: '2023-09-07T09:02:58.921Z',
    labels: [
      {
        externalId: 'simconfig-labels-Symmetry',
      },
    ],
    isActive: false,
    simulatorName: 'Symmetry',
  },
  {
    id: 7595963200293281,
    externalId: 'PROSPER-Sample_Prosper_Model-1',
    name: 'Sample Prosper Model',
    metadata: {
      'Flow Type': 'Annular',
      'Lift Method': 'None',
      'PVT Method': 'Black Oil',
      'Temperature Model': 'Rough Approximation',
      'Well Type': 'Injector',
      dataModelVersion: '1.0.2',
      dataType: 'Simulator File',
      description: '',
      fileName: 'CFAW.003_44_12a_A2 (3).Out',
      modelName: 'Sample Prosper Model',
      modelType: 'OilWell',
      nextVersion: '',
      previousVersion: '',
      simulator: 'PROSPER',
      unitSystem: 'NorSI',
      userEmail: 'brian.kuzma@cognitedata.com',
      version: '1',
    },
    source: 'PROSPER',
    dataSetId: 4390898792238806,
    createdTime: '2023-08-16T11:17:30.059Z',
    lastUpdatedTime: '2023-08-17T03:01:30.778Z',
    labels: [
      {
        externalId: 'simconfig-labels-PROSPER',
      },
    ],
    isActive: false,
    simulatorName: 'PROSPER',
  },
  {
    id: 959311717633220,
    externalId: 'DWSIM-ShowerMixer-1',
    name: 'ShowerMixer',
    metadata: {
      dataModelVersion: '1.0.2',
      dataType: 'Simulator File',
      description: 'Shower mixer model using cold and hot water',
      fileName: 'ShowerMixerEverton.dwxmz',
      modelName: 'ShowerMixer',
      nextVersion: '',
      previousVersion: '',
      simulator: 'DWSIM',
      userEmail: 'everton.colling@cognitedata.com',
      version: '1',
    },
    source: 'DWSIM',
    dataSetId: 3653383825766075,
    createdTime: '2023-05-24T20:48:12.077Z',
    lastUpdatedTime: '2023-05-24T20:48:12.077Z',
    labels: [
      {
        externalId: 'simconfig-labels-DWSIM',
      },
    ],
    isActive: false,
    simulatorName: 'DWSIM',
  },
  {
    id: 5503607640962520,
    externalId: 'Symmetry-Simple_Crude_Distillation_Unit-1',
    name: 'Simple Crude Distillation Unit',
    metadata: {
      dataModelVersion: '1.0.2',
      dataType: 'Simulator File',
      description: '',
      fileName: 'CDU1.vsym',
      modelName: 'Simple Crude Distillation Unit',
      nextVersion: '',
      previousVersion: '',
      simulator: 'Symmetry',
      unitSystem: 'Refinery',
      userEmail: 'brian.kuzma@cognitedata.com',
      version: '1',
    },
    source: 'Symmetry',
    dataSetId: 2408940221847413,
    createdTime: '2023-09-15T09:01:33.043Z',
    lastUpdatedTime: '2023-09-15T09:01:33.043Z',
    labels: [
      {
        externalId: 'simconfig-labels-Symmetry',
      },
    ],
    isActive: false,
    simulatorName: 'Symmetry',
  },
  {
    id: 8340991651976127,
    externalId: 'Symmetry-Sour_Gas_Sweetening_using_MEA-1',
    name: 'Sour Gas Sweetening using MEA',
    metadata: {
      dataModelVersion: '1.0.2',
      dataType: 'Simulator File',
      description:
        'This is an example where a sour natural gas feed is treated with MEA to sweeten it',
      fileName: 'SweeteningMEA.vsym',
      modelName: 'Sour Gas Sweetening using MEA',
      modelType: 'SteadyState',
      nextVersion: '',
      previousVersion: '',
      simulator: 'Symmetry',
      userEmail: 'everton.colling@cognitedata.com',
      version: '1',
    },
    source: 'Symmetry',
    dataSetId: 2408940221847413,
    createdTime: '2023-06-02T13:00:34.484Z',
    lastUpdatedTime: '2023-06-02T13:00:34.484Z',
    labels: [
      {
        externalId: 'simconfig-labels-Symmetry',
      },
    ],
    isActive: false,
    simulatorName: 'Symmetry',
  },
  {
    id: 1262316172098119,
    externalId: 'ProcessSim-Test_model_by_Parami-2',
    name: 'Test model by Parami',
    metadata: {
      dataModelVersion: '1.0.2',
      dataType: 'Simulator File',
      description: 'test description version 2',
      errorMessage:
        'Model name does not match the name extracted from the YAML contents',
      fileName: 'test-sample-model.yml',
      modelName: 'Test model by Parami',
      nextVersion: '',
      previousVersion: 'ProcessSim-Test_model_by_Parami-1',
      simulator: 'ProcessSim',
      unitSystem: 'OilField',
      userEmail: 'parami.abeysekara@cognitedata.com',
      version: '2',
    },
    source: 'ProcessSim',
    dataSetId: 1879426855116455,
    createdTime: '2023-10-03T06:46:07.098Z',
    lastUpdatedTime: '2023-10-03T06:46:12.740Z',
    labels: [
      {
        externalId: 'simconfig-labels-ProcessSim',
      },
    ],
    isActive: false,
    simulatorName: 'ProcessSim',
  },
];

export const Default: Story = {
  args: {
    isModalLibraryEmpty: false,
    modelFiles,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByTestId('no-results-container')).toBeFalsy();
  },
};

export const NoSearchResults: Story = {
  args: {
    isModalLibraryEmpty: false,
    modelFiles: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByTestId('no-results-container')
    ).toBeInTheDocument();
  },
};
