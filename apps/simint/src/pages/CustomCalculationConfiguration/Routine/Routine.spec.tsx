import { useMatch } from 'react-location';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';

import { useTimeseries } from '../../CalculationConfiguration/utils';

import { definitions as mockDefinitions } from './mockDefinitions';
import { Routine, RoutineProps } from './Routine';

jest.mock('./Commands/Fields/TimeSeriesPreview', () => ({
  TimeSeriesPreview: jest.fn(),
}));

jest.mock('./Commands/Fields/TimeSeriesField', () => ({
  TimeSeriesField: jest.fn(),
}));

jest.mock('../../CalculationConfiguration/utils', () => ({
  ...jest.requireActual('../../CalculationConfiguration/utils'),
  useTimeseries: jest.fn(),
}));

const mockedUseTimeseries = jest.mocked(useTimeseries);

mockedUseTimeseries.mockReturnValue({
  isLoading: false,
  timeseries: {},
});

jest.mock('react-location', () => ({
  useMatch: jest.fn(),
}));

const mockedUseMatch = jest.mocked(useMatch);

mockedUseMatch.mockReturnValue({
  id: '',
  isLoading: false,
  ownData: {},
  params: {},
  pathname: '',
  route: {},
  search: {},
  status: 'resolved',
  data: {
    definitions: mockDefinitions,
  },
});

const petroSimDynamicStepFields = mockDefinitions.simulatorsConfig?.find(
  (config) => config.key === 'PetroSIM'
)?.stepFields;

const WrappedRoutine = (props: RoutineProps) => {
  return (
    <Formik
      initialValues={{
        dataModelVersion: '1.0.2',
        calculationType: 'UserDefined',
        calculationName: 'Minimal',
        simulator: 'PetroSIM',
        unitSystem: 'Refinery',
        modelName: 'Simple Crude Distillation Unit',
        userEmail: '',
        connector: 'symmetry',
        schedule: {
          enabled: true,
          start: 1695814164332,
          repeat: '1d',
        },
        dataSampling: {
          validationWindow: 1440,
          samplingWindow: 60,
          granularity: 1,
          validationEndOffset: '0m',
        },
        logicalCheck: {
          enabled: true,
          externalId: '',
          aggregateType: 'stepInterpolation',
          check: 'eq',
          value: 1,
        },
        steadyStateDetection: {
          enabled: true,
          externalId: '',
          aggregateType: 'average',
          minSectionSize: 60,
          varThreshold: 1,
          slopeThreshold: -3,
        },
        inputConstants: [],
        inputTimeSeries: [],
        outputTimeSeries: [],
        outputSequences: [],
        calcTypeUserDefined: 'Abbreviated name',
        routine: [],
      }}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      <Routine {...props} />
    </Formik>
  );
};

const addGroup = (name: string) => {
  userEvent.click(screen.getByRole('button', { name: /add new group/i }));
  userEvent.type(screen.getByDisplayValue('New group'), `{selectall}${name}`);
  userEvent.click(screen.getByLabelText(`Expand ${name} Group`));
};

describe('Routine', () => {
  // this follows https://cognitedata.atlassian.net/wiki/spaces/PD/pages/3839164553/Minimal+Petro-SIM+simulation+routine
  it('Creates a minimal PetroSIM routine', async () => {
    const handleSetCalculation = jest.fn();

    render(
      <WrappedRoutine
        dynamicStepFields={petroSimDynamicStepFields!}
        setCalculation={handleSetCalculation}
      />
    );

    // Add new group and name it "Pause"
    addGroup('Pause');

    // Add Command step
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 1.1'));
    userEvent.type(screen.getByLabelText(/step type/i), 'com{enter}');
    userEvent.type(screen.getByLabelText(/command/i), 'pause{enter}');

    // Collapse "Pause" group
    userEvent.click(screen.getByLabelText('Collapse Pause Group'));

    // Add new group and name it "Set"
    addGroup('Set');

    // Add Set step
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 2.1'));
    userEvent.type(
      screen.getByLabelText(/Simulation Object Type/i),
      'Mat Stream'
    );
    userEvent.paste(screen.getByLabelText(/Simulation Object Name/i), 'Feed');
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Property/i),
      'Temp'
    );
    userEvent.paste(screen.getByLabelText(/Value/i), '350');
    userEvent.type(screen.getByLabelText(/Unit Type/i), 'mass f{enter}');
    userEvent.type(
      screen.getByLabelText('Unit', { exact: true }),
      'kg/h{enter}'
    );

    // Collapse "Set" group
    userEvent.click(screen.getByLabelText('Collapse Set Group'));

    // Add new group and name it "Solve"
    addGroup('Solve');

    // Add Command step
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 3.1'));
    userEvent.type(screen.getByLabelText(/step type/i), 'co{enter}');
    userEvent.type(screen.getByLabelText(/command/i), 'solve flow{enter}');

    // Collapse "Solve" group
    userEvent.click(screen.getByLabelText('Collapse Solve Group'));

    // Add new group and name it "Get"
    addGroup('Get');

    // Add Get step
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 4.1'));
    userEvent.type(screen.getByLabelText(/step type/i), 'get{enter}');
    userEvent.type(screen.getByLabelText(/Variable/i), 'HeatFlow');
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Type/i),
      'En Stream'
    );
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Name/i),
      'Crude Duty'
    );
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Property/i),
      'Heat Flow'
    );
    userEvent.type(screen.getByLabelText(/Unit Type/i), 'heat f{enter}');
    userEvent.type(
      screen.getByLabelText('Unit', { exact: true }),
      'gcal/h{enter}'
    );
    userEvent.click(screen.getByLabelText('Collapse Step 4.1'));

    // Add Get step
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 4.2'));
    userEvent.type(screen.getByLabelText(/step type/i), 'get{enter}');
    userEvent.type(screen.getByLabelText(/Variable/i), 'Temp');
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Type/i),
      'Mat Stream'
    );
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Name/i),
      'Atm Feed'
    );
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Property/i),
      'Temp'
    );
    userEvent.type(screen.getByLabelText(/Unit Type/i), 'temp{enter}');
    userEvent.type(screen.getByLabelText('Unit', { exact: true }), 'C{enter}');

    // need this to avoid "Warning: An update to Formik inside a test was not wrapped in act(...)."
    // https://stackoverflow.com/a/68891807
    await waitFor(() =>
      expect(handleSetCalculation).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inputConstants: [
            {
              name: 'Mat Stream Feed Temp - Constant',
              saveTimeseriesExternalId:
                'PetroSIM-INPUT-Minimal-MSFT0-Simple_Crude_Distillation_Unit',
              type: 'MSFT0',
              unit: 'kg/h',
              unitType: 'Mass Flow',
              value: '350',
            },
          ],
          outputTimeSeries: [
            {
              externalId:
                'PetroSIM-OUTPUT-Minimal-H0-Simple_Crude_Distillation_Unit',
              name: 'HeatFlow',
              type: 'H0',
              unit: 'Gcal/h',
              unitType: 'Heat Flow Large',
            },
            {
              externalId:
                'PetroSIM-OUTPUT-Minimal-T1-Simple_Crude_Distillation_Unit',
              name: 'Temp',
              type: 'T1',
              unit: 'C',
              unitType: 'Temperature',
            },
          ],
          routine: [
            {
              description: 'Pause',
              order: 1,
              steps: [
                {
                  arguments: { type: 'Pause' },
                  step: 1,
                  type: 'Command',
                },
              ],
            },
            {
              description: 'Set',
              order: 2,
              steps: [
                {
                  arguments: {
                    objectName: 'Feed',
                    objectProperty: 'Temp',
                    objectType: 'Mat Stream',
                    type: 'inputConstant',
                    value: 'MSFT0',
                  },
                  step: 1,
                  type: 'Set',
                },
              ],
            },
            {
              description: 'Solve',
              order: 3,
              steps: [
                {
                  arguments: { type: 'Solve' },
                  step: 1,
                  type: 'Command',
                },
              ],
            },
            {
              description: 'Get',
              order: 4,
              steps: [
                {
                  arguments: {
                    objectName: 'Crude Duty',
                    objectProperty: 'Heat Flow',
                    objectType: 'En Stream',
                    type: 'outputTimeSeries',
                    value: 'H0',
                  },
                  step: 1,
                  type: 'Get',
                },
                {
                  arguments: {
                    objectName: 'Atm Feed',
                    objectProperty: 'Temp',
                    objectType: 'Mat Stream',
                    type: 'outputTimeSeries',
                    value: 'T1',
                  },
                  step: 2,
                  type: 'Get',
                },
              ],
            },
          ],
        })
      )
    );
    // need the extra timeout because userEvent.type is slow and especially slow on CI
  }, 15000);

  it('Creates a minimal PetroSIM routine with a time series input', async () => {
    const handleSetCalculation = jest.fn();

    render(
      <WrappedRoutine
        dynamicStepFields={petroSimDynamicStepFields!}
        setCalculation={handleSetCalculation}
      />
    );

    // Add new group and name it "Set"
    addGroup('Set');

    // Add Set step with timeseries
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 1.1'));
    userEvent.type(screen.getByLabelText(/Input Type/i), 'tim{enter}');
    userEvent.paste(screen.getByLabelText(/Variable/i), 'Temp');
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Type/i),
      'Mat Stream'
    );
    userEvent.paste(screen.getByLabelText(/Simulation Object Name/i), 'Feed');
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Property/i),
      'Temp'
    );

    // Collapse "Set" group
    userEvent.click(screen.getByLabelText('Collapse Set Group'));

    // need this to avoid "Warning: An update to Formik inside a test was not wrapped in act(...)."
    // https://stackoverflow.com/a/68891807
    await waitFor(() =>
      expect(handleSetCalculation).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inputTimeSeries: [
            {
              name: 'Temp',
              sampleExternalId:
                'PetroSIM-INPUT-Minimal-T0-Simple_Crude_Distillation_Unit',
              type: 'T0',
            },
          ],
          routine: [
            {
              description: 'Set',
              order: 1,
              steps: [
                {
                  arguments: {
                    objectName: 'Feed',
                    objectProperty: 'Temp',
                    objectType: 'Mat Stream',
                    type: 'inputTimeSeries',
                    value: 'T0',
                  },
                  step: 1,
                  type: 'Set',
                },
              ],
            },
          ],
        })
      )
    );
  });

  it('Updates routine JSON when deleting Input Constant step', async () => {
    const handleSetCalculation = jest.fn();

    render(
      <WrappedRoutine
        dynamicStepFields={petroSimDynamicStepFields!}
        setCalculation={handleSetCalculation}
      />
    );

    // Add new group and name it "Set"
    addGroup('Set');

    // Add Set step with input constant
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 1.1'));
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Type/i),
      'Mat Stream'
    );

    // Delete step
    userEvent.click(screen.getByRole('button', { name: /delete step 1.1/i }));

    // need this to avoid "Warning: An update to Formik inside a test was not wrapped in act(...)."
    // https://stackoverflow.com/a/68891807
    await waitFor(() =>
      expect(handleSetCalculation).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inputConstants: [],
          routine: [
            {
              description: 'Set',
              order: 1,
              steps: [],
            },
          ],
        })
      )
    );
  });

  it('Updates routine JSON when deleting Group', async () => {
    const handleSetCalculation = jest.fn();

    render(
      <WrappedRoutine
        dynamicStepFields={petroSimDynamicStepFields!}
        setCalculation={handleSetCalculation}
      />
    );

    // Add new group and name it "Misc"
    addGroup('Misc');

    // Add Set step with input constant
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 1.1'));
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Type/i),
      'Mat Stream'
    );
    userEvent.click(screen.getByLabelText('Collapse Step 1.1'));

    // Add Set step with time series
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 1.2'));
    userEvent.type(screen.getByLabelText(/Input Type/i), 'tim{enter}');
    userEvent.paste(screen.getByLabelText(/Variable/i), 'Temp');
    userEvent.click(screen.getByLabelText('Collapse Step 1.2'));

    // Add Get step
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 1.3'));
    userEvent.type(screen.getByLabelText(/step type/i), 'get{enter}');
    userEvent.type(screen.getByLabelText(/Variable/i), 'Temp');

    // Delete group
    userEvent.click(screen.getByRole('button', { name: /delete group 1/i }));

    // need this to avoid "Warning: An update to Formik inside a test was not wrapped in act(...)."
    // https://stackoverflow.com/a/68891807
    await waitFor(() =>
      expect(handleSetCalculation).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inputConstants: [],
          inputTimeSeries: [],
          outputTimeSeries: [],
          routine: [],
        })
      )
    );
  });

  it('Removes input constant from routine JSON when changing Input Type to Time Series', async () => {
    const handleSetCalculation = jest.fn();

    render(
      <WrappedRoutine
        dynamicStepFields={petroSimDynamicStepFields!}
        setCalculation={handleSetCalculation}
      />
    );

    // Add new group and name it "Misc"
    addGroup('Misc');

    // Add Set step with input constant
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 1.1'));
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Type/i),
      'Mat Stream'
    );

    // Change Input Type to Time Series
    userEvent.type(screen.getByLabelText(/Input Type/i), 'tim{enter}');

    userEvent.paste(screen.getByLabelText(/Variable/i), 'Temp');

    // need this to avoid "Warning: An update to Formik inside a test was not wrapped in act(...)."
    // https://stackoverflow.com/a/68891807
    await waitFor(() =>
      expect(handleSetCalculation).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inputConstants: [],
          inputTimeSeries: [
            {
              name: 'Temp',
              sampleExternalId:
                'PetroSIM-INPUT-Minimal-T0-Simple_Crude_Distillation_Unit',
              type: 'T0',
            },
          ],
          outputTimeSeries: [],
          routine: [
            {
              description: 'Misc',
              order: 1,
              steps: [
                {
                  arguments: { type: 'inputTimeSeries', value: 'T0' },
                  step: 1,
                  type: 'Set',
                },
              ],
            },
          ],
        })
      )
    );
  });

  it('Removes time series from routine JSON when changing Input Type to Input Constant', async () => {
    const handleSetCalculation = jest.fn();

    render(
      <WrappedRoutine
        dynamicStepFields={petroSimDynamicStepFields!}
        setCalculation={handleSetCalculation}
      />
    );

    // Add new group and name it "Misc"
    addGroup('Misc');

    // Add Set step
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 1.1'));

    // Change Input Type to Time Series
    userEvent.type(screen.getByLabelText(/Input Type/i), 'tim{enter}');
    userEvent.paste(screen.getByLabelText(/Variable/i), 'Temp');

    // Change Input Type to Input Constant
    userEvent.type(screen.getByLabelText(/Input Type/i), 'man{enter}');
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Type/i),
      'Mat Stream'
    );

    // need this to avoid "Warning: An update to Formik inside a test was not wrapped in act(...)."
    // https://stackoverflow.com/a/68891807
    await waitFor(() =>
      expect(handleSetCalculation).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inputConstants: [
            {
              name: 'Mat Stream - Constant',
              saveTimeseriesExternalId:
                'PetroSIM-INPUT-Minimal-MS0-Simple_Crude_Distillation_Unit',
              type: 'MS0',
            },
          ],
          inputTimeSeries: [],
          outputTimeSeries: [],
          routine: [
            {
              description: 'Misc',
              order: 1,
              steps: [
                {
                  arguments: {
                    objectType: 'Mat Stream',
                    type: 'inputConstant',
                    value: 'MS0',
                  },
                  step: 1,
                  type: 'Set',
                },
              ],
            },
          ],
        })
      )
    );
  });

  it('Removes input time series from routine JSON when changing Set step to Get', async () => {
    const handleSetCalculation = jest.fn();

    render(
      <WrappedRoutine
        dynamicStepFields={petroSimDynamicStepFields!}
        setCalculation={handleSetCalculation}
      />
    );

    // Add new group and name it "Misc"
    addGroup('Misc');

    // Add Set step
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 1.1'));

    userEvent.paste(
      screen.getByLabelText(/Simulation Object Type/i),
      'Mat Stream'
    );

    // Change Set to Get
    userEvent.type(screen.getByLabelText(/step type/i), 'get{enter}');
    userEvent.paste(screen.getByLabelText(/Variable/i), 'Temp');

    // need this to avoid "Warning: An update to Formik inside a test was not wrapped in act(...)."
    // https://stackoverflow.com/a/68891807
    await waitFor(() =>
      expect(handleSetCalculation).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inputConstants: [],
          inputTimeSeries: [],
          outputTimeSeries: [
            {
              externalId:
                'PetroSIM-OUTPUT-Minimal-T0-Simple_Crude_Distillation_Unit',
              name: 'Temp',
              type: 'T0',
            },
          ],
          routine: [
            {
              description: 'Misc',
              order: 1,
              steps: [
                {
                  arguments: {
                    type: 'outputTimeSeries',
                    value: 'T0',
                  },
                  step: 1,
                  type: 'Get',
                },
              ],
            },
          ],
        })
      )
    );
  });

  it('Removes input time series from routine JSON when changing Get step to Set', async () => {
    const handleSetCalculation = jest.fn();

    render(
      <WrappedRoutine
        dynamicStepFields={petroSimDynamicStepFields!}
        setCalculation={handleSetCalculation}
      />
    );

    // Add new group and name it "Misc"
    addGroup('Misc');

    // Add Get step
    userEvent.click(screen.getByRole('button', { name: /add new step/i }));
    userEvent.click(screen.getByLabelText('Expand Step 1.1'));
    userEvent.type(screen.getByLabelText(/step type/i), 'get{enter}');

    userEvent.paste(screen.getByLabelText(/Variable/i), 'Temp');

    // Change to Set step
    userEvent.type(screen.getByLabelText(/step type/i), 'set{enter}');
    userEvent.paste(
      screen.getByLabelText(/Simulation Object Type/i),
      'Mat Stream'
    );

    // need this to avoid "Warning: An update to Formik inside a test was not wrapped in act(...)."
    // https://stackoverflow.com/a/68891807
    await waitFor(() =>
      expect(handleSetCalculation).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inputConstants: [
            {
              name: 'Mat Stream - Constant',
              saveTimeseriesExternalId:
                'PetroSIM-INPUT-Minimal-MS0-Simple_Crude_Distillation_Unit',
              type: 'MS0',
            },
          ],
          inputTimeSeries: [],
          outputTimeSeries: [],
          routine: [
            {
              description: 'Misc',
              order: 1,
              steps: [
                {
                  arguments: {
                    objectType: 'Mat Stream',
                    type: 'inputConstant',
                    value: 'MS0',
                  },
                  step: 1,
                  type: 'Set',
                },
              ],
            },
          ],
        })
      )
    );
  });
});
