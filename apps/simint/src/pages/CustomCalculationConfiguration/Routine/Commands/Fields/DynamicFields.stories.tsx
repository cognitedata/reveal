import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { Formik, useFormikContext } from 'formik';

import { StepFields } from '@cognite/simconfig-api-sdk/rtk';

import { DynamicFields } from './DynamicFields';
import { StepInputType } from './InputType';

const meta: Meta<typeof DynamicFields> = {
  component: DynamicFields,
  decorators: [
    (Story) => {
      return (
        <Formik
          initialValues={{}}
          onSubmit={(values) => {
            console.log(values);
          }}
        >
          <div>
            <Story />
            <div style={{ marginTop: '36px' }}>
              <FormikValuesDisplay />
            </div>
          </div>
        </Formik>
      );
    },
  ],
};
export default meta;

const FormikValuesDisplay = () => {
  const { values } = useFormikContext();

  return (
    <div
      style={{
        backgroundColor: 'whitesmoke',
        borderRadius: '4px',
        padding: '12px',
      }}
    >
      <h4>Formik values</h4>
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </div>
  );
};

type Story = StoryObj<typeof DynamicFields>;

const petroSimDynamicStepFields: StepFields = {
  steps: [
    {
      stepType: 'get/set',
      fields: [
        {
          name: 'objectType',
          label: 'Simulation Object Type',
          info: 'Enter the type of the PetroSIM object, i.e. Material Stream',
        },
        {
          name: 'objectName',
          label: 'Simulation Object Name',
          info: 'Enter the name of the PetroSIM object, i.e. Feed',
        },
        {
          name: 'objectProperty',
          label: 'Simulation Object Property',
          info: 'Enter the property of the PetroSIM object, i.e. Temperature',
        },
      ],
    },
    {
      stepType: 'command',
      fields: [
        {
          name: 'type',
          label: 'Command',
          options: [
            { label: 'Pause Solver', value: 'Pause Solver' },
            { label: 'Solve Flowsheet', value: 'Solve Flowsheet' },
          ],
          info: 'Select a command',
        },
      ],
    },
  ],
};

export const GetStep: Story = {
  args: {
    dynamicStepFields: petroSimDynamicStepFields,
    routineIndex: 0,
    step: {
      step: 1,
      type: 'Get',
      arguments: {
        type: 'Manual',
        value: 'Foo',
      },
    },
    stepIndex: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByLabelText('Simulation Object Type'),
      'Material Stream'
    );
    await userEvent.type(
      canvas.getByLabelText('Simulation Object Name'),
      'Feed'
    );
    await userEvent.type(
      canvas.getByLabelText('Simulation Object Property'),
      'Temperature'
    );
  },
};

export const SetStep: Story = {
  args: {
    dynamicStepFields: petroSimDynamicStepFields,
    routineIndex: 1,
    step: {
      step: 1,
      type: 'Set',
      arguments: {
        type: StepInputType.InputConstant,
      },
    },
    stepIndex: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByLabelText('Simulation Object Type'),
      'Material Stream'
    );
    await userEvent.type(
      canvas.getByLabelText('Simulation Object Name'),
      'Feed'
    );
    await userEvent.type(
      canvas.getByLabelText('Simulation Object Property'),
      'Temperature'
    );
  },
};

export const CommandStep: Story = {
  args: {
    dynamicStepFields: petroSimDynamicStepFields,
    routineIndex: 0,
    step: {
      step: 1,
      type: 'Command',
      arguments: {},
    },
    stepIndex: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Command'), 'P{enter}');
  },
};
