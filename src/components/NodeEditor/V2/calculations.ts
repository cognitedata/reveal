import { Calculation, Operation } from '@cognite/calculation-backend';

const passthroughOperationDefinition: Operation = {
  category: 'None',
  description: 'Passthrough',
  inputs: [
    {
      description: null,
      name: 'Time series',
      param: 'out-result',
      types: ['ts'],
    },
  ],
  name: 'Passthrough step used for output nodes',
  op: 'PASSTHROUGH',
} as Operation;

export const validateSteps = (
  steps: Calculation['steps'],
  operations?: Operation[]
): boolean => {
  if (!operations) {
    return false;
  }

  const operationDefinitions = [...operations, passthroughOperationDefinition];

  if (!steps.length) {
    return false;
  }

  return steps.every((step) => {
    const operationDefinition = operationDefinitions?.find(
      ({ op }) => step.op.toLowerCase() === op.toLowerCase()
    );

    if (!operationDefinition) {
      return false;
    }

    if (step.inputs.length !== operationDefinition.inputs.length) {
      return false;
    }

    return operationDefinition.inputs.every((_, inputIndex) => {
      const correspondingStepInput = step.inputs[inputIndex];

      if (!correspondingStepInput) {
        return false;
      }

      const inputValueIsSet =
        typeof correspondingStepInput.value !== 'undefined' &&
        correspondingStepInput.value !== null &&
        correspondingStepInput.value !== '';

      if (!inputValueIsSet) {
        return false;
      }

      return true;
    });
  });
};
